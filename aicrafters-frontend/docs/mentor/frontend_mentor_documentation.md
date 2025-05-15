# Mentorship Frontend Documentation

## Overview

The frontend mentorship system provides interfaces for three user types:
- **Students**: Browse, book, and interact with mentors
- **Mentors**: Manage profile, availability, and mentee interactions
- **Admins**: Review mentor applications and manage the mentorship system

## Component Structure

### Pages

#### Student/User View
- `MentorDirectory.tsx`: Browse and search available mentors
- `MentorProfile.tsx`: View mentor details and book sessions
- `MyMentorships.tsx`: View booked sessions and mentorship history
- `MentorChat.tsx`: Messaging interface for mentor communication

#### Mentor View
- `MentorDashboard.tsx`: Overview of mentorship activity
- `MentorProfileEdit.tsx`: Edit mentor profile information
- `MentorAvailability.tsx`: Set and manage availability slots
- `MentorBookings.tsx`: Manage upcoming and past bookings
- `MentorMentees.tsx`: View and manage mentee relationships
- `MentorChat.tsx`: Communication with mentees

#### Admin View
- `MentorRequests.tsx`: Review and approve mentor applications
- `MentorsManagement.tsx`: Manage existing mentors
- `MentorshipStats.tsx`: View mentorship system analytics

### Shared Components

- `AvailabilityCalendar.tsx`: Calendar component for booking/availability
- `MentorCard.tsx`: Card displaying mentor information
- `BookingForm.tsx`: Session booking form
- `SessionFeedback.tsx`: Feedback form for completed sessions
- `ChatInterface.tsx`: Reusable chat component

## State Management

### Redux Slices

- `mentorSlice.ts`: Manages mentor profiles and listings
- `bookingsSlice.ts`: Handles session bookings
- `availabilitySlice.ts`: Manages mentor availability
- `chatSlice.ts`: Handles messaging between mentors and mentees
- `mentorApplicationSlice.ts`: Manages mentor application process

### API Integration

API calls are organized in service files:
- `mentorService.ts`: Mentor-related API calls
- `bookingService.ts`: Session booking API calls
- `chatService.ts`: Messaging API integration

## Workflows

### Mentor Application Process

1. User navigates to "Become a Mentor" section
2. User completes multi-step application form:
   - Personal information
   - Skills and expertise
   - Education and experience
   - Availability settings
3. User submits application
4. Application status shown in user dashboard
5. Upon approval, mentor dashboard becomes accessible

```tsx
// Example component for mentor application form
const MentorApplicationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    skills: [],
    // Other fields...
  });

  const handleSubmit = async () => {
    try {
      await mentorService.applyAsMentor(formData);
      // Show success message
    } catch (error) {
      // Handle error
    }
  };

  return (
    <StepperForm
      activeStep={activeStep}
      onStepChange={setActiveStep}
      onComplete={handleSubmit}
      steps={[
        { label: 'Personal Info', component: <PersonalInfoForm /> },
        { label: 'Skills', component: <SkillsForm /> },
        { label: 'Experience', component: <ExperienceForm /> },
        { label: 'Availability', component: <AvailabilityForm /> },
      ]}
    />
  );
};
```

### Booking a Session

1. Student browses mentor directory
2. Student views mentor profile
3. Student selects available time slot
4. Student completes booking form with session details
5. Upon confirmation, booking is displayed in student's dashboard
6. Both mentor and student receive notifications

```tsx
// Example of booking component
const BookingComponent = ({ mentorId }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [topic, setTopic] = useState('');
  
  const handleBookSession = async () => {
    if (!selectedSlot) return;
    
    try {
      await bookingService.createBooking({
        mentorId,
        scheduledAt: selectedSlot,
        topic,
        duration: 60, // 1 hour default
      });
      // Show success message
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <div>
      <AvailabilityCalendar 
        mentorId={mentorId}
        onSlotSelect={setSelectedSlot}
      />
      <TextField
        label="Session Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <Button 
        onClick={handleBookSession}
        disabled={!selectedSlot || !topic}
      >
        Book Session
      </Button>
    </div>
  );
};
```

### Mentor Availability Management

1. Mentor sets recurring weekly availability
2. System generates bookable slots
3. Students can book available slots
4. Booked slots are removed from availability

```tsx
// Example of availability management component
const AvailabilityManager = () => {
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  
  useEffect(() => {
    // Load current availability
    const loadAvailability = async () => {
      const data = await mentorService.getAvailability();
      setWeeklyAvailability(data);
    };
    
    loadAvailability();
  }, []);
  
  const handleSaveAvailability = async () => {
    try {
      await mentorService.updateAvailability(weeklyAvailability);
      // Show success message
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <div>
      <WeeklyScheduler
        value={weeklyAvailability}
        onChange={setWeeklyAvailability}
      />
      <Button onClick={handleSaveAvailability}>
        Save Availability
      </Button>
    </div>
  );
};
```

## Admin Dashboard Components

### Mentor Application Review

```tsx
// Example of application review component
const MentorApplicationReview = ({ application }) => {
  const [status, setStatus] = useState(application.status);
  
  const handleApprove = async () => {
    try {
      await adminService.approveMentorApplication(application.userId);
      setStatus('approved');
    } catch (error) {
      // Handle error
    }
  };
  
  const handleReject = async () => {
    try {
      await adminService.rejectMentorApplication(application.userId);
      setStatus('rejected');
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <Card>
      <CardHeader title={`${application.firstName} ${application.lastName}`} />
      <CardContent>
        <Typography>Title: {application.title}</Typography>
        <Typography>Bio: {application.bio}</Typography>
        {/* Display other application details */}
      </CardContent>
      <CardActions>
        <Button onClick={handleApprove} disabled={status !== 'pending'}>
          Approve
        </Button>
        <Button onClick={handleReject} disabled={status !== 'pending'}>
          Reject
        </Button>
      </CardActions>
    </Card>
  );
};
```

## UI/UX Considerations

### Mentor Profile Display

- Professional headshot/avatar
- Clear presentation of expertise, skills, and experience
- Testimonials from previous mentees
- Availability calendar for easy booking
- Rating and review system

### Booking Experience

- Intuitive calendar for selecting time slots
- Clear indication of mentor's timezone
- Simple form for session details
- Confirmation emails and reminders

### Messaging Interface

- Real-time chat capabilities
- Ability to share resources/files
- Message notifications
- Chat history preservation

## Responsive Design

All mentorship components are built with responsive design in mind:
- Desktop: Full-featured experience with detailed layouts
- Tablet: Optimized layouts with maintained functionality
- Mobile: Streamlined views focusing on core features

## Theme Integration

The mentorship interface follows the platform's design system:
- Consistent use of color scheme
- Typography hierarchy
- Component styling
- Animation patterns

## Accessibility

The mentorship interface adheres to WCAG guidelines:
- Proper semantic HTML
- ARIA attributes where needed
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast

## Implementation Notes

1. Use React Query for efficient API data fetching and caching
2. Implement virtualization for long lists of mentors or messages
3. Use skeleton loaders during data fetching
4. Implement proper error handling for all API interactions
5. Add comprehensive form validation 