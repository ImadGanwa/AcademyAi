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
const summaryService_1 = require("../services/summaryService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Check for required environment variables
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is missing');
    process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is missing');
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
function triggerSummaries() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get course ID from command line arguments
            const courseId = process.argv[2];
            if (!courseId) {
                console.error('Please provide a course ID as an argument');
                console.log('Usage: npx ts-node src/scripts/triggerSummaries.ts <courseId>');
                process.exit(1);
            }
            console.log(`Triggering summary generation for course ${courseId}...`);
            // Call the summary service
            yield summaryService_1.SummaryService.processCourseForSummaries(courseId, process.env.OPENAI_API_KEY);
            console.log('Summary generation triggered successfully');
            // Close MongoDB connection
            yield mongoose_1.default.connection.close();
            console.log('Disconnected from MongoDB');
            process.exit(0);
        }
        catch (error) {
            console.error('Error triggering summaries:', error);
            yield mongoose_1.default.connection.close();
            process.exit(1);
        }
    });
}
// Execute the main function
triggerSummaries();
