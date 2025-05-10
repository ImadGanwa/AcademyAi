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
exports.certificateController = void 0;
const Course_1 = require("../models/Course");
const User_1 = require("../models/User");
const certificateService_1 = require("../services/certificateService");
const mongoose_1 = __importDefault(require("mongoose"));
exports.certificateController = {
    generateCertificate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { courseId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                // Get course and user data with proper type assertions
                const course = yield Course_1.Course.findById(courseId).exec();
                const user = yield User_1.User.findById(userId).exec();
                if (!course || !user) {
                    return res.status(404).json({ message: 'Course or user not found' });
                }
                // Check if the user has completed the course
                const userCourse = user.courses.find(c => c.courseId.toString() === courseId);
                if (!userCourse || userCourse.status !== 'completed') {
                    return res.status(403).json({ message: 'Course not completed' });
                }
                // Generate certificate data
                const certificateData = yield certificateService_1.certificateService.generateCertificateData(user, course);
                // Always generate both PDF and image if image doesn't exist
                const { pdfBuffer, imageUrl } = yield certificateService_1.certificateService.generateAndUploadCertificate(certificateData);
                // Update user's course with the certificate image URL if it doesn't exist
                if (!userCourse.certificateImageUrl) {
                    yield User_1.User.updateOne({
                        _id: userId,
                        'courses.courseId': new mongoose_1.default.Types.ObjectId(courseId)
                    }, {
                        $set: {
                            'courses.$.certificateImageUrl': imageUrl
                        }
                    });
                }
                // Set response headers for PDF download
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=certificate-${courseId}.pdf`);
                res.send(pdfBuffer);
            }
            catch (error) {
                console.error('Error generating certificate:', error);
                res.status(500).json({ message: 'Error generating certificate' });
            }
        });
    },
    getCertificateImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { courseId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const user = yield User_1.User.findById(userId).exec();
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                const userCourse = user.courses.find(c => c.courseId.toString() === courseId);
                if (!userCourse) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                // If certificate image doesn't exist but course is completed, generate it
                if (!userCourse.certificateImageUrl && userCourse.status === 'completed') {
                    // Get course data
                    const course = yield Course_1.Course.findById(courseId).exec();
                    if (!course) {
                        return res.status(404).json({ message: 'Course not found' });
                    }
                    // Generate certificate data
                    const certificateData = yield certificateService_1.certificateService.generateCertificateData(user, course);
                    // Generate and upload certificate
                    const { imageUrl } = yield certificateService_1.certificateService.generateAndUploadCertificate(certificateData);
                    // Update user's course with the certificate image URL
                    yield User_1.User.updateOne({
                        _id: userId,
                        'courses.courseId': new mongoose_1.default.Types.ObjectId(courseId)
                    }, {
                        $set: {
                            'courses.$.certificateImageUrl': imageUrl
                        }
                    });
                    return res.json({ imageUrl });
                }
                // Return existing image URL
                res.json({ imageUrl: userCourse.certificateImageUrl });
            }
            catch (error) {
                console.error('Error getting certificate image:', error);
                res.status(500).json({ message: 'Error getting certificate image' });
            }
        });
    }
};
