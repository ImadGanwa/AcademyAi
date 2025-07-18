import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { AppError } from '../utils/AppError'; // Assuming AppError exists for consistent error handling
import logger from '../config/logger'; // Assuming a logger exists
import redis from '../config/redis';

dotenv.config();

// Cache TTL settings
// TODO: Move these hardcoded cache TTL and limit values to environment variables or configuration
const MIND_MAP_STRUCTURE_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days in seconds
const MIND_MAP_MARKDOWN_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days in seconds
const MAX_TRANSCRIPTION_SIZE = 15000; // Limit for transcription length to avoid AI context issues

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  logger.error('GEMINI_API_KEY is not defined in the environment variables');
  // Throwing here might stop the server start, consider logging and handling missing key in functions instead?
  // For now, keeping original behavior:
  throw new Error('GEMINI_API_KEY is not defined in the environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Using Gemini-pro model which is suitable for text generation
// TODO: Move hardcoded model name to environment variable or configuration
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Enhanced interface with recursive node structure for unlimited depth
export interface Node {
  name: string;
  children?: Node[];
}

export interface MindmapData {
  title: string;
  summary: string;
  nodes: Node[];
}

/**
 * Process transcription text and structure it into deeply nested hierarchical data
 * Uses Redis caching to improve performance
 */
async function structureTranscription(transcriptionText: string, courseId?: string, videoUrl?: string): Promise<MindmapData> {
  if (!transcriptionText || transcriptionText.trim().length === 0) {
    logger.warn('Attempted to structure empty transcription text.');
    return {
        title: "Empty Transcription",
        summary: "The provided transcription was empty.",
        nodes: []
    };
  }

  try {
    // Generate a cache key based on the content
    const cacheKey = `mindmap:structure:${Buffer.from(transcriptionText.substring(0, 50)).toString('base64')}`;
    
    // If courseId and videoUrl are provided, use a more specific cache key
    const specificCacheKey = courseId && videoUrl 
      ? `mindmap:structure:${courseId}:${encodeURIComponent(videoUrl)}` 
      : cacheKey;

    // Try to get from cache first
    const cachedStructure = await redis.get<MindmapData>(specificCacheKey);
    if (cachedStructure) {
      logger.info(`Retrieved mind map structure from cache for key: ${specificCacheKey}`);
      return cachedStructure;
    }

    // Trim transcription if it's too long to avoid AI context limits
    let processedTranscription = transcriptionText;
    if (transcriptionText.length > MAX_TRANSCRIPTION_SIZE) {
      logger.warn(`Transcription exceeds max size (${transcriptionText.length} chars). Trimming to ${MAX_TRANSCRIPTION_SIZE} chars.`);
      processedTranscription = transcriptionText.substring(0, MAX_TRANSCRIPTION_SIZE);
    }

    const prompt = `
    You are an expert in organizing educational content into extremely deep, hierarchical course outlines.
    Your MOST IMPORTANT task is to extract the DEEPEST POSSIBLE hierarchical structure from the content.

    Analyze the following transcription from an educational video and create a comprehensive, DEEPLY NESTED hierarchy.

    PRIORITY INSTRUCTION:
    GO AS DEEP AS POSSIBLE - create as many nested levels as the content allows.
    Don't stop at 3-4 levels - keep going deeper until you've captured the finest details.

    Your analysis must:
    1. Identify the main title/subject of the course
    2. Create a brief summary of the course
    3. Extract main topics (level 1)
    4. For each main topic, extract subtopics (level 2)
    5. For each subtopic, extract sub-subtopics (level 3)
    6. For each sub-subtopic, extract even finer points (level 4)
    7. CONTINUE THIS PATTERN FURTHER, extracting ever more granular details at levels 5, 6, 7, and beyond

    Think of this like a tree with many branches, and each branch has smaller branches, and those have even smaller branches.
    The goal is to create the most detailed, fine-grained hierarchical representation possible.

    The output must be structured JSON with a recursive node structure that can go arbitrarily deep:

    {
      "title": "Main Course Title",
      "summary": "Brief summary of the course content",
      "nodes": [
        {
          "name": "Main Topic 1",
          "children": [
            {
              "name": "Subtopic 1.1",
              "children": [
                {
                  "name": "Sub-subtopic 1.1.1",
                  "children": [
                    {
                      "name": "Detail 1.1.1.1",
                      "children": [
                        {
                          "name": "Fine point 1.1.1.1.1",
                          "children": [
                            {"name": "Specific example 1.1.1.1.1.1"},
                            {"name": "Another specific detail 1.1.1.1.1.2"}
                          ]
                        }
                      ]
                    },
                    {"name": "Detail 1.1.1.2"}
                  ]
                },
                {"name": "Sub-subtopic 1.1.2"}
              ]
            }
          ]
        }
      ]
    }

    CRITICAL INSTRUCTIONS:
    - MAXIMIZE DEPTH: Aim for at least 6-7 levels of hierarchy where possible, but go even deeper if the content allows
    - COMPLETENESS: Capture ALL content from the transcription with nothing left out
    - GRANULARITY: Break down complex concepts into their smallest components
    - PRECISION: Each node name should be concise yet descriptive
    - CONSISTENCY: Maintain similar levels of detail across different branches
    - NO TRUNCATION: If a node doesn't have children, omit the "children" property entirely
    - EXTRACT DETAILS from examples, case studies, or technical descriptions - these often contain deeper hierarchical structure
    - PAY SPECIAL ATTENTION to sequential processes, methodologies, or detailed explanations - these are opportunities for deep nesting

    Remember: The PRIMARY GOAL is to create the DEEPEST POSSIBLE hierarchical structure.

    Transcription text:
    ${processedTranscription}
  `;

    logger.info(`Sending transcription to Gemini for structuring (length: ${processedTranscription.length})`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract only the JSON part from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.error('Invalid JSON response format from Gemini for structuring', { responseText: text });
      throw new AppError('Failed to parse mind map structure from AI response', 500);
    }

    const structuredData = JSON.parse(jsonMatch[0]) as MindmapData;
    logger.info('Successfully structured transcription using Gemini.');
    
    // Cache the result
    await redis.setEx(specificCacheKey, MIND_MAP_STRUCTURE_CACHE_TTL, structuredData);
    logger.info(`Cached mind map structure with key: ${specificCacheKey}`);
    
    return structuredData;
  } catch (error: any) {
    logger.error('Error calling Gemini API for structuring:', { message: error.message, stack: error.stack });
    // Consider more specific error checking (e.g., rate limits, API key errors)
    throw new AppError('Failed to generate mind map structure due to an external service error', 503); // Service Unavailable
  }
}

/**
 * Convert deeply nested hierarchical data to markmap compatible markdown
 * Uses Redis caching to improve performance
 */
async function convertToMarkmap(structuredData: MindmapData, courseId?: string, videoUrl?: string): Promise<string> {
  // Basic check for empty data
  if (!structuredData || !structuredData.title || !structuredData.nodes || structuredData.nodes.length === 0) {
      logger.warn('Attempted to convert empty or invalid structured data to markmap.');
      return `# ${structuredData?.title || 'Empty Mind Map'}\n\nNo content available.`;
  }

  try {
    // Generate a cache key
    const dataHash = Buffer.from(JSON.stringify(structuredData).substring(0, 100)).toString('base64');
    const cacheKey = `mindmap:markdown:${dataHash}`;
    
    // If courseId and videoUrl are provided, use a more specific cache key
    const specificCacheKey = courseId && videoUrl 
      ? `mindmap:markdown:${courseId}:${encodeURIComponent(videoUrl)}` 
      : cacheKey;

    // Try to get from cache first
    const cachedMarkdown = await redis.get<string>(specificCacheKey);
    if (cachedMarkdown) {
      logger.info(`Retrieved markdown from cache for key: ${specificCacheKey}`);
      return cachedMarkdown;
    }

    const prompt = `
    Convert the following deeply nested hierarchical course data into markdown format compatible with markmap.js.org.

    The markdown should create the DEEPEST POSSIBLE hierarchical visualization using heading levels.

    Course data:
    ${JSON.stringify(structuredData, null, 2)}

    Rules for creating the markdown:
    1. Use # for the main course title (extracted from the 'title' field of the JSON)
    2. Use ## for each top-level node (main topics, first level of the 'nodes' array)
    3. Use ### for level 2 nodes (children of top-level nodes)
    4. Use #### for level 3 nodes
    5. Use ##### for level 4 nodes
    6. Use ###### for level 5 nodes
    7. For levels 6 and deeper, continue using ###### but add a prefix like "Level 6:", "Level 7:" etc. to the node name.

    CRITICAL INSTRUCTIONS:
    - START WITH THE MAIN TITLE: The first line MUST be '# {course title}'.
    - PRESERVE THE COMPLETE HIERARCHY as it appears in the JSON, no matter how deep it goes.
    - Include EVERY node name in the hierarchy with the appropriate heading level or prefix.
    - For nodes deeper than level 5 (i.e., level 6 onwards), use the '###### Level X: {node name}' format.
    - Maintain the exact hierarchical relationships from the input JSON data.
    - Do not add any extra text, explanations, or summaries not present in the node names or title.
    - Do not use bullet points or numbered lists - ONLY use markdown heading levels (#, ##, ###, ####, #####, ######).
    - Ensure the output is purely markdown content, starting with the main title heading.

    Output only the markdown content, nothing else.
  `;

    logger.info(`Sending structured data to Gemini for markmap conversion (title: ${structuredData.title})`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const markdownText = response.text();
    logger.info(`Successfully converted structured data to markmap format for: ${structuredData.title}`);
    
    // Cache the result
    await redis.setEx(specificCacheKey, MIND_MAP_MARKDOWN_CACHE_TTL, markdownText);
    logger.info(`Cached markdown with key: ${specificCacheKey}`);
    
    return markdownText;
  } catch (error: any) {
    logger.error('Error calling Gemini API for markmap conversion:', { message: error.message, stack: error.stack });
    throw new AppError('Failed to convert mind map to display format due to an external service error', 503);
  }
}

export const MindMapService = {
  structureTranscription,
  convertToMarkmap,
}; 