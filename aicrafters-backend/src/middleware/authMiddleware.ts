import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Use the exact type that courseController expects
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        _id: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Attach only the required fields to match courseController's expectations
    req.user = {
      id: user._id.toString(),
      _id: user._id.toString(),
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}; 