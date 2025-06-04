"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const certificateController_1 = require("../controllers/certificateController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Generate certificate for a course
router.get('/:courseId', authMiddleware_1.authMiddleware, (req, res) => certificateController_1.certificateController.generateCertificate(req, res));
// Get certificate image URL
router.get('/:courseId/image', authMiddleware_1.authMiddleware, (req, res) => certificateController_1.certificateController.getCertificateImage(req, res));
exports.default = router;
