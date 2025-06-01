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
    
    // Add initial context for mentorship with enhanced search capabilities
    const mentorshipContext = `You are Adwina Mentor, an AI assistant specialized in mentorship and career guidance. 
    You help users with:
    - Finding the right mentors for their career goals by matching their needs with mentor profiles
    - Preparing for mentorship sessions
    - Understanding different mentorship styles
    - Career development advice
    - Professional networking guidance
    - Skill development recommendations
    
    When helping users find mentors, you have enhanced intelligent matching capabilities that focus on:
    - Skills and expertise areas (with partial and semantic matching)
    - Professional background including job roles and experience
    - Academic background and qualifications
    - Languages spoken
    - Countries/locations
    - Detailed bio analysis to find mentors with relevant experience
    
    All mentors on this platform offer their services for free to support the growth and development of others.
    
    You can search for mentors using a combination of these criteria to find the best matches.
    For example, you can help users find mentors who specialize in "machine learning" and speak "Spanish"
    or find mentors with experience in "startup" environments with academic backgrounds in business.
    
    When suggesting mentors, focus on matching the user's needs with the mentor's skills, professional experience, 
    and background for the most relevant recommendations.
    
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
    description: "Intelligently match users with mentors based on skills, professional background, academic experience, bio, languages, and countries.",
    parameters: {
      type: "object",
      properties: {
        skills: {
          type: "string",
          description: "Skills and expertise areas to match (e.g. 'machine learning', 'web development', 'javascript'). Uses semantic matching to find relevant mentors even with partial matches."
        },
        languages: {
          type: "string",
          description: "Language(s) that the mentor speaks (e.g. 'English', 'French', 'Spanish'). Important for ensuring good communication between mentor and mentee."
        },
        countries: {
          type: "string",
          description: "Country or countries where the mentor is from or based (e.g. 'USA', 'Canada', 'France'). Helps find mentors with relevant cultural and regional expertise."
        },
        query: {
          type: "string",
          description: "Free text search that analyzes mentor profiles holistically. Matches against bio text, professional experience, roles, academic background and more. Ideal for finding specialized expertise or specific backgrounds."
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
        
        // Enhanced format for mentor data with more context
        const formattedMentors = mentors.map(mentor => ({
          fullName: mentor.fullName,
          skills: mentor.skills,
          languages: mentor.languages,
          countries: mentor.countries,
          bio: mentor.bio,
          availability: mentor.availability,
          professionalInfo: mentor.professionalInfo,
          // Add detailed explanation of how matches were determined
          matchDetails: `This mentor was matched based on ${
            [
              args.skills ? "skills and expertise areas" : "",
              args.languages ? "language proficiency" : "",
              args.countries ? "country/location" : "",
              args.query ? "profile information including bio text, professional background, and academic experience" : ""
            ].filter(Boolean).join(", ") || "your search criteria"
          }.
          
          ${mentor.bio ? `Their bio highlights their expertise: "${mentor.bio.substring(0, 100)}${mentor.bio.length > 100 ? '...' : ''}"` : ''}
          ${mentor.professionalInfo?.role ? `They work as: ${mentor.professionalInfo.role}` : ''}
          ${mentor.professionalInfo?.academicBackground ? `Academic background: ${mentor.professionalInfo.academicBackground}` : ''}
          ${mentor.skills?.length > 0 ? `Key skills: ${mentor.skills.join(', ')}` : ''}
          ${mentor.languages?.length > 0 ? `Languages: ${mentor.languages.join(', ')}` : ''}
          ${mentor.countries?.length > 0 ? `Location: ${mentor.countries.join(', ')}` : ''}`
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