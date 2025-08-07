import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processImageUploads, validateImageFile } from '@/lib/image-processing'

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const artworkData = JSON.parse(formData.get('artworkData') as string || '{}')

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Validate all files first
    for (const file of files) {
      validateImageFile(file)
    }

    // Process image uploads
    const processedImages = await processImageUploads(files)
    
    // Create artwork records in database
    const createdArtworks = await Promise.all(
      processedImages.map(async (image, index) => {
        const artwork = await prisma.artwork.create({
          data: {
            title: artworkData.title || `Untitled ${index + 1}`,
            description: artworkData.description || null,
            medium: artworkData.medium || null,
            year: artworkData.year ? parseInt(artworkData.year) : null,
            dimensions: artworkData.dimensions || null,
            imageUrl: image.originalUrl,
            thumbnailUrl: image.thumbnailUrl,
            mediumUrl: image.mediumUrl,
            largeUrl: image.largeUrl,
            tags: artworkData.tags ? JSON.stringify(artworkData.tags) : null,
            collections: artworkData.collections ? JSON.stringify(artworkData.collections) : null,
            fileSize: image.fileSize,
            mimeType: image.mimeType,
            artistId: user.artist!.id
          }
        })
        return artwork
      })
    )

    return NextResponse.json({ 
      message: 'Artworks uploaded successfully',
      artworks: createdArtworks
    }, { status: 201 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}