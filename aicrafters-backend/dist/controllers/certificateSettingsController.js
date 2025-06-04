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
exports.certificateSettingsController = void 0;
const CertificateSettings_1 = require("../models/CertificateSettings");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
exports.certificateSettingsController = {
    getSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield CertificateSettings_1.CertificateSettings.findOne().sort({ updatedAt: -1 });
                res.json(settings || { templateUrl: null });
            }
            catch (error) {
                console.error('Error getting certificate settings:', error);
                res.status(500).json({ message: 'Error getting certificate settings' });
            }
        });
    },
    updateTemplate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user || req.user.role !== 'admin') {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                if (!req.file) {
                    return res.status(400).json({ message: 'No file uploaded' });
                }
                // Upload to Cloudinary
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: 'certificates',
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
                    // Create new settings
                    const settings = new CertificateSettings_1.CertificateSettings({
                        templateUrl: result.secure_url,
                        updatedBy: req.user._id
                    });
                    yield settings.save();
                    res.json(settings);
                }));
                // Convert buffer to stream and pipe to Cloudinary
                const stream = new stream_1.Readable();
                stream.push(req.file.buffer);
                stream.push(null);
                stream.pipe(uploadStream);
            }
            catch (error) {
                console.error('Error updating certificate template:', error);
                res.status(500).json({ message: 'Error updating certificate template' });
            }
        });
    }
};
