# Booking Feature Documentation

## Overview

The Booking feature enables users (mentees) to schedule mentoring sessions with mentors. It handles the entire booking lifecycle from availability checking to session completion and feedback, providing a centralized approach to all booking-related operations.

## Database Schema

### Mentorship Booking

```typescript
interface MentorshipBooking {
  _id: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;     // Reference to the User (mentor)
  menteeId: mongoose.Types.ObjectId;     // Reference to the User (student)
  scheduledAt: Date;                     // Date and time of session
  duration: number;                      // Duration in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  topic: string;                         // Main topic for discussion
  notes: {                               // Session notes
    mentorNotes?: string;                // Mentor's private notes
    menteeNotes?: string;                // Mentee's private notes
    sharedNotes?: string;                // Notes visible to both
  };
  feedback: {                            // Session feedback
    rating?: number;                     // 1-5 rating
    comment?: string;                    // Written feedback
    submittedAt?: Date;                  // When feedback was submitted
  };
  meetingLink?: string;                  // Video conferencing link
  price: number;                         // Price paid for the session
  mentorAvailabilityId: string;          // Reference to the chosen availability slot
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### User (Mentee) Endpoints

- `POST /api/bookings`: Create a new booking
  - Request body includes mentorId, date, startTime, endTime, topic, and optional message
  - Creates a new booking record and reserves the time slot
  - Returns booking details including status and mentorName

- `GET /api/bookings`: Get all bookings for the current user
  - Returns a list of all bookings made by the authenticated user
  - Optional query parameter for filtering by status
  - Response includes booking details with mentor information

- `GET /api/bookings/:id`: Get details for a specific booking
  - Returns detailed information about a specific booking
  - Only accessible to the mentee who made the booking

- `POST /api/bookings/:id/cancel`: Cancel a booking
  - Allows mentee to cancel their booking if done at least 24 hours in advance
  - Updates booking status to 'cancelled'
  - Reason for cancellation is required

- `POST /api/bookings/:id/review`: Rate and review a completed session
  - Allows mentee to submit rating (1-5) and optional review text
  - Updates mentor's average rating
  - Sends notification to mentor about new review

- `GET /api/bookings/availability/:mentorId`: Get mentor's available time slots
  - Returns all available time slots for a specific mentor on a given date
  - Takes into account existing bookings and mentor's set availability
  - Response includes sorted list of available time slots

### Mentor Endpoints

- `GET /api/bookings/mentor`: Get all bookings for a mentor
  - Returns a list of all bookings for the authenticated mentor
  - Optional query parameters for filtering by status, start date, end date
  - Response includes booking details with mentee information

- `GET /api/bookings/mentor/:id`: Get details for a specific booking
  - Returns detailed information about a specific booking
  - Only accessible to the mentor assigned to the booking

- `PUT /api/bookings/mentor/:id`: Update booking details
  - Allows mentor to update meeting link, notes (both private and shared)
  - Only applicable for scheduled bookings
  - Returns updated booking details

- `POST /api/bookings/mentor/:id/complete`: Mark a booking as completed
  - Changes booking status to 'completed'
  - Optional notes can be added
  - Increments mentor's sessionsCount
  - Notification sent to mentee about session completion

- `POST /api/bookings/mentor/:id/cancel`: Cancel a booking
  - Allows mentor to cancel a booking if done at least 24 hours in advance
  - Updates booking status to 'cancelled'
  - Reason for cancellation is required
  - Notification sent to mentee about cancellation

## Workflows

### Booking a Session

1. User browses available mentors
2. User selects a mentor and views their profile
3. User checks mentor's availability for a specific date
4. User books a session by selecting an available time slot
5. System creates a booking record and notifies the mentor
6. User receives confirmation of the booking

### During & After Session

1. Both parties join at the scheduled time using the meeting link
2. Mentor may update the booking with notes during or after the session
3. Mentor marks the session as 'completed'
4. Mentee can provide rating and feedback
5. System updates mentor ratings and statistics

### Cancellations

1. Either party may cancel a booking at least 24 hours in advance
2. Cancellation reason must be provided
3. Other party is notified of the cancellation
4. If payment was made, refund process is initiated

## Technical Implementation

### Business Logic

The booking system's business logic is mainly implemented in:
- `bookingController.ts`: Contains all HTTP request handlers
- `MentorshipBooking.ts`: Contains the booking model with methods for conflict checking

### Key Helper Functions

```typescript
// Check for scheduling conflicts
static async checkForConflicts(
  mentorId: mongoose.Types.ObjectId,
  scheduledAt: Date,
  duration: number
): Promise<boolean> {
  // Convert scheduled time to range
  const startTime = new Date(scheduledAt);
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
  
  // Find any overlapping bookings
  const overlappingBookings = await this.find({
    mentorId,
    status: 'scheduled',
    $or: [
      // New booking starts during an existing booking
      {
        scheduledAt: { $lte: startTime },
        $expr: {
          $gt: [
            { $add: ['$scheduledAt', { $multiply: ['$duration', 60, 1000] }] },
            startTime.getTime()
          ]
        }
      },
      // New booking ends during an existing booking
      {
        scheduledAt: { $lt: endTime },
        scheduledAt: { $gt: startTime }
      },
      // New booking completely encompasses an existing booking
      {
        scheduledAt: { $gte: startTime },
        $expr: {
          $lte: [
            { $add: ['$scheduledAt', { $multiply: ['$duration', 60, 1000] }] },
            endTime.getTime()
          ]
        }
      }
    ]
  });
  
  return overlappingBookings.length > 0;
}
```

### Availability System

The booking system relies on the mentor availability system to determine when sessions can be booked:

```typescript
// Helper function to get the Monday of a week for a given date
const getMondayOfWeek = (date: Date | string): string => {
  const dateObj = new Date(date);
  const day = dateObj.getDay() || 7; // Convert Sunday (0) to 7
  const diff = dateObj.getDate() - day + 1; // 1 = Monday
  const mondayDate = new Date(dateObj);
  mondayDate.setDate(diff);
  
  // Format as YYYY-MM-DD
  return mondayDate.toISOString().split('T')[0];
};
```

This function helps identify which week a date belongs to, allowing the system to check for specific week-based availability versus recurring availability.

## Implementation Considerations

- **Time Zone Handling**: Ensure all booking times are properly stored and displayed in the correct time zones
- **Payment Integration**: Process payments securely for mentorship sessions
- **Video Conferencing Integration**: Generate and verify meeting links
- **Notification System**: Email and in-app notifications for booking events
- **Conflict Resolution**: Prevent double-booking and handle last-minute cancellations
- **Feedback System**: Collect and analyze session feedback for quality improvement

## Future Enhancements

- Group booking support for group mentoring sessions
- Recurring booking options for regular mentoring relationships
- Waitlist functionality for popular mentors
- Automated reminder system for upcoming sessions
- Calendar integration (Google Calendar, Outlook, etc.)
- Mobile notifications and calendar links
- Analytics dashboard for booking trends and mentor performance 