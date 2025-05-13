import mongoose from 'mongoose';
import { Course, ICourse } from '../models/Course';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the expected type for the config when reading from DB
interface CertificateConfig {
  showUserName?: boolean;
  showCourseName?: boolean;
  showCertificateId?: boolean;
  namePosition?: any;
  coursePosition?: any;
  idPosition?: any;
}

// Define the expected type for saving back to DB
interface SaveConfig {
  showUserName: boolean;
  showCourseName: boolean;
  showCertificateId: boolean;
  namePosition?: { x: number; y: number };
  coursePosition?: { x: number; y: number };
  idPosition?: { x: number; y: number };
}

async function migrateCertificatePositions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string, {});
    console.log('Connected to MongoDB');

    // Find all courses with certificate templates that might need migration
    const courses = await Course.find({
      certificateTemplateUrl: { $exists: true, $ne: null }
    });

    console.log(`Found ${courses.length} courses with certificate templates`);
    let migratedCount = 0;

    for (const course of courses) {
      let needsUpdate = false;
      const config = (course.certificateTemplateConfig || {}) as CertificateConfig;
      
      // Create a new config with proper types for saving
      const newConfig: SaveConfig = {
        showUserName: !!config.showUserName, // Convert to boolean
        showCourseName: !!config.showCourseName, // Convert to boolean
        showCertificateId: !!config.showCertificateId, // Convert to boolean
      };

      // Check if namePosition exists but lacks x-coordinate
      if (config.namePosition && typeof config.namePosition === 'object') {
        if (!('x' in config.namePosition)) {
          newConfig.namePosition = {
            x: 0.5,
            y: config.namePosition.y || 0.52
          };
          needsUpdate = true;
        } else {
          newConfig.namePosition = {
            x: config.namePosition.x,
            y: config.namePosition.y
          };
        }
      }

      // Check if coursePosition exists but lacks x-coordinate
      if (config.coursePosition && typeof config.coursePosition === 'object') {
        if (!('x' in config.coursePosition)) {
          newConfig.coursePosition = {
            x: 0.5,
            y: config.coursePosition.y || 0.72
          };
          needsUpdate = true;
        } else {
          newConfig.coursePosition = {
            x: config.coursePosition.x,
            y: config.coursePosition.y
          };
        }
      }

      // Check if idPosition exists but lacks x-coordinate
      if (config.idPosition && typeof config.idPosition === 'object') {
        if (!('x' in config.idPosition)) {
          newConfig.idPosition = {
            x: 0.5,
            y: config.idPosition.y || 0.95
          };
          needsUpdate = true;
        } else {
          newConfig.idPosition = {
            x: config.idPosition.x,
            y: config.idPosition.y
          };
        }
      }

      // Save updated course if changes were made
      if (needsUpdate) {
        course.certificateTemplateConfig = newConfig;
        await course.save();
        migratedCount++;
        console.log(`Migrated certificate config for course ${course._id} - ${course.title}`);
      }
    }

    console.log(`Migration complete. ${migratedCount} courses updated.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateCertificatePositions().catch(console.error); 