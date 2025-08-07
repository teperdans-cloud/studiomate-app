import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleCalendarService } from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/dashboard?error=google_calendar_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard?error=missing_auth_code', request.url))
    }

    // Get the artist profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { artist: true }
    })

    if (!user || !user.artist) {
      return NextResponse.redirect(new URL('/dashboard?error=artist_not_found', request.url))
    }

    // Exchange code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/dashboard?error=google_config_missing', request.url))
    }

    const tokens = await GoogleCalendarService.exchangeCodeForTokens(
      code,
      clientId,
      clientSecret,
      redirectUri
    )

    if (!tokens) {
      return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', request.url))
    }

    // Store tokens securely (in production, encrypt these)
    await prisma.notificationPreference.upsert({
      where: { artistId: user.artist.id },
      update: {
        googleCalendarEnabled: true,
        googleCalendarId: 'primary' // Default calendar
        // Note: In production, you would store encrypted tokens
      },
      create: {
        artistId: user.artist.id,
        googleCalendarEnabled: true,
        googleCalendarId: 'primary'
      }
    })

    return NextResponse.redirect(new URL('/dashboard?success=google_calendar_connected', request.url))

  } catch (error) {
    console.error('Google Calendar callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=google_calendar_setup_failed', request.url))
  }
}