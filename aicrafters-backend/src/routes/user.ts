import express from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';

const router = express.Router();

// Configure multer to store files in memory
const upload = multer({ 
  storage: multer.memoryStorage(),
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
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);
router.post('/set-password', userController.setPassword);
router.get('/has-password', userController.hasPassword);
router.put('/profile-image', upload.single('profileImage'), userController.updateProfileImage);
router.delete('/account', userController.deleteAccount);

export default router; 