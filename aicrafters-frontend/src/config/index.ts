const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  API_URL: process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:5000' : 'https://aicrafters.aicademy.com'),
  MAX_FILE_SIZE: 1.5 * 1024 * 1024, // 1.5MB in bytes
  CLOUDINARY: {
    CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dhx01wyfd',
    UPLOAD_PRESET: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'aicrafters',
  }
};

export default config; 