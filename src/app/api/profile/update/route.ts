import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanitizeObject, sanitizeString, sanitizeEmail } from '@/lib/sanitization'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting - 10 profile updates per hour
    const clientIP = getClientIP(request)
    const { success } = rateLimit(`profile-update:${clientIP}`, 10, 60 * 60 * 1000) // 1 hour
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many update attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const profileData = sanitizeObject(body)

    // Get current user and artist profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { artist: true }
    })

    if (!user || !user.artist) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Sanitize and validate inputs
    const updates: Record<string, unknown> = {}

    if (profileData.name !== undefined) {
      updates.name = sanitizeString(profileData.name)
    }

    if (profileData.email !== undefined) {
      updates.email = sanitizeEmail(profileData.email)
    }

    if (profileData.bio !== undefined) {
      updates.bio = sanitizeString(profileData.bio)
      if ((updates.bio as string).length > 2000) {
        return NextResponse.json(
          { error: 'Bio must be less than 2000 characters' },
          { status: 400 }
        )
      }
    }

    if (profileData.location !== undefined) {
      updates.location = sanitizeString(profileData.location)
    }

    if (profileData.website !== undefined) {
      updates.website = sanitizeString(profileData.website)
      // Basic URL validation
      if (updates.website && !(updates.website as string).match(/^https?:\/\/.+/)) {
        return NextResponse.json(
          { error: 'Website must be a valid URL starting with http:// or https://' },
          { status: 400 }
        )
      }
    }

    if (profileData.instagramHandle !== undefined) {
      updates.instagramHandle = sanitizeString(profileData.instagramHandle)
      // Remove @ if present
      if ((updates.instagramHandle as string).startsWith('@')) {
        updates.instagramHandle = (updates.instagramHandle as string).substring(1)
      }
    }

    if (profileData.careerStage !== undefined) {
      const validStages = ['emerging', 'mid', 'established']
      if (typeof profileData.careerStage !== 'string' || !validStages.includes(profileData.careerStage)) {
        return NextResponse.json(
          { error: 'Invalid career stage' },
          { status: 400 }
        )
      }
      updates.careerStage = profileData.careerStage
    }

    if (profileData.artisticFocus !== undefined) {
      const validFocus = [
        'painting', 'sculpture', 'photography', 'drawing', 'printmaking',
        'installation', 'performance', 'video', 'digital', 'ceramics',
        'textiles', 'jewelry'
      ]
      
      const focusArray = (profileData.artisticFocus as string).split(',').filter(Boolean)
      const invalidFocus = focusArray.filter((focus: string) => 
        !validFocus.includes(focus.toLowerCase())
      )
      
      if (invalidFocus.length > 0) {
        return NextResponse.json(
          { error: `Invalid artistic focus: ${invalidFocus.join(', ')}` },
          { status: 400 }
        )
      }
      
      updates.artisticFocus = profileData.artisticFocus
    }

    if (profileData.interestedRegions !== undefined) {
      const validRegions = ['local', 'national', 'international']
      const regionsArray = (profileData.interestedRegions as string).split(',').filter(Boolean)
      const invalidRegions = regionsArray.filter((region: string) => 
        !validRegions.includes(region.toLowerCase())
      )
      
      if (invalidRegions.length > 0) {
        return NextResponse.json(
          { error: `Invalid region: ${invalidRegions.join(', ')}` },
          { status: 400 }
        )
      }
      
      updates.interestedRegions = profileData.interestedRegions
    }

    // Update user data
    if (updates.name || updates.email) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(updates.name ? { name: updates.name as string } : {}),
          ...(updates.email ? { email: updates.email as string } : {})
        }
      })
    }

    // Update artist data
    const artistUpdates = {
      ...(updates.bio !== undefined && { bio: updates.bio }),
      ...(updates.location !== undefined && { location: updates.location }),
      ...(updates.website !== undefined && { website: updates.website }),
      ...(updates.instagramHandle !== undefined && { instagramHandle: updates.instagramHandle }),
      ...(updates.careerStage !== undefined && { careerStage: updates.careerStage }),
      ...(updates.artisticFocus !== undefined && { artisticFocus: updates.artisticFocus }),
      ...(updates.interestedRegions !== undefined && { interestedRegions: updates.interestedRegions }),
      updatedAt: new Date()
    }

    const updatedArtist = await prisma.artist.update({
      where: { id: user.artist.id },
      data: artistUpdates
    })

    // Calculate new completeness score
    const completenessScore = calculateProfileCompleteness({
      name: updates.name || user.name,
      email: updates.email || user.email,
      location: updates.location || updatedArtist.location,
      website: updates.website || updatedArtist.website,
      instagramHandle: updates.instagramHandle || updatedArtist.instagramHandle,
      artisticFocus: updates.artisticFocus || updatedArtist.artisticFocus,
      careerStage: updates.careerStage || updatedArtist.careerStage,
      bio: updates.bio || updatedArtist.bio,
      cvData: updatedArtist.cvData,
      interestedRegions: updates.interestedRegions || updatedArtist.interestedRegions
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        id: updatedArtist.id,
        userId: user.id,
        completenessScore,
        ...artistUpdates
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

function calculateProfileCompleteness(profile: Record<string, unknown>): number {
  let score = 0
  
  // Basic information (40 points)
  if (profile.name) score += 10
  if (profile.email) score += 10
  if (profile.location) score += 10
  if (profile.website) score += 10
  
  // Artistic details (35 points)
  if (profile.artisticFocus) score += 15
  if (profile.careerStage) score += 10
  if (profile.bio && (profile.bio as string).length > 50) score += 10
  
  // CV and experience (20 points)  
  if (profile.cvData) score += 20
  
  // Additional details (5 points)
  if (profile.instagramHandle) score += 3
  if (profile.interestedRegions) score += 2
  
  return Math.min(score, 100)
}