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
exports.uploadFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const UPLOAD_DIR = path_1.default.join(__dirname, '../../uploads');
// Ensure uploads directory exists
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const uploadFile = (file, folder) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${(0, uuid_1.v4)()}.${fileExtension}`;
        const folderPath = path_1.default.join(UPLOAD_DIR, folder);
        // Create folder if it doesn't exist
        if (!fs_1.default.existsSync(folderPath)) {
            fs_1.default.mkdirSync(folderPath, { recursive: true });
        }
        const filePath = path_1.default.join(folderPath, fileName);
        fs_1.default.writeFileSync(filePath, file.buffer);
        // Return relative path that will be served by Express
        return `${folder}/${fileName}`;
    }
    catch (error) {
        console.error('File upload error:', error);
        throw new Error('Failed to upload file');
    }
});
exports.uploadFile = uploadFile;
