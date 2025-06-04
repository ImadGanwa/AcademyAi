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
function checkSummaries() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get course ID from command line arguments or use default
            const courseId = process.argv[2] || '67c3e57e754c83ca019ea97e';
            console.log(`Checking summaries for course ${courseId}...`);
            // Find transcriptions with completed summaries
            const transcriptions = yield VideoTranscription_1.VideoTranscription.find({
                courseId,
                summaryStatus: 'completed'
            });
            console.log(`Found ${transcriptions.length} completed summaries for course ${courseId}`);
            if (transcriptions.length > 0) {
                // Print the first summary as an example
                const example = transcriptions[1];
                console.log('\nExample summaries for video:', example.videoUrl);
                console.log('\nVideo Summary:', example.videoSummary);
                console.log('\nSection Summary:', example.sectionSummary);
                console.log('\nCourse Summary:', example.courseSummary);
            }
            else {
                console.log('\nNo completed summaries found. Check if summaries are still being processed.');
                // Check if there are any pending summaries
                const pendingSummaries = yield VideoTranscription_1.VideoTranscription.find({
                    courseId,
                    summaryStatus: 'pending'
                });
                console.log(`Found ${pendingSummaries.length} pending summaries.`);
                // Check if there are any failed summaries
                const failedSummaries = yield VideoTranscription_1.VideoTranscription.find({
                    courseId,
                    summaryStatus: 'failed'
                });
                console.log(`Found ${failedSummaries.length} failed summaries.`);
                if (failedSummaries.length > 0) {
                    console.log('\nExample of failed summary error:', failedSummaries[0].error);
                }
            }
            // Close MongoDB connection
            yield mongoose_1.default.connection.close();
            console.log('Disconnected from MongoDB');
            process.exit(0);
        }
        catch (error) {
            console.error('Error checking summaries:', error);
            yield mongoose_1.default.connection.close();
            process.exit(1);
        }
    });
}
// Execute the main function
checkSummaries();
