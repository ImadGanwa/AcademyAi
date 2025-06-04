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
// Check for required environment variables
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is missing');
    process.exit(1);
}
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
});
// Main function
function checkVideoTranscription() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get arguments from command line
            if (process.argv.length < 4) {
                console.error('Usage: npm run ts-node src/scripts/checkVideoTranscription.ts <courseId> <videoUrl>');
                process.exit(1);
            }
            const courseId = process.argv[2];
            const videoUrl = process.argv[3];
            console.log(`Checking video transcription for course ${courseId} and video ${videoUrl}...`);
            // Find the transcription
            const transcription = yield VideoTranscription_1.VideoTranscription.findOne({
                courseId,
                videoUrl
            });
            if (!transcription) {
                console.log(`No transcription found for video ${videoUrl} in course ${courseId}`);
                process.exit(0);
            }
            console.log('\nTranscription details:');
            console.log('ID:', transcription._id);
            console.log('Status:', transcription.status);
            console.log('Summary Status:', transcription.summaryStatus);
            console.log('Video Summary:', transcription.videoSummary === null ? 'NULL' : (transcription.videoSummary || 'EMPTY STRING'));
            console.log('Section Summary:', transcription.sectionSummary || 'N/A');
            console.log('Course Summary:', transcription.courseSummary ? 'Present' : 'N/A');
            console.log('Error:', transcription.error || 'None');
            console.log('Last Attempt:', transcription.lastAttempt);
            console.log('Retry Count:', transcription.retryCount);
            // Close MongoDB connection
            yield mongoose_1.default.connection.close();
            console.log('\nDisconnected from MongoDB');
            process.exit(0);
        }
        catch (error) {
            console.error('Error checking video transcription:', error);
            yield mongoose_1.default.connection.close();
            process.exit(1);
        }
    });
}
// Execute the main function
checkVideoTranscription();
