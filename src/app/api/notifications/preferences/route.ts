import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the artist profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        artist: {
          include: {
            notificationPreference: true
          }
        }
      }
    })

    if (!user || !user.artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    // Get or create notification preferences
    let preferences = user.artist.notificationPreference

    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          artistId: user.artist.id,
          emailEnabled: true,
          reminderIntervals: '[7,3,1]',
          opportunityDeadlines: true,
          customDeadlines: true,
          applicationDeadlines: true,
          googleCalendarEnabled: false
        }
      })
    }

    // Parse JSON fields
    const formattedPreferences = {
      ...preferences,
      reminderIntervals: JSON.parse(preferences.reminderIntervals)
    }

    return NextResponse.json({ preferences: formattedPreferences })

  } catch (error) {
    console.error('Notification preferences fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the artist profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        artist: {
          include: {
            notificationPreference: true
          }
        }
      }
    })

    if (!user || !user.artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const data = await request.json()

    // Validate reminder intervals if provided
    if (data.reminderIntervals && !Array.isArray(data.reminderIntervals)) {
      return NextResponse.json({ 
        error: 'reminderIntervals must be an array of numbers' 
      }, { status: 400 })
    }

    // Update or create notification preferences
    const preferences = await prisma.notificationPreference.upsert({
      where: { artistId: user.artist.id },
      update: {
        emailEnabled: data.emailEnabled !== undefined ? data.emailEnabled : undefined,
        reminderIntervals: data.reminderIntervals ? JSON.stringify(data.reminderIntervals) : undefined,
        opportunityDeadlines: data.opportunityDeadlines !== undefined ? data.opportunityDeadlines : undefined,
        customDeadlines: data.customDeadlines !== undefined ? data.customDeadlines : undefined,
        applicationDeadlines: data.applicationDeadlines !== undefined ? data.applicationDeadlines : undefined,
        googleCalendarEnabled: data.googleCalendarEnabled !== undefined ? data.googleCalendarEnabled : undefined,
        googleCalendarId: data.googleCalendarId !== undefined ? data.googleCalendarId : undefined
      },
      create: {
        artistId: user.artist.id,
        emailEnabled: data.emailEnabled !== undefined ? data.emailEnabled : true,
        reminderIntervals: data.reminderIntervals ? JSON.stringify(data.reminderIntervals) : '[7,3,1]',
        opportunityDeadlines: data.opportunityDeadlines !== undefined ? data.opportunityDeadlines : true,
        customDeadlines: data.customDeadlines !== undefined ? data.customDeadlines : true,
        applicationDeadlines: data.applicationDeadlines !== undefined ? data.applicationDeadlines : true,
        googleCalendarEnabled: data.googleCalendarEnabled !== undefined ? data.googleCalendarEnabled : false,
        googleCalendarId: data.googleCalendarId || null
      }
    })

    // Parse JSON fields for response
    const formattedPreferences = {
      ...preferences,
      reminderIntervals: JSON.parse(preferences.reminderIntervals)
    }

    return NextResponse.json({ 
      message: 'Notification preferences updated successfully',
      preferences: formattedPreferences
    })

  } catch (error) {
    console.error('Notification preferences update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}