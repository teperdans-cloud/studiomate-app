import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the artist
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        artist: {
          include: {
            applications: {
              include: {
                opportunity: true
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      }
    })

    if (!user || !user.artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      applications: user.artist.applications
    })
  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('id')

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 })
    }

    // Verify the application belongs to the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        artist: {
          include: {
            applications: {
              where: {
                id: applicationId
              }
            }
          }
        }
      }
    })

    if (!user || !user.artist || user.artist.applications.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Delete the application
    await prisma.application.delete({
      where: {
        id: applicationId
      }
    })

    return NextResponse.json({ message: 'Application deleted successfully' })
  } catch (error) {
    console.error('Application deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}