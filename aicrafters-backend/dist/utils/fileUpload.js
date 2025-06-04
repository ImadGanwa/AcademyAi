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
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// Folder mapping for different types of uploads
const folderMapping = {
    'profile-images': 'aicrafters/profile-images',
    'course-images': 'aicrafters/course-images',
    'lesson-materials': 'aicrafters/lesson-materials'
};
// Function to upload file to Cloudinary
const uploadToCloudinary = (input, folder) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadFolder = folderMapping[folder] || folder;
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: uploadFolder,
                resource_type: 'auto',
                transformation: [
                    { width: 500, height: 500, crop: 'limit' }
                ]
            }, (error, result) => {
                if (error)
                    return reject(error);
                if (!result)
                    return reject(new Error('No result from Cloudinary'));
                resolve(result.secure_url);
            });
            if (Buffer.isBuffer(input)) {
                // If input is a buffer, pipe it directly
                stream_1.Readable.from(input).pipe(uploadStream);
            }
            else {
                // If input is a file, pipe its buffer
                stream_1.Readable.from(input.buffer).pipe(uploadStream);
            }
        });
    }
    catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
// Function to delete file from Cloudinary
const deleteFromCloudinary = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract public_id from URL
        const publicId = url.split('/').slice(-2).join('/').split('.')[0];
        yield cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
});
exports.deleteFromCloudinary = deleteFromCloudinary;
