import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMatchedOpportunities } from '@/lib/matching'

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
        artist: true
      }
    })

    if (!user || !user.artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    // Get all opportunities
    const opportunities = await prisma.opportunity.findMany({
      where: {
        deadline: {
          gte: new Date() // Only future opportunities
        }
      },
      orderBy: {
        deadline: 'asc'
      }
    })

    // Get matched opportunities using the AI algorithm
    const matchedOpportunities = getMatchedOpportunities(user.artist, opportunities)

    return NextResponse.json({ 
      matches: matchedOpportunities.slice(0, 10), // Return top 10 matches
      totalMatches: matchedOpportunities.length
    })
  } catch (error) {
    console.error('Matching error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}