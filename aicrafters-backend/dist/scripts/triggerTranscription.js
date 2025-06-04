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
const transcriptionService_1 = require("../services/transcriptionService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function triggerTranscription() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(process.env.MONGODB_URI || '');
            console.log('Connected to MongoDB');
            const courseId = '67c3e57e754c83ca019ea97e'; // Your course ID
            const accessToken = process.env.VIMEO_ACCESS_TOKEN; // Make sure this is set in your .env
            if (!accessToken) {
                throw new Error('VIMEO_ACCESS_TOKEN is not set in environment variables');
            }
            console.log('Starting transcription process for course:', courseId);
            yield transcriptionService_1.TranscriptionService.processCourseVideos(courseId, accessToken);
            console.log('Transcription process completed');
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
triggerTranscription();
