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
            if (!userCourse.certificateId) {
                throw new Error('Certificate ID not found. Course may not be completed yet.');
            }
            return {
                userName: user.fullName,
                courseName: course.title,
                certificateId: userCourse.certificateId
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
    generateAndUploadCertificate(certificateData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate PDF
            const pdfBuffer = yield this.generateCertificatePDF(certificateData);
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
    generateCertificatePDF(certificateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Get the latest certificate template URL
                    const settings = yield CertificateSettings_1.CertificateSettings.findOne().sort({ updatedAt: -1 });
                    if (!(settings === null || settings === void 0 ? void 0 : settings.templateUrl)) {
                        throw new Error('Certificate template not found');
                    }
                    // Download template image
                    const templateResponse = yield axios_1.default.get(settings.templateUrl, { responseType: 'arraybuffer' });
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
                    // Add the certificate content
                    this.addCertificateContent(doc, certificateData);
                    // Finalize the PDF
                    doc.end();
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
    addCertificateContent(doc, certificateData) {
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const contentWidth = 600; // Width for text content
        const leftMargin = (pageWidth - contentWidth) / 2;
        // User name
        doc.fontSize(36)
            .font('Helvetica-Bold')
            .fillColor('#000000');
        doc.text(certificateData.userName, leftMargin, pageHeight * 0.52, {
            width: contentWidth,
            align: 'center'
        });
        // Course name
        doc.fontSize(28)
            .font('Helvetica-Bold')
            .fillColor('#000000');
        doc.text(certificateData.courseName, leftMargin, pageHeight * 0.72, {
            width: contentWidth,
            align: 'center'
        });
        // Certificate ID (small at the bottom)
        doc.fontSize(8)
            .font('Helvetica')
            .fillColor('#666666');
        doc.text(`Certificate ID: ${certificateData.certificateId}`, leftMargin, doc.page.height - 25, {
            width: contentWidth,
            align: 'center'
        });
    }
}
exports.certificateService = new CertificateService();
