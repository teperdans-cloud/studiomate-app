import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteImageFiles } from '@/lib/image-processing'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get artwork by ID and verify ownership
    const artwork = await prisma.artwork.findUnique({
      where: { 
        id: params.id,
        artistId: user.artist.id
      }
    })

    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }

    // Parse JSON fields
    const formattedArtwork = {
      ...artwork,
      tags: artwork.tags ? JSON.parse(artwork.tags) : [],
      collections: artwork.collections ? JSON.parse(artwork.collections) : []
    }

    return NextResponse.json({ artwork: formattedArtwork })

  } catch (error) {
    console.error('Artwork fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify artwork ownership
    const existingArtwork = await prisma.artwork.findUnique({
      where: { 
        id: params.id,
        artistId: user.artist.id
      }
    })

    if (!existingArtwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }

    const data = await request.json()

    // Update artwork
    const updatedArtwork = await prisma.artwork.update({
      where: { id: params.id },
      data: {
        title: data.title || existingArtwork.title,
        description: data.description !== undefined ? data.description : existingArtwork.description,
        medium: data.medium !== undefined ? data.medium : existingArtwork.medium,
        year: data.year !== undefined ? (data.year ? parseInt(data.year) : null) : existingArtwork.year,
        dimensions: data.dimensions !== undefined ? data.dimensions : existingArtwork.dimensions,
        tags: data.tags !== undefined ? JSON.stringify(data.tags) : existingArtwork.tags,
        collections: data.collections !== undefined ? JSON.stringify(data.collections) : existingArtwork.collections,
      }
    })

    // Parse JSON fields for response
    const formattedArtwork = {
      ...updatedArtwork,
      tags: updatedArtwork.tags ? JSON.parse(updatedArtwork.tags) : [],
      collections: updatedArtwork.collections ? JSON.parse(updatedArtwork.collections) : []
    }

    return NextResponse.json({ 
      message: 'Artwork updated successfully',
      artwork: formattedArtwork
    })

  } catch (error) {
    console.error('Artwork update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get artwork to delete and verify ownership
    const artwork = await prisma.artwork.findUnique({
      where: { 
        id: params.id,
        artistId: user.artist.id
      }
    })

    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }

    // Delete artwork from database
    await prisma.artwork.delete({
      where: { id: params.id }
    })

    // Delete image files from filesystem
    const imageUrls = [
      artwork.imageUrl,
      artwork.thumbnailUrl,
      artwork.mediumUrl,
      artwork.largeUrl
    ].filter(Boolean) as string[]

    if (imageUrls.length > 0) {
      await deleteImageFiles(imageUrls)
    }

    return NextResponse.json({ 
      message: 'Artwork deleted successfully' 
    })

  } catch (error) {
    console.error('Artwork deletion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}