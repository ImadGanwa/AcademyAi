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
const mongoose_1 = __importDefault(require("mongoose"));
const VideoTranscription_1 = require("../models/VideoTranscription");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function checkTranscriptions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(process.env.MONGODB_URI || '');
            console.log('Connected to MongoDB');
            const courseId = '67c3e57e754c83ca019ea97e'; // Course ID to check
            console.log(`Checking transcriptions for course: ${courseId}`);
            const transcriptions = yield VideoTranscription_1.VideoTranscription.find({ courseId });
            if (transcriptions.length === 0) {
                console.log('No transcriptions found for this course.');
            }
            else {
                transcriptions.forEach((t, i) => {
                    console.log(`\nTranscription ${i + 1}:`);
                    console.log(`Course ID: ${t.courseId}`);
                    console.log(`Video URL: ${t.videoUrl}`);
                    console.log(`Status: ${t.status}`);
                    console.log(`Last Attempt: ${t.lastAttempt}`);
                    console.log(`Error: ${t.error || 'None'}`);
                    console.log(`Retry Count: ${t.retryCount || 0}`);
                    console.log(`Transcription length: ${t.transcription ? t.transcription.length : 0}`);
                });
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('\nDisconnected from MongoDB');
        }
    });
}
checkTranscriptions();
