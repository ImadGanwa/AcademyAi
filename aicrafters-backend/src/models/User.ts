import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Exportable Mentor Schema Types for consistency across the application
export interface MentorSkill {
  id: string;
  name: string;
}

export interface MentorLanguage {
  id: string;
  name: string;
}

export interface MentorProfessionalInfo {
  role?: string;
  linkedIn?: string;
  academicBackground?: string;
  experience?: string;
  [key: string]: any;
}

export interface MentorAvailabilitySlot {
  day: number;
  startTime: string;
  endTime: string;
  weekKey?: string;
}



export interface MentorProfile {
  title: string;
  bio: string;
  hourlyRate: number;
  country?: string;
  skills: Array<MentorSkill>;
  languages: Array<MentorLanguage>;
  professionalInfo?: MentorProfessionalInfo;
  availability: Array<MentorAvailabilitySlot>;
  isVerified: boolean;
  menteesCount: number;
  sessionsCount: number;
  mentorRating: number;
  mentorReviewsCount: number;
  appliedAt: Date;
  approvedAt: Date | null;
}

export interface MentorProfileUpdate {
  title?: string;
  bio?: string;
  hourlyRate?: number;
  skills?: Array<string | { id?: string; name: string }>;
  languages?: Array<string | { id?: string; name: string }>;
}

export interface MentorApplicationAvailability {
  weekdays?: boolean;
  weekends?: boolean;
  mornings?: boolean;
  afternoons?: boolean;
  evenings?: boolean;
  [key: string]: any;
}

export interface IMentorApplication extends Document {
  fullName: string;
  email: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  languages: string[];
  countries: string[];
  availability: MentorApplicationAvailability;
  professionalInfo: MentorProfessionalInfo;
  preferences: {
    sessionDuration?: string;
    [key: string]: any;
  };
  appliedAt: Date;
  reviewedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  role: 'user' | 'trainer' | 'mentor' | 'admin';
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
  // Mentor specific fields
  mentorProfile?: MentorProfile;
}

interface IUserModel extends Model<IUser> {
  getSafeUser(user: IUser): SafeUser;
}

// MODIFIED SafeUser interface:
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
  courses: Array<{ // Updated to match IUser.courses structure for direct assignment
    courseId: mongoose.Types.ObjectId;
    status: 'in progress' | 'saved' | 'completed';
    organizationId?: mongoose.Types.ObjectId; // Added
    completedAt?: Date;
    certificateId?: string;
    certificateImageUrl?: string;
    rating?: number;
    comment?: string;
    progress?: { // Added
      timeSpent: number;
      percentage: number;
      completedLessons: Array<string>;
    };
  }>;
  mentorProfile?: MentorProfile; // Updated to use the centralized MentorProfile type
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
    enum: ['user', 'trainer', 'mentor', 'admin'],
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
        type: String, // Mongoose will interpret this as Array<String>
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
  // Add mentor specific fields
  mentorProfile: {
    title: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    hourlyRate: {
      type: Number,
      min: 0
    },
    country: {
      type: String,
      trim: true
    },
    skills: [{
      id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      }
    }],
    languages: [{
      id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      }
    }],
    professionalInfo: {
      role: {
        type: String,
        trim: true
      },
      linkedIn: {
        type: String,
        trim: true
      },
      academicBackground: {
        type: String,
        trim: true
      },
      experience: {
        type: String,
        trim: true
      }
      // Note: The schema doesn't define [key: string]: any, Mongoose subdocuments are strict by default.
    },
    availability: [{
      day: {
        type: Number,
        required: true,
        min: 0,
        max: 6
      },
      startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      weekKey: {
        type: String,
        trim: true
      }
    }],
    isVerified: {
      type: Boolean,
      default: false
    },
    menteesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    sessionsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    mentorRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    mentorReviewsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    approvedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// Indexes for common queries
userSchema.index({ email: 1, status: 1 });
userSchema.index({ role: 1, status: 1 });

// Add these indexes for mentor queries
userSchema.index({ 'mentorProfile.skills.name': 1 });
userSchema.index({ 'mentorProfile.languages.name': 1 });
userSchema.index({ 'mentorProfile.hourlyRate': 1 });
userSchema.index({ 'mentorProfile.isVerified': 1, 'mentorProfile.mentorRating': -1 });

// Update password hashing middleware
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    
    if (!this.password) {
      // console.error('Password hashing middleware: No password provided'); // Original comment.
      // If password is not required (e.g. social login) and not provided, this is fine.
      // The `required` function for password field already handles this.
      // This check could be relevant if password was set to null/undefined after being required.
      return next();
    }
    
    // console.log(`Hashing password for user: ${this.email}`); // Original comment.
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // console.log(`Password successfully hashed for user: ${this.email}`); // Original comment.
    next();
  } catch (error) {
    // console.error('Error hashing password:', error); // Original comment.
    next(error as Error);
  }
});

// Update password comparison method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) { // password field has select: false, so it might not be populated
    // console.error('Password comparison failed: No password available on user object. Ensure password field is selected in query.'); // Original comment.
    // This can happen if the user document was fetched without selecting the password.
    // For comparePassword to work, the document must have the password field.
    return false;
  }

  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    // console.error('Password comparison error:', error); // Original comment.
    return false;
  }
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
    courses: user.courses, // Now compatible due to SafeUser.courses update
    mentorProfile: user.mentorProfile // Now compatible due to SafeUser.mentorProfile update
  };
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);