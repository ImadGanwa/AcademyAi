import { Request, Response } from 'express';
import { Course } from '../models/Course';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { certificateService } from '../services/certificateService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    _id: string;
    role: string;
  };
}

export const coursesController = {
  // ... existing code ...

  // Add course-specific certificate template
  async updateCertificateTemplate(req: AuthRequest, res: Response) {
    try {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'trainer')) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { courseId } = req.params;

      if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
      }

      // Check if course exists and user has permission
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Verify instructor owns the course or user is admin
      if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to update this course' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Process template configuration if provided
      let templateConfig = undefined;
      if (req.body.templateConfig) {
        try {
          templateConfig = JSON.parse(req.body.templateConfig);
        } catch (e) {
          console.error('Error parsing template configuration:', e);
          // Continue without template config if parsing fails
        }
      }

      // Set default configuration if not provided
      if (!templateConfig) {
        templateConfig = {
          showUserName: true,
          showCourseName: false, // Default to hiding course name for course-specific templates
          showCertificateId: true
        };
      }

      // Upload to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'certificates/courses',
          resource_type: 'image',
          transformation: [
            { width: 2000, crop: "scale" },
            { quality: 100 },
            { fetch_format: "png" },
            { density: 300 }
          ]
        },
        async (error: any, result: any) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ message: 'Error uploading template' });
          }

          if (!result?.secure_url) {
            return res.status(500).json({ message: 'No URL returned from Cloudinary' });
          }

          // Update course with new certificate template URL and configuration
          course.certificateTemplateUrl = result.secure_url;
          course.certificateTemplateConfig = templateConfig;
          await course.save();
          
          res.json({ 
            courseId: course._id,
            certificateTemplateUrl: result.secure_url,
            certificateTemplateConfig: course.certificateTemplateConfig
          });
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const stream = new Readable();
      stream.push(req.file.buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    } catch (error) {
      console.error('Error updating course certificate template:', error);
      res.status(500).json({ message: 'Error updating course certificate template' });
    }
  },
  
  // Add a new method to update only the template configuration
  async updateCertificateTemplateConfig(req: AuthRequest, res: Response) {
    try {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'trainer')) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { courseId } = req.params;

      if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
      }

      // Check if course exists and user has permission
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Verify instructor owns the course or user is admin
      if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to update this course' });
      }

      // Check if course has a certificate template
      if (!course.certificateTemplateUrl) {
        return res.status(400).json({ message: 'Course does not have a certificate template' });
      }

      // Process template configuration
      const { templateConfig } = req.body;
      if (!templateConfig) {
        return res.status(400).json({ message: 'Template configuration is required' });
      }

      // Update course with new configuration
      course.certificateTemplateConfig = templateConfig;
      await course.save();
      
      res.json({ 
        courseId: course._id,
        certificateTemplateUrl: course.certificateTemplateUrl,
        certificateTemplateConfig: course.certificateTemplateConfig
      });
    } catch (error) {
      console.error('Error updating certificate template configuration:', error);
      res.status(500).json({ message: 'Error updating certificate template configuration' });
    }
  },
  
  // Update getCourseTemplate to include configuration
  async getCourseTemplate(req: AuthRequest, res: Response) {
    try {
      const { courseId } = req.params;
      
      if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
      }
      
      const course = await Course.findById(courseId).select('certificateTemplateUrl certificateTemplateConfig');
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      res.json({ 
        courseId: course._id,
        certificateTemplateUrl: course.certificateTemplateUrl || undefined,
        certificateTemplateConfig: course.certificateTemplateConfig || undefined
      });
    } catch (error) {
      console.error('Error getting course certificate template:', error);
      res.status(500).json({ message: 'Error getting course certificate template' });
    }
  },
  
  // Update deleteCertificateTemplate to also clear configuration
  async deleteCertificateTemplate(req: AuthRequest, res: Response) {
    try {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'trainer')) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { courseId } = req.params;

      if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
      }

      // Check if course exists and user has permission
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Verify instructor owns the course or user is admin
      if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to update this course' });
      }

      // Check if course has a certificate template
      if (!course.certificateTemplateUrl) {
        return res.status(404).json({ message: 'No certificate template found for this course' });
      }

      // Remove certificate template URL and configuration from course
      course.certificateTemplateUrl = undefined;
      course.certificateTemplateConfig = undefined;
      await course.save();
      
      res.json({ 
        courseId: course._id,
        message: 'Certificate template removed successfully'
      });
    } catch (error) {
      console.error('Error deleting course certificate template:', error);
      res.status(500).json({ message: 'Error deleting course certificate template' });
    }
  },
  
  // Add a new method to the controller for generating a test certificate
  async generateTestCertificate(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const { courseId } = req.params;
      const { userName, courseName, certificateId } = req.body;

      if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
      }

      // Additional validation
      if (!userName) {
        return res.status(400).json({ message: 'User name is required' });
      }

      // Find the course for template info
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Use the certificateService directly, no need to create a new instance
      const pdfBuffer = await certificateService.generateTestCertificate({
        userName,
        courseName: courseName || course.title,
        courseId: courseId,
        certificateId: certificateId || `TEST-${Date.now().toString().slice(-8)}`,
        completionDate: new Date(),
        certificateTemplateUrl: course.certificateTemplateUrl,
        certificateTemplateConfig: course.certificateTemplateConfig
      });

      // Set appropriate headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=test-certificate-${courseId}.pdf`);
      
      // Send the PDF buffer directly
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating test certificate:', error);
      res.status(500).json({ message: 'Failed to generate test certificate' });
    }
  },
  
  // ... existing code ...
}; 