import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if artist profile already exists
    const existingArtist = await prisma.artist.findUnique({
      where: { userId: user.id }
    })

    if (existingArtist) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 409 })
    }

    // Create artist profile
    const artist = await prisma.artist.create({
      data: {
        userId: user.id,
        bio: data.bio || null,
        location: data.location || null,
        website: data.website || null,
        instagramHandle: data.instagramHandle || null,
        careerStage: data.careerStage || null,
        artisticFocus: data.artisticFocus || null,
        interestedRegions: data.interestedRegions || null,
      }
    })

    return NextResponse.json({ artist }, { status: 201 })
  } catch (error) {
    console.error('Profile creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        artist: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ artist: user.artist })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}