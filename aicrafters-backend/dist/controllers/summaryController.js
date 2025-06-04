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
Object.defineProperty(exports, "__esModule", { value: true });
exports.summaryController = void 0;
const summaryService_1 = require("../services/summaryService");
exports.summaryController = {
    processCourseForSummaries(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                const apiKey = req.headers['x-openai-api-key'];
                if (!apiKey) {
                    return res.status(401).json({ error: 'OpenAI API key is required' });
                }
                yield summaryService_1.SummaryService.processCourseForSummaries(courseId, apiKey);
                res.json({ message: 'Summary generation process started successfully' });
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: 'An unknown error occurred' });
                }
            }
        });
    },
    getVideoSummary(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId, videoUrl } = req.params;
                const videoTranscription = yield summaryService_1.SummaryService.getVideoTranscriptionWithSummaries(courseId, videoUrl);
                if (!videoTranscription) {
                    return res.status(404).json({ error: 'Video transcription not found' });
                }
                res.json({
                    videoSummary: videoTranscription.videoSummary || null,
                    sectionSummary: videoTranscription.sectionSummary || '',
                    courseSummary: videoTranscription.courseSummary || ''
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: 'An unknown error occurred' });
                }
            }
        });
    }
};
