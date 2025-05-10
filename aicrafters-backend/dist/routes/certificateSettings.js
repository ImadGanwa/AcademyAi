"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const certificateSettingsController_1 = require("../controllers/certificateSettingsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Get certificate settings
router.get('/', authMiddleware_1.authMiddleware, (req, res) => certificateSettingsController_1.certificateSettingsController.getSettings(req, res));
// Update certificate template
router.post('/template', authMiddleware_1.authMiddleware, upload.single('template'), (req, res) => certificateSettingsController_1.certificateSettingsController.updateTemplate(req, res));
exports.default = router;
