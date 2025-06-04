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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorshipBooking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MentorshipBookingSchema = new mongoose_1.Schema({
    mentorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    menteeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    scheduledAt: {
        type: Date,
        required: true,
        index: true
    },
    duration: {
        type: Number,
        required: true,
        min: 15, // Minimum 15 minutes
        default: 60 // Default 1 hour
    },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'completed', 'cancelled', 'no-show'],
        default: 'pending',
        required: true,
        index: true
    },
    topic: {
        type: String,
        required: true,
        trim: true
    },
    notes: {
        mentorNotes: {
            type: String,
            trim: true
        },
        menteeNotes: {
            type: String,
            trim: true
        },
        sharedNotes: {
            type: String,
            trim: true
        }
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true
        },
        submittedAt: {
            type: Date
        }
    },
    meetingLink: {
        type: String,
        trim: true
    },
    googleEventId: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    mentorAvailabilityId: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
// Create compound indexes for efficient queries
MentorshipBookingSchema.index({ mentorId: 1, scheduledAt: 1 });
MentorshipBookingSchema.index({ menteeId: 1, scheduledAt: 1 });
MentorshipBookingSchema.index({ status: 1, scheduledAt: 1 });
// Add instance methods for common operations
MentorshipBookingSchema.methods.complete = function () {
    this.status = 'completed';
    return this.save();
};
MentorshipBookingSchema.methods.cancel = function () {
    this.status = 'cancelled';
    return this.save();
};
MentorshipBookingSchema.methods.markNoShow = function () {
    this.status = 'no-show';
    return this.save();
};
MentorshipBookingSchema.methods.addFeedback = function (rating, comment) {
    this.feedback = {
        rating,
        comment,
        submittedAt: new Date()
    };
    return this.save();
};
// Static method to check for scheduling conflicts
MentorshipBookingSchema.statics.checkForConflicts = function (mentorId, scheduledAt, duration, excludeBookingId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Calculate session end time
        const sessionEndTime = new Date(scheduledAt.getTime() + duration * 60000);
        console.log(`Checking for conflicts at time: ${scheduledAt.toISOString()} to ${sessionEndTime.toISOString()}`);
        console.log(`Session duration: ${duration} minutes`);
        // Using a simpler approach with manual verification instead of complex MongoDB queries
        // that might not work correctly with date calculations
        const query = {
            mentorId,
            status: 'scheduled',
            scheduledAt: {
                // Look for bookings that start around the same time (within a larger window)
                $gte: new Date(scheduledAt.getTime() - 2 * 60 * 60000), // 2 hours before
                $lte: new Date(sessionEndTime.getTime() + 2 * 60 * 60000) // 2 hours after
            }
        };
        // Exclude the current booking if we're checking an update
        if (excludeBookingId) {
            query._id = { $ne: excludeBookingId };
        }
        // Find all potential conflicts
        const potentialConflicts = yield this.find(query);
        console.log(`Found ${potentialConflicts.length} potential conflicts to check`);
        // Manually check each potential conflict
        let hasConflict = false;
        for (let i = 0; i < potentialConflicts.length; i++) {
            const booking = potentialConflicts[i];
            const bookingStart = new Date(booking.scheduledAt);
            const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
            console.log(`Examining potential conflict:
      Booking: ${booking._id}
      Start: ${bookingStart.toISOString()}
      End: ${bookingEnd.toISOString()}
    `);
            // Check for overlap
            const overlaps = (
            // Case 1: New booking starts during existing booking
            (scheduledAt >= bookingStart && scheduledAt < bookingEnd) ||
                // Case 2: New booking ends during existing booking
                (sessionEndTime > bookingStart && sessionEndTime <= bookingEnd) ||
                // Case 3: New booking completely contains existing booking
                (scheduledAt <= bookingStart && sessionEndTime >= bookingEnd));
            if (overlaps) {
                console.log(`CONFLICT DETECTED with booking ${booking._id}`);
                hasConflict = true;
                break;
            }
        }
        console.log(`Final conflict result: ${hasConflict}`);
        return hasConflict;
    });
};
// Static method to get upcoming sessions for a mentor
MentorshipBookingSchema.statics.getUpcomingForMentor = function (mentorId, limit = 10) {
    return this.find({
        mentorId,
        status: 'scheduled',
        scheduledAt: { $gt: new Date() }
    })
        .sort({ scheduledAt: 1 })
        .limit(limit)
        .populate('menteeId', 'fullName email profileImage')
        .exec();
};
// Static method to get upcoming sessions for a mentee
MentorshipBookingSchema.statics.getUpcomingForMentee = function (menteeId, limit = 10) {
    return this.find({
        menteeId,
        status: 'scheduled',
        scheduledAt: { $gt: new Date() }
    })
        .sort({ scheduledAt: 1 })
        .limit(limit)
        .populate('mentorId', 'fullName email profileImage mentorProfile.title')
        .exec();
};
exports.MentorshipBooking = mongoose_1.default.model('MentorshipBooking', MentorshipBookingSchema);
