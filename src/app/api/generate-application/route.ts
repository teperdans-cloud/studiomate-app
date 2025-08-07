import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateApplicationSummary } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { opportunityId } = await request.json()

    if (!opportunityId) {
      return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 })
    }

    // Get the artist profile with artworks
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        artist: {
          include: {
            artworks: {
              orderBy: { createdAt: 'desc' },
              take: 10 // Get recent artworks for context
            }
          }
        }
      }
    })

    if (!user || !user.artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    // Get the opportunity
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId }
    })

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
      }, { status: 500 })
    }

    // Generate application materials
    const applicationData = await generateApplicationSummary(user.artist, opportunity)

    // Create application record in database
    const application = await prisma.application.create({
      data: {
        artistId: user.artist.id,
        opportunityId: opportunity.id,
        artistStatement: applicationData.artistStatement,
        coverLetter: applicationData.coverLetter,
        status: 'draft'
      }
    })

    return NextResponse.json({
      application: {
        id: application.id,
        artistStatement: applicationData.artistStatement,
        coverLetter: applicationData.coverLetter,
        tips: applicationData.tips
      }
    })
  } catch (error) {
    console.error('Application generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate application. Please try again.' 
    }, { status: 500 })
  }
}