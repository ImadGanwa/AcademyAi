"use strict";
// Test script for thread management
// This simulates the scenarios described in the issue
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mockThreadsByUserAndCourse = new Map();
const mockLastVideoByThread = new Map();
function generateThreadKey(userId, courseId) {
    return `${userId}:${courseId}`;
}
function simulateChat(userId, courseId, videoUrl, message, threadId) {
    return __awaiter(this, void 0, void 0, function* () {
        const threadKey = generateThreadKey(userId, courseId);
        // Get or create thread
        let actualThreadId = threadId;
        if (!actualThreadId) {
            if (!mockThreadsByUserAndCourse.has(threadKey)) {
                actualThreadId = `thread_${Math.random().toString(36).substr(2, 9)}`;
                mockThreadsByUserAndCourse.set(threadKey, actualThreadId);
                console.log(`✅ Created new thread ${actualThreadId} for user ${userId} in course ${courseId}`);
            }
            else {
                actualThreadId = mockThreadsByUserAndCourse.get(threadKey);
                console.log(`♻️ Using existing thread ${actualThreadId} for user ${userId} in course ${courseId}`);
            }
        }
        // Check for video changes within same thread
        const lastVideoUrl = mockLastVideoByThread.get(actualThreadId);
        if (lastVideoUrl && lastVideoUrl !== videoUrl) {
            console.log(`🎥 Video changed from ${lastVideoUrl} to ${videoUrl} in thread ${actualThreadId} - adding new video context`);
        }
        // Update last video
        mockLastVideoByThread.set(actualThreadId, videoUrl);
        return {
            response: `Response to: ${message}`,
            threadId: actualThreadId
        };
    });
}
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧪 Testing Thread Management Solution\n');
        // Test Scenario 1: Course switching bug fix
        console.log('📚 Test 1: Course Switching');
        console.log('='.repeat(40));
        let result1 = yield simulateChat('user1', 'course1', 'video1', 'Hello in course 1', null);
        console.log(`User message in course 1: Got threadId ${result1.threadId}`);
        let result2 = yield simulateChat('user1', 'course2', 'video1', 'Hello in course 2', null);
        console.log(`User message in course 2: Got threadId ${result2.threadId}`);
        // Verify different threads for different courses
        if (result1.threadId !== result2.threadId) {
            console.log('✅ PASS: Different courses get different threads');
        }
        else {
            console.log('❌ FAIL: Same thread used for different courses');
        }
        console.log('\n🎬 Test 2: Video Switching Within Same Course');
        console.log('='.repeat(50));
        // Continue in course 1 with different video
        let result3 = yield simulateChat('user1', 'course1', 'video2', 'New video question', result1.threadId);
        console.log(`Video switch in course 1: Got threadId ${result3.threadId}`);
        // Verify same thread for same course
        if (result1.threadId === result3.threadId) {
            console.log('✅ PASS: Same course keeps same thread for different videos');
        }
        else {
            console.log('❌ FAIL: Different thread created for same course');
        }
        console.log('\n👥 Test 3: Multiple Users');
        console.log('='.repeat(30));
        let result4 = yield simulateChat('user2', 'course1', 'video1', 'Another user in course 1', null);
        console.log(`User 2 in course 1: Got threadId ${result4.threadId}`);
        // Verify different users get different threads even in same course
        if (result1.threadId !== result4.threadId) {
            console.log('✅ PASS: Different users get different threads even in same course');
        }
        else {
            console.log('❌ FAIL: Different users share the same thread');
        }
        console.log('\n📊 Final State:');
        console.log('='.repeat(20));
        console.log('Active threads:', mockThreadsByUserAndCourse.size);
        console.log('Thread mappings:');
        for (let [key, threadId] of mockThreadsByUserAndCourse.entries()) {
            console.log(`  ${key} -> ${threadId}`);
        }
        console.log('\nVideo tracking:');
        for (let [threadId, videoUrl] of mockLastVideoByThread.entries()) {
            console.log(`  ${threadId} -> ${videoUrl}`);
        }
    });
}
runTests().catch(console.error);
