"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Verify environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables are missing');
}
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});
exports.default = cloudinary_1.v2;
