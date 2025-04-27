import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadFile = async (file: Express.Multer.File, folder: string): Promise<string> => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const folderPath = path.join(UPLOAD_DIR, folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);
    fs.writeFileSync(filePath, file.buffer);

    // Return relative path that will be served by Express
    return `${folder}/${fileName}`;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
  }
}; 