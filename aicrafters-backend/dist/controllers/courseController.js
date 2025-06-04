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
exports.courseController = void 0;
const Course_1 = require("../models/Course");
const Category_1 = require("../models/Category");
const mongoose_1 = __importDefault(require("mongoose"));
const fileUpload_1 = require("../utils/fileUpload");
const User_1 = require("../models/User");
const redis_1 = __importDefault(require("../config/redis"));
const notifications_1 = require("../utils/notifications");
const email_1 = require("../utils/email");
const Organization_1 = require("../models/Organization");
const getVimeoVideoId = (url) => {
    const match = url.match(/(?:\/|groups\/[^/]+\/videos\/)(\d+)/);
    return match ? match[1] : null;
};
const calculateContentReadingTime = (content) => {
    // Remove HTML tags but keep the text
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    // Reading speed: 150 words per minute
    const readingTime = words / 150;
    // Count images (img tags)
    const imageMatches = content.match(/<img[^>]*>/g);
    const imageCount = imageMatches ? imageMatches.length : 0;
    // 15 seconds (0.25 minutes) per image
    const imageTime = imageCount * 0.25;
    // Return total time in minutes, rounded up
    return Math.ceil(readingTime + imageTime);
};
const fetchVimeoDuration = (videoId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
        const data = yield response.json();
        const minutes = data.duration / 60;
        return Math.ceil(minutes);
    }
    catch (error) {
        console.error('Error fetching Vimeo duration:', error);
        return 0;
    }
});
// Helper function to get ID from a document
const getDocumentId = (doc) => {
    if (!doc)
        return '';
    if (doc._id)
        return doc._id.toString();
    if (doc.id)
        return doc.id;
    return '';
};
exports.courseController = {
    getAllCourses: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Try to get data from cache first
            const cacheKey = 'all-courses';
            const cachedData = yield redis_1.default.get(cacheKey);
            if (cachedData) {
                // Handle both string and object responses from Redis
                const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
                return res.json(parsedData);
            }
            const courses = yield Course_1.Course.find()
                .populate('instructor', 'fullName email')
                .sort({ createdAt: -1 });
            const transformedCourses = courses.map(course => {
                var _a;
                const courseObj = course.toObject();
                const courseData = {
                    id: courseObj._id.toString(),
                    title: courseObj.title,
                    subtitle: courseObj.subtitle,
                    description: courseObj.description,
                    instructor: courseObj.instructor,
                    thumbnail: courseObj.thumbnail,
                    previewVideo: courseObj.previewVideo,
                    originalPrice: courseObj.originalPrice,
                    currentPrice: courseObj.currentPrice,
                    categories: courseObj.categories,
                    learningPoints: courseObj.learningPoints,
                    requirements: courseObj.requirements,
                    status: courseObj.status,
                    rating: courseObj.rating,
                    usersCount: ((_a = courseObj.users) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    createdAt: courseObj.createdAt,
                    updatedAt: courseObj.updatedAt
                };
                if (courseObj.courseContent && courseObj.courseContent.sections) {
                    courseData.courseContent = {
                        sections: courseObj.courseContent.sections.map(section => ({
                            id: getDocumentId(section),
                            title: section.title,
                            lessons: section.contents.map(content => {
                                var _a;
                                const contentData = {
                                    id: getDocumentId(content),
                                    title: content.title,
                                    type: content.type,
                                    preview: false,
                                    duration: 0,
                                    contentItems: [],
                                    questions: []
                                };
                                if (content.type === 'lesson') {
                                    const lessonContent = content.content;
                                    contentData.preview = lessonContent.preview || false;
                                    contentData.duration = lessonContent.duration || 0;
                                    contentData.contentItems = lessonContent.contentItems || [];
                                }
                                else if (content.type === 'quiz') {
                                    const quizContent = content.content;
                                    contentData.preview = quizContent.preview || false;
                                    contentData.questions = quizContent.questions || [];
                                    contentData.duration = ((_a = quizContent.questions) === null || _a === void 0 ? void 0 : _a.length) * 2 || 0;
                                }
                                return contentData;
                            })
                        }))
                    };
                }
                return courseData;
            });
            // Cache the results for 5 minutes
            yield redis_1.default.setEx(cacheKey, 300, JSON.stringify(transformedCourses));
            res.json(transformedCourses);
        }
        catch (error) {
            console.error('Get all courses error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error fetching courses' });
        }
    }),
    getCourseById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const courseId = req.params.id;
            // Try to get data from cache first
            const cacheKey = `course:${courseId}`;
            const cachedData = yield redis_1.default.get(cacheKey);
            if (cachedData) {
                // Handle both string and object responses from Redis
                const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
                return res.json(parsedData);
            }
            const course = yield Course_1.Course.findById(courseId)
                .populate({
                path: 'instructor',
                select: 'fullName email profileImage title bio rating reviewsCount usersCount coursesCount'
            })
                .populate('users', 'fullName email');
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            const courseObj = course.toObject();
            const transformedCourse = {
                id: courseObj._id.toString(),
                title: courseObj.title,
                subtitle: courseObj.subtitle,
                description: courseObj.description,
                instructor: courseObj.instructor,
                thumbnail: courseObj.thumbnail,
                previewVideo: courseObj.previewVideo,
                originalPrice: courseObj.originalPrice,
                currentPrice: courseObj.currentPrice,
                categories: courseObj.categories,
                learningPoints: courseObj.learningPoints,
                requirements: courseObj.requirements,
                status: courseObj.status,
                rating: courseObj.rating,
                usersCount: ((_a = courseObj.users) === null || _a === void 0 ? void 0 : _a.length) || 0,
                createdAt: courseObj.createdAt,
                updatedAt: courseObj.updatedAt
            };
            if (courseObj.courseContent && courseObj.courseContent.sections) {
                transformedCourse.courseContent = {
                    sections: courseObj.courseContent.sections.map(section => ({
                        id: getDocumentId(section),
                        title: section.title,
                        lessons: section.contents.map(content => {
                            var _a;
                            const contentData = {
                                id: getDocumentId(content),
                                title: content.title,
                                type: content.type,
                                preview: false,
                                duration: 0,
                                contentItems: [],
                                questions: []
                            };
                            if (content.type === 'lesson') {
                                const lessonContent = content.content;
                                contentData.preview = lessonContent.preview || false;
                                contentData.duration = lessonContent.duration || 0;
                                contentData.contentItems = lessonContent.contentItems || [];
                            }
                            else if (content.type === 'quiz') {
                                const quizContent = content.content;
                                contentData.preview = quizContent.preview || false;
                                contentData.questions = quizContent.questions || [];
                                contentData.duration = ((_a = quizContent.questions) === null || _a === void 0 ? void 0 : _a.length) * 2 || 0;
                            }
                            return contentData;
                        })
                    }))
                };
            }
            // Cache the results for 5 minutes
            yield redis_1.default.setEx(cacheKey, 300, JSON.stringify(transformedCourse));
            res.json(transformedCourse);
        }
        catch (error) {
            console.error('Get course by id error:', error);
            if (error instanceof Error) {
                if (error instanceof mongoose_1.default.Error.CastError) {
                    return res.status(400).json({ message: 'Invalid course ID' });
                }
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error fetching course' });
        }
    }),
    getTrainerCourses: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            if (req.user.role !== 'trainer') {
                return res.status(403).json({ message: 'Only trainers can access their courses' });
            }
            const courses = yield Course_1.Course.find({ instructor: req.user.id })
                .populate('instructor', 'fullName email')
                .sort({ createdAt: -1 });
            // Transform the response to include all course information
            const transformedCourses = courses.map(course => {
                var _a;
                const courseObj = course.toObject();
                // Include course metadata
                const courseData = {
                    id: courseObj._id.toString(),
                    title: courseObj.title,
                    subtitle: courseObj.subtitle,
                    description: courseObj.description,
                    instructor: courseObj.instructor,
                    thumbnail: courseObj.thumbnail,
                    previewVideo: courseObj.previewVideo,
                    originalPrice: courseObj.originalPrice,
                    currentPrice: courseObj.currentPrice,
                    categories: courseObj.categories,
                    learningPoints: courseObj.learningPoints,
                    requirements: courseObj.requirements,
                    status: courseObj.status,
                    rating: courseObj.rating,
                    usersCount: ((_a = courseObj.users) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    createdAt: courseObj.createdAt,
                    updatedAt: courseObj.updatedAt
                };
                // Include full section and lesson information including content
                if (courseObj.courseContent && courseObj.courseContent.sections) {
                    courseData.courseContent = {
                        sections: courseObj.courseContent.sections.map(section => ({
                            id: getDocumentId(section),
                            title: section.title,
                            lessons: section.contents.map(content => {
                                var _a, _b;
                                const contentData = {
                                    id: getDocumentId(content),
                                    title: content.title,
                                    type: content.type,
                                    preview: false,
                                    duration: 0,
                                    contentItems: [],
                                    questions: []
                                };
                                if (content.type === 'lesson') {
                                    const lessonContent = content.content;
                                    contentData.duration = lessonContent.duration || 0;
                                    contentData.preview = lessonContent.preview || false;
                                    contentData.contentItems = ((_a = lessonContent.contentItems) === null || _a === void 0 ? void 0 : _a.map((item) => ({
                                        type: item.type,
                                        content: item.content,
                                        duration: item.duration
                                    }))) || [];
                                }
                                else if (content.type === 'quiz') {
                                    const quizContent = content.content;
                                    contentData.preview = quizContent.preview || false;
                                    contentData.questions = quizContent.questions || [];
                                    contentData.duration = ((_b = quizContent.questions) === null || _b === void 0 ? void 0 : _b.length) * 2 || 0;
                                    contentData.contentItems = [];
                                }
                                return contentData;
                            })
                        }))
                    };
                }
                return courseData;
            });
            res.json(transformedCourses);
        }
        catch (error) {
            console.error('Get trainer courses error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error fetching trainer courses' });
        }
    }),
    createCourse: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            // First, handle the file upload
            let thumbnailUrl = '';
            if (req.file) {
                try {
                    thumbnailUrl = yield (0, fileUpload_1.uploadToCloudinary)(req.file, 'course-thumbnails');
                }
                catch (error) {
                    console.error('Error uploading thumbnail:', error);
                    return res.status(500).json({ error: 'Error uploading thumbnail' });
                }
            }
            else {
                return res.status(400).json({ error: 'Thumbnail is required' });
            }
            const { title, subtitle, description, originalPrice, currentPrice, vimeoLink, categoriesStr, learningPointsStr, requirementsStr, courseContentStr, duration, } = req.body;
            let categories, learningPoints, requirements, courseContent;
            try {
                // Parse all JSON strings
                categories = JSON.parse(categoriesStr || '[]');
                learningPoints = JSON.parse(learningPointsStr || '[]');
                requirements = JSON.parse(requirementsStr || '[]');
                courseContent = JSON.parse(courseContentStr || '{"sections":[]}');
                // Validate arrays
                if (!Array.isArray(categories)) {
                    throw new Error('Categories must be an array');
                }
                if (!Array.isArray(learningPoints)) {
                    throw new Error('Learning Points must be an array');
                }
                if (!Array.isArray(requirements)) {
                    throw new Error('Requirements must be an array');
                }
                // Validate course content structure
                if (!courseContent.sections || !Array.isArray(courseContent.sections)) {
                    throw new Error('Invalid course content structure');
                }
                // Transform sections to match the database structure
                courseContent.sections = courseContent.sections.map((section) => {
                    if (!section.title || !section.contents || !Array.isArray(section.contents)) {
                        throw new Error('Invalid section structure');
                    }
                    return {
                        title: section.title,
                        contents: section.contents.map((content) => {
                            if (!content.type || !content.title || !content.content) {
                                throw new Error('Invalid content structure');
                            }
                            if (content.type === 'lesson') {
                                const lessonContent = content.content;
                                if (!Array.isArray(lessonContent.contentItems)) {
                                    throw new Error('Invalid lesson content structure - contentItems must be an array');
                                }
                                return {
                                    title: content.title,
                                    type: 'lesson',
                                    content: {
                                        type: 'lesson',
                                        contentItems: lessonContent.contentItems.map((item) => ({
                                            type: item.type,
                                            content: item.content,
                                            duration: item.duration
                                        })),
                                        preview: lessonContent.preview || false,
                                        duration: lessonContent.duration || 0
                                    }
                                };
                            }
                            else if (content.type === 'quiz') {
                                const quizContent = content.content;
                                const transformedQuiz = {
                                    title: content.title,
                                    type: 'quiz',
                                    content: {
                                        id: quizContent.id,
                                        title: quizContent.title,
                                        type: 'quiz',
                                        questions: quizContent.questions || [],
                                        preview: quizContent.preview || false
                                    }
                                };
                                return transformedQuiz;
                            }
                            throw new Error('Invalid content type');
                        })
                    };
                });
            }
            catch (error) {
                console.error('=== DEBUG: JSON Parse Error ===');
                console.error('Error:', error);
                console.error('Categories String:', categoriesStr);
                console.error('Learning Points String:', learningPointsStr);
                console.error('Requirements String:', requirementsStr);
                console.error('Course Content String:', courseContentStr);
                return res.status(400).json({
                    error: 'Invalid JSON data provided',
                    details: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
            const course = new Course_1.Course({
                title,
                subtitle,
                description,
                instructor: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                originalPrice: Number(originalPrice),
                currentPrice: Number(currentPrice),
                thumbnail: thumbnailUrl,
                previewVideo: vimeoLink,
                categories,
                learningPoints,
                requirements,
                courseContent,
                status: 'draft',
                duration: Number(duration) || 0
            });
            yield course.save();
            // Transform the course data before sending response
            const courseObj = course.toObject();
            const transformedCourse = {
                id: courseObj._id.toString(),
                title: courseObj.title,
                subtitle: courseObj.subtitle,
                description: courseObj.description,
                instructor: courseObj.instructor,
                thumbnail: courseObj.thumbnail,
                previewVideo: courseObj.previewVideo,
                originalPrice: courseObj.originalPrice,
                currentPrice: courseObj.currentPrice,
                categories: courseObj.categories,
                learningPoints: courseObj.learningPoints,
                requirements: courseObj.requirements,
                status: courseObj.status,
                rating: courseObj.rating,
                usersCount: ((_b = courseObj.users) === null || _b === void 0 ? void 0 : _b.length) || 0,
                createdAt: courseObj.createdAt,
                updatedAt: courseObj.updatedAt,
                courseContent: courseObj.courseContent && {
                    sections: courseObj.courseContent.sections.map(section => ({
                        id: getDocumentId(section),
                        title: section.title,
                        lessons: section.contents.map(content => {
                            var _a, _b;
                            const contentData = {
                                id: getDocumentId(content),
                                title: content.title,
                                type: content.type,
                                preview: false,
                                duration: 0,
                                contentItems: [],
                                questions: []
                            };
                            if (content.type === 'lesson') {
                                const lessonContent = content.content;
                                contentData.duration = lessonContent.duration || 0;
                                contentData.preview = lessonContent.preview || false;
                                contentData.contentItems = ((_a = lessonContent.contentItems) === null || _a === void 0 ? void 0 : _a.map((item) => ({
                                    type: item.type,
                                    content: item.content,
                                    duration: item.duration
                                }))) || [];
                            }
                            else if (content.type === 'quiz') {
                                const quizContent = content.content;
                                contentData.preview = quizContent.preview || false;
                                contentData.questions = quizContent.questions || [];
                                contentData.duration = ((_b = quizContent.questions) === null || _b === void 0 ? void 0 : _b.length) * 2 || 0;
                                contentData.contentItems = [];
                            }
                            return contentData;
                        })
                    }))
                }
            };
            // Invalidate the all-courses cache
            yield redis_1.default.setEx('all-courses', 1, '');
            res.status(201).json({
                course: transformedCourse,
                redirectTo: `/[lang]/dashboard/courses`
            });
        }
        catch (error) {
            console.error('Error creating course:', error);
            res.status(500).json({
                error: 'Error creating course',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }),
    uploadThumbnail: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            if (req.user.role !== 'trainer') {
                return res.status(403).json({ message: 'Only trainers can upload course thumbnails' });
            }
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            const thumbnailUrl = yield (0, fileUpload_1.uploadToCloudinary)(req.file, 'course-thumbnails');
            res.json({
                message: 'Thumbnail uploaded successfully',
                path: thumbnailUrl
            });
        }
        catch (error) {
            console.error('Upload thumbnail error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error uploading thumbnail' });
        }
    }),
    getCategories: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const categories = yield Category_1.Category.find().sort({ name: 1 });
            res.json(categories.map(cat => cat.name));
        }
        catch (error) {
            console.error('Get categories error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error fetching categories' });
        }
    }),
    addCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            if (req.user.role !== 'trainer') {
                return res.status(403).json({ message: 'Only trainers can add categories' });
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
                createdBy: req.user.id
            });
            yield category.save();
            const categories = yield Category_1.Category.find().sort({ name: 1 });
            res.status(201).json({
                message: 'Category added successfully',
                categories: categories.map(cat => cat.name)
            });
        }
        catch (error) {
            console.error('Add category error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error adding category' });
        }
    }),
    updateCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            if (req.user.role !== 'trainer') {
                return res.status(403).json({ message: 'Only trainers can update categories' });
            }
            const { oldName, newName } = req.body;
            if (!oldName || !newName) {
                return res.status(400).json({ message: 'Both old and new category names are required' });
            }
            const category = yield Category_1.Category.findOne({ name: oldName });
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            // Check if user is the creator of the category
            if (category.createdBy.toString() !== req.user.id) {
                return res.status(403).json({ message: 'You can only update categories you created' });
            }
            const existingCategory = yield Category_1.Category.findOne({
                name: newName.trim(),
                _id: { $ne: category._id }
            });
            if (existingCategory) {
                return res.status(400).json({ message: 'New category name already exists' });
            }
            category.name = newName.trim();
            yield category.save();
            const categories = yield Category_1.Category.find().sort({ name: 1 });
            res.json({
                message: 'Category updated successfully',
                categories: categories.map(cat => cat.name)
            });
        }
        catch (error) {
            console.error('Update category error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating category' });
        }
    }),
    deleteCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            if (req.user.role !== 'trainer') {
                return res.status(403).json({ message: 'Only trainers can delete categories' });
            }
            const categoryName = req.params.name;
            if (!categoryName) {
                return res.status(400).json({ message: 'Category name is required' });
            }
            const category = yield Category_1.Category.findOne({ name: categoryName });
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            // Check if user is the creator of the category
            if (category.createdBy.toString() !== req.user.id) {
                return res.status(403).json({ message: 'You can only delete categories you created' });
            }
            yield Category_1.Category.deleteOne({ _id: category._id });
            const categories = yield Category_1.Category.find().sort({ name: 1 });
            res.json({
                message: 'Category deleted successfully',
                categories: categories.map(cat => cat.name)
            });
        }
        catch (error) {
            console.error('Delete category error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error deleting category' });
        }
    }),
    updateCourseSection: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            if (req.user.role !== 'trainer') {
                return res.status(403).json({ message: 'Only trainers can update course sections' });
            }
            const courseId = req.params.courseId;
            const sectionId = req.params.sectionId;
            const { title, contents } = req.body;
            const course = yield Course_1.Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Verify the course belongs to the trainer
            if (course.instructor.toString() !== req.user.id) {
                return res.status(403).json({ message: 'You can only update your own courses' });
            }
            // Find the section to update
            const sectionIndex = course.courseContent.sections.findIndex(section => getDocumentId(section) === sectionId);
            if (sectionIndex === -1) {
                return res.status(404).json({ message: 'Section not found' });
            }
            // Update section
            const currentSection = course.courseContent.sections[sectionIndex];
            course.courseContent.sections[sectionIndex] = Object.assign(Object.assign({}, currentSection), { title: title || currentSection.title, contents: contents || currentSection.contents });
            yield course.save();
            res.json(course);
        }
        catch (error) {
            console.error('Update course section error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating course section' });
        }
    }),
    updateCourseStatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            const course = yield Course_1.Course.findOne({ _id: id, instructor: userId })
                .populate('instructor', 'fullName email')
                .lean();
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Trainers can send courses for review or change published courses to draft
            if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
                if (status !== 'review' && status !== 'draft') {
                    return res.status(403).json({ message: 'Trainers can only send courses for review or change to draft' });
                }
                // Only allow draft courses to be sent for review
                if (status === 'review' && course.status !== 'draft') {
                    return res.status(400).json({ message: 'Only draft courses can be sent for review' });
                }
                // Only allow published or review courses to be changed to draft
                if (status === 'draft' && !['published', 'review'].includes(course.status)) {
                    return res.status(400).json({ message: 'Only published or review courses can be changed to draft' });
                }
                // If course is being sent for review
                if (status === 'review') {
                    try {
                        // Find all admin users
                        const admins = yield User_1.User.find({ role: 'admin' });
                        // Send email and create notification for each admin
                        for (const admin of admins) {
                            // Send email to admin
                            yield (0, email_1.sendCourseSubmissionEmail)(admin.email, admin.fullName, course.title);
                            // Create notification for admin
                            yield (0, notifications_1.createNotification)({
                                recipient: admin._id.toString(),
                                type: 'course',
                                title: 'New Course Review Request',
                                message: `${course.instructor.fullName} has submitted "${course.title}" for review.`,
                                relatedId: course._id.toString()
                            });
                        }
                    }
                    catch (error) {
                        console.error('Error sending course review notifications:', error);
                        // Don't fail the request if notifications fail
                    }
                }
            }
            // Update the course status
            yield Course_1.Course.findByIdAndUpdate(id, { status });
            res.json({ message: 'Course status updated successfully', status });
        }
        catch (error) {
            console.error('Update course status error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating course status' });
        }
    }),
    deleteCourse: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const { id } = req.params;
            const course = yield Course_1.Course.findById(id);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Verify that the user is the course instructor
            if (course.instructor.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to delete this course' });
            }
            // Delete the course
            yield Course_1.Course.findByIdAndDelete(id);
            // Invalidate both the specific course cache and all-courses cache
            yield redis_1.default.setEx(`course:${id}`, 1, '');
            yield redis_1.default.setEx('all-courses', 1, '');
            res.json({ message: 'Course deleted successfully' });
        }
        catch (error) {
            console.error('Delete course error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error deleting course' });
        }
    }),
    getMyCourses: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            const { search } = req.query;
            const query = { instructor: userId };
            if (search) {
                query.title = { $regex: search, $options: 'i' };
            }
            const courses = yield Course_1.Course.find(query).sort({ updatedAt: -1 });
            const transformedCourses = courses.map(course => {
                var _a;
                return ({
                    id: course._id,
                    title: course.title,
                    subtitle: course.subtitle,
                    thumbnail: course.thumbnail,
                    status: course.status,
                    usersCount: ((_a = course.users) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    rating: course.rating || 0,
                    duration: course.duration || 0,
                    createdAt: course.createdAt,
                    updatedAt: course.updatedAt
                });
            });
            res.json(transformedCourses);
        }
        catch (error) {
            console.error('Get my courses error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error fetching courses' });
        }
    }),
    // Update course
    updateCourse: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            const courseId = req.params.id;
            // First find the course to verify ownership and get existing content
            const existingCourse = yield Course_1.Course.findOne({ _id: courseId, instructor: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
            if (!existingCourse) {
                return res.status(404).json({ error: 'Course not found or unauthorized' });
            }
            // Create a map of existing lesson IDs
            const existingLessonIds = new Map();
            (_b = existingCourse.courseContent) === null || _b === void 0 ? void 0 : _b.sections.forEach((section) => {
                section.contents.forEach((content) => {
                    var _a;
                    // Store the exact ID from the content
                    const contentId = (_a = content._id) === null || _a === void 0 ? void 0 : _a.toString();
                    if (contentId) {
                        existingLessonIds.set(content.title, contentId);
                    }
                });
            });
            // Handle thumbnail upload first if a new file is provided
            let thumbnailUrl;
            if (req.file) {
                try {
                    thumbnailUrl = yield (0, fileUpload_1.uploadToCloudinary)(req.file, 'course-thumbnails');
                }
                catch (error) {
                    console.error('Error uploading thumbnail:', error);
                    return res.status(500).json({ error: 'Error uploading thumbnail' });
                }
            }
            const { title, subtitle, description, originalPrice, currentPrice, vimeoLink, categoriesStr, learningPointsStr, requirementsStr, courseContentStr, status } = req.body;
            let categories, learningPoints, requirements, courseContent;
            try {
                // Parse JSON strings
                categories = JSON.parse(categoriesStr);
                learningPoints = JSON.parse(learningPointsStr);
                requirements = JSON.parse(requirementsStr);
                courseContent = JSON.parse(courseContentStr);
                // Validate course content structure
                if (courseContent) {
                    if (!Array.isArray(courseContent.sections)) {
                        throw new Error('Invalid course content structure: sections must be an array');
                    }
                    courseContent.sections = courseContent.sections.map((section) => {
                        if (!section.title || !section.contents || !Array.isArray(section.contents)) {
                            throw new Error('Invalid section structure');
                        }
                        return {
                            title: section.title,
                            contents: section.contents.map((content) => {
                                var _a;
                                if (!content.type || !content.title || !content.content) {
                                    throw new Error('Invalid content structure');
                                }
                                // Try to find existing lesson ID
                                const existingId = existingLessonIds.get(content.title);
                                const contentId = existingId ? new mongoose_1.default.Types.ObjectId(existingId) : new mongoose_1.default.Types.ObjectId();
                                if (content.type === 'lesson') {
                                    return {
                                        _id: contentId,
                                        title: content.title,
                                        type: 'lesson',
                                        content: {
                                            type: 'lesson',
                                            contentItems: content.content.contentItems || [],
                                            preview: content.content.preview || false,
                                            duration: content.content.duration || 0
                                        }
                                    };
                                }
                                else if (content.type === 'quiz') {
                                    const quizContent = content.content;
                                    return {
                                        _id: contentId,
                                        title: content.title,
                                        type: 'quiz',
                                        content: {
                                            type: 'quiz',
                                            title: quizContent.title || content.title,
                                            questions: quizContent.questions || [],
                                            preview: quizContent.preview || false,
                                            duration: (((_a = quizContent.questions) === null || _a === void 0 ? void 0 : _a.length) || 0) * 2
                                        }
                                    };
                                }
                                throw new Error('Invalid content type');
                            })
                        };
                    });
                }
            }
            catch (error) {
                console.error('=== DEBUG: JSON Parse Error ===');
                console.error('Error:', error);
                return res.status(400).json({
                    error: 'Invalid JSON data provided',
                    details: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
            // Build update object with all fields
            const updateData = {
                title,
                subtitle,
                description,
                originalPrice: Number(originalPrice),
                currentPrice: Number(currentPrice),
                categories,
                learningPoints,
                requirements,
                status,
                duration: Number(req.body.duration) || 0
            };
            // Only include courseContent if it was provided
            if (courseContent) {
                updateData.courseContent = courseContent;
            }
            // Only update thumbnail if a new one was uploaded
            if (thumbnailUrl) {
                updateData.thumbnail = thumbnailUrl;
            }
            // Update preview video if provided
            if (vimeoLink) {
                updateData.previewVideo = vimeoLink;
            }
            // Then update the course with the new data
            const course = yield Course_1.Course.findOneAndUpdate({ _id: courseId }, updateData, { new: true }).populate('instructor', 'fullName email');
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            // Invalidate all relevant caches
            yield Promise.all([
                redis_1.default.setEx(`course:${courseId}`, 1, ''),
                redis_1.default.setEx('all-courses', 1, ''),
                redis_1.default.setEx(`instructor:${(_c = req.user) === null || _c === void 0 ? void 0 : _c.id}:courses`, 1, '')
            ]);
            // Calculate total lessons in the updated course
            let totalLessons = 0;
            const newLessonIds = new Set();
            course.courseContent.sections.forEach(section => {
                section.contents.forEach((content) => {
                    totalLessons++;
                    if (content._id) {
                        newLessonIds.add(content._id.toString());
                    }
                });
            });
            // Find all users who have this course and update their progress
            const users = yield User_1.User.find({ 'courses.courseId': courseId });
            for (const user of users) {
                const userCourse = user.courses.find(c => c.courseId.toString() === courseId);
                if (userCourse && userCourse.progress) {
                    // Filter out completed lessons that no longer exist in the course
                    const validCompletedLessons = userCourse.progress.completedLessons.filter(lessonId => newLessonIds.has(lessonId.toString()));
                    // Calculate new progress percentage based on valid completed lessons
                    const completedLessonsCount = validCompletedLessons.length;
                    const newPercentage = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;
                    // Update the user's course progress
                    yield User_1.User.findOneAndUpdate({
                        _id: user._id,
                        'courses.courseId': courseId
                    }, {
                        $set: {
                            'courses.$.progress.completedLessons': validCompletedLessons,
                            'courses.$.progress.percentage': newPercentage,
                            'courses.$.status': newPercentage === 100 ? 'completed' : 'in progress'
                        }
                    });
                }
            }
            // Transform the course data before sending response
            const courseObj = course.toObject();
            const transformedCourse = {
                id: ((_d = courseObj._id) === null || _d === void 0 ? void 0 : _d.toString()) || courseId,
                title: courseObj.title,
                subtitle: courseObj.subtitle,
                description: courseObj.description,
                instructor: courseObj.instructor,
                thumbnail: courseObj.thumbnail,
                previewVideo: courseObj.previewVideo,
                originalPrice: courseObj.originalPrice,
                currentPrice: courseObj.currentPrice,
                categories: courseObj.categories,
                learningPoints: courseObj.learningPoints,
                requirements: courseObj.requirements,
                status: courseObj.status,
                rating: courseObj.rating,
                usersCount: ((_e = courseObj.users) === null || _e === void 0 ? void 0 : _e.length) || 0,
                createdAt: courseObj.createdAt,
                updatedAt: courseObj.updatedAt,
                courseContent: courseObj.courseContent
            };
            res.json(transformedCourse);
        }
        catch (error) {
            console.error('Error updating course:', error);
            res.status(500).json({
                error: 'Error updating course',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }),
    purchaseCourse: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const courseId = req.params.id;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Check if user already has this course
            const user = yield User_1.User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Check if course exists in user's courses with any status
            const existingCourse = user.courses.find(course => course.courseId.toString() === courseId &&
                (course.status === 'in progress' || course.status === 'completed'));
            if (existingCourse) {
                return res.status(400).json({ message: 'You already own this course' });
            }
            // Get course details for email
            const course = yield Course_1.Course.findById(courseId).populate('instructor', 'fullName');
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Add course to user's courses with 'in progress' status
            yield User_1.User.findByIdAndUpdate(userId, {
                $push: {
                    courses: {
                        courseId: courseId,
                        status: 'in progress',
                        progress: {
                            timeSpent: 0,
                            percentage: 0,
                            completedLessons: []
                        }
                    }
                }
            });
            // Add user to course's users
            yield Course_1.Course.findByIdAndUpdate(courseId, { $addToSet: { users: userId } });
            // Send purchase confirmation email
            try {
                yield (0, email_1.sendPurchaseConfirmationEmail)(user.email, user.fullName, course.title, courseId, course.instructor.fullName);
            }
            catch (error) {
                console.error('Error sending purchase confirmation email:', error);
                // Don't fail the purchase if email fails, but log it
            }
            // Invalidate user courses cache
            yield redis_1.default.setEx(`user-courses:${userId}`, 1, '');
            res.status(200).json({ message: 'Course purchased successfully' });
        }
        catch (error) {
            console.error('Error purchasing course:', error);
            res.status(500).json({ message: 'Error purchasing course' });
        }
    }),
    getUserCourses: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Try to get data from cache first
            const cacheKey = `user-courses:${userId}`;
            const cachedData = yield redis_1.default.get(cacheKey);
            if (cachedData) {
                // Only parse if it's a string, otherwise return as is
                return res.json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
            }
            // Get user with their courses and organizations
            const userDoc = yield User_1.User.findById(userId)
                .populate({
                path: 'courses.courseId',
                model: 'Course',
                populate: {
                    path: 'instructor',
                    model: 'User',
                    select: 'fullName'
                }
            })
                .populate('organizations')
                .lean();
            if (!userDoc) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Get all organization courses
            const organizations = userDoc.organizations || [];
            let organizationCourses = [];
            if (organizations.length > 0) {
                const orgs = yield Organization_1.Organization.find({ _id: { $in: organizations } })
                    .populate({
                    path: 'courses',
                    model: 'Course',
                    populate: {
                        path: 'instructor',
                        model: 'User',
                        select: 'fullName'
                    }
                })
                    .lean();
                // Add organization courses to user's courses if not already present
                for (const org of orgs) {
                    const orgCourses = org.courses || [];
                    for (const course of orgCourses) {
                        // Check if user already has this course
                        const existingCourse = (_b = userDoc.courses) === null || _b === void 0 ? void 0 : _b.find(c => {
                            var _a;
                            return c.courseId && c.courseId._id && course &&
                                c.courseId._id.toString() === ((_a = course === null || course === void 0 ? void 0 : course._id) === null || _a === void 0 ? void 0 : _a.toString());
                        });
                        if (!existingCourse) {
                            organizationCourses.push({
                                courseId: course,
                                status: 'in progress',
                                organizationId: org._id,
                                progress: {
                                    timeSpent: 0,
                                    percentage: 0,
                                    completedLessons: []
                                }
                            });
                        }
                    }
                }
            }
            // Combine user's personal courses with organization courses
            const allCourses = [...(userDoc.courses || []), ...organizationCourses];
            const courses = allCourses
                .filter(course => course && course.courseId)
                .map(course => {
                var _a, _b, _c, _d, _e;
                return ({
                    id: course.courseId._id.toString(),
                    title: course.courseId.title,
                    instructor: ((_a = course.courseId.instructor) === null || _a === void 0 ? void 0 : _a.fullName) || 'Unknown Instructor',
                    updatedDate: new Date(course.courseId.updatedAt).toISOString().split('T')[0],
                    duration: course.courseId.duration || 0,
                    timeDone: ((_b = course.progress) === null || _b === void 0 ? void 0 : _b.timeSpent) || 0,
                    imageId: course.courseId.thumbnail,
                    status: course.status,
                    organizationId: ((_c = course.organizationId) === null || _c === void 0 ? void 0 : _c.toString()) || null,
                    progress: {
                        percentage: ((_d = course.progress) === null || _d === void 0 ? void 0 : _d.percentage) || 0,
                        completedLessons: ((_e = course.progress) === null || _e === void 0 ? void 0 : _e.completedLessons) || []
                    }
                });
            });
            // Cache the results for 1 minute instead of 5 minutes
            yield redis_1.default.setEx(cacheKey, 60, JSON.stringify(courses));
            res.json(courses);
        }
        catch (error) {
            console.error('Error fetching user courses:', error);
            res.status(500).json({ message: 'Error fetching courses' });
        }
    }),
    markLessonComplete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { courseId, lessonId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Get the course to calculate total lessons
            const course = yield Course_1.Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Check if user already has this course, if not add it
            const user = yield User_1.User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Check if user already has the course
            const userHasCourse = user.courses.some(course => course.courseId.toString() === courseId);
            // If user doesn't have the course, add it to their courses
            if (!userHasCourse) {
                yield User_1.User.findByIdAndUpdate(userId, {
                    $push: {
                        courses: {
                            courseId: courseId,
                            status: 'in progress',
                            progress: {
                                timeSpent: 0,
                                percentage: 0,
                                completedLessons: []
                            }
                        }
                    }
                });
                // Add user to course's users
                yield Course_1.Course.findByIdAndUpdate(courseId, { $addToSet: { users: userId } });
            }
            // Calculate total lessons
            let totalLessons = 0;
            course.courseContent.sections.forEach(section => {
                totalLessons += section.contents.length;
            });
            // Update the user document using findOneAndUpdate
            const result = yield User_1.User.findOneAndUpdate({
                _id: userId,
                'courses.courseId': courseId
            }, {
                $addToSet: { 'courses.$.progress.completedLessons': lessonId },
                $set: {
                    'courses.$.status': 'in progress',
                    'courses.$.progress.timeSpent': 0 // You can update this with actual time spent if needed
                }
            }, { new: true });
            if (!result) {
                return res.status(404).json({ message: 'User or course not found' });
            }
            // Find the updated course in user's courses
            const userCourse = result.courses.find(c => c.courseId.toString() === courseId);
            if (!userCourse || !userCourse.progress) {
                return res.status(404).json({ message: 'Course progress not found' });
            }
            // Calculate new progress percentage
            const completedLessonsCount = userCourse.progress.completedLessons.length;
            const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedLessonsCount / totalLessons) * 100)) : 0;
            // Generate a certificate ID if one doesn't exist
            const certificateId = `CERT-${courseId.slice(-6).toUpperCase()}-${userId.slice(-4).toUpperCase()}-${Date.now()}`;
            // If all lessons are completed or percentage is 100, update the course status to completed
            if (percentage >= 100) {
                yield User_1.User.findOneAndUpdate({
                    _id: userId,
                    'courses.courseId': courseId
                }, {
                    $set: {
                        'courses.$.status': 'completed',
                        'courses.$.completedAt': new Date(),
                        'courses.$.progress.percentage': 100,
                        'courses.$.certificateId': certificateId
                    }
                });
            }
            else {
                // Update just the progress percentage
                yield User_1.User.findOneAndUpdate({
                    _id: userId,
                    'courses.courseId': courseId
                }, {
                    $set: {
                        'courses.$.progress.percentage': percentage
                    }
                });
            }
            // Get the final state after all updates
            const finalUser = yield User_1.User.findById(userId);
            const finalCourse = finalUser === null || finalUser === void 0 ? void 0 : finalUser.courses.find(c => c.courseId.toString() === courseId);
            // Set the course to completed directly for testing
            if (!(finalCourse === null || finalCourse === void 0 ? void 0 : finalCourse.certificateId)) {
                yield User_1.User.findOneAndUpdate({
                    _id: userId,
                    'courses.courseId': courseId
                }, {
                    $set: {
                        'courses.$.status': 'completed',
                        'courses.$.completedAt': new Date(),
                        'courses.$.progress.percentage': 100,
                        'courses.$.certificateId': certificateId
                    }
                });
            }
            res.json({
                message: 'Lesson marked as complete',
                progress: {
                    percentage,
                    completedLessons: userCourse.progress.completedLessons
                },
                status: percentage >= 100 ? 'completed' : 'in progress',
                certificateId: percentage >= 100 ? certificateId : finalCourse === null || finalCourse === void 0 ? void 0 : finalCourse.certificateId
            });
        }
        catch (error) {
            console.error('Error marking lesson as complete:', error);
            res.status(500).json({ message: 'Error marking lesson as complete' });
        }
    }),
    saveCourse: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const courseId = req.params.id;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Find the user
            const user = yield User_1.User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Check if course exists
            const course = yield Course_1.Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Check if course is already saved or in progress
            const existingCourse = user.courses.find(c => c.courseId.toString() === courseId);
            if (existingCourse) {
                if (existingCourse.status === 'saved') {
                    // If already saved, remove it (toggle functionality)
                    user.courses = user.courses.filter(c => c.courseId.toString() !== courseId);
                    yield user.save();
                    return res.json({ message: 'Course removed from saved', isSaved: false });
                }
                else {
                    return res.status(400).json({ message: 'Course is already in progress or completed' });
                }
            }
            // Add course to user's courses with 'saved' status
            user.courses.push({
                courseId: new mongoose_1.default.Types.ObjectId(courseId),
                status: 'saved',
                progress: {
                    timeSpent: 0,
                    percentage: 0,
                    completedLessons: []
                }
            });
            yield user.save();
            res.json({ message: 'Course saved successfully', isSaved: true });
        }
        catch (error) {
            console.error('Error saving course:', error);
            res.status(500).json({ message: 'Error saving course' });
        }
    }),
    enrollCourse: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const courseId = req.params.id;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Find the course first
            const course = yield Course_1.Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Add course to user's courses with 'in progress' status
            const user = yield User_1.User.findByIdAndUpdate(userId, {
                $push: {
                    courses: {
                        courseId: courseId,
                        status: 'in progress'
                    }
                }
            }, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Add user to course's users
            course.users = course.users || [];
            course.users.push(new mongoose_1.default.Types.ObjectId(userId));
            yield user.save();
            yield course.save();
            res.json({
                message: 'Successfully enrolled in the course',
                courseId: course._id
            });
        }
        catch (error) {
            console.error('Error enrolling in course:', error);
            res.status(500).json({ message: 'Error enrolling in course' });
        }
    }),
    addReview: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const courseId = req.params.id;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const { rating, comment } = req.body;
            if (!rating) {
                return res.status(400).json({ message: 'Rating is required' });
            }
            // Find the user and update their course data
            const user = yield User_1.User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Find the course in user's courses
            const userCourse = user.courses.find(c => c.courseId.toString() === courseId);
            if (!userCourse) {
                return res.status(404).json({ message: 'Course not found in user\'s courses' });
            }
            // Add rating and comment to user's course data
            userCourse.rating = rating;
            userCourse.comment = comment;
            yield user.save();
            // Update course reviews
            const course = yield Course_1.Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Initialize reviews array if it doesn't exist
            if (!course.reviews) {
                course.reviews = [];
            }
            // Add review to course
            const newReview = {
                user: new mongoose_1.default.Types.ObjectId(userId),
                rating,
                comment,
                createdAt: new Date()
            };
            course.reviews.push(newReview);
            // Calculate new average rating
            let totalRating = 0;
            course.reviews.forEach(review => {
                totalRating += review.rating;
            });
            course.rating = totalRating / course.reviews.length;
            yield course.save();
            res.json({
                message: 'Review added successfully',
                review: {
                    user: userId,
                    rating,
                    comment,
                    createdAt: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error adding review:', error);
            res.status(500).json({ message: 'Error adding review' });
        }
    }),
    checkCourseAccess: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const courseId = req.params.id;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Always grant access to all courses for all users
            res.status(200).json({ hasAccess: true });
            /* Original code commented out:
            // Check if user has purchased the course
            const user = await User.findById(userId);
            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }
      
            const hasAccess = user.courses.some(course =>
              course.courseId.toString() === courseId && (course.status === 'in progress' || course.status === 'completed')
            );
      
            res.status(200).json({ hasAccess });
            */
        }
        catch (error) {
            console.error('Error checking course access:', error);
            res.status(500).json({ message: 'Error checking course access' });
        }
    }),
    inviteUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const courseId = req.params.id;
            const { email } = req.body;
            // Validate input
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }
            // Check if the course exists and the user is the instructor
            const course = yield Course_1.Course.findOne({
                _id: courseId,
                instructor: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                status: 'published'
            }).populate('instructor', 'fullName');
            if (!course) {
                return res.status(404).json({ message: 'Course not found or unauthorized' });
            }
            // Find or create the user user
            let user = yield User_1.User.findOne({ email });
            if (!user) {
                // Create a new user account for the user
                const password = Math.random().toString(36).slice(-8);
                user = new User_1.User({
                    email,
                    password,
                    fullName: email.split('@')[0], // Temporary name from email
                    role: 'user',
                    isEmailVerified: true,
                    status: 'active'
                });
                yield user.save();
            }
            // Check if user already has access to the course
            const hasAccess = (_b = user.courses) === null || _b === void 0 ? void 0 : _b.some(c => c.courseId.toString() === courseId &&
                (c.status === 'in progress' || c.status === 'completed'));
            if (hasAccess) {
                return res.status(400).json({ message: 'User already has access to this course' });
            }
            // Add course to user's courses
            yield User_1.User.findByIdAndUpdate(user._id, {
                $push: {
                    courses: {
                        courseId: courseId,
                        status: 'in progress',
                        progress: {
                            timeSpent: 0,
                            percentage: 0,
                            completedLessons: []
                        }
                    }
                }
            });
            // Add user to course's users
            yield Course_1.Course.findByIdAndUpdate(courseId, { $addToSet: { users: user._id } });
            // Create notification for the user
            yield (0, notifications_1.createNotification)({
                recipient: user._id.toString(),
                type: 'course',
                title: 'Course Invitation',
                message: `You have been invited to join the course "${course.title}"`,
                relatedId: course._id.toString()
            });
            // Send invitation email
            try {
                yield (0, email_1.sendCourseInvitationEmail)(user.email, course.title, course._id.toString(), course.instructor.fullName);
            }
            catch (error) {
                console.error('Error sending invitation email:', error);
                // Don't fail the invitation if email fails, but log it
            }
            res.status(200).json({
                message: 'User invited successfully',
                userEmail: user.email,
                courseName: course.title
            });
        }
        catch (error) {
            console.error('Error inviting user:', error);
            if (error instanceof Error) {
                res.status(500).json({
                    message: 'Error inviting user',
                    error: error.message
                });
            }
            else {
                res.status(500).json({
                    message: 'Error inviting user',
                    error: 'Unknown error occurred'
                });
            }
        }
    }),
    getPublishedCourses: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const courses = yield Course_1.Course.find({ status: 'published' })
                .select('_id title thumbnail')
                .sort({ createdAt: -1 });
            const transformedCourses = courses.map(course => ({
                _id: course._id,
                title: course.title,
                thumbnail: course.thumbnail || '/images/placeholder-course.jpg',
                isPublished: true
            }));
            res.json(transformedCourses);
        }
        catch (error) {
            console.error('Get published courses error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error fetching published courses' });
        }
    })
};
