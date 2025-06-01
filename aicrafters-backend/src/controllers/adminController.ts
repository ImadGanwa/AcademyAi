import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { User, MentorProfile, MentorProfessionalInfo, IMentorApplication } from '../models/User';
import { Course, ICourse } from '../models/Course';
import { Category } from '../models/Category';
import { MentorApplication } from '../models/MentorApplication';
import { sendWelcomeEmail, sendCourseApprovalEmail, sendCourseRejectionEmail, sendMentorApprovalEmail, sendMentorRejectionEmail, sendMentorWelcomeEmail } from '../utils/email';
import { parseExcelUsers } from '../utils/excelParser';
import { createNotification } from './notificationController';
import { Document } from 'mongoose';
import bcryptjs from 'bcryptjs';
import { Organization } from '../models/Organization';
import { generateRandomPassword } from '../utils/passwordGenerator';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/fileUpload';
import { notificationService } from '../services/notificationService';

interface EmailError extends Error {
  message: string;
  stack?: string;
}

interface PopulatedCourse extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  instructor: {
    _id: mongoose.Types.ObjectId;
    fullName: string;
    email: string;
  };
}

export const adminController = {
  getDashboardStats: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Get user statistics
      const [
        totalUsers,
        adminUsers,
        trainerUsers,
        userUsers,
        totalCourses,
        activeCourses,
        categories,
        averageRating
      ] = await Promise.all([
        User.countDocuments({ status: 'active' }),
        User.countDocuments({ role: 'admin', status: 'active' }),
        User.countDocuments({ role: 'trainer', status: 'active' }),
        User.countDocuments({ role: 'user', status: 'active' }),
        Course.countDocuments(),
        Course.countDocuments({ status: 'published' }),
        Category.countDocuments(),
        Course.aggregate([
          { $match: { status: 'published' } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]).then(result => result[0]?.avgRating || 0)
      ]);

      res.json({
        users: {
          total: totalUsers,
          admins: adminUsers,
          trainers: trainerUsers,
          users: userUsers
        },
        courses: {
          total: totalCourses,
          active: activeCourses,
          categories: categories,
          averageRating: Number(averageRating.toFixed(1))
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
  },

  getUsers: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { search, role, status } = req.query;
      const query: any = {};

      // Apply filters
      if (role && ['admin', 'trainer', 'user'].includes(role as string)) {
        query.role = role;
      }
      if (status && ['active', 'inactive', 'suspended', 'pending'].includes(status as string)) {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(query)
        .select('fullName email role status lastActive profileImage')
        .sort({ lastActive: -1 });

      const transformedUsers = users.map(user => ({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        lastActive: user.lastActive || null,
        initials: user.fullName
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase(),
        profileImage: user.profileImage
      }));

      res.json(transformedUsers);
    } catch (error) {
      console.error('Get users error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { id } = req.params;
      const { role, status, fullName, email, password } = req.body;

      // Validate input
      if (!['admin', 'trainer', 'user'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      // Prevent self-demotion
      if (req.user._id === id && role !== 'admin') {
        return res.status(400).json({ message: 'Cannot change your own admin role' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // If status is being changed to active, ensure email is verified
      if (status === 'active' && !user.isEmailVerified) {
        user.isEmailVerified = true;
      }

      // Update basic fields
      user.role = role;
      user.status = status;

      // Update optional fields if provided
      if (fullName) user.fullName = fullName;
      if (email) {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already taken' });
        }
        user.email = email;
      }
      if (password) {
        // Don't hash the password here, let the pre-save middleware handle it
        user.password = password;
      }
      
      // Handle profile image upload
      if (req.file) {
        // If user already has a profile image, delete it from Cloudinary
        if (user.profileImage) {
          await deleteFromCloudinary(user.profileImage);
        }
        // Upload new image to Cloudinary
        const imageUrl = await uploadToCloudinary(req.file, 'profile-images');
        user.profileImage = imageUrl;
      }

      await user.save();

      const updatedUser = {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        lastActive: user.lastActive || null,
        initials: user.fullName
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase(),
        profileImage: user.profileImage
      };

      res.json(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error updating user' });
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { id } = req.params;

      // Prevent self-deletion
      if (req.user.id === id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await User.findByIdAndDelete(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error deleting user' });
    }
  },

  getCourses: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { search, status } = req.query;
      const query: any = {
        status: { $in: ['published', 'review'] }
      };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } }
        ];
      }
      if (status && ['published', 'review'].includes(status as string)) {
        query.status = status;
      }

      const courses = await Course.find(query)
        .populate({
          path: 'instructor',
          select: 'fullName email'
        })
        .sort({ updatedAt: -1 });

      const transformedCourses = courses.map(course => {
        const instructor = course.instructor as unknown as { fullName: string; email: string; };
        const usersCount = course.users?.length || 0;
        const thumbnailPath = course.thumbnail 
          ? `${course.thumbnail}` 
          : '/images/placeholder-course.jpg';

        return {
          id: course._id,
          title: course.title,
          instructor: instructor?.fullName || 'Unknown',
          instructorEmail: instructor?.email,
          thumbnail: thumbnailPath,
          status: course.status,
          usersCount,
          rating: course.rating || 0,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        };
      });

      res.json(transformedCourses);
    } catch (error) {
      console.error('Get courses error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching courses' });
    }
  },

  updateCourseStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!['published', 'review', 'draft'].includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }

      const course = await Course.findById(id).populate('instructor', 'fullName email') as PopulatedCourse | null;
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }

      const previousStatus = course.status;
      course.status = status;
      await course.save();

      // Send notification and email to trainer if course is published
      if (status === 'published' && previousStatus !== 'published') {
        try {
          // Create notification
          await createNotification({
            recipient: course.instructor._id.toString(),
            type: 'course',
            title: 'Course Approved',
            message: `Your course "${course.title}" has been approved and is now published.`,
            action: 'View Course',
            relatedId: course._id.toString()
          });

          // Send email notification
          await sendCourseApprovalEmail(
            course.instructor.email,
            course.instructor.fullName,
            course.title,
            course._id.toString()
          );
        } catch (error) {
          console.error('Error sending course approval notification:', error);
          // Don't fail the request if notification fails
        }
      }

      // Send notification and email to trainer if course is rejected (moved to draft)
      if (status === 'draft' && previousStatus === 'review') {
        try {
          // Create notification
          await createNotification({
            recipient: course.instructor._id.toString(),
            type: 'course',
            title: 'Course Rejected',
            message: `Your course "${course.title}" requires revisions before it can be published.`,
            relatedId: course._id.toString()
          });

          // Send email notification
          await sendCourseRejectionEmail(
            course.instructor.email,
            course.instructor.fullName,
            course.title,
            course._id.toString()
          );
        } catch (error) {
          console.error('Error sending course rejection notification:', error);
          // Don't fail the request if notification fails
        }
      }

      res.json({ message: 'Course status updated successfully', status });
    } catch (error) {
      console.error('Update course status error:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Error updating course status' });
    }
  },

  createUser: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { email, fullName, role, sendEmail = true } = req.body;

      // Validate input
      if (!email || !fullName || !role) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Generate a random password
      const password = generateRandomPassword();
      const hashedPassword = await bcryptjs.hash(password, 10);

      // Create new user
      const user = new User({
        email,
        password: hashedPassword,
        fullName,
        role,
        isEmailVerified: true, // Since admin is creating the account
        status: 'active',
        lastActive: new Date()
      });

      await user.save();

      // Send welcome email with credentials if sendEmail is true
      let emailSent = false;
      let emailError: EmailError | null = null;

      if (sendEmail) {
        try {
          await sendWelcomeEmail(email, fullName, password);
          emailSent = true;
        } catch (error) {
          console.error('Error sending welcome email:', error);
          emailError = error as EmailError;
        }
      }

      const response = {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          lastActive: user.lastActive || null,
          initials: user.fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
        },
        emailSent,
        emailError: emailError ? emailError.message : null
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Error creating user' });
    }
  },

  checkEmails: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { emails } = req.body;
      if (!emails || !Array.isArray(emails)) {
        return res.status(400).json({ message: 'Invalid email list' });
      }

      // Find existing emails
      const existingUsers = await User.find({
        email: { $in: emails }
      }).select('email');

      const duplicates = existingUsers.map(user => user.email);

      res.json({ duplicates });
    } catch (error) {
      console.error('Check emails error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error checking emails' });
    }
  },

  parseExcelUsers: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }


      // Parse Excel file
      const users = parseExcelUsers(req.file.buffer);

      res.json(users);
    } catch (error) {
      console.error('Excel parsing error:', error);
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error parsing Excel file' });
    }
  },

  createBulkUsers: async (req: Request, res: Response) => {
    try {
      const { users, organizationId } = req.body;

      if (!users || !Array.isArray(users)) {
        return res.status(400).json({ message: 'Invalid users data' });
      }

      // Get organization and its courses if organizationId is provided
      let organizationCourses: mongoose.Types.ObjectId[] = [];
      if (organizationId) {
        const organization = await Organization.findById(organizationId);
        if (organization && organization.courses) {
          organizationCourses = organization.courses;
        }
      }

      const results = [];
      const errors = [];

      for (const userData of users) {
        try {
          const { firstName, lastName, email, sendEmail } = userData;
          
          // Check if user already exists
          const existingUser = await User.findOne({ email: email.toLowerCase() });
          if (existingUser) {
            errors.push({ email, error: 'User already exists' });
            continue;
          }

          // Generate random password
          const password = generateRandomPassword();

          // Send welcome email before creating user
          if (sendEmail) {
            await sendWelcomeEmail(email, `${firstName} ${lastName}`.trim(), password);
          }

          // Prepare user courses if organization has courses
          const userCourses = organizationCourses.map(courseId => ({
            courseId,
            status: 'in progress',
            organizationId,
            progress: {
              timeSpent: 0,
              percentage: 0,
              completedLessons: []
            }
          }));

          // Create new user with combined fullName and courses
          // Password will be hashed by the pre-save middleware
          const newUser = await User.create({
            fullName: `${firstName} ${lastName}`.trim(),
            email: email.toLowerCase(),
            password: password,
            role: 'user',
            isEmailVerified: true,
            organizations: organizationId ? [organizationId] : [],
            courses: userCourses
          });

          results.push({ email, success: true });
        } catch (error) {
          console.error('Error creating user:', error);
          errors.push({ email: userData.email, error: 'Failed to create user' });
        }
      }

      res.json({
        message: 'Bulk user creation completed',
        results,
        errors
      });
    } catch (error) {
      console.error('Bulk create users error:', error);
      res.status(500).json({ message: 'Error creating users' });
    }
  },

  // Get all categories with course counts
  getCategories: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const categories = await Category.find().sort({ name: 1 });
      
      // Get course counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const courseCount = await Course.countDocuments({
            categories: category.name
          });

          const courses = await Course.find({
            categories: category.name
          }).select('title').limit(5);

          return {
            id: category._id,
            name: category.name,
            courseCount,
            courses: courses.map(course => ({
              id: course._id,
              title: course.title
            }))
          };
        })
      );

      res.json(categoriesWithCounts);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ message: 'Error fetching categories' });
    }
  },

  // Create a new category
  createCategory: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      const existingCategory = await Category.findOne({ name: name.trim() });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
      }

      const category = new Category({
        name: name.trim(),
        createdBy: req.user._id
      });

      await category.save();

      res.status(201).json({
        id: category._id,
        name: category.name,
        courseCount: 0,
        courses: []
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ message: 'Error creating category' });
    }
  },

  // Update a category
  updateCategory: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      const existingCategory = await Category.findOne({
        name: name.trim(),
        _id: { $ne: id }
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }

      // Find the category first to get the old name
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      const oldName = category.name;
      category.name = name.trim();
      await category.save();

      // Update the category name in all courses that use it
      await Course.updateMany(
        { categories: oldName },
        { $set: { 'categories.$': name.trim() } }
      );

      // Get updated course count and courses
      const courseCount = await Course.countDocuments({
        categories: category.name
      });

      const courses = await Course.find({
        categories: category.name
      }).select('title').limit(5);

      res.json({
        id: category._id,
        name: category.name,
        courseCount,
        courses: courses.map(course => ({
          id: course._id,
          title: course.title
        }))
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ message: 'Error updating category' });
    }
  },

  // Delete a category
  deleteCategory: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check if category is being used by any courses
      const courseCount = await Course.countDocuments({
        categories: category.name
      });

      if (courseCount > 0) {
        return res.status(400).json({
          message: 'Cannot delete category that is being used by courses'
        });
      }

      await Category.findByIdAndDelete(id);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ message: 'Error deleting category' });
    }
  },

  // Get courses with less than 3 categories
  getAvailableCourses: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const courses = await Course.find({
        status: 'published',
        $expr: {
          $lt: [{ $size: { $ifNull: ['$categories', []] } }, 3]
        }
      })
      .select('title thumbnail categories')
      .sort({ title: 1 });

      const transformedCourses = courses.map(course => ({
        id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        categoryCount: course.categories?.length || 0
      }));

      res.json(transformedCourses);
    } catch (error) {
      console.error('Get available courses error:', error);
      res.status(500).json({ message: 'Error fetching available courses' });
    }
  },

  // Add course to category
  addCourseToCategory: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { categoryId } = req.params;
      const { courseId } = req.body;

      // Find the category
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if course already has this category
      if (course.categories.includes(category.name)) {
        return res.status(400).json({ message: 'Course already in this category' });
      }

      // Check if course has less than 3 categories
      if (course.categories.length >= 3) {
        return res.status(400).json({ message: 'Course already has maximum number of categories' });
      }

      // Add category to course
      course.categories.push(category.name);
      await course.save();

      res.json({ message: 'Course added to category successfully' });
    } catch (error) {
      console.error('Add course to category error:', error);
      res.status(500).json({ message: 'Error adding course to category' });
    }
  },

  // Remove course from category
  removeCourseFromCategory: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { categoryId, courseId } = req.params;

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Find the category
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check if course has this category
      if (!course.categories.includes(category.name)) {
        return res.status(400).json({ message: 'Course is not in this category' });
      }

      // Remove category from course
      course.categories = course.categories.filter(cat => cat !== category.name);
      await course.save();

      res.json({ message: 'Course removed from category successfully' });
    } catch (error) {
      console.error('Remove course from category error:', error);
      res.status(500).json({ message: 'Error removing course from category' });
    }
  },

  /**
   * Get all mentor applications
   * @route GET /api/admin/mentor-applications
   */
  getMentorApplications: async (req: Request, res: Response): Promise<void> => {
    try {
      const applications = await MentorApplication.find().sort({ appliedAt: -1 });
      
      res.status(200).json({
        success: true,
        data: {
          applications,
          count: applications.length
        }
      });
    } catch (error: any) {
      console.error('Error fetching mentor applications:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while fetching mentor applications'
      });
    }
  },

  /**
   * Update mentor application status
   * @route PUT /api/admin/mentor-applications/:id
   */
  updateMentorApplicationStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      
      // Validate status
      if (!status || !['approved', 'rejected'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status. Status must be either "approved" or "rejected"'
        });
        return;
      }
      
      // Find and update the application
      const application = await MentorApplication.findByIdAndUpdate(
        id,
        { 
          status,
          ...(adminNotes && { adminNotes }),
          reviewedAt: new Date()
        },
        { new: true }
      );
      
      if (!application) {
        res.status(404).json({
          success: false,
          error: 'Mentor application not found'
        });
        return;
      }
      
      // If application is approved, create or update the user account
      if (status === 'approved') {
        try {
          // Check if a user already exists with this email
          let user = await User.findOne({ email: application.email });
          let generatedPassword = null;
          
          if (user) {
            // Update existing user to add mentor role and profile
            user.role = 'mentor';
            
            // Initialize mentor profile with application data
            user.mentorProfile = {
              title: application.professionalInfo?.role || '',
              bio: application.bio,
              hourlyRate: application.hourlyRate,
              country: application.countries?.[0] ,
              skills: application.skills.map(name => ({ id: String(Math.random()), name })),
              languages: application.languages.map(name => ({ id: String(Math.random()), name })),
              professionalInfo: {
                role: application.professionalInfo?.role || 'Professional Mentor',
                linkedIn: application.professionalInfo?.linkedIn || '',
                academicBackground: application.professionalInfo?.academicBackground || '',
                experience: application.professionalInfo?.experience || ''
              },
              availability: Array.isArray(application.availability) ? application.availability : [],
              isVerified: true,
              menteesCount: 0,
              sessionsCount: 0,
              mentorRating: 0,
              mentorReviewsCount: 0,
              appliedAt: application.appliedAt,
              approvedAt: new Date()
            };
            
            await user.save();
            console.log('Updated existing user to mentor role:', user.email);
            
            // Send approval email to existing user
            await sendMentorApprovalEmail(application.email, application.fullName);
          } else {
            // Create a new user with the mentor role
            generatedPassword = generateRandomPassword();
            console.log('Generated password for new mentor:', generatedPassword); // For debugging only, remove in production
            
            // We'll create the user directly without using bcrypt here
            // The pre-save middleware will handle the hashing
            user = new User({
              email: application.email,
              fullName: application.fullName,
              password: generatedPassword, // Plain text password, will be hashed by pre-save middleware
              role: 'mentor',
              isEmailVerified: true, // Auto-verify the email since it came through the application
              status: 'active',
              lastActive: new Date(),
              mentorProfile: {
                title: application.professionalInfo?.role || 'Professional Mentor',
                bio: application.bio,
                hourlyRate: application.hourlyRate,
                country: application.countries?.[0] || 'United States',
                skills: application.skills.map(name => ({ id: String(Math.random()), name })),
                languages: application.languages.map(name => ({ id: String(Math.random()), name })),
                professionalInfo: {
                  role: application.professionalInfo?.role || 'Professional Mentor',
                  linkedIn: application.professionalInfo?.linkedIn || '',
                  academicBackground: application.professionalInfo?.academicBackground || '',
                  experience: application.professionalInfo?.experience || ''
                },
                availability: Array.isArray(application.availability) ? application.availability : [],
                isVerified: true,
                menteesCount: 0,
                sessionsCount: 0,
                mentorRating: 0,
                mentorReviewsCount: 0,
                appliedAt: application.appliedAt,
                approvedAt: new Date()
              }
            });
            
            // Check if the password is correctly set in the user object
            console.log('Password field set in user object:', !!user.password); // For debugging only, remove in production
            
            try {
              await user.save();
              console.log('Created new user with mentor role:', user.email);
              
              // Verify the user was saved with a password
              const savedUser = await User.findOne({ email: application.email }).select('+password');
              console.log('Saved user has password:', !!savedUser?.password); // For debugging only, remove in production

              // Test the login flow with the new password
              if (savedUser) {
                const passwordValid = await savedUser.comparePassword(generatedPassword);
                console.log('Password validation test:', passwordValid ? 'SUCCESS' : 'FAILED');
              }

              // Send welcome email with account credentials
              await sendMentorWelcomeEmail(application.email, application.fullName, generatedPassword);
            } catch (saveError) {
              console.error('Error saving new mentor user:', saveError);
              throw saveError;
            }
          }
          
          // Log approval info
          console.log('Sent mentor approval email to:', application.email);
        } catch (emailError) {
          console.error('Error in mentor approval process:', emailError);
          // Continue with the response even if there's an email error
        }
      } else if (status === 'rejected') {
        // If application is rejected, remove mentor role and set isVerified to false
        try {
          const user = await User.findOne({ email: application.email });
          if (user && user.role === 'mentor') {
            // Remove mentor role and set isVerified to false
            user.role = 'user'; // Revert to default role
            if (user.mentorProfile) {
              user.mentorProfile.isVerified = false;
            }
            await user.save();
            console.log('Removed mentor role from user:', user.email);
          }
        } catch (userUpdateError) {
          console.error('Error updating user role on rejection:', userUpdateError);
          // Continue with the response even if there's an error
        }
        
        // Send rejection email
        try {
          await sendMentorRejectionEmail(application.email, application.fullName, adminNotes);
          console.log('Sent mentor rejection email to:', application.email);
        } catch (emailError) {
          console.error('Error sending rejection email:', emailError);
          // Continue with the response even if there's an email error
        }
      }
      
      res.status(200).json({
        success: true,
        message: `Mentor application ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
        data: {
          application
        }
      });
    } catch (error: any) {
      console.error('Error updating mentor application status:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while updating mentor application status'
      });
    }
  },

  /**
   * Fix existing mentors' country field - temporary migration endpoint
   * @route POST /api/admin/fix-mentor-countries
   */
  fixMentorCountries: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      console.log('🔧 Starting mentor country field fix...');

      // Find all mentors who don't have a country field or have empty country
      const mentorsToUpdate = await User.find({
        role: 'mentor',
        'mentorProfile.isVerified': true,
        $or: [
          { 'mentorProfile.country': { $exists: false } },
          { 'mentorProfile.country': '' },
          { 'mentorProfile.country': null },
          { 'mentorProfile.country': undefined }
        ]
      });

      console.log(`📊 Found ${mentorsToUpdate.length} mentors to update`);

      let updatedCount = 0;
      const results = [];

      for (const mentor of mentorsToUpdate) {
        try {
          // Try to find their original application to get the country
          const application = await MentorApplication.findOne({ email: mentor.email });
          
          let countryToAssign = 'US'; // Default country code if no application found
          
          if (application && application.countries && application.countries.length > 0) {
            countryToAssign = application.countries[0];
            console.log(`🌍 Found country for ${mentor.email}: ${countryToAssign}`);
          } else {
            console.log(`⚠️ No application/country found for ${mentor.email}, using default: ${countryToAssign}`);
          }

          // Update the mentor's country field
          await User.findByIdAndUpdate(
            mentor._id,
            { $set: { 'mentorProfile.country': countryToAssign } },
            { new: true }
          );

          updatedCount++;
          results.push({
            email: mentor.email,
            fullName: mentor.fullName,
            assignedCountry: countryToAssign,
            hadApplication: !!application
          });

          console.log(`✅ Updated ${mentor.email} with country: ${countryToAssign}`);
        } catch (updateError) {
          console.error(`❌ Error updating mentor ${mentor.email}:`, updateError);
          results.push({
            email: mentor.email,
            fullName: mentor.fullName,
            error: (updateError as Error).message
          });
        }
      }

      console.log(`🎉 Mentor country fix completed. Updated ${updatedCount} out of ${mentorsToUpdate.length} mentors.`);

      res.status(200).json({
        success: true,
        message: `Successfully updated ${updatedCount} mentors`,
        data: {
          totalFound: mentorsToUpdate.length,
          updated: updatedCount,
          results
        }
      });
    } catch (error: any) {
      console.error('Error fixing mentor countries:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred while fixing mentor countries'
      });
    }
  }
}; 