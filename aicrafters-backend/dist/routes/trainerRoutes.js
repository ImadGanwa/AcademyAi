"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trainerController_1 = require("../controllers/trainerController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * @route   GET /api/trainer/chat
 * @desc    Chat with the Trainer Coach
 * @access  Private (requires authentication)
 */
router.get('/chat', auth_1.authMiddleware, trainerController_1.trainerController.chat);
/**
 * @route   GET /api/trainer/users
 * @desc    Get users enrolled in trainer's courses
 * @access  Private (requires trainer authentication)
 */
router.get('/users', auth_1.authMiddleware, trainerController_1.trainerController.getUsers);
// Monitoring and management endpoints
router.get('/stats', auth_1.authMiddleware, trainerController_1.trainerController.getStats);
router.get('/health', trainerController_1.trainerController.healthCheck); // No auth for health checks
router.post('/preload', auth_1.authMiddleware, trainerController_1.trainerController.preloadContent);
router.delete('/cache/:courseId', auth_1.authMiddleware, trainerController_1.trainerController.invalidateCache);
exports.default = router;
