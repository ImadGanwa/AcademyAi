"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transcriptionController_1 = require("../controllers/transcriptionController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Process all videos in a course for transcription
router.post('/courses/:courseId', auth_1.authMiddleware, transcriptionController_1.transcriptionController.processCourseVideos);
// Get transcription for a specific video
router.get('/courses/:courseId/videos/:videoUrl', auth_1.authMiddleware, transcriptionController_1.transcriptionController.getTranscription);
// Update transcription for a specific video
router.put('/courses/:courseId/videos/:videoUrl', auth_1.authMiddleware, transcriptionController_1.transcriptionController.updateTranscription);
exports.default = router;
