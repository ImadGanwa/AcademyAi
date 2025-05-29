import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before any other imports
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import courseRoutes from './routes/courses';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';
import trainerRoutes from './routes/trainerRoutes';
import mentorRoutes from './routes/mentorRoutes';
import certificateRoutes from './routes/certificate';
import certificateSettingsRoutes from './routes/certificateSettings';
import { errorHandler } from './middleware/errorHandler';
import { newsletterRoutes } from './routes/newsletterRoutes';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import organizationRoutes from './routes/organizationRoutes';
import transcriptionRoutes from './routes/transcriptionRoutes';
import summaryRoutes from './routes/summaryRoutes';
import mindMapRoutes from './routes/mindMapRoutes';
import bookingRoutes from './routes/bookingRoutes';

const app = express();
if(!process.env.ALLOWED_ORIGINS){
  throw new Error('ALLOWED_ORIGINS environment variable is not defined');
}

  // CORS configuration
  const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Configure body parser for different content types
// TODO: Move hardcoded request size limits to environment variables or configuration
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/certificate-settings', certificateSettingsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/transcriptions', transcriptionRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/mindmaps', mindMapRoutes);
app.use('/api/bookings', bookingRoutes);

// Connect to MongoDB
// TODO: Move hardcoded MongoDB connection string to environment variables
if(!process.env.MONGODB_URI){
  throw new Error('MONGODB_URI environment variable is not defined');
}
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
