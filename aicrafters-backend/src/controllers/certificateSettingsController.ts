import { Request, Response } from 'express';
import { CertificateSettings, ICertificateSettings } from '../models/CertificateSettings';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

interface AuthRequest extends Request {
  user?: {
    id: string;
    _id: string;
    role: string;
  };
}

export const certificateSettingsController = {
  async getSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await CertificateSettings.findOne().sort({ updatedAt: -1 });
      res.json(settings || { templateUrl: null });
    } catch (error) {
      console.error('Error getting certificate settings:', error);
      res.status(500).json({ message: 'Error getting certificate settings' });
    }
  },

  async updateTemplate(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Upload to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'certificates',
          resource_type: 'image',
          transformation: [
            { width: 2000, crop: "scale" },
            { quality: 100 },
            { fetch_format: "png" },
            { density: 300 }
          ]
        },
        async (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ message: 'Error uploading template' });
          }

          if (!result?.secure_url) {
            return res.status(500).json({ message: 'No URL returned from Cloudinary' });
          }

          // Create new settings
          const settings = new CertificateSettings({
            templateUrl: result.secure_url,
            updatedBy: (req.user as { _id: string })._id
          });

          await settings.save();
          res.json(settings);
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const stream = new Readable();
      stream.push(req.file.buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    } catch (error) {
      console.error('Error updating certificate template:', error);
      res.status(500).json({ message: 'Error updating certificate template' });
    }
  }
}; 