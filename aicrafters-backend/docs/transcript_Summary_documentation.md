# AICrafters Transcription System Documentation

## Overview
The transcription system automatically generates and stores transcriptions for Vimeo videos in courses. It uses the Vimeo API to fetch transcriptions and stores them in MongoDB for easy access.

## System Components

### 1. Database Model
**File:** `src/models/VideoTranscription.ts`
```typescript
interface IVideoTranscription {
  courseId: mongoose.Types.ObjectId;
  videoUrl: string;
  transcription: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  lastAttempt: Date;
  retryCount: number;  // Number of attempts made to get transcription
  videoSummary?: string; // AI-generated summary of the video
  sectionSummary?: string; // AI-generated summary of the section
  courseSummary?: string; // AI-generated summary of the entire course
  summaryStatus?: 'pending' | 'completed' | 'failed'; // Status of AI summary generation
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. API Endpoints
**File:** `src/routes/transcriptionRoutes.ts`
- `POST /api/transcriptions/courses/:courseId/process`
  - Triggers transcription process for all videos in a course
  - Requires authentication
  - Returns: `{ message: 'Transcription process started successfully' }`

- `GET /api/transcriptions/courses/:courseId/videos/:videoUrl`
  - Retrieves transcription for a specific video
  - Requires authentication
  - Returns: `{ transcription: string }`

**File:** `src/routes/summaryRoutes.ts`
- `POST /api/summaries/courses/:courseId/generate`
  - Triggers AI summary generation for a course and its videos
  - Requires authentication and OpenAI API key
  - Returns: `{ message: 'Summary generation process started successfully' }`

- `GET /api/summaries/courses/:courseId/videos/:videoUrl`
  - Retrieves AI-generated summaries for a specific video
  - Requires authentication
  - Returns: `{ videoSummary: string, sectionSummary: string, courseSummary: string }`

### 3. Service Layer
**File:** `src/services/transcriptionService.ts`
- Handles business logic for transcription processing
- Features:
  - Maximum of 3 retry attempts for failed transcriptions
  - 10-minute delay between retry attempts
  - Skips already completed transcriptions
  - Extracts video URLs from course content
  - Updates transcription status and error messages

**File:** `src/services/summaryService.ts`
- Handles business logic for generating AI-powered summaries
- Features:
  - Generates summaries at video, section, and course levels
  - Uses OpenAI API for natural language processing
  - Integrates with existing transcription data
  - Stores all summaries in the database

### 4. Vimeo API Integration
**File:** `src/utils/transcriptionApi.ts`
- Handles communication with Vimeo API
- Features:
  - Extracts video ID from Vimeo URLs
  - Fetches transcription data
  - Processes VTT format into plain text
  - Error handling for API responses

### 5. OpenAI Integration
**File:** `src/services/summaryService.ts`
- Handles communication with OpenAI API
- Features:
  - Sends transcription text to OpenAI for summarization
  - Processes API responses
  - Manages API error handling and retries
  - Supports different levels of summarization

## How to Use

### 1. Environment Setup
Add to your `.env` file:
```env
VIMEO_ACCESS_TOKEN=your_vimeo_access_token
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

### 2. Triggering Transcriptions
```typescript
// Using the API
POST /api/transcriptions/courses/:courseId/process
Headers: {
  Authorization: 'Bearer your_jwt_token'
}

// Using the service directly
await TranscriptionService.processCourseVideos(courseId, accessToken);
```

### 3. Generating Summaries
```typescript
// Using the API
POST /api/summaries/courses/:courseId/generate
Headers: {
  Authorization: 'Bearer your_jwt_token'
  X-OpenAI-API-Key: 'your_openai_api_key'
}

// Using the service directly
await SummaryService.processCourseForSummaries(courseId, openAiApiKey);
```

### 4. Retrieving Transcriptions and Summaries
```typescript
// Using the API for transcriptions
GET /api/transcriptions/courses/:courseId/videos/:videoUrl
Headers: {
  Authorization: 'Bearer your_jwt_token'
}

// Using the API for summaries
GET /api/summaries/courses/:courseId/videos/:videoUrl
Headers: {
  Authorization: 'Bearer your_jwt_token'
}

// Using the service directly
const transcription = await TranscriptionService.getTranscription(courseId, videoUrl);
const transcriptionWithSummaries = await SummaryService.getVideoTranscriptionWithSummaries(courseId, videoUrl);
```

### 5. Database Queries
```typescript
// Find all transcriptions for a course
const transcriptions = await VideoTranscription.find({ courseId });

// Find specific video transcription
const transcription = await VideoTranscription.findOne({ courseId, videoUrl });

// Find failed transcriptions
const failedTranscriptions = await VideoTranscription.find({ status: 'failed' });

// Find transcriptions with completed summaries
const completedSummaries = await VideoTranscription.find({ summaryStatus: 'completed' });

// Find transcriptions that reached max retries
const maxRetriesTranscriptions = await VideoTranscription.find({ retryCount: { $gte: 3 } });
```

## Data Structure

### VideoTranscription Document
```typescript
{
  courseId: ObjectId,      // Reference to the course
  videoUrl: string,        // Vimeo video URL
  transcription: string,   // The actual transcription text
  status: string,          // 'pending' | 'completed' | 'failed'
  error: string,           // Error message if failed
  lastAttempt: Date,       // Last attempt timestamp
  retryCount: number,      // Number of attempts made (max 3)
  videoSummary: string,    // AI-generated video summary
  sectionSummary: string,  // AI-generated section summary
  courseSummary: string,   // AI-generated course summary
  summaryStatus: string,   // 'pending' | 'completed' | 'failed' for summary generation
  createdAt: Date,         // Document creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

## Error Handling

### Common Error Scenarios
1. **Invalid Vimeo URL**
   - Error: "Invalid Vimeo URL"
   - Solution: Ensure video URL is a valid Vimeo URL

2. **Unauthorized Access**
   - Error: "Unauthorized: Please check your access token"
   - Solution: Verify Vimeo access token is valid

3. **Video Not Found**
   - Error: "Video not found or not accessible"
   - Solution: Check if video exists and is accessible

4. **Transcription Not Available**
   - Error: "No transcription found"
   - Solution: Wait for Vimeo to generate transcription

5. **Max Retries Reached**
   - Error: "Max retries reached"
   - Solution: Wait for course update to trigger new attempt

6. **OpenAI API Error**
   - Error: "Failed to generate summary with OpenAI"
   - Solution: Check OpenAI API key and rate limits

## Best Practices

1. **Error Handling**
   - Always check transcription and summary status before displaying
   - Monitor retry counts for failed transcriptions
   - Log errors for debugging

2. **Performance**
   - Use indexes for frequent queries
   - Cache transcriptions and summaries when possible
   - Implement pagination for large datasets

3. **Security**
   - Always use authentication for API endpoints
   - Validate input data
   - Use environment variables for sensitive data
   - Don't expose OpenAI API key in client-side code

## Maintenance

### Checking Transcription Status
Use the provided script:
```bash
npx ts-node src/scripts/checkTranscriptions.ts
```

### Triggering New Transcriptions
Use the provided script:
```bash
npx ts-node src/scripts/triggerTranscription.ts
```

### Triggering Summary Generation
Use the provided script:
```bash
npx ts-node src/scripts/triggerSummaries.ts
```

## Future Improvements

1. **Features to Add**
   - Batch processing for multiple courses
   - Webhook support for transcription and summary updates
   - Transcription and summary search functionality
   - Support for other video platforms
   - More detailed summary categories
   - Custom prompt templates for different summary types

2. **Optimizations**
   - Implement caching
   - Add rate limiting
   - Improve error handling
   - Add more detailed logging
   - Optimize OpenAI API usage
   - Support different OpenAI models (e.g., GPT-4 for better summaries)

## Troubleshooting

### Common Issues
1. **Transcription Not Found**
   - Check if video URL is correct
   - Verify Vimeo access token
   - Check if transcription exists in database

2. **Failed Transcriptions**
   - Check error message in database
   - Verify video accessibility
   - Check Vimeo API status
   - Check retry count (max 3 attempts)

3. **Failed Summaries**
   - Check OpenAI API key validity
   - Verify transcription exists and is completed
   - Check OpenAI API rate limits
   - Verify that the transcription text is not empty 