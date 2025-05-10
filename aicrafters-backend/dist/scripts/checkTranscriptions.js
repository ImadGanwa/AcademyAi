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
            // Find all transcriptions
            const transcriptions = yield VideoTranscription_1.VideoTranscription.find();
            console.log('\nFound transcriptions:', transcriptions.length);
            // Print each transcription
            transcriptions.forEach((transcription, index) => {
                console.log(`\nTranscription ${index + 1}:`);
                console.log('Course ID:', transcription.courseId);
                console.log('Video URL:', transcription.videoUrl);
                console.log('Status:', transcription.status);
                console.log('Last Attempt:', transcription.lastAttempt);
                if (transcription.error) {
                    console.log('Error:', transcription.error);
                }
                console.log('Transcription length:', transcription.transcription.length);
            });
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
