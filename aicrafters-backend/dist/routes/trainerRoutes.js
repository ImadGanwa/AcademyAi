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
exports.default = router;
