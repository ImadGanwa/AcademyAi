"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
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
        required: function () {
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
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Course',
                required: true
            },
            status: {
                type: String,
                enum: ['in progress', 'saved', 'completed'],
                required: true
            },
            organizationId: {
                type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
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
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const salt = yield bcryptjs_1.default.genSalt(10);
            this.password = yield bcryptjs_1.default.hash(this.password, salt);
            // console.log(`Password successfully hashed for user: ${this.email}`); // Original comment.
            next();
        }
        catch (error) {
            // console.error('Error hashing password:', error); // Original comment.
            next(error);
        }
    });
});
// Update password comparison method
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.password) { // password field has select: false, so it might not be populated
            // console.error('Password comparison failed: No password available on user object. Ensure password field is selected in query.'); // Original comment.
            // This can happen if the user document was fetched without selecting the password.
            // For comparePassword to work, the document must have the password field.
            return false;
        }
        try {
            return yield bcryptjs_1.default.compare(candidatePassword, this.password);
        }
        catch (error) {
            // console.error('Password comparison error:', error); // Original comment.
            return false;
        }
    });
};
// Add this before creating the model
userSchema.statics.getSafeUser = function (user) {
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
exports.User = mongoose_1.default.model('User', userSchema);
