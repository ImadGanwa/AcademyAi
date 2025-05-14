import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  role: 'user' | 'trainer' | 'admin';
  courses: Array<{
    courseId: mongoose.Types.ObjectId;
    status: 'in progress' | 'saved' | 'completed';
    organizationId?: mongoose.Types.ObjectId;
    completedAt?: Date;
    certificateId?: string;
    certificateImageUrl?: string;
    rating?: number;
    comment?: string;
    progress?: {
      timeSpent: number;
      percentage: number;
      completedLessons: Array<string>;
    };
  }>;
  marketingConsent: boolean;
  isEmailVerified: boolean;
  verificationToken?: string;
  lastLogin: Date;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  profileImage?: string;
  // Instructor specific fields
  title?: string;
  bio?: string;
  rating?: number;
  reviewsCount?: number;
  usersCount?: number;
  coursesCount?: number;
  lastActive?: Date;
  isGoogleUser: boolean;
  isLinkedinUser: boolean;
  linkedinId?: string;
  organizations: Array<mongoose.Types.ObjectId>;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  preferredLanguage: string;
}

interface IUserModel extends Model<IUser> {
  getSafeUser(user: IUser): SafeUser;
}

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isEmailVerified: boolean;
  status: string;
  createdAt: Date;
  profileImage?: string;
  title?: string;
  bio?: string;
  rating?: number;
  reviewsCount?: number;
  usersCount?: number;
  coursesCount?: number;
  lastActive?: Date;
  courses: Array<{
    courseId: mongoose.Types.ObjectId;
    status: 'in progress' | 'saved' | 'completed';
    completedAt?: Date;
    certificateId?: string;
    certificateImageUrl?: string;
    rating?: number;
    comment?: string;
  }>;
  preferredLanguage: string;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true, // Add index for better query performance
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.isGoogleUser && !this.isLinkedinUser; // Password not required for social auth users
    },
    minlength: 6,
    select: false,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true, // Add index for search functionality
  },
  phone: {
    type: String,
    required: false,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'trainer', 'admin'],
    default: 'user',
    index: true,
  },
  marketingConsent: {
    type: Boolean,
    default: false,
    description: 'User consent for receiving marketing emails and updates',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended'],
    default: 'active',
    index: true,
  },
  courses: [{
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    status: {
      type: String,
      enum: ['in progress', 'saved', 'completed'],
      required: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    certificateId: {
      type: String,
      default: null
    },
    certificateImageUrl: {
      type: String,
      default: null
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      default: null
    },
    progress: {
      timeSpent: {
        type: Number,
        default: 0
      },
      percentage: {
        type: Number,
        default: 0
      },
      completedLessons: [{
        type: String,
        default: []
      }]
    }
  }],
  verificationToken: String,
  profileImage: {
    type: String,
    default: null
  },
  // Add instructor specific fields
  title: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  usersCount: {
    type: Number,
    default: 0
  },
  coursesCount: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  isLinkedinUser: {
    type: Boolean,
    default: false
  },
  linkedinId: {
    type: String,
    sparse: true,
    unique: true
  },
  organizations: [{
    type: Schema.Types.ObjectId,
    ref: 'Organization'
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  preferredLanguage: {
    type: String,
    default: 'en',
    enum: ['en', 'fr', 'ar'],
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// Indexes for common queries
userSchema.index({ email: 1, status: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ fullName: 'text' }); // Text index for fullName search

// Update password hashing middleware
userSchema.pre('save', async function(next) {
  // Only skip if password hasn't been modified or there is no password
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Update password comparison method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const user = await User.findById(this._id).select('+password');
  if (!user || !user.password) {
    return false;
  }

  return await bcrypt.compare(candidatePassword, user.password);
};

// Add this before creating the model
userSchema.statics.getSafeUser = function(user: IUser): SafeUser {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    status: user.status,
    createdAt: user.createdAt,
    profileImage: user.profileImage,
    title: user.title,
    bio: user.bio,
    rating: user.rating,
    reviewsCount: user.reviewsCount,
    usersCount: user.usersCount,
    coursesCount: user.coursesCount,
    lastActive: user.lastActive,
    courses: user.courses,
    preferredLanguage: user.preferredLanguage,
  };
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
