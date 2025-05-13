import { Course, ICourse } from '../models/Course';
import { User, IUser } from '../models/User';
import { CertificateSettings } from '../models/CertificateSettings';
import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import axios from 'axios';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CertificateData {
  userName: string;
  courseName: string;
  certificateId: string;
}

// Template configuration interface to control which elements appear on the certificate
interface TemplateConfig {
  showUserName: boolean;
  showCourseName: boolean;
  showCertificateId: boolean;
  namePosition?: { x: number; y: number };
  coursePosition?: { x: number; y: number };
  idPosition?: { x: number; y: number };
}

// Add a new interface for test certificate data
interface TestCertificateData {
  userName: string;
  courseName: string;
  courseId: string;
  certificateId: string;
  completionDate: Date;
  certificateTemplateUrl?: string;
  certificateTemplateConfig?: TemplateConfig;
}

class CertificateService {
  private assetsPath: string;

  constructor() {
    this.assetsPath = path.join(__dirname, '../assets/certificates');
  }

  async generateCertificateData(user: IUser & { _id: mongoose.Types.ObjectId }, course: ICourse & { _id: mongoose.Types.ObjectId }): Promise<CertificateData> {
    // Find the user's completed course entry
    const userCourse = user.courses.find(c => c.courseId.toString() === course._id.toString());
    
    if (!userCourse) {
      throw new Error('Course not found in user\'s completed courses');
    }

    if (!userCourse.certificateId) {
      throw new Error('Certificate ID not found. Course may not be completed yet.');
    }

    return {
      userName: user.fullName,
      courseName: course.title,
      certificateId: userCourse.certificateId
    };
  }

  private calculateCompletionTime(timeSpent?: number): string {
    if (!timeSpent) return '2-3 hours';
    
    const hours = Math.floor(timeSpent / 3600);
    if (hours < 1) return 'Less than an hour';
    if (hours === 1) return '1 hour';
    return `${hours} hours`;
  }

  async generateAndUploadCertificate(certificateData: CertificateData, courseId?: string): Promise<{ pdfBuffer: Buffer; imageUrl: string }> {
    // Generate PDF - pass courseId for course-specific template
    const pdfBuffer = await this.generateCertificatePDF(certificateData, courseId);
    
    // Upload to Cloudinary and get image URL
    const imageUrl = await this.uploadToCloudinary(pdfBuffer);

    return { pdfBuffer, imageUrl };
  }

  private async uploadToCloudinary(pdfBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'certificates',
          format: 'png',
          pages: true,
          transformation: [
            { width: 2000, crop: "scale" },
            { quality: 100 },
            { fetch_format: "png" },
            { density: 300 }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result?.secure_url || '');
        }
      );

      const readStream = new Readable();
      readStream.push(pdfBuffer);
      readStream.push(null);
      readStream.pipe(uploadStream);
    });
  }

  async generateCertificatePDF(certificateData: CertificateData, courseId?: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        let templateUrl = null;
        let templateConfig: TemplateConfig | null = null;
        let isCourseSpecificTemplate = false;
        
        // First check if the course has a specific template
        if (courseId) {
          const course = await Course.findById(courseId).select('certificateTemplateUrl certificateTemplateConfig');
          if (course?.certificateTemplateUrl) {
            templateUrl = course.certificateTemplateUrl;
            isCourseSpecificTemplate = true;
            
            // If the course has template config, use it
            if (course.certificateTemplateConfig) {
              templateConfig = course.certificateTemplateConfig;
            } else {
              // Default config for course-specific templates: don't show course name (assume it's in the template)
              templateConfig = {
                showUserName: true, 
                showCourseName: false, // Default to not showing the course name for course-specific templates
                showCertificateId: true
              };
            }
          }
        }
        
        // If no course-specific template, use the general template
        if (!templateUrl) {
          const settings = await CertificateSettings.findOne().sort({ updatedAt: -1 });
          templateUrl = settings?.templateUrl;
          
          // Default config for global template: show everything
          templateConfig = {
            showUserName: true,
            showCourseName: true,
            showCertificateId: true
          };
        }
        
        if (!templateUrl) {
          throw new Error('Certificate template not found');
        }

        // Download template image
        const templateResponse = await axios.get(templateUrl, { responseType: 'arraybuffer' });
        const templateBuffer = Buffer.from(templateResponse.data);

        // Create a new PDF document with higher resolution
        const doc = new PDFDocument({
          layout: 'landscape',
          size: 'A4',
          margin: 0,
          info: {
            Title: `${certificateData.courseName} Certificate`,
            Author: 'AiCademy',
          }
        });

        // Create a buffer to store the PDF
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Add template background with high quality settings
        doc.image(templateBuffer, 0, 0, {
          width: doc.page.width,
          height: doc.page.height,
          align: 'center',
          valign: 'center'
        });

        // Add the certificate content with template configuration
        this.addCertificateContent(doc, certificateData, templateConfig);

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addCertificateContent(doc: PDFKit.PDFDocument, certificateData: CertificateData, templateConfig?: TemplateConfig | null): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = 600; // Width for text content

    // Default configuration if none provided
    const config: TemplateConfig = templateConfig || {
      showUserName: true,
      showCourseName: true,
      showCertificateId: true
    };

    // User name (if enabled)
    if (config.showUserName) {
      // Calculate position based on both x and y coordinates
      const nameX = config.namePosition?.x ? pageWidth * config.namePosition.x : pageWidth * 0.5;
      const nameY = config.namePosition?.y ? pageHeight * config.namePosition.y : pageHeight * 0.52;
      
      // Calculate left margin based on x position
      const nameLeftMargin = nameX - (contentWidth / 2);
      
      doc.fontSize(36)
         .font('Helvetica-Bold')
         .fillColor('#000000');
      doc.text(certificateData.userName, nameLeftMargin, nameY, {
        width: contentWidth,
        align: 'center'
      });
    }

    // Course name (if enabled)
    if (config.showCourseName) {
      // Calculate position based on both x and y coordinates
      const courseX = config.coursePosition?.x ? pageWidth * config.coursePosition.x : pageWidth * 0.5;
      const courseY = config.coursePosition?.y ? pageHeight * config.coursePosition.y : pageHeight * 0.72;
      
      // Calculate left margin based on x position
      const courseLeftMargin = courseX - (contentWidth / 2);
      
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#000000');
      doc.text(certificateData.courseName, courseLeftMargin, courseY, {
        width: contentWidth,
        align: 'center'
      });
    }

    // Certificate ID (if enabled)
    if (config.showCertificateId) {
      // Calculate position based on both x and y coordinates
      const idX = config.idPosition?.x ? pageWidth * config.idPosition.x : pageWidth * 0.5;
      const idY = config.idPosition?.y ? pageHeight * config.idPosition.y : pageHeight * 0.95;
      
      // Calculate left margin based on x position
      const idLeftMargin = idX - (contentWidth / 2);
      
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#666666');
      doc.text(`Certificate ID: ${certificateData.certificateId}`, idLeftMargin, idY, {
        width: contentWidth,
        align: 'center'
      });
    }
  }

  // Add this method to the CertificateService class
  async generateTestCertificate(testData: TestCertificateData): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Use the provided template URL and config or fetch them
        let templateUrl = testData.certificateTemplateUrl;
        let templateConfig = testData.certificateTemplateConfig;
        
        // If no template URL provided, try to get it from the course
        if (!templateUrl) {
          const course = await Course.findById(testData.courseId).select('certificateTemplateUrl certificateTemplateConfig');
          if (course?.certificateTemplateUrl) {
            templateUrl = course.certificateTemplateUrl;
            templateConfig = course.certificateTemplateConfig;
          } else {
            // Fallback to global template
            const settings = await CertificateSettings.findOne().sort({ updatedAt: -1 });
            templateUrl = settings?.templateUrl;
          }
        }
        
        if (!templateUrl) {
          throw new Error('Certificate template not found');
        }

        // Default config if none provided
        if (!templateConfig) {
          templateConfig = {
            showUserName: true,
            showCourseName: templateUrl.includes('global'),  // Only show course name if it's a global template
            showCertificateId: true,
            namePosition: { x: 0.5, y: 0.52 },
            coursePosition: { x: 0.5, y: 0.72 },
            idPosition: { x: 0.5, y: 0.95 }
          };
        }

        // Download template image
        const templateResponse = await axios.get(templateUrl, { responseType: 'arraybuffer' });
        const templateBuffer = Buffer.from(templateResponse.data);

        // Create a new PDF document with higher resolution
        const doc = new PDFDocument({
          layout: 'landscape',
          size: 'A4',
          margin: 0,
          info: {
            Title: `${testData.courseName} Test Certificate`,
            Author: 'AiCademy',
          }
        });

        // Create a buffer to store the PDF
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Add template background with high quality settings
        doc.image(templateBuffer, 0, 0, {
          width: doc.page.width,
          height: doc.page.height,
          align: 'center',
          valign: 'center'
        });

        // Add the certificate content using the config
        this.addCertificateContent(doc, {
          userName: testData.userName,
          courseName: testData.courseName,
          certificateId: testData.certificateId
        }, templateConfig);

        // Add TEST CERTIFICATE watermark
        doc.save();
        doc.fillColor('rgba(100, 100, 100, 0.2)');
        doc.fontSize(60);
        doc.font('Helvetica-Bold');
        doc.rotate(45, { origin: [doc.page.width / 2, doc.page.height / 2] });
        doc.text('TEST CERTIFICATE', 0, 0, {
          align: 'center',
          width: doc.page.width * 1.5,
          height: doc.page.height
        });
        doc.restore();

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const certificateService = new CertificateService(); 