import { OpenAI } from 'openai';
import mongoose from 'mongoose';
import { VideoTranscription } from '../models/VideoTranscription';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store conversation threads by user and course combination
const threadsByUserAndCourse = new Map<string, string>();

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
 * Generate a unique key for thread identification
 */
function generateThreadKey(userId: string, courseId: string): string {
  return `${userId}:${courseId}`;
}

/**
 * Get or create a conversation thread for a user and course combination
 */
async function getOrCreateThreadForUserAndCourse(
  userId: string, 
  courseId: string, 
  context?: string
): Promise<string> {
  const threadKey = generateThreadKey(userId, courseId);
  
  if (!threadsByUserAndCourse.has(threadKey)) {
    const thread = await openai.beta.threads.create();
    threadsByUserAndCourse.set(threadKey, thread.id);
    
    // Add initial context as a user message if provided
    if (context) {
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Context for this course conversation:\n${context}`
      });
    }
    
    return thread.id;
  }
  
  return threadsByUserAndCourse.get(threadKey)!;
}

/**
 * Add video context to an existing thread when switching videos within the same course
 */
async function addVideoContextToThread(
  threadId: string, 
  videoContext: string
): Promise<void> {
  if (videoContext.trim()) {
    await openai.beta.threads.messages.create(threadId, {
      role: "user", 
      content: `New video context (video changed within course):\n${videoContext}`
    });
  }
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

  let context = "Context about the current video:\n";

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
 * Track the last video URL for each thread to detect video changes
 */
const lastVideoByThread = new Map<string, string>();

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
    
    // Build context for current video
    const currentVideoContext = await buildContext(courseObjectId, videoUrl);
    
    // Get or create a thread for this user and course combination
    const actualThreadId = threadId || await getOrCreateThreadForUserAndCourse(
      userId, 
      courseId, 
      currentVideoContext
    );
    
    // Check if we've switched videos within the same course
    const lastVideoUrl = lastVideoByThread.get(actualThreadId);
    if (lastVideoUrl && lastVideoUrl !== videoUrl) {
      // Video changed within the same course - add new video context
      await addVideoContextToThread(actualThreadId, currentVideoContext);
    }
    
    // Update the last video URL for this thread
    lastVideoByThread.set(actualThreadId, videoUrl);
    
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

/**
 * Clear thread data for a specific user and course (useful for testing or manual cleanup)
 */
export function clearThreadForUserAndCourse(userId: string, courseId: string): void {
  const threadKey = generateThreadKey(userId, courseId);
  const threadId = threadsByUserAndCourse.get(threadKey);
  
  if (threadId) {
    threadsByUserAndCourse.delete(threadKey);
    lastVideoByThread.delete(threadId);
  }
}

/**
 * Get all active threads (useful for monitoring)
 */
export function getActiveThreadsCount(): number {
  return threadsByUserAndCourse.size;
}

/**
 * Get system statistics for monitoring (basic version)
 */
export function getSystemStats(): {
  activeThreads: number;
  lastVideoTracking: number;
  health: { redis: boolean };
} {
  return {
    activeThreads: threadsByUserAndCourse.size,
    lastVideoTracking: lastVideoByThread.size,
    health: { redis: true }
  };
}

/**
 * Preload popular content (placeholder for future implementation)
 */
export async function preloadPopularContent(): Promise<void> {
  // This is a placeholder function to match the mentor service interface
  // In the future, this could preload commonly accessed course contexts
  console.log('Preloading popular trainer content...');
}

/**
 * Invalidate context cache (placeholder for future implementation)
 */
export async function invalidateContextCache(courseId: string, videoUrl?: string): Promise<void> {
  // This is a placeholder function to match the mentor service interface
  // In the future, this could invalidate cached course contexts
  console.log('Invalidating trainer context cache...', 
    videoUrl ? `Course: ${courseId}, Video: ${videoUrl}` : `Course: ${courseId}`);
} 