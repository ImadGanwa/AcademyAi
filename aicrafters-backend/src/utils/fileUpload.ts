import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Folder mapping for different types of uploads
const folderMapping: { [key: string]: string } = {
  'profile-images': 'aicrafters/profile-images',
  'course-images': 'aicrafters/course-images',
  'lesson-materials': 'aicrafters/lesson-materials'
};

// Function to upload file to Cloudinary
export const uploadToCloudinary = async (input: Express.Multer.File | Buffer, folder: string): Promise<string> => {
  try {
    const uploadFolder = folderMapping[folder] || folder;
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: uploadFolder,
          resource_type: 'auto',
          transformation: [
            { width: 500, height: 500, crop: 'limit' }
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No result from Cloudinary'));
          resolve(result.secure_url);
        }
      );

      if (Buffer.isBuffer(input)) {
        // If input is a buffer, pipe it directly
        Readable.from(input).pipe(uploadStream);
      } else {
        // If input is a file, pipe its buffer
        Readable.from(input.buffer).pipe(uploadStream);
      }
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Function to delete file from Cloudinary
export const deleteFromCloudinary = async (url: string): Promise<void> => {
  try {
    // Extract public_id from URL
    const publicId = url.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}; 