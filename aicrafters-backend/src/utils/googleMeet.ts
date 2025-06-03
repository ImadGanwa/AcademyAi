import { google } from 'googleapis';
import crypto from 'crypto';

interface MeetingDetails {
  topic: string;
  start: Date;
  durationMins: number;
  mentorEmail: string;
  menteeEmail?: string;
}

export async function createGoogleMeet(details: MeetingDetails) {
  try {
    // Check if required environment variables are set
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID environment variable is not set');
    }
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('GOOGLE_CLIENT_SECRET environment variable is not set');
    }
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      throw new Error('GOOGLE_REFRESH_TOKEN environment variable is not set');
    }

    console.log('Google Meet environment variables check passed');
    console.log('Creating Google Meet with credentials:', {
      clientIdPresent: !!process.env.GOOGLE_CLIENT_ID,
      clientSecretPresent: !!process.env.GOOGLE_CLIENT_SECRET,
      refreshTokenPresent: !!process.env.GOOGLE_REFRESH_TOKEN
    });

    // Initialize OAuth2 client
    const oauth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth.setCredentials({ 
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth });
    const endTime = new Date(details.start.getTime() + details.durationMins * 60_000);

    console.log('Creating Google Meet for:', {
      topic: details.topic,
      start: details.start.toISOString(),
      end: endTime.toISOString(),
      duration: details.durationMins,
      mentorEmail: details.mentorEmail,
      menteeEmail: details.menteeEmail
    });

    // Create calendar event with Google Meet link
    const { data } = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Mentorship Session: ${details.topic}`,
        description: `Mentorship session between mentor and mentee.\n\nTopic: ${details.topic}`,
        start: { 
          dateTime: details.start.toISOString(),
          timeZone: 'UTC'
        },
        end: { 
          dateTime: endTime.toISOString(),
          timeZone: 'UTC'
        },
        attendees: [
          { email: details.mentorEmail, responseStatus: 'accepted' },
          ...(details.menteeEmail ? [{ email: details.menteeEmail, responseStatus: 'needsAction' }] : [])
        ],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }       // 30 minutes before
          ]
        }
      }
    });

    // Extract the Google Meet link
    const joinUrl = data.conferenceData?.entryPoints?.find(
      (entry: any) => entry.entryPointType === 'video'
    )?.uri;

    if (!joinUrl) {
      console.error('No Google Meet link generated. Response data:', JSON.stringify(data, null, 2));
      throw new Error('No Google Meet link was generated');
    }

    console.log('Google Meet created successfully:', {
      eventId: data.id,
      meetLink: joinUrl
    });

    return {
      id: data.id!,
      joinUrl,
      eventUrl: data.htmlLink
    };

  } catch (error: any) {
    console.error('Error creating Google Meet:', error);
    
    // Handle specific Google API errors
    if (error.code === 401) {
      throw new Error('Google API authentication failed. Please check credentials.');
    } else if (error.code === 403) {
      throw new Error('Google API access forbidden. Please check permissions.');
    } else if (error.code === 404) {
      throw new Error('Google Calendar not found.');
    } else if (error.response?.data?.error) {
      throw new Error(`Google API error: ${error.response.data.error.message}`);
    }
    
    throw new Error(`Failed to create Google Meet: ${error.message}`);
  }
}

// Function to delete a Google Calendar event (for cancellations)
export async function deleteGoogleMeetEvent(eventId: string) {
  try {
    const oauth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    );
    
    oauth.setCredentials({ 
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN! 
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth });
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    });

    console.log(`Google Calendar event ${eventId} deleted successfully`);
    return true;

  } catch (error: any) {
    console.error('Error deleting Google Calendar event:', error);
    // Don't throw error for deletion failures, just log them
    return false;
  }
} 