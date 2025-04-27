import express from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/linkedin', authController.linkedinAuth);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.use(authMiddleware);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);

export default router;
