import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCustomDeadline, updateDeadline, deleteDeadline, toggleDeadlineCompletion } from '@/lib/calendar'

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

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.dueDate || !data.type) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, dueDate, type' 
      }, { status: 400 })
    }

    // Create deadline
    const deadline = await createCustomDeadline(user.artist.id, {
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      type: data.type,
      priority: data.priority || 'medium',
      opportunityId: data.opportunityId,
      applicationId: data.applicationId
    })

    return NextResponse.json({ 
      message: 'Deadline created successfully',
      deadline
    }, { status: 201 })

  } catch (error) {
    console.error('Deadline creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const data = await request.json()
    const { searchParams } = new URL(request.url)
    const deadlineId = searchParams.get('id')
    const action = searchParams.get('action')

    if (!deadlineId) {
      return NextResponse.json({ error: 'Deadline ID required' }, { status: 400 })
    }

    // Handle toggle completion
    if (action === 'toggle') {
      const deadline = await toggleDeadlineCompletion(deadlineId, user.artist.id)
      return NextResponse.json({ 
        message: 'Deadline updated successfully',
        deadline
      })
    }

    // Handle regular update
    const deadline = await updateDeadline(deadlineId, user.artist.id, {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      type: data.type,
      priority: data.priority
    })

    return NextResponse.json({ 
      message: 'Deadline updated successfully',
      deadline
    })

  } catch (error) {
    console.error('Deadline update error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const deadlineId = searchParams.get('id')

    if (!deadlineId) {
      return NextResponse.json({ error: 'Deadline ID required' }, { status: 400 })
    }

    await deleteDeadline(deadlineId, user.artist.id)

    return NextResponse.json({ 
      message: 'Deadline deleted successfully' 
    })

  } catch (error) {
    console.error('Deadline deletion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}