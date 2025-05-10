"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const Category_1 = require("../models/Category");
const email_1 = require("../utils/email");
const excelParser_1 = require("../utils/excelParser");
const notificationController_1 = require("./notificationController");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Organization_1 = require("../models/Organization");
const passwordGenerator_1 = require("../utils/passwordGenerator");
const fileUpload_1 = require("../utils/fileUpload");
exports.adminController = {
    getDashboardStats: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            // Get user statistics
            const [totalUsers, adminUsers, trainerUsers, userUsers, totalCourses, activeCourses, categories, averageRating] = yield Promise.all([
                User_1.User.countDocuments({ status: 'active' }),
                User_1.User.countDocuments({ role: 'admin', status: 'active' }),
                User_1.User.countDocuments({ role: 'trainer', status: 'active' }),
                User_1.User.countDocuments({ role: 'user', status: 'active' }),
                Course_1.Course.countDocuments(),
                Course_1.Course.countDocuments({ status: 'published' }),
                Category_1.Category.countDocuments(),
                Course_1.Course.aggregate([
                    { $match: { status: 'published' } },
                    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
                ]).then(result => { var _a; return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.avgRating) || 0; })
            ]);
            res.json({
                users: {
                    total: totalUsers,
                    admins: adminUsers,
                    trainers: trainerUsers,
                    users: userUsers
                },
                courses: {
                    total: totalCourses,
                    active: activeCourses,
                    categories: categories,
                    averageRating: Number(averageRating.toFixed(1))
                }
            });
        }
        catch (error) {
            console.error('Get dashboard stats error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error fetching dashboard statistics' });
        }
    }),
    getUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { search, role, status } = req.query;
            const query = {};
            // Apply filters
            if (role && ['admin', 'trainer', 'user'].includes(role)) {
                query.role = role;
            }
            if (status && ['active', 'inactive', 'suspended', 'pending'].includes(status)) {
                query.status = status;
            }
            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }
            const users = yield User_1.User.find(query)
                .select('fullName email role status lastActive profileImage')
                .sort({ lastActive: -1 });
            const transformedUsers = users.map(user => ({
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status,
                lastActive: user.lastActive || null,
                initials: user.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase(),
                profileImage: user.profileImage
            }));
            res.json(transformedUsers);
        }
        catch (error) {
            console.error('Get users error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error fetching users' });
        }
    }),
    updateUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { id } = req.params;
            const { role, status, fullName, email, password } = req.body;
            // Validate input
            if (!['admin', 'trainer', 'user'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }
            // Prevent self-demotion
            if (req.user._id === id && role !== 'admin') {
                return res.status(400).json({ message: 'Cannot change your own admin role' });
            }
            const user = yield User_1.User.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // If status is being changed to active, ensure email is verified
            if (status === 'active' && !user.isEmailVerified) {
                user.isEmailVerified = true;
            }
            // Update basic fields
            user.role = role;
            user.status = status;
            // Update optional fields if provided
            if (fullName)
                user.fullName = fullName;
            if (email) {
                // Check if email is already taken by another user
                const existingUser = yield User_1.User.findOne({ email, _id: { $ne: id } });
                if (existingUser) {
                    return res.status(400).json({ message: 'Email already taken' });
                }
                user.email = email;
            }
            if (password) {
                // Don't hash the password here, let the pre-save middleware handle it
                user.password = password;
            }
            // Handle profile image upload
            if (req.file) {
                // If user already has a profile image, delete it from Cloudinary
                if (user.profileImage) {
                    yield (0, fileUpload_1.deleteFromCloudinary)(user.profileImage);
                }
                // Upload new image to Cloudinary
                const imageUrl = yield (0, fileUpload_1.uploadToCloudinary)(req.file, 'profile-images');
                user.profileImage = imageUrl;
            }
            yield user.save();
            const updatedUser = {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status,
                lastActive: user.lastActive || null,
                initials: user.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase(),
                profileImage: user.profileImage
            };
            res.json(updatedUser);
        }
        catch (error) {
            console.error('Update user error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating user' });
        }
    }),
    deleteUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { id } = req.params;
            // Prevent self-deletion
            if (req.user.id === id) {
                return res.status(400).json({ message: 'Cannot delete your own account' });
            }
            const user = yield User_1.User.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            yield User_1.User.findByIdAndDelete(id);
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Delete user error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error deleting user' });
        }
    }),
    getCourses: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { search, status } = req.query;
            const query = {
                status: { $in: ['published', 'review'] }
            };
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } }
                ];
            }
            if (status && ['published', 'review'].includes(status)) {
                query.status = status;
            }
            const courses = yield Course_1.Course.find(query)
                .populate({
                path: 'instructor',
                select: 'fullName email'
            })
                .sort({ updatedAt: -1 });
            const transformedCourses = courses.map(course => {
                var _a;
                const instructor = course.instructor;
                const usersCount = ((_a = course.users) === null || _a === void 0 ? void 0 : _a.length) || 0;
                const thumbnailPath = course.thumbnail
                    ? `${course.thumbnail}`
                    : '/images/placeholder-course.jpg';
                return {
                    id: course._id,
                    title: course.title,
                    instructor: (instructor === null || instructor === void 0 ? void 0 : instructor.fullName) || 'Unknown',
                    instructorEmail: instructor === null || instructor === void 0 ? void 0 : instructor.email,
                    thumbnail: thumbnailPath,
                    status: course.status,
                    usersCount,
                    rating: course.rating || 0,
                    createdAt: course.createdAt,
                    updatedAt: course.updatedAt
                };
            });
            res.json(transformedCourses);
        }
        catch (error) {
            console.error('Get courses error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error fetching courses' });
        }
    }),
    updateCourseStatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                res.status(403).json({ message: 'Not authorized' });
                return;
            }
            const { id } = req.params;
            const { status } = req.body;
            if (!['published', 'review', 'draft'].includes(status)) {
                res.status(400).json({ message: 'Invalid status' });
                return;
            }
            const course = yield Course_1.Course.findById(id).populate('instructor', 'fullName email');
            if (!course) {
                res.status(404).json({ message: 'Course not found' });
                return;
            }
            const previousStatus = course.status;
            course.status = status;
            yield course.save();
            // Send notification and email to trainer if course is published
            if (status === 'published' && previousStatus !== 'published') {
                try {
                    // Create notification
                    yield (0, notificationController_1.createNotification)({
                        recipient: course.instructor._id.toString(),
                        type: 'course',
                        title: 'Course Approved',
                        message: `Your course "${course.title}" has been approved and is now published.`,
                        action: 'View Course',
                        relatedId: course._id.toString()
                    });
                    // Send email notification
                    yield (0, email_1.sendCourseApprovalEmail)(course.instructor.email, course.instructor.fullName, course.title, course._id.toString());
                }
                catch (error) {
                    console.error('Error sending course approval notification:', error);
                    // Don't fail the request if notification fails
                }
            }
            // Send notification and email to trainer if course is rejected (moved to draft)
            if (status === 'draft' && previousStatus === 'review') {
                try {
                    // Create notification
                    yield (0, notificationController_1.createNotification)({
                        recipient: course.instructor._id.toString(),
                        type: 'course',
                        title: 'Course Rejected',
                        message: `Your course "${course.title}" requires revisions before it can be published.`,
                        relatedId: course._id.toString()
                    });
                    // Send email notification
                    yield (0, email_1.sendCourseRejectionEmail)(course.instructor.email, course.instructor.fullName, course.title, course._id.toString());
                }
                catch (error) {
                    console.error('Error sending course rejection notification:', error);
                    // Don't fail the request if notification fails
                }
            }
            res.json({ message: 'Course status updated successfully', status });
        }
        catch (error) {
            console.error('Update course status error:', error);
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: 'Error updating course status' });
        }
    }),
    createUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { email, fullName, role, sendEmail = true } = req.body;
            // Validate input
            if (!email || !fullName || !role) {
                return res.status(400).json({ message: 'All fields are required' });
            }
            // Check if user already exists
            const existingUser = yield User_1.User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            // Generate a random password
            const password = (0, passwordGenerator_1.generateRandomPassword)();
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            // Create new user
            const user = new User_1.User({
                email,
                password: hashedPassword,
                fullName,
                role,
                isEmailVerified: true, // Since admin is creating the account
                status: 'active',
                lastActive: new Date()
            });
            yield user.save();
            // Send welcome email with credentials if sendEmail is true
            let emailSent = false;
            let emailError = null;
            if (sendEmail) {
                try {
                    yield (0, email_1.sendWelcomeEmail)(email, fullName, password);
                    emailSent = true;
                }
                catch (error) {
                    console.error('Error sending welcome email:', error);
                    emailError = error;
                }
            }
            const response = {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    lastActive: user.lastActive || null,
                    initials: user.fullName
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                },
                emailSent,
                emailError: emailError ? emailError.message : null
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({ message: 'Error creating user' });
        }
    }),
    checkEmails: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { emails } = req.body;
            if (!emails || !Array.isArray(emails)) {
                return res.status(400).json({ message: 'Invalid email list' });
            }
            // Find existing emails
            const existingUsers = yield User_1.User.find({
                email: { $in: emails }
            }).select('email');
            const duplicates = existingUsers.map(user => user.email);
            res.json({ duplicates });
        }
        catch (error) {
            console.error('Check emails error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error checking emails' });
        }
    }),
    parseExcelUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            // Parse Excel file
            const users = (0, excelParser_1.parseExcelUsers)(req.file.buffer);
            res.json(users);
        }
        catch (error) {
            console.error('Excel parsing error:', error);
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error parsing Excel file' });
        }
    }),
    createBulkUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { users, organizationId } = req.body;
            if (!users || !Array.isArray(users)) {
                return res.status(400).json({ message: 'Invalid users data' });
            }
            // Get organization and its courses if organizationId is provided
            let organizationCourses = [];
            if (organizationId) {
                const organization = yield Organization_1.Organization.findById(organizationId);
                if (organization && organization.courses) {
                    organizationCourses = organization.courses;
                }
            }
            const results = [];
            const errors = [];
            for (const userData of users) {
                try {
                    const { firstName, lastName, email, sendEmail } = userData;
                    // Check if user already exists
                    const existingUser = yield User_1.User.findOne({ email: email.toLowerCase() });
                    if (existingUser) {
                        errors.push({ email, error: 'User already exists' });
                        continue;
                    }
                    // Generate random password
                    const password = (0, passwordGenerator_1.generateRandomPassword)();
                    // Send welcome email before creating user
                    if (sendEmail) {
                        yield (0, email_1.sendWelcomeEmail)(email, `${firstName} ${lastName}`.trim(), password);
                    }
                    // Prepare user courses if organization has courses
                    const userCourses = organizationCourses.map(courseId => ({
                        courseId,
                        status: 'in progress',
                        organizationId,
                        progress: {
                            timeSpent: 0,
                            percentage: 0,
                            completedLessons: []
                        }
                    }));
                    // Create new user with combined fullName and courses
                    // Password will be hashed by the pre-save middleware
                    const newUser = yield User_1.User.create({
                        fullName: `${firstName} ${lastName}`.trim(),
                        email: email.toLowerCase(),
                        password: password,
                        role: 'user',
                        isEmailVerified: true,
                        organizations: organizationId ? [organizationId] : [],
                        courses: userCourses
                    });
                    results.push({ email, success: true });
                }
                catch (error) {
                    console.error('Error creating user:', error);
                    errors.push({ email: userData.email, error: 'Failed to create user' });
                }
            }
            res.json({
                message: 'Bulk user creation completed',
                results,
                errors
            });
        }
        catch (error) {
            console.error('Bulk create users error:', error);
            res.status(500).json({ message: 'Error creating users' });
        }
    }),
    // Get all categories with course counts
    getCategories: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const categories = yield Category_1.Category.find().sort({ name: 1 });
            // Get course counts for each category
            const categoriesWithCounts = yield Promise.all(categories.map((category) => __awaiter(void 0, void 0, void 0, function* () {
                const courseCount = yield Course_1.Course.countDocuments({
                    categories: category.name
                });
                const courses = yield Course_1.Course.find({
                    categories: category.name
                }).select('title').limit(5);
                return {
                    id: category._id,
                    name: category.name,
                    courseCount,
                    courses: courses.map(course => ({
                        id: course._id,
                        title: course.title
                    }))
                };
            })));
            res.json(categoriesWithCounts);
        }
        catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ message: 'Error fetching categories' });
        }
    }),
    // Create a new category
    createCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Category name is required' });
            }
            const existingCategory = yield Category_1.Category.findOne({ name: name.trim() });
            if (existingCategory) {
                return res.status(400).json({ message: 'Category already exists' });
            }
            const category = new Category_1.Category({
                name: name.trim(),
                createdBy: req.user._id
            });
            yield category.save();
            res.status(201).json({
                id: category._id,
                name: category.name,
                courseCount: 0,
                courses: []
            });
        }
        catch (error) {
            console.error('Create category error:', error);
            res.status(500).json({ message: 'Error creating category' });
        }
    }),
    // Update a category
    updateCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { id } = req.params;
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Category name is required' });
            }
            const existingCategory = yield Category_1.Category.findOne({
                name: name.trim(),
                _id: { $ne: id }
            });
            if (existingCategory) {
                return res.status(400).json({ message: 'Category name already exists' });
            }
            // Find the category first to get the old name
            const category = yield Category_1.Category.findById(id);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            const oldName = category.name;
            category.name = name.trim();
            yield category.save();
            // Update the category name in all courses that use it
            yield Course_1.Course.updateMany({ categories: oldName }, { $set: { 'categories.$': name.trim() } });
            // Get updated course count and courses
            const courseCount = yield Course_1.Course.countDocuments({
                categories: category.name
            });
            const courses = yield Course_1.Course.find({
                categories: category.name
            }).select('title').limit(5);
            res.json({
                id: category._id,
                name: category.name,
                courseCount,
                courses: courses.map(course => ({
                    id: course._id,
                    title: course.title
                }))
            });
        }
        catch (error) {
            console.error('Update category error:', error);
            res.status(500).json({ message: 'Error updating category' });
        }
    }),
    // Delete a category
    deleteCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { id } = req.params;
            const category = yield Category_1.Category.findById(id);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            // Check if category is being used by any courses
            const courseCount = yield Course_1.Course.countDocuments({
                categories: category.name
            });
            if (courseCount > 0) {
                return res.status(400).json({
                    message: 'Cannot delete category that is being used by courses'
                });
            }
            yield Category_1.Category.findByIdAndDelete(id);
            res.json({ message: 'Category deleted successfully' });
        }
        catch (error) {
            console.error('Delete category error:', error);
            res.status(500).json({ message: 'Error deleting category' });
        }
    }),
    // Get courses with less than 3 categories
    getAvailableCourses: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const courses = yield Course_1.Course.find({
                status: 'published',
                $expr: {
                    $lt: [{ $size: { $ifNull: ['$categories', []] } }, 3]
                }
            })
                .select('title thumbnail categories')
                .sort({ title: 1 });
            const transformedCourses = courses.map(course => {
                var _a;
                return ({
                    id: course._id,
                    title: course.title,
                    thumbnail: course.thumbnail,
                    categoryCount: ((_a = course.categories) === null || _a === void 0 ? void 0 : _a.length) || 0
                });
            });
            res.json(transformedCourses);
        }
        catch (error) {
            console.error('Get available courses error:', error);
            res.status(500).json({ message: 'Error fetching available courses' });
        }
    }),
    // Add course to category
    addCourseToCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { categoryId } = req.params;
            const { courseId } = req.body;
            // Find the category
            const category = yield Category_1.Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            // Find the course
            const course = yield Course_1.Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Check if course already has this category
            if (course.categories.includes(category.name)) {
                return res.status(400).json({ message: 'Course already in this category' });
            }
            // Check if course has less than 3 categories
            if (course.categories.length >= 3) {
                return res.status(400).json({ message: 'Course already has maximum number of categories' });
            }
            // Add category to course
            course.categories.push(category.name);
            yield course.save();
            res.json({ message: 'Course added to category successfully' });
        }
        catch (error) {
            console.error('Add course to category error:', error);
            res.status(500).json({ message: 'Error adding course to category' });
        }
    }),
    // Remove course from category
    removeCourseFromCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { categoryId, courseId } = req.params;
            // Find the course
            const course = yield Course_1.Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Find the category
            const category = yield Category_1.Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            // Check if course has this category
            if (!course.categories.includes(category.name)) {
                return res.status(400).json({ message: 'Course is not in this category' });
            }
            // Remove category from course
            course.categories = course.categories.filter(cat => cat !== category.name);
            yield course.save();
            res.json({ message: 'Course removed from category successfully' });
        }
        catch (error) {
            console.error('Remove course from category error:', error);
            res.status(500).json({ message: 'Error removing course from category' });
        }
    })
};
