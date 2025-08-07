import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tags = searchParams.get('tags')
    const collections = searchParams.get('collections')
    const medium = searchParams.get('medium')
    const year = searchParams.get('year')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: Record<string, unknown> = {
      artistId: user.artist.id
    }

    if (tags) {
      where.tags = {
        contains: tags
      }
    }

    if (collections) {
      where.collections = {
        contains: collections
      }
    }

    if (medium) {
      where.medium = {
        contains: medium,
        mode: 'insensitive'
      }
    }

    if (year) {
      where.year = parseInt(year)
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get artworks with filtering and pagination
    const [artworks, total] = await Promise.all([
      prisma.artwork.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.artwork.count({ where })
    ])

    // Parse JSON fields
    const formattedArtworks = artworks.map(artwork => ({
      ...artwork,
      tags: artwork.tags ? JSON.parse(artwork.tags) : [],
      collections: artwork.collections ? JSON.parse(artwork.collections) : []
    }))

    return NextResponse.json({
      artworks: formattedArtworks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}