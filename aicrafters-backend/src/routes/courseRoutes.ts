import { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/published', courseController.getPublishedCourses);

// Protected routes
router.use(authMiddleware);

// ... rest of the routes ... 