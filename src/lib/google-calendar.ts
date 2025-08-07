import { google } from 'googleapis'
import { calendar_v3 } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { CalendarEvent } from './calendar'

export interface GoogleCalendarConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  accessToken: string
  refreshToken: string
}

export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar
  private auth: OAuth2Client

  constructor(config: GoogleCalendarConfig) {
    this.auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    )
    
    this.auth.setCredentials({
      access_token: config.accessToken,
      refresh_token: config.refreshToken
    })
    
    this.calendar = google.calendar({ version: 'v3', auth: this.auth })
  }

  async createEvent(event: CalendarEvent, calendarId: string = 'primary'): Promise<string | null> {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.start.toISOString(),
            timeZone: 'UTC'
          },
          end: {
            dateTime: event.end.toISOString(),
            timeZone: 'UTC'
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 1 day
              { method: 'popup', minutes: 60 } // 1 hour
            ]
          },
          extendedProperties: {
            private: {
              artmatchId: event.id,
              artmatchType: event.type
            }
          }
        }
      })

      return response.data.id || null
    } catch (error) {
      console.error('Google Calendar event creation error:', error)
      return null
    }
  }

  async updateEvent(
    googleEventId: string, 
    event: Partial<CalendarEvent>, 
    calendarId: string = 'primary'
  ): Promise<boolean> {
    try {
      await this.calendar.events.update({
        calendarId,
        eventId: googleEventId,
        requestBody: {
          summary: event.title,
          description: event.description,
          start: event.start ? {
            dateTime: event.start.toISOString(),
            timeZone: 'UTC'
          } : undefined,
          end: event.end ? {
            dateTime: event.end.toISOString(),
            timeZone: 'UTC'
          } : undefined
        }
      })

      return true
    } catch (error) {
      console.error('Google Calendar event update error:', error)
      return false
    }
  }

  async deleteEvent(googleEventId: string, calendarId: string = 'primary'): Promise<boolean> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId: googleEventId
      })

      return true
    } catch (error) {
      console.error('Google Calendar event deletion error:', error)
      return false
    }
  }

  async syncEvents(events: CalendarEvent[], calendarId: string = 'primary'): Promise<void> {
    try {
      // Get existing StudioMate events from Google Calendar
      const existingEvents = await this.calendar.events.list({
        calendarId,
        privateExtendedProperty: ['artmatchType'],
        maxResults: 250
      })

      const existingEventMap = new Map()
      if (existingEvents.data.items) {
        existingEvents.data.items.forEach((event: calendar_v3.Schema$Event) => {
          const artmatchId = event.extendedProperties?.private?.artmatchId
          if (artmatchId) {
            existingEventMap.set(artmatchId, event.id)
          }
        })
      }

      // Process each event
      for (const event of events) {
        const googleEventId = existingEventMap.get(event.id)
        
        if (googleEventId) {
          // Update existing event
          await this.updateEvent(googleEventId, event, calendarId)
          existingEventMap.delete(event.id)
        } else {
          // Create new event
          await this.createEvent(event, calendarId)
        }
      }

      // Delete events that no longer exist in StudioMate
      for (const googleEventId of Array.from(existingEventMap.values())) {
        await this.deleteEvent(googleEventId, calendarId)
      }
    } catch (error) {
      console.error('Google Calendar sync error:', error)
    }
  }

  static generateAuthUrl(clientId: string, redirectUri: string): string {
    const auth = new google.auth.OAuth2(clientId, '', redirectUri)
    
    return auth.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
      prompt: 'consent'
    })
  }

  static async exchangeCodeForTokens(
    code: string, 
    clientId: string, 
    clientSecret: string, 
    redirectUri: string
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
      
      const { tokens } = await auth.getToken(code)
      
      return {
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || ''
      }
    } catch (error) {
      console.error('Google Calendar token exchange error:', error)
      return null
    }
  }
}

export async function syncArtistCalendarWithGoogle(
  artistId: string,
  events: CalendarEvent[]
): Promise<boolean> {
  try {
    // Get artist's Google Calendar configuration
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      include: { notificationPreference: true }
    })

    if (!artist?.notificationPreference?.googleCalendarEnabled) {
      return false
    }

    // This would require storing Google Calendar tokens securely
    // For now, we'll just log the sync attempt
    console.log(`Would sync ${events.length} events to Google Calendar for artist ${artistId}`)
    
    return true
  } catch (error) {
    console.error('Google Calendar sync error:', error)
    return false
  }
}

// Helper function to get Google Calendar authorization URL
export function getGoogleCalendarAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`
  
  if (!clientId || !redirectUri) {
    throw new Error('Google Calendar configuration missing')
  }

  return GoogleCalendarService.generateAuthUrl(clientId, redirectUri)
}