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
Object.defineProperty(exports, "__esModule", { value: true });
exports.coursesController = void 0;
const Course_1 = require("../models/Course");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const certificateService_1 = require("../services/certificateService");
exports.coursesController = {
    // ... existing code ...
    // Add course-specific certificate template
    updateCertificateTemplate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'trainer')) {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                const { courseId } = req.params;
                if (!courseId) {
                    return res.status(400).json({ message: 'Course ID is required' });
                }
                // Check if course exists and user has permission
                const course = yield Course_1.Course.findById(courseId);
                if (!course) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                // Verify instructor owns the course or user is admin
                if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
                    return res.status(403).json({ message: 'Unauthorized to update this course' });
                }
                if (!req.file) {
                    return res.status(400).json({ message: 'No file uploaded' });
                }
                // Process template configuration if provided
                let templateConfig = undefined;
                if (req.body.templateConfig) {
                    try {
                        templateConfig = JSON.parse(req.body.templateConfig);
                    }
                    catch (e) {
                        console.error('Error parsing template configuration:', e);
                        // Continue without template config if parsing fails
                    }
                }
                // Set default configuration if not provided
                if (!templateConfig) {
                    templateConfig = {
                        showUserName: true,
                        showCourseName: false, // Default to hiding course name for course-specific templates
                        showCertificateId: true
                    };
                }
                // Upload to Cloudinary
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: 'certificates/courses',
                    resource_type: 'image',
                    transformation: [
                        { width: 2000, crop: "scale" },
                        { quality: 100 },
                        { fetch_format: "png" },
                        { density: 300 }
                    ]
                }, (error, result) => __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        return res.status(500).json({ message: 'Error uploading template' });
                    }
                    if (!(result === null || result === void 0 ? void 0 : result.secure_url)) {
                        return res.status(500).json({ message: 'No URL returned from Cloudinary' });
                    }
                    // Update course with new certificate template URL and configuration
                    course.certificateTemplateUrl = result.secure_url;
                    course.certificateTemplateConfig = templateConfig;
                    yield course.save();
                    res.json({
                        courseId: course._id,
                        certificateTemplateUrl: result.secure_url,
                        certificateTemplateConfig: course.certificateTemplateConfig
                    });
                }));
                // Convert buffer to stream and pipe to Cloudinary
                const stream = new stream_1.Readable();
                stream.push(req.file.buffer);
                stream.push(null);
                stream.pipe(uploadStream);
            }
            catch (error) {
                console.error('Error updating course certificate template:', error);
                res.status(500).json({ message: 'Error updating course certificate template' });
            }
        });
    },
    // Add a new method to update only the template configuration
    updateCertificateTemplateConfig(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'trainer')) {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                const { courseId } = req.params;
                if (!courseId) {
                    return res.status(400).json({ message: 'Course ID is required' });
                }
                // Check if course exists and user has permission
                const course = yield Course_1.Course.findById(courseId);
                if (!course) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                // Verify instructor owns the course or user is admin
                if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
                    return res.status(403).json({ message: 'Unauthorized to update this course' });
                }
                // Check if course has a certificate template
                if (!course.certificateTemplateUrl) {
                    return res.status(400).json({ message: 'Course does not have a certificate template' });
                }
                // Process template configuration
                const { templateConfig } = req.body;
                if (!templateConfig) {
                    return res.status(400).json({ message: 'Template configuration is required' });
                }
                // Update course with new configuration
                course.certificateTemplateConfig = templateConfig;
                yield course.save();
                res.json({
                    courseId: course._id,
                    certificateTemplateUrl: course.certificateTemplateUrl,
                    certificateTemplateConfig: course.certificateTemplateConfig
                });
            }
            catch (error) {
                console.error('Error updating certificate template configuration:', error);
                res.status(500).json({ message: 'Error updating certificate template configuration' });
            }
        });
    },
    // Update getCourseTemplate to include configuration
    getCourseTemplate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                if (!courseId) {
                    return res.status(400).json({ message: 'Course ID is required' });
                }
                const course = yield Course_1.Course.findById(courseId).select('certificateTemplateUrl certificateTemplateConfig');
                if (!course) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                res.json({
                    courseId: course._id,
                    certificateTemplateUrl: course.certificateTemplateUrl || undefined,
                    certificateTemplateConfig: course.certificateTemplateConfig || undefined
                });
            }
            catch (error) {
                console.error('Error getting course certificate template:', error);
                res.status(500).json({ message: 'Error getting course certificate template' });
            }
        });
    },
    // Update deleteCertificateTemplate to also clear configuration
    deleteCertificateTemplate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'trainer')) {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                const { courseId } = req.params;
                if (!courseId) {
                    return res.status(400).json({ message: 'Course ID is required' });
                }
                // Check if course exists and user has permission
                const course = yield Course_1.Course.findById(courseId);
                if (!course) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                // Verify instructor owns the course or user is admin
                if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
                    return res.status(403).json({ message: 'Unauthorized to update this course' });
                }
                // Check if course has a certificate template
                if (!course.certificateTemplateUrl) {
                    return res.status(404).json({ message: 'No certificate template found for this course' });
                }
                // Remove certificate template URL and configuration from course
                course.certificateTemplateUrl = undefined;
                course.certificateTemplateConfig = undefined;
                yield course.save();
                res.json({
                    courseId: course._id,
                    message: 'Certificate template removed successfully'
                });
            }
            catch (error) {
                console.error('Error deleting course certificate template:', error);
                res.status(500).json({ message: 'Error deleting course certificate template' });
            }
        });
    },
    // Add a new method to the controller for generating a test certificate
    generateTestCertificate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user || req.user.role !== 'admin') {
                    return res.status(403).json({ message: 'Unauthorized access' });
                }
                const { courseId } = req.params;
                const { userName, courseName, certificateId } = req.body;
                if (!courseId) {
                    return res.status(400).json({ message: 'Course ID is required' });
                }
                // Additional validation
                if (!userName) {
                    return res.status(400).json({ message: 'User name is required' });
                }
                // Find the course for template info
                const course = yield Course_1.Course.findById(courseId);
                if (!course) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                // Use the certificateService directly, no need to create a new instance
                const pdfBuffer = yield certificateService_1.certificateService.generateTestCertificate({
                    userName,
                    courseName: courseName || course.title,
                    courseId: courseId,
                    certificateId: certificateId || `TEST-${Date.now().toString().slice(-8)}`,
                    completionDate: new Date(),
                    certificateTemplateUrl: course.certificateTemplateUrl,
                    certificateTemplateConfig: course.certificateTemplateConfig
                });
                // Set appropriate headers for PDF download
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=test-certificate-${courseId}.pdf`);
                // Send the PDF buffer directly
                res.send(pdfBuffer);
            }
            catch (error) {
                console.error('Error generating test certificate:', error);
                res.status(500).json({ message: 'Failed to generate test certificate' });
            }
        });
    },
    // ... existing code ...
};
