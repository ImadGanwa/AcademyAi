"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithTrainer = chatWithTrainer;
const openai_1 = require("openai");
const mongoose_1 = __importDefault(require("mongoose"));
const VideoTranscription_1 = require("../models/VideoTranscription");
// Initialize OpenAI client
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
// Store conversation threads by user
const threadsByUser = new Map();
/**
 * Get or create a conversation thread for a user
 */
function getOrCreateThreadForUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!threadsByUser.has(userId)) {
            const thread = yield openai.beta.threads.create();
            threadsByUser.set(userId, thread.id);
            return thread.id;
        }
        return threadsByUser.get(userId);
    });
}
/**
 * Build the context from video transcription and summaries
 */
function buildContext(courseId, videoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const transcriptionData = yield VideoTranscription_1.VideoTranscription.findOne({
            courseId,
            videoUrl
        });
        if (!transcriptionData) {
            return "No transcription data available for this video.";
        }
        let context = "";
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
    });
}
/**
 * Initialize the assistant with course context
 */
function initializeAssistant(courseId, videoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = yield buildContext(courseId, videoUrl);
        const assistant = yield openai.beta.assistants.create({
            name: "Trainer Coach",
            instructions: `You are the Trainer Coach, an educational assistant for an online course platform. Your role is to help students understand the course content and answer their questions based on the video they are currently watching.

You have access to the following information:
${context}

Instructions:
1. Answer questions based on the video content and transcription.
2. If the question is about something not covered in the current video, use the section and course summaries to provide context.
3. Keep answers concise, clear, and educational in tone.
4. If you don't know the answer, admit it rather than making up information.
5. Don't discuss the fact that you're an AI or mention that your answers are based on transcriptions - just provide helpful answers directly.`,
            model: "gpt-4-turbo-preview",
        });
        return assistant.id;
    });
}
/**
 * Chat with the trainer coach
 */
function chatWithTrainer(userId, courseId, videoUrl, message, threadId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // Convert courseId to ObjectId
            const courseObjectId = new mongoose_1.default.Types.ObjectId(courseId);
            // Get or create a thread for this user
            const actualThreadId = threadId || (yield getOrCreateThreadForUser(userId));
            // Initialize assistant with context
            const assistantId = yield initializeAssistant(courseObjectId, videoUrl);
            // Add the user message to the thread
            yield openai.beta.threads.messages.create(actualThreadId, {
                role: "user",
                content: message
            });
            // Run the assistant on the thread
            const run = yield openai.beta.threads.runs.create(actualThreadId, {
                assistant_id: assistantId
            });
            // Poll for completion
            let runStatus = yield openai.beta.threads.runs.retrieve(actualThreadId, run.id);
            while (runStatus.status !== "completed" && runStatus.status !== "failed") {
                yield new Promise(resolve => setTimeout(resolve, 1000));
                runStatus = yield openai.beta.threads.runs.retrieve(actualThreadId, run.id);
            }
            if (runStatus.status !== "completed") {
                throw new Error(`Run failed: ${runStatus.status}`);
            }
            // Get the assistant's response
            const messages = yield openai.beta.threads.messages.list(actualThreadId);
            const assistantMessages = messages.data.filter(msg => msg.role === "assistant" && msg.run_id === run.id);
            const assistantResponse = ((_a = assistantMessages[0]) === null || _a === void 0 ? void 0 : _a.content.filter((part) => part.type === "text").map((part) => part.text.value).join("\n")) || "No response.";
            return {
                response: assistantResponse,
                threadId: actualThreadId
            };
        }
        catch (error) {
            console.error("Error in chatWithTrainer:", error);
            throw new Error(`Failed to chat with trainer: ${error.message}`);
        }
    });
}
