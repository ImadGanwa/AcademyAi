const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  API_URL: process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:5000' : 'https://aicrafters.aicademy.com'), // TODO: Move hardcoded API URLs to environment variables
  MAX_FILE_SIZE: 1.5 * 1024 * 1024, // TODO: Move hardcoded file size limit to environment variable
  CLOUDINARY: {
    CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dhx01wyfd', // TODO: Move hardcoded Cloudinary fallback values to environment variables
    UPLOAD_PRESET: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'aicrafters', // TODO: Move hardcoded Cloudinary fallback values to environment variables
  }
};

export default config; 