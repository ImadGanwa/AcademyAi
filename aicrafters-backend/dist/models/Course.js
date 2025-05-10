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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Content item schema
const contentItemSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['text', 'media'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    duration: Number
});
// Lesson schema
const lessonSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['lesson'],
        required: true,
        default: 'lesson'
    },
    contentItems: [contentItemSchema],
    preview: {
        type: Boolean,
        default: false
    },
    duration: {
        type: Number,
        default: 0
    }
});
// Quiz option schema
const quizOptionSchema = new mongoose_1.Schema({
    id: String,
    text: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
});
// Quiz question schema
const quizQuestionSchema = new mongoose_1.Schema({
    question: {
        type: String,
        required: true
    },
    context: {
        type: String,
        required: true
    },
    isMultipleChoice: {
        type: Boolean,
        required: true
    },
    options: [quizOptionSchema]
});
// Content section schema
const contentSectionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['lesson', 'quiz'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function (content) {
                const contentType = this.type;
                if (contentType === 'lesson') {
                    return content.type === 'lesson' && Array.isArray(content.contentItems);
                }
                else {
                    return content.type === 'quiz' && Array.isArray(content.questions);
                }
            },
            message: 'Invalid content structure for the given type'
        }
    }
});
// Course section schema
const courseSectionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    contents: [contentSectionSchema]
});
const courseSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    subtitle: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    instructor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    originalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    currentPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    previewVideo: {
        type: String,
    },
    categories: [{
            type: String,
            required: true,
        }],
    learningPoints: [{
            type: String,
            required: true,
        }],
    requirements: [{
            type: String,
            required: true,
        }],
    courseContent: {
        sections: [courseSectionSchema]
    },
    duration: {
        type: Number,
        default: 0,
    },
    users: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        }],
    rating: {
        type: Number,
        default: 0,
    },
    reviews: [{
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },
            comment: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
    status: {
        type: String,
        enum: ['draft', 'review', 'published', 'archived'],
        default: 'draft',
    },
    badge: {
        name: String,
        colorKey: {
            type: String,
            enum: ['primary', 'secondary']
        }
    }
}, {
    timestamps: true,
    versionKey: false
});
exports.Course = mongoose_1.default.model('Course', courseSchema);
