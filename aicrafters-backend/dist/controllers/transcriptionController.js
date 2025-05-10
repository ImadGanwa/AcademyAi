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
exports.transcriptionController = void 0;
const transcriptionService_1 = require("../services/transcriptionService");
exports.transcriptionController = {
    processCourseVideos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                const accessToken = req.headers.authorization;
                if (!accessToken) {
                    return res.status(401).json({ error: 'Access token is required' });
                }
                yield transcriptionService_1.TranscriptionService.processCourseVideos(courseId, accessToken);
                res.json({ message: 'Transcription process started successfully' });
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
    getTranscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId, videoUrl } = req.params;
                const transcription = yield transcriptionService_1.TranscriptionService.getTranscription(courseId, videoUrl);
                if (!transcription) {
                    return res.status(404).json({ error: 'Transcription not found' });
                }
                res.json({ transcription });
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
