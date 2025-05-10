require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aicrafters';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Define schemas based on the existing models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'trainer', 'admin'], default: 'user' },
  courses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    status: { type: String, enum: ['in progress', 'saved', 'completed'] },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    completedAt: { type: Date },
    certificateId: { type: String },
    certificateImageUrl: { type: String },
    rating: { type: Number },
    comment: { type: String },
    progress: {
      timeSpent: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      completedLessons: [{ type: String }]
    }
  }],
  marketingConsent: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: true }, // Set to true for seed data
  status: { type: String, enum: ['pending', 'active', 'inactive', 'suspended'], default: 'active' },
  profileImage: { type: String },
  title: { type: String },
  bio: { type: String },
  rating: { type: Number },
  reviewsCount: { type: Number, default: 0 },
  usersCount: { type: Number, default: 0 },
  coursesCount: { type: Number, default: 0 },
  lastActive: { type: Date },
  isGoogleUser: { type: Boolean, default: false },
  isLinkedinUser: { type: Boolean, default: false },
  organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalPrice: { type: Number, required: true, min: 0 },
  currentPrice: { type: Number, required: true, min: 0 },
  thumbnail: { type: String, required: true },
  previewVideo: { type: String },
  categories: [{ type: String }],
  learningPoints: [{ type: String }],
  requirements: [{ type: String }],
  courseContent: {
    sections: [{
      title: { type: String, required: true },
      contents: [{
        type: { type: String, enum: ['lesson', 'quiz'], required: true },
        title: { type: String, required: true },
        content: { type: mongoose.Schema.Types.Mixed, required: true }
      }]
    }]
  },
  duration: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'review', 'published', 'archived'], default: 'draft' },
  badge: {
    name: { type: String },
    colorKey: { type: String, enum: ['primary', 'secondary'] }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  logo: { type: String },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create models
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Course = mongoose.model('Course', courseSchema);
const Organization = mongoose.model('Organization', organizationSchema);

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Course.deleteMany({});
    await Organization.deleteMany({});
    
    console.log('Previous data cleared');
    
    // Create admin user
    const passwordHash = await bcrypt.hash('adminpassword123', 10);
    const admin = new User({
      email: 'admin@aicrafters.com',
      password: passwordHash,
      fullName: 'Admin User',
      role: 'admin',
      isEmailVerified: true,
      status: 'active'
    });
    
    const savedAdmin = await admin.save();
    console.log('Admin user created');
    
    // Create trainer user
    const trainerPasswordHash = await bcrypt.hash('trainer123', 10);
    const trainer = new User({
      email: 'trainer@aicrafters.com',
      password: trainerPasswordHash,
      fullName: 'AI Trainer',
      role: 'trainer',
      isEmailVerified: true,
      status: 'active',
      title: 'AI Specialist',
      bio: 'Experienced AI instructor with 5+ years of industry experience',
      profileImage: 'https://randomuser.me/api/portraits/women/44.jpg'
    });
    
    const savedTrainer = await trainer.save();
    console.log('Trainer user created');
    
    // Create regular user
    const userPasswordHash = await bcrypt.hash('user123', 10);
    const regularUser = new User({
      email: 'user@example.com',
      password: userPasswordHash,
      fullName: 'Regular User',
      role: 'user',
      isEmailVerified: true,
      status: 'active',
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
    });
    
    const savedUser = await regularUser.save();
    console.log('Regular user created');
    
    // Create categories
    const categories = [
      { name: 'Artificial Intelligence', createdBy: savedAdmin._id },
      { name: 'Machine Learning', createdBy: savedAdmin._id },
      { name: 'Deep Learning', createdBy: savedAdmin._id },
      { name: 'Natural Language Processing', createdBy: savedAdmin._id },
      { name: 'Computer Vision', createdBy: savedAdmin._id }
    ];
    
    const savedCategories = await Category.insertMany(categories);
    console.log('Categories created');
    
    // Create course
    const course = new Course({
      title: 'Introduction to Artificial Intelligence',
      subtitle: 'Learn the fundamentals of AI and its applications',
      description: 'This comprehensive course covers the basics of artificial intelligence, including machine learning, neural networks, and practical applications in today\'s world.',
      instructor: savedTrainer._id,
      originalPrice: 99.99,
      currentPrice: 49.99,
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad495',
      categories: ['Artificial Intelligence', 'Machine Learning'],
      learningPoints: [
        'Understand AI fundamentals',
        'Learn about machine learning algorithms',
        'Apply AI concepts to real-world problems',
        'Build simple AI models'
      ],
      requirements: [
        'Basic programming knowledge',
        'Understanding of mathematics and statistics'
      ],
      courseContent: {
        sections: [{
          title: 'Getting Started with AI',
          contents: [{
            type: 'lesson',
            title: 'What is Artificial Intelligence?',
            content: {
              type: 'lesson',
              contentItems: [
                {
                  type: 'text',
                  content: 'Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans.',
                  duration: 0
                },
                {
                  type: 'media',
                  content: 'https://example.com/intro-video.mp4',
                  duration: 300
                }
              ]
            }
          }]
        }]
      },
      duration: 1200, // 20 hours in minutes
      status: 'published',
      badge: {
        name: 'Bestseller',
        colorKey: 'primary'
      }
    });
    
    const savedCourse = await course.save();
    console.log('Course created');
    
    // Create organization
    const organization = new Organization({
      name: 'AI Learning Hub',
      description: 'An organization dedicated to AI education',
      admin: savedAdmin._id,
      members: [savedTrainer._id, savedUser._id],
      courses: [savedCourse._id]
    });
    
    const savedOrganization = await organization.save();
    console.log('Organization created');
    
    // Update users with course enrollment
    await User.findByIdAndUpdate(savedUser._id, {
      $push: {
        courses: {
          courseId: savedCourse._id,
          status: 'in progress',
          organizationId: savedOrganization._id,
          progress: {
            timeSpent: 45,
            percentage: 15,
            completedLessons: []
          }
        },
        organizations: savedOrganization._id
      }
    });
    
    console.log('User updated with course enrollment');
    
    console.log('Seed data completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Run the seeding process
const runSeed = async () => {
  await connectDB();
  await seedData();
  console.log('Disconnecting from MongoDB');
  await mongoose.disconnect();
  console.log('Done!');
};

runSeed(); 