import { OpenAI } from 'openai';
import { ScalableMentorThreadManager } from './ScalableMentorThreadManager';
import { MentorSearchCache } from './MentorSearchCache';
import logger from '../config/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize scalable components
const mentorThreadManager = new ScalableMentorThreadManager();
const mentorSearchCache = new MentorSearchCache();

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
 * Define the search_mentors tool for OpenAI assistant with caching
 */
const searchMentorsTool = {
  type: "function" as const,
  function: {
    name: "search_mentors",
    description: "Intelligently match users with mentors based on skills, professional background, academic experience, bio, languages, and countries. Results are cached for better performance.",
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
 * Handle tool calls from the assistant with caching
 */
async function handleToolCalls(threadId: string, runId: string, toolCalls: any[]) {
  const toolOutputs = [];

  for (const toolCall of toolCalls) {
    if (toolCall.function.name === "search_mentors") {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        
        // Use cached search for better performance
        const mentors = await mentorSearchCache.getCachedSearch(args);
        
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
        logger.error('Error in mentor search tool call:', error);
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
 * Run OpenAI assistant with retry logic and better error handling
 */
async function runMentorAssistantWithRetry(threadId: string, maxRetries: number = 3): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Run the assistant on the thread with the search_mentors tool
      let run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: process.env.OPENAI_MENTOR_ASSISTANT_ID || process.env.OPENAI_ASSISTANT_ID as string,
        tools: [searchMentorsTool]
      });
      
      // Keep polling until we get a terminal state with exponential backoff
      let pollCount = 0;
      const maxPolls = 60; // 60 seconds timeout
      
      while (true) {
        // Exponential backoff: 1s, 2s, 4s, then 1s intervals
        const delay = pollCount < 3 ? Math.pow(2, pollCount) * 1000 : 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        pollCount++;
        
        // Get the current run status
        run = await openai.beta.threads.runs.retrieve(threadId, run.id);
        
        // Check if we've reached a terminal state
        if (run.status === "completed" || run.status === "failed" || 
            run.status === "cancelled" || run.status === "expired") {
          break;
        }
        
        // Handle tool calls if required
        if (run.status === "requires_action" && 
            run.required_action?.type === "submit_tool_outputs") {
          const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
          await handleToolCalls(threadId, run.id, toolCalls);
          // Reset poll count after handling tool calls
          pollCount = 0;
        }
        
        // Timeout check
        if (pollCount >= maxPolls) {
          throw new Error('Assistant run timeout after 60 seconds');
        }
      }
      
      if (run.status !== "completed") {
        throw new Error(`Assistant run failed with status: ${run.status}`);
      }
      
      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(threadId);
      const assistantMessages = messages.data.filter(msg => 
        msg.role === "assistant" && msg.run_id === run.id
      );
      
      const assistantResponse = assistantMessages[0]?.content
        .filter(part => isTextContent(part))
        .map(part => isTextContent(part) ? part.text.value : '')
        .join("\n") || "I'm here to help with your mentorship and career questions. How can I assist you today?";
      
      return assistantResponse;
      
    } catch (error: any) {
      logger.warn(`Mentor assistant run attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry with exponential backoff
      const retryDelay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error("Maximum retries exceeded");
}

/**
 * Chat with the Adwina Mentor - Now scalable for 1000+ concurrent users
 */
export async function chatWithMentor(
  userId: string,
  message: string,
  threadId?: string,
  mentorId?: string
): Promise<MentorChatResponse> {
  const startTime = Date.now();
  
  try {
    logger.info(`Mentor chat request from user ${userId}${mentorId ? ` with mentor ${mentorId}` : ' (general)'}`);
    
    // Build initial mentorship context
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
    
    // Get or create thread using Redis storage (scales across multiple instances)
    const actualThreadId = threadId || await mentorThreadManager.getOrCreateMentorThread(
      userId, 
      mentorId, 
      mentorshipContext
    );
    
    // Add the user message to the thread
    await openai.beta.threads.messages.create(actualThreadId, {
      role: "user",
      content: message
    });
    
    // Run the assistant with retry logic
    const response = await runMentorAssistantWithRetry(actualThreadId);
    
    const duration = Date.now() - startTime;
    logger.info(`Mentor chat request completed in ${duration}ms for user ${userId}`);
    
    return {
      response,
      threadId: actualThreadId
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`Mentor chat request failed after ${duration}ms for user ${userId}:`, error);
    throw new Error(`Failed to chat with mentor: ${error.message}`);
  }
}

/**
 * Clear mentor thread data for a specific user (useful for testing or manual cleanup)
 */
export async function clearMentorThreadForUser(userId: string, mentorId?: string): Promise<void> {
  await mentorThreadManager.clearMentorThreadForUser(userId, mentorId);
}

/**
 * Get mentor system statistics for monitoring
 */
export async function getMentorSystemStats(): Promise<{
  threads: { totalThreads: number; generalThreads: number; mentorSpecificThreads: number };
  searchCache: { totalCachedSearches: number; cacheSize: string; oldestEntry?: string; newestEntry?: string };
  health: { redis: boolean; searchCache: boolean };
}> {
  try {
    const [threadStats, searchCacheStats, redisHealth, searchCacheHealth] = await Promise.all([
      mentorThreadManager.getMentorThreadStats(),
      mentorSearchCache.getCacheStats(),
      mentorThreadManager.healthCheck(),
      mentorSearchCache.healthCheck()
    ]);
    
    return {
      threads: threadStats,
      searchCache: searchCacheStats,
      health: { 
        redis: redisHealth,
        searchCache: searchCacheHealth
      }
    };
  } catch (error) {
    logger.error('Error getting mentor system stats:', error);
    return {
      threads: { totalThreads: 0, generalThreads: 0, mentorSpecificThreads: 0 },
      searchCache: { totalCachedSearches: 0, cacheSize: '0 entries' },
      health: { redis: false, searchCache: false }
    };
  }
}

/**
 * Preload popular mentor searches for better performance
 */
export async function preloadPopularMentorContent(): Promise<void> {
  await mentorSearchCache.preloadPopularSearches();
}

/**
 * Invalidate mentor search cache when mentor data is updated
 */
export async function invalidateMentorSearchCache(pattern?: string): Promise<void> {
  if (pattern) {
    await mentorSearchCache.invalidateSearchPattern(pattern);
  } else {
    await mentorSearchCache.invalidateSearchCache();
  }
}

/**
 * Get user's mentor threads for management
 */
export async function getUserMentorThreads(userId: string): Promise<Array<{threadId: string, type: string, mentorId?: string}>> {
  return await mentorThreadManager.getUserMentorThreads(userId);
}

/**
 * Switch to specific mentor context
 */
export async function switchToMentorContext(threadId: string, mentorId: string, mentorInfo?: any): Promise<void> {
  await mentorThreadManager.switchToMentorContext(threadId, mentorId, mentorInfo);
}

// Export instances for testing
export { mentorThreadManager, mentorSearchCache }; 