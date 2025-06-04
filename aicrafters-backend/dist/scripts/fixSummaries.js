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
function fixSummaries() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get course ID from command line arguments or use default
            const courseId = process.argv[2] || '67c3e57e754c83ca019ea97e';
            console.log(`Fixing summaries for course ${courseId}...`);
            // Find transcriptions with issues
            const transcriptions = yield VideoTranscription_1.VideoTranscription.find({
                courseId,
                summaryStatus: 'completed'
            });
            console.log(`Found ${transcriptions.length} completed summaries for course ${courseId}`);
            let fixedCount = 0;
            // Check each transcription for issues
            for (const transcription of transcriptions) {
                let needsUpdate = false;
                // Fix undefined or incorrect types
                if (transcription.videoSummary === undefined) {
                    transcription.videoSummary = '';
                    needsUpdate = true;
                }
                if (transcription.sectionSummary === undefined) {
                    transcription.sectionSummary = '';
                    needsUpdate = true;
                }
                if (transcription.courseSummary === undefined) {
                    transcription.courseSummary = '';
                    needsUpdate = true;
                }
                // If transcription is in completed state with null videoSummary but has pending status, fix it
                if (transcription.status === 'pending' && transcription.summaryStatus === 'completed') {
                    console.log(`Found transcription with pending status but completed summaries: ${transcription.videoUrl}`);
                    transcription.status = 'completed';
                    needsUpdate = true;
                }
                // Save if changes were made
                if (needsUpdate) {
                    yield transcription.save();
                    fixedCount++;
                    console.log(`Fixed transcription: ${transcription.videoUrl}`);
                }
            }
            console.log(`Fixed ${fixedCount} transcriptions.`);
            // Close MongoDB connection
            yield mongoose_1.default.connection.close();
            console.log('Disconnected from MongoDB');
            process.exit(0);
        }
        catch (error) {
            console.error('Error fixing summaries:', error);
            yield mongoose_1.default.connection.close();
            process.exit(1);
        }
    });
}
// Execute the main function
fixSummaries();
