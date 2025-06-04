"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
// Configure multer to store files in memory
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
// Protected routes - require authentication
router.use(auth_1.authMiddleware);
router.get('/profile', userController_1.userController.getProfile);
router.put('/profile', userController_1.userController.updateProfile);
router.put('/password', userController_1.userController.updatePassword);
router.post('/set-password', userController_1.userController.setPassword);
router.get('/has-password', userController_1.userController.hasPassword);
router.put('/profile-image', upload.single('profileImage'), userController_1.userController.updateProfileImage);
router.delete('/account', userController_1.userController.deleteAccount);
exports.default = router;
