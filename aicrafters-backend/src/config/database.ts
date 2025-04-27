import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aicrafters';

const connectDB = async () => {
  try {
    let uri = MONGODB_URI;
    if (!uri.includes('dbname=')) {
      uri = `${uri}?retryWrites=true&w=majority&dbname=aicrafters`;
    }

    const conn = await mongoose.connect(uri);
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  }
};

export default connectDB;
