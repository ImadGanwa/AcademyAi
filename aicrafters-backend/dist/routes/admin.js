"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = express_1.default.Router();
// Configure multer to store files in memory
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
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
router.use(authMiddleware_1.authMiddleware);
// Dashboard statistics
router.get('/dashboard/stats', adminController_1.adminController.getDashboardStats);
// User management
router.get('/users', adminController_1.adminController.getUsers);
router.post('/users', adminController_1.adminController.createUser);
router.post('/users/check-emails', adminController_1.adminController.checkEmails);
router.post('/users/bulk/parse', upload.single('file'), adminController_1.adminController.parseExcelUsers);
router.post('/users/bulk/create', adminController_1.adminController.createBulkUsers);
router.put('/users/:id', upload.single('profileImage'), adminController_1.adminController.updateUser);
router.delete('/users/:id', adminController_1.adminController.deleteUser);
// Course management
router.get('/courses', adminController_1.adminController.getCourses);
router.patch('/courses/:id/status', adminController_1.adminController.updateCourseStatus);
// Category management
router.get('/categories', adminController_1.adminController.getCategories);
router.post('/categories', adminController_1.adminController.createCategory);
router.put('/categories/:id', adminController_1.adminController.updateCategory);
router.delete('/categories/:id', adminController_1.adminController.deleteCategory);
// Course category management
router.get('/courses/available', adminController_1.adminController.getAvailableCourses);
router.post('/categories/:categoryId/courses', adminController_1.adminController.addCourseToCategory);
router.delete('/categories/:categoryId/courses/:courseId', adminController_1.adminController.removeCourseFromCategory);
// Add mentor application routes
/**
 * @route GET /api/admin/mentor-applications
 * @desc Get all mentor applications
 * @access Private (Admin only)
 */
router.get('/mentor-applications', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.adminController.getMentorApplications);
/**
 * @route PUT /api/admin/mentor-applications/:id
 * @desc Update mentor application status
 * @access Private (Admin only)
 */
router.put('/mentor-applications/:id', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.adminController.updateMentorApplicationStatus);
/**
 * @route POST /api/admin/fix-mentor-countries
 * @desc Fix existing mentors' country field - temporary migration endpoint
 * @access Private (Admin only)
 */
router.post('/fix-mentor-countries', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.adminController.fixMentorCountries);
exports.default = router;
