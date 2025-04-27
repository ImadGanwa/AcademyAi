import express from 'express';
import { courseController } from '../controllers/courseController';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = express.Router();

// Public routes
router.get('/published', courseController.getPublishedCourses);
router.get('/categories', courseController.getCategories);
router.get('/list', courseController.getAllCourses);
router.get('/user-courses', authMiddleware, courseController.getUserCourses);

// Protected routes
router.post('/create', 
  authMiddleware,
  upload.single('thumbnail'),
  (req, res, next) => {
    next();
  },
  courseController.createCourse
);

router.post('/upload/thumbnail', authMiddleware, upload.single('thumbnail'), courseController.uploadThumbnail);
router.post('/categories', authMiddleware, courseController.addCategory);
router.get('/my-courses', authMiddleware, courseController.getMyCourses);

// Routes with ID parameter should come last
router.get('/:id', courseController.getCourseById);
router.get('/:id/access', authMiddleware, courseController.checkCourseAccess);
router.put('/:id', authMiddleware, upload.single('thumbnail'), courseController.updateCourse);
router.patch('/:id/update-status', authMiddleware, courseController.updateCourseStatus);
router.delete('/:id', authMiddleware, courseController.deleteCourse);
router.post('/:id/purchase', authMiddleware, courseController.purchaseCourse);
router.post('/:id/invite', authMiddleware, courseController.inviteUser);
router.post('/:courseId/lessons/:lessonId/complete', authMiddleware, courseController.markLessonComplete);
router.post('/:id/save', authMiddleware, courseController.saveCourse);
router.post('/:id/reviews', authMiddleware, courseController.addReview);

export default router;
