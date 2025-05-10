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
exports.SummaryService = void 0;
const axios_1 = __importDefault(require("axios"));
const VideoTranscription_1 = require("../models/VideoTranscription");
const Course_1 = require("../models/Course");
const mongoose_1 = __importDefault(require("mongoose"));
class SummaryService {
    /**
     * Process all videos in a course to generate summaries
     */
    static processCourseForSummaries(courseId, apiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find all transcriptions for the course that are completed but don't have summaries
                const transcriptions = yield VideoTranscription_1.VideoTranscription.find({
                    courseId,
                    status: 'completed',
                    summaryStatus: { $ne: 'completed' }
                });
                // Generate video summaries first
                for (const transcription of transcriptions) {
                    // Use mongoose ObjectId toString to avoid type issues
                    const transcriptionId = transcription._id instanceof mongoose_1.default.Types.ObjectId
                        ? transcription._id.toString()
                        : String(transcription._id);
                    yield this.generateVideoSummary(transcriptionId, apiKey);
                }
                // Get the course to process section summaries
                const course = yield Course_1.Course.findById(courseId);
                if (!course) {
                    throw new Error('Course not found');
                }
                // Generate section summaries
                for (const section of course.courseContent.sections) {
                    yield this.generateSectionSummary(courseId, section.title, apiKey);
                }
                // Generate course summary
                yield this.generateCourseSummary(courseId, apiKey);
            }
            catch (error) {
                console.error('Error processing course for summaries:', error);
                throw error;
            }
        });
    }
    /**
     * Generate a summary for a specific video
     */
    static generateVideoSummary(transcriptionId, apiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transcription = yield VideoTranscription_1.VideoTranscription.findById(transcriptionId);
                if (!transcription || transcription.status !== 'completed') {
                    throw new Error('Transcription not found or not completed');
                }
                // Update status to pending
                transcription.summaryStatus = 'pending';
                yield transcription.save();
                // Prepare prompt for OpenAI
                const prompt = `Summarize the following video transcription in a concise paragraph:
      
${transcription.transcription}`;
                // Call OpenAI API
                const summary = yield this.callOpenAI(prompt, apiKey);
                // Update the transcription with summary
                transcription.videoSummary = summary;
                transcription.summaryStatus = 'completed';
                yield transcription.save();
            }
            catch (error) {
                console.error(`Error generating video summary:`, error);
                // Update transcription with error
                yield VideoTranscription_1.VideoTranscription.findByIdAndUpdate(transcriptionId, {
                    summaryStatus: 'failed',
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });
    }
    /**
     * Generate a summary for a course section
     */
    static generateSectionSummary(courseId, sectionTitle, apiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all video transcriptions for videos in this section
                const course = yield Course_1.Course.findById(courseId);
                if (!course) {
                    throw new Error('Course not found');
                }
                // Find the section
                const section = course.courseContent.sections.find(s => s.title === sectionTitle);
                if (!section) {
                    throw new Error('Section not found');
                }
                // Get video URLs from the section
                const videoUrls = [];
                for (const content of section.contents) {
                    if (content.type === 'lesson') {
                        const lesson = content.content; // Type cast to access lesson properties
                        if (lesson.contentItems) {
                            for (const item of lesson.contentItems) {
                                if (item.type === 'media' && item.content.includes('vimeo.com')) {
                                    videoUrls.push(item.content);
                                }
                            }
                        }
                    }
                }
                // Get transcriptions for these videos
                const transcriptions = yield VideoTranscription_1.VideoTranscription.find({
                    courseId,
                    videoUrl: { $in: videoUrls },
                    status: 'completed'
                });
                // If no transcriptions found, return
                if (transcriptions.length === 0) {
                    return;
                }
                // Collect all video summaries
                const videoSummaries = transcriptions
                    .filter(t => t.videoSummary)
                    .map(t => t.videoSummary)
                    .join('\n\n');
                // Prepare prompt for OpenAI
                const prompt = `Create a concise summary of this course section based on the following video summaries:
      
${videoSummaries}

Section title: ${sectionTitle}`;
                // Call OpenAI API
                const sectionSummary = yield this.callOpenAI(prompt, apiKey);
                // Update all transcriptions in this section with the section summary
                yield VideoTranscription_1.VideoTranscription.updateMany({ courseId, videoUrl: { $in: videoUrls } }, { sectionSummary });
            }
            catch (error) {
                console.error(`Error generating section summary:`, error);
            }
        });
    }
    /**
     * Generate an overall course summary
     */
    static generateCourseSummary(courseId, apiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all section summaries
                const transcriptions = yield VideoTranscription_1.VideoTranscription.find({
                    courseId,
                    sectionSummary: { $ne: null }
                });
                // Extract unique section summaries
                const sectionSummaries = Array.from(new Set(transcriptions.map(t => t.sectionSummary))).filter(Boolean).join('\n\n');
                // Get course details
                const course = yield Course_1.Course.findById(courseId);
                if (!course) {
                    throw new Error('Course not found');
                }
                // Prepare prompt for OpenAI
                const prompt = `Create a comprehensive course summary based on the following section summaries:
      
${sectionSummaries}

Course title: ${course.title}
Course description: ${course.description}`;
                // Call OpenAI API
                const courseSummary = yield this.callOpenAI(prompt, apiKey);
                // Update all transcriptions for this course with the course summary
                yield VideoTranscription_1.VideoTranscription.updateMany({ courseId }, { courseSummary });
            }
            catch (error) {
                console.error(`Error generating course summary:`, error);
            }
        });
    }
    /**
     * Retrieve a video transcription with all its associated summaries
     */
    static getVideoTranscriptionWithSummaries(courseId, videoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transcription = yield VideoTranscription_1.VideoTranscription.findOne({
                    courseId,
                    videoUrl
                });
                return transcription;
            }
            catch (error) {
                console.error(`Error getting video transcription:`, error);
                throw error;
            }
        });
    }
    /**
     * Call OpenAI API to generate a summary
     */
    static callOpenAI(prompt, apiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post(this.OPENAI_API_URL, {
                    model: this.MODEL,
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that creates concise, informative summaries.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.5,
                    max_tokens: 500
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    }
                });
                return response.data.choices[0].message.content.trim();
            }
            catch (error) {
                console.error('Error calling OpenAI API:', error);
                throw new Error('Failed to generate summary with OpenAI');
            }
        });
    }
}
exports.SummaryService = SummaryService;
SummaryService.OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
SummaryService.MODEL = 'gpt-4o';
