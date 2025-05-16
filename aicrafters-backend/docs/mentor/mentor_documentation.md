# Mentor Feature Documentation

## Overview

The Mentor feature allows experienced professionals to join the platform and provide mentoring services to students. Unlike trainers (teachers) who are focused on delivering course content, mentors provide personalized guidance, career advice, and support to students. Mentors can set their availability, manage mentees, and communicate directly with them.

## User Roles

- **Mentor**: A professional who provides mentoring services.
- **User/Student**: A learner who can book sessions with mentors.
- **Admin**: Platform administrators who can manage and approve mentors.

## Database Schema

### User Model Updates

The existing User model will be extended to include 'mentor' as a possible role, similar to how 'trainer' is handled:

```typescript
// Update to User model's role field
role: {
  type: String,
  enum: ['user', 'trainer', 'mentor', 'admin'],
  default: 'user',
  index: true,
}

// Mentor-specific fields added to User model
mentorProfile: {
  title: String,                        // Professional title
  bio: String,                          // Detailed biography
  hourlyRate: Number,                   // Mentoring rate per hour
  skills: [{                            // Skills and expertise areas
    id: String,
    name: String,
  }],
  languages: [{                         // Languages spoken
    id: String,
    name: String,
  }],
  education: [{                         // Educational background
    institution: String,
    degree: String,
    field: String,
    startYear: Number,
    endYear: Number,
  }],
  experience: [{                        // Professional experience
    company: String,
    position: String,
    description: String,
    startYear: Number,
    endYear: Number,
  }],
  availability: [{                      // Weekly availability slots
    day: Number,                        // 0-6 (Sunday-Saturday)
    startTime: String,                  // HH:MM format
    endTime: String,                    // HH:MM format
  }],
  socialLinks: {                        // Professional social links
    linkedin: String,
    twitter: String,
    github: String,
    website: String,
  },
  isVerified: {                         // Whether the mentor is verified
    type: Boolean,
    default: false
  },
  menteesCount: {                       // Total number of mentees
    type: Number,
    default: 0
  },
  sessionsCount: {                      // Total number of sessions completed
    type: Number,
    default: 0
  },
  mentorRating: {                       // Separate from instructor rating
    type: Number,
    default: 0
  },
  mentorReviewsCount: {                 // Separate from instructor reviews
    type: Number,
    default: 0
  },
  appliedAt: Date,                      // When the mentor applied
  approvedAt: Date,                     // When the mentor was approved
}
```

### Mentor Message

```typescript
interface MentorMessage {
  _id: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;     // Reference to the User (mentor)
  menteeId: mongoose.Types.ObjectId;     // Reference to the User (student)
  sender: 'mentor' | 'mentee';           // Who sent the message
  content: string;                       // Message content
  isRead: boolean;                       // Whether the message has been read
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Mentor Management

- `POST /api/mentor/apply`: Submit mentor application
  - Request body contains mentor application details including skills, experience, availability
  - Creates pending application in user's profile
  - Sends notification to admin for review

- `GET /api/mentor/profile`: Get mentor profile
  - Returns the complete mentor profile for the authenticated mentor
  - Includes skills, education, experience, and other profile details

- `PUT /api/mentor/profile`: Update mentor profile
  - Updates the mentor's profile information
  - Validates input data before saving

- `GET /api/mentor/availability`: Get mentor availability
  - Returns the mentor's available time slots

- `PUT /api/mentor/availability`: Update mentor availability
  - Updates the mentor's available time slots
  - Validates for conflicts with existing bookings

### Mentee Management

- `GET /api/mentor/mentees`: Get all mentees for a mentor
- `GET /api/mentor/mentees/:id`: Get details for a specific mentee
- `GET /api/mentor/mentees/:id/sessions`: Get all sessions with a specific mentee

### Messaging

- `GET /api/mentor/messages/:menteeId`: Get conversation with a specific mentee
- `POST /api/mentor/messages/:menteeId`: Send a message to a mentee

### Admin Endpoints

- `GET /api/admin/mentors`: Get all mentors (with pagination)
  - Returns a list of all mentors with pagination support
  - Query parameters for filtering by status, skills, etc.
  - Response includes basic mentor information and statistics

- `GET /api/admin/mentors/:id`: Get mentor details
  - Returns detailed information about a specific mentor
  - Includes complete profile, statistics, and booking history

- `PUT /api/admin/mentors/:id/verify`: Verify a mentor
  - Sets the mentor's verification status to true
  - Enables the mentor to appear in public searches
  - Updates any relevant notification settings

- `PUT /api/admin/mentors/:id/status`: Change mentor status
  - Updates the mentor's active status
  - Options include: active, inactive, suspended
  - Affects visibility and booking ability

- `GET /api/admin/mentor-applications`: Get all mentor applications
  - Returns a list of all mentor applications with pagination
  - Includes filters for application status
  - Response contains application details and user information

- `GET /api/admin/mentor-applications/:id`: Get specific application details
  - Returns detailed information about a mentor application
  - Includes all submitted application materials

- `PUT /api/admin/mentor-applications/:id`: Update application status
  - Updates the status of a mentor application
  - Status options: pending, approved, rejected
  - When approved, automatically updates user role to mentor
  - Sends notification to the applicant

- `POST /api/admin/mentors/:id/feedback`: Send feedback to mentor
  - Allows admin to send feedback to a mentor
  - Useful for performance reviews and quality control

### User Endpoints

- `GET /api/mentors`: Get all available mentors
- `GET /api/mentors/:id`: Get a specific mentor's public profile

## Authentication & Authorization

- Mentors must be authenticated to access mentor endpoints
- Users must be authenticated to book sessions
- Admin authorization required for admin endpoints
- Role-based middleware to protect endpoints

## Implementation Details

### Mentor Application Process

1. User submits an application via `POST /api/mentor/apply` endpoint
2. Application data is stored in the user's profile with status 'pending'
3. Admin receives notification of new mentor application
4. Admin reviews application in admin dashboard and approves/rejects
5. On approval, user's role is updated to include 'mentor'

### Profile Management

The mentor profile management is handled through the following components:
- `mentorController.ts`: Contains HTTP request handlers
- `mentorService.ts`: Contains the business logic
- `mentorRoutes.ts`: Defines the API routes

Profile updates are validated using a schema validation middleware before being processed.

### Admin Controller Implementation

The admin functions for mentor management are implemented in `adminMentorController.ts` with these key functions:

```typescript
// Get all mentor applications with filtering and pagination
const getMentorApplications = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query: any = {};
    
    if (status && ['pending', 'approved', 'rejected'].includes(String(status))) {
      query['mentorProfile.status'] = status;
    }
    
    const applications = await User.find({
      'mentorProfile.appliedAt': { $exists: true },
      ...query
    })
    .select('name email mentorProfile')
    .sort({ 'mentorProfile.appliedAt': -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
    
    const total = await User.countDocuments({
      'mentorProfile.appliedAt': { $exists: true },
      ...query
    });
    
    return res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update mentor application status
const updateMentorApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user || !user.mentorProfile || !user.mentorProfile.appliedAt) {
      return res.status(404).json({
        success: false,
        error: 'Mentor application not found'
      });
    }
    
    // Update status
    user.mentorProfile.status = status;
    
    // If approved, update role and set approvedAt
    if (status === 'approved') {
      user.role = 'mentor';
      user.mentorProfile.approvedAt = new Date();
      user.mentorProfile.isVerified = true;
      
      // Send approval notification
      await notificationService.sendMentorApprovalNotification(user._id);
    } else {
      // Send rejection notification
      await notificationService.sendMentorRejectionNotification(user._id);
    }
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      data: {
        message: `Mentor application ${status}`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          mentorProfile: user.mentorProfile
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
```

### Availability Management

Mentors can set their weekly availability, which is then used to generate bookable slots:
1. Mentor sets recurring weekly availability (days and time ranges)
2. System generates actual bookable slots based on this availability
3. When bookings are made, those slots are marked as unavailable

## Workflow

### Becoming a Mentor

1. User applies to become a mentor through the application form
2. Admin reviews application and approves/rejects
3. Upon approval, user role is updated to include 'mentor'
4. Mentor sets up their profile and availability

## Implementation Considerations

- **Scheduling System**: Need to handle timezones properly
- **Notification System**: Email and in-app notifications
- **Rating System**: Calculate average mentor ratings from session feedback
- **Search & Filtering**: Allow users to find mentors by skills, availability, etc.

## Future Enhancements

- Group mentoring sessions
- Subscription-based mentoring plans
- Mentor certification programs
- Mentorship progress tracking
- Skill assessments for mentees
- Recommendation algorithm for mentor matching 