import { OpenAI } from 'openai';
import mongoose from 'mongoose';
import { VideoTranscription } from '../models/VideoTranscription';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store conversation threads by user
const threadsByUser = new Map<string, string>();

interface ChatResponse {
  response: string;
  threadId: string;
}

// OpenAI response content types
interface TextContentBlock {
  type: 'text';
  text: {
    value: string;
  };
}

// Type guard to check if content is text
function isTextContent(content: any): content is TextContentBlock {
  return content.type === 'text' && content.text && typeof content.text.value === 'string';
}

/**
 * Get or create a conversation thread for a user
 */
async function getOrCreateThreadForUser(userId: string, context?: string): Promise<string> {
  if (!threadsByUser.has(userId)) {
    const thread = await openai.beta.threads.create();
    threadsByUser.set(userId, thread.id);
    
    // Add context as a user message if provided
    if (context) {
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: context
      });
    }
    
    return thread.id;
  }
  return threadsByUser.get(userId)!;
}

/**
 * Build the context from video transcription and summaries
 */
async function buildContext(courseId: mongoose.Types.ObjectId, videoUrl: string): Promise<string> {
  const transcriptionData = await VideoTranscription.findOne({
    courseId,
    videoUrl
  });

  if (!transcriptionData) {
    return "No transcription data available for this video.";
  }

  let context = "Context about the video:\n";

  // Add video transcription if available
  if (transcriptionData.transcription) {
    context += `Video Transcription:\n${transcriptionData.transcription}\n\n`;
  }

  // Add video summary if available
  if (transcriptionData.videoSummary) {
    context += `Video Summary:\n${transcriptionData.videoSummary}\n\n`;
  }

  // Add section summary if available
  if (transcriptionData.sectionSummary) {
    context += `Section Summary:\n${transcriptionData.sectionSummary}\n\n`;
  }

  // Add course summary if available
  if (transcriptionData.courseSummary) {
    context += `Course Summary:\n${transcriptionData.courseSummary}\n\n`;
  }

  return context;
}

/**
 * Chat with the trainer coach
 */
export async function chatWithTrainer(
  userId: string,
  courseId: string, 
  videoUrl: string, 
  message: string,
  threadId?: string
): Promise<ChatResponse> {
  try {
    // Convert courseId to ObjectId
    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    
    // Build context
    const context = await buildContext(courseObjectId, videoUrl);
    
    // Get or create a thread for this user
    const actualThreadId = threadId || await getOrCreateThreadForUser(userId, context);
    
    // Add the user message to the thread
    await openai.beta.threads.messages.create(actualThreadId, {
      role: "user",
      content: message
    });
    
    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(actualThreadId, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID as string
    });
    
    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(actualThreadId, run.id);
    
    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(actualThreadId, run.id);
    }
    
    if (runStatus.status !== "completed") {
      throw new Error(`Run failed: ${runStatus.status}`);
    }
    
    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(actualThreadId);
    const assistantMessages = messages.data.filter(msg => 
      msg.role === "assistant" && msg.run_id === run.id
    );
    
    const assistantResponse = assistantMessages[0]?.content
      .filter(part => isTextContent(part))
      .map(part => isTextContent(part) ? part.text.value : '')
      .join("\n") || "No response.";
    
    return {
      response: assistantResponse,
      threadId: actualThreadId
    };
  } catch (error: any) {
    console.error("Error in chatWithTrainer:", error);
    throw new Error(`Failed to chat with trainer: ${error.message}`);
  }
} 