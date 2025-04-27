import express from 'express';
import { trainerController } from '../controllers/trainerController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/users', authMiddleware, trainerController.getUsers);

export default router; 