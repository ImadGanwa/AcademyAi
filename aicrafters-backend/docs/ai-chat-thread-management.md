# AI Chat Thread Management

## Overview

The AI learning system uses OpenAI's thread API to maintain conversation context. This document explains how thread management works to address course switching and video content handling.

## Key Issues Resolved

### 1. Course Switching Bug
**Problem**: Users switching from one course to another would continue to receive answers related to their original course instead of the new course.

**Solution**: Threads are now stored using a composite key of `userId:courseId` instead of just `userId`, ensuring each user gets a separate conversation thread per course.

### 2. Video Content Handling
**Problem**: When users switch between videos within a course, the system needs to incorporate new video content without creating entirely new threads.

**Solution**: When switching videos within the same course, new video context is added to the existing thread rather than creating a new thread.

## Implementation Details

### Thread Key Generation
```typescript
function generateThreadKey(userId: string, courseId: string): string {
  return `${userId}:${courseId}`;
}
```

### Thread Storage
```typescript
// Store conversation threads by user and course combination
const threadsByUserAndCourse = new Map<string, string>();

// Track the last video URL for each thread to detect video changes
const lastVideoByThread = new Map<string, string>();
```

### Core Logic Flow

1. **New Course**: Create new thread with course-specific key
2. **Same Course, Different Video**: Add new video context to existing thread
3. **Same Course, Same Video**: Continue using existing thread

## Behavior Scenarios

### Scenario 1: User switches courses
```
User1 in Course1 -> Thread: user1:course1 (thread_abc123)
User1 in Course2 -> Thread: user1:course2 (thread_def456) // New thread
```

### Scenario 2: User switches videos within same course
```
User1 in Course1, Video1 -> Thread: user1:course1 (thread_abc123)
User1 in Course1, Video2 -> Thread: user1:course1 (thread_abc123) // Same thread + new video context
```

### Scenario 3: Multiple users in same course
```
User1 in Course1 -> Thread: user1:course1 (thread_abc123)
User2 in Course1 -> Thread: user2:course1 (thread_xyz789) // Different thread
```

## Frontend Integration

The frontend hook (`useAIFeatures`) detects course changes and automatically clears local chat state:

```typescript
// Handle course changes - clear chat state when course changes
useEffect(() => {
  if (currentCourseId.current !== courseId) {
    console.log(`Course changed - clearing chat state`);
    
    // Clear chat state for course switch
    setMessages([]);
    setThreadId(undefined);
    setChatError(null);
    
    // Update the current course reference
    currentCourseId.current = courseId;
  }
}, [courseId]);
```

## Video Context Management

When a video change is detected within the same course:

```typescript
// Check if we've switched videos within the same course
const lastVideoUrl = lastVideoByThread.get(actualThreadId);
if (lastVideoUrl && lastVideoUrl !== videoUrl) {
  // Video changed within the same course - add new video context
  await addVideoContextToThread(actualThreadId, currentVideoContext);
}

// Update the last video URL for this thread
lastVideoByThread.set(actualThreadId, videoUrl);
```

The new video context includes:
- Video transcription
- Video summary
- Section summary
- Course summary

## Context Structure

### Initial Course Context
```
Context for this course conversation:
Context about the current video:
Video Transcription: [transcription text]
Video Summary: [summary text]
Section Summary: [section summary]
Course Summary: [course summary]
```

### Video Switch Context
```
New video context (video changed within course):
Context about the current video:
Video Transcription: [new video transcription]
Video Summary: [new video summary]
Section Summary: [section summary]
Course Summary: [course summary]
```

## Utility Functions

### Clear Thread Data
```typescript
export function clearThreadForUserAndCourse(userId: string, courseId: string): void {
  const threadKey = generateThreadKey(userId, courseId);
  const threadId = threadsByUserAndCourse.get(threadKey);
  
  if (threadId) {
    threadsByUserAndCourse.delete(threadKey);
    lastVideoByThread.delete(threadId);
  }
}
```

### Monitor Active Threads
```typescript
export function getActiveThreadsCount(): number {
  return threadsByUserAndCourse.size;
}
```

## Benefits

1. **Isolated Conversations**: Each course has its own conversation context
2. **Efficient Context Updates**: Video switches don't restart conversations
3. **Memory Efficiency**: Threads are reused within courses
4. **User Experience**: Seamless transitions between videos in same course
5. **Clear Separation**: No cross-course contamination

## Testing

Run the test script to verify thread management:

```bash
cd aicrafters-backend
node test-thread-management.js
```

Expected results:
- ✅ Different courses get different threads
- ✅ Same course keeps same thread for different videos  
- ✅ Different users get different threads even in same course

## Monitoring

Monitor thread usage in production:

```typescript
console.log('Active threads:', getActiveThreadsCount());
```

Thread keys follow the pattern: `userId:courseId` 