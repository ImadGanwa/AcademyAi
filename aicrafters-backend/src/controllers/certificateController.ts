import { Request, Response } from 'express';
import { Course, ICourse } from '../models/Course';
import { User, IUser } from '../models/User';
import { certificateService } from '../services/certificateService';
import mongoose from 'mongoose';

// Use the type that matches what the auth middleware provides
interface AuthRequest extends Request {
  user?: {
    id: string;
    _id: string;
    role: string;
  };
}

export const certificateController = {
  async generateCertificate(req: AuthRequest, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get course and user data with proper type assertions
      const course = await Course.findById(courseId).exec() as (ICourse & { _id: mongoose.Types.ObjectId }) | null;
      const user = await User.findById(userId).exec() as (IUser & { _id: mongoose.Types.ObjectId }) | null;

      if (!course || !user) {
        return res.status(404).json({ message: 'Course or user not found' });
      }

      // Check if the user has completed the course
      const userCourse = user.courses.find(c => c.courseId.toString() === courseId);
      if (!userCourse || userCourse.status !== 'completed') {
        return res.status(403).json({ message: 'Course not completed' });
      }

      // Generate certificate data
      const certificateData = await certificateService.generateCertificateData(user, course);

      // Always generate both PDF and image if image doesn't exist
      const { pdfBuffer, imageUrl } = await certificateService.generateAndUploadCertificate(certificateData);

      // Update user's course with the certificate image URL if it doesn't exist
      if (!userCourse.certificateImageUrl) {
        await User.updateOne(
          { 
            _id: userId,
            'courses.courseId': new mongoose.Types.ObjectId(courseId)
          },
          { 
            $set: { 
              'courses.$.certificateImageUrl': imageUrl 
            } 
          }
        );
      }

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=certificate-${courseId}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating certificate:', error);
      res.status(500).json({ message: 'Error generating certificate' });
    }
  },

  async getCertificateImage(req: AuthRequest, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await User.findById(userId).exec();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userCourse = user.courses.find(c => c.courseId.toString() === courseId);
      if (!userCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // If certificate image doesn't exist but course is completed, generate it
      if (!userCourse.certificateImageUrl && userCourse.status === 'completed') {
        // Get course data
        const course = await Course.findById(courseId).exec() as (ICourse & { _id: mongoose.Types.ObjectId }) | null;
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }

        // Generate certificate data
        const certificateData = await certificateService.generateCertificateData(user, course);

        // Generate and upload certificate
        const { imageUrl } = await certificateService.generateAndUploadCertificate(certificateData);

        // Update user's course with the certificate image URL
        await User.updateOne(
          { 
            _id: userId,
            'courses.courseId': new mongoose.Types.ObjectId(courseId)
          },
          { 
            $set: { 
              'courses.$.certificateImageUrl': imageUrl 
            } 
          }
        );

        return res.json({ imageUrl });
      }

      // Return existing image URL
      res.json({ imageUrl: userCourse.certificateImageUrl });
    } catch (error) {
      console.error('Error getting certificate image:', error);
      res.status(500).json({ message: 'Error getting certificate image' });
    }
  }
}; 