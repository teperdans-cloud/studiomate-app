import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getArtistCalendarEvents, generateICSContent } from '@/lib/calendar'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the artist profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { artist: true }
    })

    if (!user || !user.artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    // Get calendar events
    let events = await getArtistCalendarEvents(user.artist.id)

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      events = events.filter(event => 
        event.start >= start && event.start <= end
      )
    }

    // Handle ICS export
    if (format === 'ics') {
      const icsContent = generateICSContent(events, user.name || 'Artist')
      
      return new NextResponse(icsContent, {
        headers: {
          'Content-Type': 'text/calendar',
          'Content-Disposition': 'attachment; filename="artmatch-calendar.ics"'
        }
      })
    }

    // Return JSON format
    return NextResponse.json({ 
      events,
      total: events.length
    })

  } catch (error) {
    console.error('Calendar fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}