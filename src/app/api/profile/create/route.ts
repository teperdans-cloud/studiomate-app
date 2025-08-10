import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanitizeObject, sanitizeString, sanitizeEmail } from '@/lib/sanitization'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

interface ProfileCreationData {
  basicInfo: {
    fullName: string
    email: string
    location: string
    phone?: string
    website?: string
    instagramHandle?: string
  }
  cvData?: {
    bio?: string
    fileName?: string
    education: { degree: string; institution: string; year?: string }[]
    experience: { title: string; organization: string; duration?: string }[]
    skills: string[]
    awards: { title: string; year?: string; organization?: string }[]
    exhibitions: { title: string; venue: string; year?: string; type?: string }[]
    contact?: { email?: string; phone?: string; website?: string; location?: string }
  }
  artisticFocus: string[]
  careerStage: string
  preferences: {
    regions: string[]
    opportunityTypes: string[]
    goals: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 3 profile creation attempts per hour
    const clientIP = getClientIP(request)
    const { success } = rateLimit(`profile-create:${clientIP}`, 3, 60 * 60 * 1000) // 1 hour
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many profile creation attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions) as { user?: { email?: string, id?: string } } | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const profileData = sanitizeObject(body) as unknown as ProfileCreationData

    // Validate required fields
    if (!profileData.basicInfo?.fullName || !profileData.basicInfo?.email || !profileData.basicInfo?.location) {
      return NextResponse.json(
        { error: 'Missing required basic information (name, email, location)' },
        { status: 400 }
      )
    }

    // Sanitize and validate inputs
    const sanitizedData = {
      fullName: sanitizeString(profileData.basicInfo.fullName),
      email: sanitizeEmail(profileData.basicInfo.email),
      location: sanitizeString(profileData.basicInfo.location),
      phone: profileData.basicInfo.phone ? sanitizeString(profileData.basicInfo.phone) : null,
      website: profileData.basicInfo.website ? sanitizeString(profileData.basicInfo.website) : null,
      instagramHandle: profileData.basicInfo.instagramHandle ? sanitizeString(profileData.basicInfo.instagramHandle) : null,
      artisticFocus: profileData.artisticFocus?.map(focus => sanitizeString(focus)).filter(Boolean) || [],
      careerStage: sanitizeString(profileData.careerStage || 'emerging'),
      interestedRegions: profileData.preferences?.regions?.join(',') || '',
      opportunityTypes: profileData.preferences?.opportunityTypes?.join(',') || '',
      goals: profileData.preferences?.goals?.join(',') || ''
    }

    // Validate artistic focus
    const validArtisticFocus = [
      'painting', 'sculpture', 'photography', 'drawing', 'printmaking', 'installation',
      'performance', 'video', 'digital', 'ceramics', 'textiles', 'jewelry'
    ]
    
    const invalidFocus = sanitizedData.artisticFocus.filter(
      focus => !validArtisticFocus.includes(focus.toLowerCase())
    )
    
    if (invalidFocus.length > 0) {
      return NextResponse.json(
        { error: `Invalid artistic focus: ${invalidFocus.join(', ')}` },
        { status: 400 }
      )
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: sanitizedData.email },
      include: { artist: true }
    })

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          email: sanitizedData.email,
          name: sanitizedData.fullName
        },
        include: { artist: true }
      })
    }

    // Create or update artist profile
    let artist
    if (user.artist) {
      // Update existing artist profile
      artist = await prisma.artist.update({
        where: { id: user.artist.id },
        data: {
          bio: profileData.cvData?.bio || null,
          location: sanitizedData.location,
          website: sanitizedData.website,
          instagramHandle: sanitizedData.instagramHandle,
          careerStage: sanitizedData.careerStage,
          artisticFocus: sanitizedData.artisticFocus.join(','),
          interestedRegions: sanitizedData.interestedRegions,
          awards: profileData.cvData?.awards ? JSON.stringify(profileData.cvData.awards) : null,
          cvData: profileData.cvData ? JSON.stringify(profileData.cvData) : null,
          cvFileName: profileData.cvData?.fileName || null,
          cvUploadedAt: profileData.cvData ? new Date() : null
        }
      })
    } else {
      // Create new artist profile
      artist = await prisma.artist.create({
        data: {
          userId: user.id,
          bio: profileData.cvData?.bio || null,
          location: sanitizedData.location,
          website: sanitizedData.website,
          instagramHandle: sanitizedData.instagramHandle,
          careerStage: sanitizedData.careerStage,
          artisticFocus: sanitizedData.artisticFocus.join(','),
          interestedRegions: sanitizedData.interestedRegions,
          awards: profileData.cvData?.awards ? JSON.stringify(profileData.cvData.awards) : null,
          cvData: profileData.cvData ? JSON.stringify(profileData.cvData) : null,
          cvFileName: profileData.cvData?.fileName || null,
          cvUploadedAt: profileData.cvData ? new Date() : null
        }
      })
    }

    // Create notification preferences if they don't exist
    const existingPrefs = await prisma.notificationPreference.findUnique({
      where: { artistId: artist.id }
    })

    if (!existingPrefs) {
      await prisma.notificationPreference.create({
        data: {
          artistId: artist.id,
          emailEnabled: true,
          reminderIntervals: JSON.stringify([7, 3, 1]),
          opportunityDeadlines: profileData.preferences?.opportunityTypes?.includes('grants') || 
                               profileData.preferences?.opportunityTypes?.includes('exhibitions') || true,
          customDeadlines: true,
          applicationDeadlines: true,
          googleCalendarEnabled: false
        }
      })
    }

    // Calculate profile completeness score
    const completenessScore = calculateProfileCompleteness({
      basicInfo: {
        fullName: sanitizedData.fullName,
        email: sanitizedData.email,
        location: sanitizedData.location,
        website: sanitizedData.website || undefined
      },
      artisticFocus: sanitizedData.artisticFocus,
      careerStage: sanitizedData.careerStage,
      cvData: profileData.cvData,
      preferences: profileData.preferences
    })

    return NextResponse.json({
      message: 'Profile created successfully',
      profile: {
        id: artist.id,
        userId: user.id,
        completenessScore,
        artisticFocus: sanitizedData.artisticFocus,
        careerStage: sanitizedData.careerStage,
        preferences: profileData.preferences
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Profile creation error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

function calculateProfileCompleteness(profile: ProfileCreationData): number {
  let score = 0
  
  // Basic information (40 points)
  if (profile.basicInfo.fullName) score += 10
  if (profile.basicInfo.email) score += 10
  if (profile.basicInfo.location) score += 10
  if (profile.basicInfo.website) score += 10
  
  // Artistic details (30 points)
  if (profile.artisticFocus?.length > 0) score += 15
  if (profile.careerStage) score += 10
  if (profile.cvData?.bio && profile.cvData.bio.length > 50) score += 5
  
  // CV and experience (20 points)  
  if (profile.cvData) score += 20
  
  // Preferences (10 points)
  if (profile.preferences?.regions?.length > 0) score += 3
  if (profile.preferences?.opportunityTypes?.length > 0) score += 4
  if (profile.preferences?.goals?.length > 0) score += 3
  
  return Math.min(score, 100)
}