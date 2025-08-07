import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ArtworkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  medium: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  dimensions: z.string().optional(),
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  mediumUrl: z.string().url().optional(),
  largeUrl: z.string().url().optional(),
  tags: z.string().optional(),
  collections: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { artist: true }
    })

    if (!user?.artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const tags = searchParams.get('tags')
    const medium = searchParams.get('medium')

    const artworks = await prisma.artwork.findMany({
      where: {
        artistId: user.artist.id,
        ...(tags && { tags: { contains: tags } }),
        ...(medium && { medium: { contains: medium } })
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ artworks })
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { artist: true }
    })

    if (!user?.artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = ArtworkSchema.parse(body)

    const artwork = await prisma.artwork.create({
      data: {
        ...validatedData,
        artistId: user.artist.id
      }
    })

    return NextResponse.json({ artwork }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating artwork:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { artist: true }
    })

    if (!user?.artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('id')

    if (!artworkId) {
      return NextResponse.json({ error: 'Artwork ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = ArtworkSchema.parse(body)

    // Check if artwork belongs to the user
    const existingArtwork = await prisma.artwork.findFirst({
      where: {
        id: artworkId,
        artistId: user.artist.id
      }
    })

    if (!existingArtwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }

    const artwork = await prisma.artwork.update({
      where: { id: artworkId },
      data: validatedData
    })

    return NextResponse.json({ artwork })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating artwork:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { artist: true }
    })

    if (!user?.artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('id')

    if (!artworkId) {
      return NextResponse.json({ error: 'Artwork ID is required' }, { status: 400 })
    }

    // Check if artwork belongs to the user
    const existingArtwork = await prisma.artwork.findFirst({
      where: {
        id: artworkId,
        artistId: user.artist.id
      }
    })

    if (!existingArtwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }

    await prisma.artwork.delete({
      where: { id: artworkId }
    })

    return NextResponse.json({ message: 'Artwork deleted successfully' })
  } catch (error) {
    console.error('Error deleting artwork:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}