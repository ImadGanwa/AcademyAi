"use strict";
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
exports.createGoogleMeet = createGoogleMeet;
exports.deleteGoogleMeetEvent = deleteGoogleMeetEvent;
const googleapis_1 = require("googleapis");
const crypto_1 = __importDefault(require("crypto"));
function createGoogleMeet(details) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
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
            const oauth = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
            oauth.setCredentials({
                refresh_token: process.env.GOOGLE_REFRESH_TOKEN
            });
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth });
            const endTime = new Date(details.start.getTime() + details.durationMins * 60000);
            console.log('Creating Google Meet for:', {
                topic: details.topic,
                start: details.start.toISOString(),
                end: endTime.toISOString(),
                duration: details.durationMins,
                mentorEmail: details.mentorEmail,
                menteeEmail: details.menteeEmail
            });
            // Create calendar event with Google Meet link
            const { data } = yield calendar.events.insert({
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
                            requestId: crypto_1.default.randomUUID(),
                            conferenceSolutionKey: { type: 'hangoutsMeet' }
                        }
                    },
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 }, // 24 hours before
                            { method: 'popup', minutes: 30 } // 30 minutes before
                        ]
                    }
                }
            });
            // Extract the Google Meet link
            const joinUrl = (_c = (_b = (_a = data.conferenceData) === null || _a === void 0 ? void 0 : _a.entryPoints) === null || _b === void 0 ? void 0 : _b.find((entry) => entry.entryPointType === 'video')) === null || _c === void 0 ? void 0 : _c.uri;
            if (!joinUrl) {
                console.error('No Google Meet link generated. Response data:', JSON.stringify(data, null, 2));
                throw new Error('No Google Meet link was generated');
            }
            console.log('Google Meet created successfully:', {
                eventId: data.id,
                meetLink: joinUrl
            });
            return {
                id: data.id,
                joinUrl,
                eventUrl: data.htmlLink
            };
        }
        catch (error) {
            console.error('Error creating Google Meet:', error);
            // Handle specific Google API errors
            if (error.code === 401) {
                throw new Error('Google API authentication failed. Please check credentials.');
            }
            else if (error.code === 403) {
                throw new Error('Google API access forbidden. Please check permissions.');
            }
            else if (error.code === 404) {
                throw new Error('Google Calendar not found.');
            }
            else if ((_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.error) {
                throw new Error(`Google API error: ${error.response.data.error.message}`);
            }
            throw new Error(`Failed to create Google Meet: ${error.message}`);
        }
    });
}
// Function to delete a Google Calendar event (for cancellations)
function deleteGoogleMeetEvent(eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const oauth = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
            oauth.setCredentials({
                refresh_token: process.env.GOOGLE_REFRESH_TOKEN
            });
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth });
            yield calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId
            });
            console.log(`Google Calendar event ${eventId} deleted successfully`);
            return true;
        }
        catch (error) {
            console.error('Error deleting Google Calendar event:', error);
            // Don't throw error for deletion failures, just log them
            return false;
        }
    });
}
