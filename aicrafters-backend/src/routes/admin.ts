import express from 'express';
import multer from 'multer';
import { adminController } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Configure multer to store files in memory
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Accept Excel files - check both file extension and MIME type
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream'
    ];
    const allowedExtensions = /\.(xlsx|xls)$/;

    if (!allowedMimes.includes(file.mimetype) && !file.originalname.match(allowedExtensions)) {
      return cb(new Error('Only Excel files (.xlsx, .xls) are allowed!'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All admin routes require authentication
router.use(authMiddleware);

// Dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.post('/users/check-emails', adminController.checkEmails);
router.post('/users/bulk/parse', upload.single('file'), adminController.parseExcelUsers);
router.post('/users/bulk/create', adminController.createBulkUsers);
router.put('/users/:id', upload.single('profileImage'), adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Course management
router.get('/courses', adminController.getCourses);
router.patch('/courses/:id/status', adminController.updateCourseStatus);

// Category management
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Course category management
router.get('/courses/available', adminController.getAvailableCourses);
router.post('/categories/:categoryId/courses', adminController.addCourseToCategory);
router.delete('/categories/:categoryId/courses/:courseId', adminController.removeCourseFromCategory);

export default router; 