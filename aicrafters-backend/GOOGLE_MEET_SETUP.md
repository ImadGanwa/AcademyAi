# Google Meet Integration Setup

## Overview
This integration automatically creates Google Meet links when mentors accept booking requests (status changes from 'pending' to 'scheduled').

## Required Dependencies

Install the Google APIs client library:
```bash
npm install googleapis
```

## Environment Variables

Add these environment variables to your `.env` file:

```env
# Google API Credentials for Calendar/Meet Integration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
```

## Google API Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Set application type to "Web application"
4. Add authorized redirect URIs (for testing: `http://localhost:3000`)
5. Save the Client ID and Client Secret

### 3. Generate Refresh Token
You can use the Google OAuth 2.0 Playground:
1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon and check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In Step 1, select "Google Calendar API v3" > "https://www.googleapis.com/auth/calendar"
5. Click "Authorize APIs" and complete the OAuth flow
6. In Step 2, click "Exchange authorization code for tokens"
7. Copy the refresh token

## Features

### Automatic Meeting Creation
- When mentor accepts a booking (pending → scheduled), a Google Meet link is automatically created
- Meeting includes both mentor and mentee as attendees
- Calendar event is created with reminders (24 hours and 30 minutes before)

### Meeting Deletion
- When bookings are cancelled, the associated Google Calendar event is automatically deleted
- Handles both mentor and mentee cancellations

### Error Handling
- If Google Meet creation fails, the booking update returns a 502 error
- Calendar event deletion failures are logged but don't block the cancellation process

## Database Changes

The `MentorshipBooking` model now includes:
- `googleEventId`: Stores the Google Calendar event ID for management
- `meetingLink`: Stores the Google Meet join URL

## API Endpoints Affected

- `PUT /api/bookings/mentor/:id` - Now creates Google Meet when status changes to 'scheduled'
- `POST /api/bookings/:id/cancel` - Deletes Google Calendar event
- `POST /api/bookings/mentor/:id/cancel` - Deletes Google Calendar event

## Testing

To test the integration:
1. Create a booking request as a mentee
2. Accept the booking as a mentor (this should create a Google Meet link)
3. Check that the meeting link is included in confirmation emails
4. Cancel the booking and verify the calendar event is deleted

## Troubleshooting

### Common Issues
1. **Authentication Failed (401)**: Check your Google credentials
2. **Access Forbidden (403)**: Ensure Calendar API is enabled and credentials have proper scope
3. **No Meet Link Generated**: Check that conferenceData is properly configured in the API request

### Logs
The system logs Google Meet creation and deletion activities. Check server logs for detailed error messages. 