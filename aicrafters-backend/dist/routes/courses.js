"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const coursesController_1 = require("../controllers/coursesController");
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
const router = express_1.default.Router();
// Public routes
router.get('/published', courseController_1.courseController.getPublishedCourses);
router.get('/categories', courseController_1.courseController.getCategories);
router.get('/list', courseController_1.courseController.getAllCourses);
router.get('/user-courses', auth_1.authMiddleware, courseController_1.courseController.getUserCourses);
// Protected routes
router.post('/create', auth_1.authMiddleware, upload.single('thumbnail'), (req, res, next) => {
    next();
}, courseController_1.courseController.createCourse);
router.post('/upload/thumbnail', auth_1.authMiddleware, upload.single('thumbnail'), courseController_1.courseController.uploadThumbnail);
router.post('/categories', auth_1.authMiddleware, courseController_1.courseController.addCategory);
router.get('/my-courses', auth_1.authMiddleware, courseController_1.courseController.getMyCourses);
// Routes with ID parameter should come last
router.get('/:id', courseController_1.courseController.getCourseById);
router.get('/:id/access', auth_1.authMiddleware, courseController_1.courseController.checkCourseAccess);
router.put('/:id', auth_1.authMiddleware, upload.single('thumbnail'), courseController_1.courseController.updateCourse);
router.patch('/:id/update-status', auth_1.authMiddleware, courseController_1.courseController.updateCourseStatus);
router.delete('/:id', auth_1.authMiddleware, courseController_1.courseController.deleteCourse);
router.post('/:id/purchase', auth_1.authMiddleware, courseController_1.courseController.purchaseCourse);
router.post('/:id/invite', auth_1.authMiddleware, courseController_1.courseController.inviteUser);
router.post('/:courseId/lessons/:lessonId/complete', auth_1.authMiddleware, courseController_1.courseController.markLessonComplete);
router.post('/:id/save', auth_1.authMiddleware, courseController_1.courseController.saveCourse);
router.post('/:id/reviews', auth_1.authMiddleware, courseController_1.courseController.addReview);
// Add certificate template routes
router.post('/:courseId/certificate-template', auth_1.authMiddleware, upload.single('template'), (req, res) => {
    coursesController_1.coursesController.updateCertificateTemplate(req, res);
});
// Endpoint to update just the certificate configuration
router.put('/:courseId/certificate-template/config', auth_1.authMiddleware, (req, res) => {
    coursesController_1.coursesController.updateCertificateTemplateConfig(req, res);
});
router.get('/:courseId/certificate-template', auth_1.authMiddleware, (req, res) => {
    coursesController_1.coursesController.getCourseTemplate(req, res);
});
router.delete('/:courseId/certificate-template', auth_1.authMiddleware, (req, res) => {
    coursesController_1.coursesController.deleteCertificateTemplate(req, res);
});
// Add test certificate generation endpoint
router.post('/:courseId/certificate/test', auth_1.authMiddleware, (req, res) => {
    coursesController_1.coursesController.generateTestCertificate(req, res);
});
exports.default = router;
