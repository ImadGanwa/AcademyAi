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

  async generateAndUploadCertificate(certificateData: CertificateData): Promise<{ pdfBuffer: Buffer; imageUrl: string }> {
    // Generate PDF
    const pdfBuffer = await this.generateCertificatePDF(certificateData);
    
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

  async generateCertificatePDF(certificateData: CertificateData): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get the latest certificate template URL
        const settings = await CertificateSettings.findOne().sort({ updatedAt: -1 });
        if (!settings?.templateUrl) {
          throw new Error('Certificate template not found');
        }

        // Download template image
        const templateResponse = await axios.get(settings.templateUrl, { responseType: 'arraybuffer' });
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

        // Add the certificate content
        this.addCertificateContent(doc, certificateData);

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addCertificateContent(doc: PDFKit.PDFDocument, certificateData: CertificateData): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = 600; // Width for text content
    const leftMargin = (pageWidth - contentWidth) / 2;

    // User name
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor('#000000');
    doc.text(certificateData.userName, leftMargin, pageHeight * 0.52, {
      width: contentWidth,
      align: 'center'
    });

    // Course name
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#000000');
    doc.text(certificateData.courseName, leftMargin, pageHeight * 0.72, {
      width: contentWidth,
      align: 'center'
    });

    // Certificate ID (small at the bottom)
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#666666');
    doc.text(`Certificate ID: ${certificateData.certificateId}`, leftMargin, doc.page.height - 25, {
      width: contentWidth,
      align: 'center'
    });
  }
}

export const certificateService = new CertificateService(); 