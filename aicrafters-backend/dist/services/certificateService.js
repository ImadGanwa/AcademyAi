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
exports.certificateService = void 0;
const Course_1 = require("../models/Course");
const CertificateSettings_1 = require("../models/CertificateSettings");
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const axios_1 = __importDefault(require("axios"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
class CertificateService {
    constructor() {
        this.assetsPath = path_1.default.join(__dirname, '../assets/certificates');
    }
    generateCertificateData(user, course) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find the user's completed course entry
            const userCourse = user.courses.find(c => c.courseId.toString() === course._id.toString());
            if (!userCourse) {
                throw new Error('Course not found in user\'s completed courses');
            }
            // Generate a certificate ID if it doesn't exist
            let certificateId = userCourse.certificateId;
            if (!certificateId) {
                certificateId = `CERT-${course._id.toString().slice(-6).toUpperCase()}-${user._id.toString().slice(-4).toUpperCase()}-${Date.now()}`;
                // We don't update the database here as that should be handled by the controller
            }
            return {
                userName: user.fullName,
                courseName: course.title,
                certificateId: certificateId
            };
        });
    }
    calculateCompletionTime(timeSpent) {
        if (!timeSpent)
            return '2-3 hours';
        const hours = Math.floor(timeSpent / 3600);
        if (hours < 1)
            return 'Less than an hour';
        if (hours === 1)
            return '1 hour';
        return `${hours} hours`;
    }
    generateAndUploadCertificate(certificateData, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate PDF - pass courseId for course-specific template
            const pdfBuffer = yield this.generateCertificatePDF(certificateData, courseId);
            // Upload to Cloudinary and get image URL
            const imageUrl = yield this.uploadToCloudinary(pdfBuffer);
            return { pdfBuffer, imageUrl };
        });
    }
    uploadToCloudinary(pdfBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: 'certificates',
                    format: 'png',
                    pages: true,
                    transformation: [
                        { width: 2000, crop: "scale" },
                        { quality: 100 },
                        { fetch_format: "png" },
                        { density: 300 }
                    ]
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve((result === null || result === void 0 ? void 0 : result.secure_url) || '');
                });
                const readStream = new stream_1.Readable();
                readStream.push(pdfBuffer);
                readStream.push(null);
                readStream.pipe(uploadStream);
            });
        });
    }
    generateCertificatePDF(certificateData, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let templateUrl = null;
                    let templateConfig = null;
                    let isCourseSpecificTemplate = false;
                    // First check if the course has a specific template
                    if (courseId) {
                        const course = yield Course_1.Course.findById(courseId).select('certificateTemplateUrl certificateTemplateConfig');
                        if (course === null || course === void 0 ? void 0 : course.certificateTemplateUrl) {
                            templateUrl = course.certificateTemplateUrl;
                            isCourseSpecificTemplate = true;
                            // If the course has template config, use it
                            if (course.certificateTemplateConfig) {
                                templateConfig = course.certificateTemplateConfig;
                            }
                            else {
                                // Default config for course-specific templates: don't show course name (assume it's in the template)
                                templateConfig = {
                                    showUserName: true,
                                    showCourseName: false, // Default to not showing the course name for course-specific templates
                                    showCertificateId: true
                                };
                            }
                        }
                    }
                    // If no course-specific template, use the general template
                    if (!templateUrl) {
                        const settings = yield CertificateSettings_1.CertificateSettings.findOne().sort({ updatedAt: -1 });
                        templateUrl = settings === null || settings === void 0 ? void 0 : settings.templateUrl;
                        // Default config for global template: show everything
                        templateConfig = {
                            showUserName: true,
                            showCourseName: true,
                            showCertificateId: true
                        };
                    }
                    if (!templateUrl) {
                        throw new Error('Certificate template not found');
                    }
                    // Download template image
                    const templateResponse = yield axios_1.default.get(templateUrl, { responseType: 'arraybuffer' });
                    const templateBuffer = Buffer.from(templateResponse.data);
                    // Create a new PDF document with higher resolution
                    const doc = new pdfkit_1.default({
                        layout: 'landscape',
                        size: 'A4',
                        margin: 0,
                        info: {
                            Title: `${certificateData.courseName} Certificate`,
                            Author: 'AiCademy',
                        }
                    });
                    // Create a buffer to store the PDF
                    const chunks = [];
                    doc.on('data', (chunk) => chunks.push(chunk));
                    doc.on('end', () => resolve(Buffer.concat(chunks)));
                    // Add template background with high quality settings
                    doc.image(templateBuffer, 0, 0, {
                        width: doc.page.width,
                        height: doc.page.height,
                        align: 'center',
                        valign: 'center'
                    });
                    // Add the certificate content with template configuration
                    this.addCertificateContent(doc, certificateData, templateConfig);
                    // Finalize the PDF
                    doc.end();
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
    addCertificateContent(doc, certificateData, templateConfig) {
        var _a, _b, _c, _d, _e, _f;
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const contentWidth = 600; // Width for text content
        // Default configuration if none provided
        const config = templateConfig || {
            showUserName: true,
            showCourseName: true,
            showCertificateId: true
        };
        // User name (if enabled)
        if (config.showUserName) {
            // Calculate position based on both x and y coordinates
            const nameX = ((_a = config.namePosition) === null || _a === void 0 ? void 0 : _a.x) ? pageWidth * config.namePosition.x : pageWidth * 0.5;
            const nameY = ((_b = config.namePosition) === null || _b === void 0 ? void 0 : _b.y) ? pageHeight * config.namePosition.y : pageHeight * 0.52;
            // Calculate left margin based on x position
            const nameLeftMargin = nameX - (contentWidth / 2);
            doc.fontSize(36)
                .font('Helvetica-Bold')
                .fillColor('#000000');
            doc.text(certificateData.userName, nameLeftMargin, nameY, {
                width: contentWidth,
                align: 'center'
            });
        }
        // Course name (if enabled)
        if (config.showCourseName) {
            // Calculate position based on both x and y coordinates
            const courseX = ((_c = config.coursePosition) === null || _c === void 0 ? void 0 : _c.x) ? pageWidth * config.coursePosition.x : pageWidth * 0.5;
            const courseY = ((_d = config.coursePosition) === null || _d === void 0 ? void 0 : _d.y) ? pageHeight * config.coursePosition.y : pageHeight * 0.72;
            // Calculate left margin based on x position
            const courseLeftMargin = courseX - (contentWidth / 2);
            doc.fontSize(28)
                .font('Helvetica-Bold')
                .fillColor('#000000');
            doc.text(certificateData.courseName, courseLeftMargin, courseY, {
                width: contentWidth,
                align: 'center'
            });
        }
        // Certificate ID (if enabled)
        if (config.showCertificateId) {
            // Calculate position based on both x and y coordinates
            const idX = ((_e = config.idPosition) === null || _e === void 0 ? void 0 : _e.x) ? pageWidth * config.idPosition.x : pageWidth * 0.5;
            const idY = ((_f = config.idPosition) === null || _f === void 0 ? void 0 : _f.y) ? pageHeight * config.idPosition.y : pageHeight * 0.95;
            // Calculate left margin based on x position
            const idLeftMargin = idX - (contentWidth / 2);
            doc.fontSize(8)
                .font('Helvetica')
                .fillColor('#666666');
            doc.text(`Certificate ID: ${certificateData.certificateId}`, idLeftMargin, idY, {
                width: contentWidth,
                align: 'center'
            });
        }
    }
    // Add this method to the CertificateService class
    generateTestCertificate(testData) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Use the provided template URL and config or fetch them
                    let templateUrl = testData.certificateTemplateUrl;
                    let templateConfig = testData.certificateTemplateConfig;
                    // If no template URL provided, try to get it from the course
                    if (!templateUrl) {
                        const course = yield Course_1.Course.findById(testData.courseId).select('certificateTemplateUrl certificateTemplateConfig');
                        if (course === null || course === void 0 ? void 0 : course.certificateTemplateUrl) {
                            templateUrl = course.certificateTemplateUrl;
                            templateConfig = course.certificateTemplateConfig;
                        }
                        else {
                            // Fallback to global template
                            const settings = yield CertificateSettings_1.CertificateSettings.findOne().sort({ updatedAt: -1 });
                            templateUrl = settings === null || settings === void 0 ? void 0 : settings.templateUrl;
                        }
                    }
                    if (!templateUrl) {
                        throw new Error('Certificate template not found');
                    }
                    // Default config if none provided
                    if (!templateConfig) {
                        templateConfig = {
                            showUserName: true,
                            showCourseName: templateUrl.includes('global'), // Only show course name if it's a global template
                            showCertificateId: true,
                            namePosition: { x: 0.5, y: 0.52 },
                            coursePosition: { x: 0.5, y: 0.72 },
                            idPosition: { x: 0.5, y: 0.95 }
                        };
                    }
                    // Download template image
                    const templateResponse = yield axios_1.default.get(templateUrl, { responseType: 'arraybuffer' });
                    const templateBuffer = Buffer.from(templateResponse.data);
                    // Create a new PDF document with higher resolution
                    const doc = new pdfkit_1.default({
                        layout: 'landscape',
                        size: 'A4',
                        margin: 0,
                        info: {
                            Title: `${testData.courseName} Test Certificate`,
                            Author: 'AiCademy',
                        }
                    });
                    // Create a buffer to store the PDF
                    const chunks = [];
                    doc.on('data', (chunk) => chunks.push(chunk));
                    doc.on('end', () => resolve(Buffer.concat(chunks)));
                    // Add template background with high quality settings
                    doc.image(templateBuffer, 0, 0, {
                        width: doc.page.width,
                        height: doc.page.height,
                        align: 'center',
                        valign: 'center'
                    });
                    // Add the certificate content using the config
                    this.addCertificateContent(doc, {
                        userName: testData.userName,
                        courseName: testData.courseName,
                        certificateId: testData.certificateId
                    }, templateConfig);
                    // Add TEST CERTIFICATE watermark
                    doc.save();
                    doc.fillColor('rgba(100, 100, 100, 0.2)');
                    doc.fontSize(60);
                    doc.font('Helvetica-Bold');
                    doc.rotate(45, { origin: [doc.page.width / 2, doc.page.height / 2] });
                    doc.text('TEST CERTIFICATE', 0, 0, {
                        align: 'center',
                        width: doc.page.width * 1.5,
                        height: doc.page.height
                    });
                    doc.restore();
                    // Finalize the PDF
                    doc.end();
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
}
exports.certificateService = new CertificateService();
