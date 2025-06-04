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
const Course_1 = require("../models/Course");
const summaryService_1 = require("../services/summaryService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function triggerAllSummaries() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
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
            yield mongoose_1.default.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB');
            // Get all courses
            const courses = yield Course_1.Course.find({});
            console.log(`Found ${courses.length} courses to process for summaries`);
            // Process each course
            for (let i = 0; i < courses.length; i++) {
                const course = courses[i];
                const courseId = course._id.toString();
                const courseTitle = course.title || courseId;
                console.log(`\nProcessing summaries for course ${i + 1}/${courses.length}: ${courseTitle}`);
                try {
                    yield summaryService_1.SummaryService.processCourseForSummaries(courseId, process.env.OPENAI_API_KEY);
                    console.log(`Completed summary generation for course: ${courseTitle}`);
                }
                catch (error) {
                    console.error(`Error generating summaries for course ${courseId}:`, error);
                }
                // Add a delay between courses to avoid overloading the API
                if (i < courses.length - 1) {
                    console.log('Waiting 5 seconds before processing next course...');
                    yield new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
            console.log('\nAll courses processed for summary generation');
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
triggerAllSummaries();
