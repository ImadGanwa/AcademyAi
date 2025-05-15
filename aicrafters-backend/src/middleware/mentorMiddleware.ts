import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

/**
 * Middleware to check if the user is a mentor
 */
export const isMentor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    // Check if user has mentor role
    if (req.user.role !== 'mentor') {
      res.status(403).json({ success: false, error: 'Access denied. User is not a mentor' });
      return;
    }

    next();
  } catch (error) {
    console.error('Error in mentor middleware:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Middleware to check if the user has an approved mentor profile
 */
export const isApprovedMentor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Check if user has mentor role
    if (user.role !== 'mentor') {
      res.status(403).json({ success: false, error: 'Access denied. User is not a mentor' });
      return;
    }

    // Check if mentor profile is approved
    if (!user.mentorProfile?.isVerified || !user.mentorProfile?.approvedAt) {
      res.status(403).json({ success: false, error: 'Access denied. Mentor profile not approved' });
      return;
    }

    next();
  } catch (error) {
    console.error('Error in mentor middleware:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Middleware to check if the user has applied to be a mentor
 */
export const hasMentorApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Check if user has a mentor profile with an application date
    if (!user.mentorProfile?.appliedAt) {
      res.status(403).json({ success: false, error: 'User has not applied to be a mentor' });
      return;
    }

    next();
  } catch (error) {
    console.error('Error in mentor middleware:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}; 