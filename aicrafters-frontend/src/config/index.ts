
const config = {
  API_URL: process.env.REACT_APP_API_URL,
  MAX_FILE_SIZE: 1.5 * 1024 * 1024,
  CLOUDINARY: {
    CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dhx01wyfd',
    UPLOAD_PRESET: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'ADWIN',
  },
  FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || 'https://app.adwin.global'
};

export default config; 