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
const transcriptionService_1 = require("../services/transcriptionService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function triggerAllTranscriptions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(process.env.MONGODB_URI || '');
            console.log('Connected to MongoDB');
            const accessToken = process.env.VIMEO_ACCESS_TOKEN;
            if (!accessToken) {
                throw new Error('VIMEO_ACCESS_TOKEN is not set in environment variables');
            }
            // Get all courses
            const courses = yield Course_1.Course.find({});
            console.log(`Found ${courses.length} courses to process`);
            // Process each course
            for (let i = 0; i < courses.length; i++) {
                const course = courses[i];
                const courseId = course._id.toString();
                const courseTitle = course.title || courseId;
                console.log(`\nProcessing course ${i + 1}/${courses.length}: ${courseTitle}`);
                try {
                    yield transcriptionService_1.TranscriptionService.processCourseVideos(courseId, accessToken);
                    console.log(`Completed transcription for course: ${courseTitle}`);
                }
                catch (error) {
                    console.error(`Error processing course ${courseId}:`, error);
                }
                // Add a delay between courses to avoid overloading the API
                if (i < courses.length - 1) {
                    console.log('Waiting 5 seconds before processing next course...');
                    yield new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
            console.log('\nAll courses processed for transcription');
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
triggerAllTranscriptions();
