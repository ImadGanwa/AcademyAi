import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/fileUpload';
import { validateProfileUpdate } from '../validators/userValidator'; // You'll need to implement this
import { sendPasswordResetConfirmationEmail, sendWelcomeEmail } from '../utils/email';
import bcrypt from 'bcryptjs';
import { generateRandomPassword } from '../utils/passwordGenerator';
import { handleError } from '../utils/errorHandler';

export const userController = {
  // Get user profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // From auth middleware
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({ user: User.getSafeUser(user) });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Check if user has password set
  async hasPassword(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user has a password set
      const hasPassword = !!user.password;

      return res.json({ hasPassword });
    } catch (error) {
      console.error('Check password status error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Set initial password for social login users
  async setPassword(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { password } = req.body;

      // Validate input
      if (!password) {
        return res.status(400).json({ message: 'Password is required' });
      }

      // Password validation
      if (password.length < 8 || password.length > 40) {
        return res.status(400).json({ message: 'Password must be between 8 and 40 characters' });
      }

      if (!/\d/.test(password)) {
        return res.status(400).json({ message: 'Password must contain at least one number' });
      }

      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
        return res.status(400).json({ message: 'Password must contain both lowercase and uppercase letters' });
      }

      // eslint-disable-next-line no-useless-escape
      if (!/[-!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        return res.status(400).json({ message: 'Password must contain at least one special character' });
      }

      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user already has a password
      if (user.password) {
        return res.status(400).json({ message: 'User already has a password set' });
      }

      // Set password (will be hashed by pre-save middleware)
      user.password = password;
      await user.save();

      // Send confirmation email
      try {
        await sendPasswordResetConfirmationEmail(user.email, user.fullName);
      } catch (emailError) {
        console.error('Failed to send password set confirmation email:', emailError);
        // Don't block the password set if email fails
      }

      return res.json({
        message: 'Password set successfully',
        user: User.getSafeUser(user)
      });
    } catch (error) {
      console.error('Set password error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { fullName } = req.body;

      // Validate input
      const validationError = validateProfileUpdate(req.body);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update fields
      user.fullName = fullName;

      await user.save();

      return res.json({
        user: User.getSafeUser(user),
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update profile image
  async updateProfileImage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete old profile image from Cloudinary if it exists
      if (user.profileImage) {
        await deleteFromCloudinary(user.profileImage);
      }

      // Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(file, 'profile-images');

      // Update user profile image URL
      user.profileImage = imageUrl;
      await user.save();

      return res.json({
        user: User.getSafeUser(user),
        message: 'Profile image updated successfully'
      });
    } catch (error) {
      console.error('Update profile image error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update password
  async updatePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      // Password validation
      if (newPassword.length < 8 || newPassword.length > 40) {
        return res.status(400).json({ message: 'Password must be between 8 and 40 characters' });
      }

      if (!/\d/.test(newPassword)) {
        return res.status(400).json({ message: 'Password must contain at least one number' });
      }

      if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword)) {
        return res.status(400).json({ message: 'Password must contain both lowercase and uppercase letters' });
      }

      // eslint-disable-next-line no-useless-escape
      if (!/[-!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
        return res.status(400).json({ message: 'Password must contain at least one special character' });
      }

      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // First send success response to client
      const response = {
        message: 'Password updated successfully',
        user: User.getSafeUser(user)
      };
      
      res.json(response);

      // Then try to send the confirmation email asynchronously
      // This won't block the response and won't cause issues if it fails
      setTimeout(async () => {
        try {
          await sendPasswordResetConfirmationEmail(user.email, user.fullName);
          console.log(`Password reset confirmation email sent to ${user.email}`);
        } catch (emailError) {
          console.error('Failed to send password reset confirmation email:', emailError);
          // Log more detailed error information for debugging
          if (emailError instanceof Error) {
            console.error('Error name:', emailError.name);
            console.error('Error message:', emailError.message);
            console.error('Error stack:', emailError.stack);
          }
          // Email failure is logged but doesn't affect the password update
        }
      }, 0);
      
    } catch (error) {
      console.error('Update password error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Delete user account
  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Soft delete or handle related data cleanup
      user.status = 'inactive';
      await user.save();

      return res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  createBatchUsers: async (req: Request, res: Response) => {
    try {
      const { users } = req.body;

      if (!Array.isArray(users)) {
        return res.status(400).json({ message: 'Users must be an array' });
      }

      const createdUsers = [];
      const errors = [];

      for (const userData of users) {
        const { fullName, email, sendEmail } = userData;
        
        try {
          // Check if user already exists
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            errors.push({ email, error: 'User already exists' });
            continue;
          }

          // Generate random password
          const password = generateRandomPassword();

          // Create new user
          const newUser = new User({
            fullName,
            email,
            password,
            role: 'user'
          });

          await newUser.save();

          // Send welcome email with password if requested
          if (sendEmail) {
            try {
              await sendWelcomeEmail(email, fullName, password);
            } catch (emailError) {
              console.error('Failed to send welcome email:', emailError);
              errors.push({ email, error: 'User created but failed to send welcome email' });
              continue;
            }
          }

          createdUsers.push(User.getSafeUser(newUser));
        } catch (error) {
          console.error('Error creating user:', error);
          errors.push({ email, error: 'Failed to create user' });
        }
      }

      return res.json({
        message: 'Batch user creation completed',
        createdUsers,
        errors
      });
    } catch (error) {
      handleError(res, error);
    }
  }
};
