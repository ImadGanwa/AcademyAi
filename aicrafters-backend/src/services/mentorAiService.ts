import { OpenAI } from 'openai';
import { searchMentors } from './mentorSearchService';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store conversation threads by user
const mentorThreadsByUser = new Map<string, string>();

interface MentorChatResponse {
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
async function getOrCreateMentorThreadForUser(userId: string): Promise<string> {
  if (!mentorThreadsByUser.has(userId)) {
    const thread = await openai.beta.threads.create();
    mentorThreadsByUser.set(userId, thread.id);
    
    // Add initial context for mentorship
    const mentorshipContext = `You are Adwina Mentor, an AI assistant specialized in mentorship and career guidance. 
    You help users with:
    - Finding the right mentors for their career goals
    - Preparing for mentorship sessions
    - Understanding different mentorship styles
    - Career development advice
    - Professional networking guidance
    - Skill development recommendations
    
    Be supportive, professional, and provide actionable advice. Focus on mentorship-related topics and career development.`;
    
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: mentorshipContext
    });
    
    return thread.id;
  }
  return mentorThreadsByUser.get(userId)!;
}

/**
 * Define the search_mentors tool for OpenAI assistant
 */
const searchMentorsTool = {
  type: "function" as const,
  function: {
    name: "search_mentors",
    description: "Search for mentors based on various criteria like skills, languages, hourly rate, etc.",
    parameters: {
      type: "object",
      properties: {
        skills: {
          type: "string",
          description: "Skills area(s) to search for (e.g. 'machine learning', 'web development')"
        },
        languages: {
          type: "string",
          description: "Language(s) that the mentor speaks"
        },
        countries: {
          type: "string",
          description: "Country or countries where the mentor is from or based"
        },
        hourlyRateMin: {
          type: "number",
          description: "Minimum hourly rate"
        },
        hourlyRateMax: {
          type: "number",
          description: "Maximum hourly rate"
        },
        availability: {
          type: "string",
          description: "Availability preferences (e.g. 'weekdays', 'weekends', 'mornings', 'afternoons', 'evenings')"
        },
        query: {
          type: "string",
          description: "Free text search query to find in mentor profiles"
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default: 10)"
        }
      },
      required: []
    }
  }
};

/**
 * Handle tool calls from the assistant
 */
async function handleToolCalls(threadId: string, runId: string, toolCalls: any[]) {
  const toolOutputs = [];

  for (const toolCall of toolCalls) {
    if (toolCall.function.name === "search_mentors") {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        const mentors = await searchMentors(args);
        
        // Format mentor data for readability
        const formattedMentors = mentors.map(mentor => ({
          fullName: mentor.fullName,
          skills: mentor.skills,
          hourlyRate: mentor.hourlyRate,
          languages: mentor.languages,
          countries: mentor.countries,
          bio: mentor.bio,
          availability: mentor.availability,
          professionalInfo: mentor.professionalInfo
        }));
        
        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify(formattedMentors)
        });
      } catch (error: any) {
        // Handle errors and send them back to the assistant
        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify({ error: error.message })
        });
      }
    }
  }

  // Submit the tool outputs back to the assistant
  if (toolOutputs.length > 0) {
    await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
      tool_outputs: toolOutputs
    });
  }
}

/**
 * Chat with the Adwina Mentor
 */
export async function chatWithMentor(
  userId: string,
  message: string,
  threadId?: string,
  mentorId?: string
): Promise<MentorChatResponse> {
  try {
    // Get or create a thread for this user
    const actualThreadId = threadId || await getOrCreateMentorThreadForUser(userId);
    
    // Add the user message to the thread
    await openai.beta.threads.messages.create(actualThreadId, {
      role: "user",
      content: message
    });
    
    // Run the assistant on the thread with the search_mentors tool
    let run = await openai.beta.threads.runs.create(actualThreadId, {
      assistant_id: process.env.OPENAI_MENTOR_ASSISTANT_ID || process.env.OPENAI_ASSISTANT_ID as string,
      tools: [searchMentorsTool]
    });
    
    // Keep polling until we get a terminal state
    while (true) {
      // Wait a bit before checking status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the current run status
      run = await openai.beta.threads.runs.retrieve(actualThreadId, run.id);
      
      // Check if we've reached a terminal state
      if (run.status === "completed" || run.status === "failed" || run.status === "cancelled" || run.status === "expired") {
        break;
      }
      
      // Handle tool calls if required
      if (run.status === "requires_action" && 
          run.required_action?.type === "submit_tool_outputs") {
        const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
        await handleToolCalls(actualThreadId, run.id, toolCalls);
        // Continue polling after handling tool calls
      }
    }
    
    if (run.status !== "completed") {
      throw new Error(`Run failed: ${run.status}`);
    }
    
    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(actualThreadId);
    const assistantMessages = messages.data.filter(msg => 
      msg.role === "assistant" && msg.run_id === run.id
    );
    
    const assistantResponse = assistantMessages[0]?.content
      .filter(part => isTextContent(part))
      .map(part => isTextContent(part) ? part.text.value : '')
      .join("\n") || "I'm here to help with your mentorship and career questions. How can I assist you today?";
    
    return {
      response: assistantResponse,
      threadId: actualThreadId
    };
  } catch (error: any) {
    console.error("Error in chatWithMentor:", error);
    throw new Error(`Failed to chat with mentor: ${error.message}`);
  }
} 