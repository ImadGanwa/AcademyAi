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
exports.VideoTranscription = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const videoTranscriptionSchema = new mongoose_1.Schema({
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    transcription: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    error: {
        type: String
    },
    lastAttempt: {
        type: Date,
        default: Date.now
    },
    retryCount: {
        type: Number,
        default: 0
    },
    videoSummary: {
        type: String,
        default: null
    },
    sectionSummary: {
        type: String,
        default: null
    },
    courseSummary: {
        type: String,
        default: null
    },
    summaryStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: null
    }
}, {
    timestamps: true
});
// Create indexes for better query performance
videoTranscriptionSchema.index({ courseId: 1, videoUrl: 1 }, { unique: true });
videoTranscriptionSchema.index({ status: 1, lastAttempt: 1 });
videoTranscriptionSchema.index({ summaryStatus: 1 });
exports.VideoTranscription = mongoose_1.default.model('VideoTranscription', videoTranscriptionSchema);
