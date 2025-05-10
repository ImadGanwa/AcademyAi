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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Organization'
        }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
});
// Indexes for common queries
userSchema.index({ email: 1, status: 1 });
userSchema.index({ role: 1, status: 1 });
// Update password hashing middleware
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Only skip if password hasn't been modified or there is no password
        if (!this.isModified('password') || !this.password) {
            return next();
        }
        try {
            const salt = yield bcryptjs_1.default.genSalt(10);
            this.password = yield bcryptjs_1.default.hash(this.password, salt);
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// Update password comparison method
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield exports.User.findById(this._id).select('+password');
        if (!user || !user.password) {
            return false;
        }
        return yield bcryptjs_1.default.compare(candidatePassword, user.password);
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
        courses: user.courses
    };
};
exports.User = mongoose_1.default.model('User', userSchema);
