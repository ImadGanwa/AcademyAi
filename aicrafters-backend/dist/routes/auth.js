"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Public routes
router.post('/register', authController_1.authController.register);
router.post('/login', authController_1.authController.login);
router.post('/google', authController_1.authController.googleAuth);
router.post('/linkedin', authController_1.authController.linkedinAuth);
router.get('/verify-email/:token', authController_1.authController.verifyEmail);
router.post('/resend-verification', authController_1.authController.resendVerification);
router.post('/request-password-reset', authController_1.authController.requestPasswordReset);
router.post('/reset-password/:token', authController_1.authController.resetPassword);
// Protected routes
router.use(authMiddleware_1.authMiddleware);
router.get('/me', authController_1.authController.getCurrentUser);
router.post('/logout', authController_1.authController.logout);
exports.default = router;
