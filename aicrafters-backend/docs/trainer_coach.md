# Trainer Coach Documentation

## Overview

The Trainer Coach is an AI-powered assistant integrated into the course player that provides context-aware support for students. It uses the video transcription, video summary, section summary, and course summary data to provide intelligent responses to student questions.

## Key Features

- **Context-aware responses**: The Trainer Coach uses video transcription and summaries to provide accurate responses
- **Real-time chat interface**: Students can interact with the Trainer Coach while watching videos
- **Adaptive content**: Responses are tailored to the specific content being viewed
- **Persistent conversations**: Conversations are maintained in threads to provide continuity
- **Interactive UI**: User-friendly chat interface displayed next to course videos

## Requirements

### Backend
- Connect to the VideoTranscription database model
- Create API endpoints for chatbot interactions
- Integrate with OpenAI API for generating responses
- Pass the following context to the AI model:
  - Video transcription
  - Video summary
  - Section summary
  - Course summary

### Frontend
- Create a chat component to display next to video content
- Design a user-friendly chat interface
- Implement state management for chat history
- Handle API requests to the backend chatbot service

## Technical Implementation

### Backend

The backend implementation includes:

1. **API Routes**:
   - `GET /api/trainer/chat`: Chat with the Trainer Coach
     - Parameters:
       - `courseId`: The ID of the course
       - `videoUrl`: The URL of the video
       - `message`: The user's message
       - `threadId` (optional): The conversation thread ID for continuity

2. **Service Layer**:
   - `trainerService.ts`: Handles OpenAI API integration and context building
   - Features:
     - Conversation threading for persistent interactions
     - Context building from video transcription and summaries
     - Error handling and retries

3. **Controller Layer**:
   - `trainerController.ts`: Handles API requests and responses
   - Features:
     - Parameter validation
     - Error handling
     - Response formatting

### Response Format
```json
{
  "success": true,
  "data": {
    "response": "AI-generated response",
    "threadId": "conversation-thread-id"
  }
}
```

### Frontend

The frontend implementation includes:

1. **Components**:
   - `TrainerChat.tsx`: Main trainer chat component
   - `ChatMessage.tsx`: Component for displaying individual messages
   - `ChatInput.tsx`: Component for user input

2. **Hooks**:
   - `useTrainerChat.ts`: Custom hook for managing chat state and API communication

3. **Services**:
   - `trainerService.ts`: Service for communication with the backend API

## Database Integration

The implementation uses the existing VideoTranscription model:

```typescript
interface IVideoTranscription {
  courseId: mongoose.Types.ObjectId;
  videoUrl: string;
  transcription: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  lastAttempt: Date;
  retryCount: number;
  videoSummary?: string; // AI-generated summary of the video
  sectionSummary?: string; // AI-generated summary of the section
  courseSummary?: string; // AI-generated summary of the entire course
  summaryStatus?: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
```

## Architecture

```
Backend
├── models/
│   └── VideoTranscription.ts  (existing)
├── services/
│   └── trainerService.ts      (new)
├── routes/
│   └── trainerRoutes.ts       (new)
└── controllers/
    └── trainerController.ts   (new)

Frontend
├── components/
│   └── TrainerChat/
│       ├── TrainerChat.tsx       (new)
│       ├── ChatMessage.tsx       (new)
│       └── ChatInput.tsx         (new)
├── services/
│   └── trainerService.ts      (new)
└── hooks/
    └── useTrainerChat.ts      (new)
```

## Integration

The Trainer Coach integrates with the course player page. It appears alongside the video player, providing a chat interface where students can ask questions related to the content they're watching.

### Integration in Course Video Player

```jsx
// In your CourseVideoPlayer component
function CourseVideoPlayer({ courseId, videoUrl, videoTitle }) {
  const [showChat, setShowChat] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const toggleChat = () => {
    setShowChat(prev => !prev);
  };

  return (
    <>
      {/* Mobile chat toggle button */}
      {isMobile && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          <IconButton
            color="primary"
            sx={{ 
              bgcolor: 'background.paper',
              boxShadow: 3,
              '&:hover': { bgcolor: 'background.paper' }
            }}
            onClick={toggleChat}
          >
            {showChat ? <CloseIcon /> : <ChatIcon />}
          </IconButton>
        </Box>
      )}

      {/* Desktop layout */}
      {!isMobile ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {/* Video player */}
            <VideoPlayer url={videoUrl} title={videoTitle} />
          </Grid>
          <Grid item xs={12} md={4}>
            {/* Trainer Coach */}
            <Box sx={{ height: 'calc(100vh - 200px)' }}>
              <TrainerChat 
                courseId={courseId} 
                videoUrl={videoUrl} 
              />
            </Box>
          </Grid>
        </Grid>
      ) : (
        <>
          {/* Mobile layout */}
          <Box sx={{ width: '100%' }}>
            {/* Video player */}
            <VideoPlayer url={videoUrl} title={videoTitle} />
          </Box>
          
          {/* Mobile chat popup */}
          {showChat && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                right: 0,
                width: '100%',
                height: '70vh',
                zIndex: 999,
                padding: 1,
              }}
            >
              <TrainerChat 
                courseId={courseId} 
                videoUrl={videoUrl} 
                onClose={toggleChat}
              />
            </Box>
          )}
        </>
      )}
    </>
  );
}
```

### Responsive Design

The integration includes responsive design considerations:
- On desktop, the Trainer Coach appears in a sidebar next to the video
- On mobile, the Trainer Coach is accessible via a chat button that opens a modal

## Dependencies

- Backend:
  - OpenAI SDK: For AI capabilities
  - Mongoose: For database access
  - Express: For API endpoints

- Frontend:
  - React: For UI components
  - Material UI: For styling
  - React Markdown: For message formatting
  - Axios: For API communication

## Data Flow

1. User watches a video in the course player
2. User asks a question via the Trainer Coach interface
3. The frontend sends the question to the backend
4. The backend retrieves context data (transcription, summaries)
5. The backend sends the context and question to OpenAI
6. OpenAI generates a response based on the context
7. The response is sent back to the frontend
8. The frontend displays the response to the user

## Testing Guidelines

When testing the Trainer Coach integration:

1. **Test with real data:** Use actual video content with transcription and summaries
2. **Test various questions:** Try asking specific questions about:
   - Content explained in the video
   - Related topics covered in other parts of the course
   - Clarification requests about concepts
3. **Test on different devices:** Ensure the UI works well on desktop and mobile
4. **Test error handling:** Try scenarios where transcription might be missing

## Implementation Status

- ✅ Backend service implementation (trainerService.ts)
- ✅ API endpoints creation (trainerController.ts, trainerRoutes.ts)
- ✅ Frontend component development (TrainerChat, ChatMessage, ChatInput)
- ✅ Backend dependency installation (openai)
- ✅ Frontend dependency installation (react-markdown)
- ✅ Documentation

Remaining tasks:
- ➡️ Integrate TrainerChat into video player component
- ➡️ Test with real course data and transcriptions
- ➡️ Add analytics to track common questions (future enhancement)

## Future Enhancements

Potential enhancements for the Trainer Coach feature:

1. **Analytics**: Track common questions to improve the model and content
2. **Interactive exercises**: Generate practice exercises based on content
3. **Personalized learning**: Adapt responses to the user's learning pace
4. **Code assistance**: Provide help with coding exercises
5. **Multilingual support**: Support for multiple languages

## Getting Started (For Developers)

1. Ensure the required dependencies are installed:
   ```bash
   # Backend
   cd aicrafters-backend
   npm install openai
   
   # Frontend
   cd aicrafters-frontend
   npm install react-markdown
   ```

2. Configure the OpenAI API key in the backend `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

3. Follow the integration guide in this document to integrate the TrainerChat component into the course player page.

## Implementation Notes

- OpenAI API key needs to be set in the backend .env file
- The TrainerChat component is responsive and supports both desktop and mobile
- Initial context loading may take some time, consider adding a loading indicator
- The OpenAI model used is gpt-4-turbo-preview for optimal results 