"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mindMapController_1 = require("../controllers/mindMapController");
const auth_1 = require("../middleware/auth"); // Import auth middleware
const router = express_1.default.Router();
// --- Mind Map Routes ---
// GET /api/mindmaps/courses/:courseId/videos/:videoUrl
// Generates and returns a mind map in Markmap markdown format for a specific video
// Requires authentication
router.get('/courses/:courseId/videos/:videoUrl', auth_1.authMiddleware, // Apply authentication middleware
mindMapController_1.MindMapController.generateMindMapForVideo);
// Add other mind map related routes here if needed
// e.g., router.get('/courses/:courseId/sections/:sectionId', ...)
exports.default = router;
