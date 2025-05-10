"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const summaryController_1 = require("../controllers/summaryController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Generate summaries for a course
router.post('/courses/:courseId/generate', auth_1.authMiddleware, summaryController_1.summaryController.processCourseForSummaries);
// Get summaries for a specific video
router.get('/courses/:courseId/videos/:videoUrl', auth_1.authMiddleware, summaryController_1.summaryController.getVideoSummary);
exports.default = router;
