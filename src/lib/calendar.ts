import { prisma } from '@/lib/prisma'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  type: 'opportunity' | 'custom' | 'application'
  priority: 'low' | 'medium' | 'high'
  isCompleted: boolean
  opportunityId?: string
  applicationId?: string
  color?: string
}

export interface DeadlineData {
  title: string
  description?: string
  dueDate: Date
  type: 'opportunity' | 'custom' | 'application'
  priority?: 'low' | 'medium' | 'high'
  opportunityId?: string
  applicationId?: string
}

export async function getArtistCalendarEvents(artistId: string): Promise<CalendarEvent[]> {
  // Get custom deadlines
  const customDeadlines = await prisma.deadline.findMany({
    where: { artistId },
    include: {
      opportunity: true,
      application: {
        include: {
          opportunity: true
        }
      }
    },
    orderBy: { dueDate: 'asc' }
  })

  // Get opportunity deadlines (not already tracked as custom deadlines)
  const opportunities = await prisma.opportunity.findMany({
    where: {
      deadline: {
        gte: new Date()
      },
      applications: {
        some: {
          artistId
        }
      }
    },
    include: {
      applications: {
        where: { artistId }
      }
    },
    orderBy: { deadline: 'asc' }
  })

  const events: CalendarEvent[] = []

  // Add custom deadlines
  customDeadlines.forEach(deadline => {
    events.push({
      id: deadline.id,
      title: deadline.title,
      description: deadline.description || undefined,
      start: deadline.dueDate,
      end: deadline.dueDate,
      type: deadline.type as 'opportunity' | 'custom' | 'application',
      priority: deadline.priority as 'low' | 'medium' | 'high',
      isCompleted: deadline.isCompleted,
      opportunityId: deadline.opportunityId || undefined,
      applicationId: deadline.applicationId || undefined,
      color: getPriorityColor(deadline.priority as 'low' | 'medium' | 'high')
    })
  })

  // Add opportunity deadlines if not already tracked
  opportunities.forEach(opportunity => {
    const hasCustomDeadline = customDeadlines.some(d => d.opportunityId === opportunity.id)
    if (!hasCustomDeadline) {
      events.push({
        id: `opp-${opportunity.id}`,
        title: `${opportunity.title} - Deadline`,
        description: `${opportunity.organizer} - ${opportunity.type}`,
        start: opportunity.deadline,
        end: opportunity.deadline,
        type: 'opportunity',
        priority: 'medium',
        isCompleted: false,
        opportunityId: opportunity.id,
        color: getPriorityColor('medium')
      })
    }
  })

  return events.sort((a, b) => a.start.getTime() - b.start.getTime())
}

export async function createCustomDeadline(artistId: string, data: DeadlineData) {
  return await prisma.deadline.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      type: data.type,
      priority: data.priority || 'medium',
      artistId,
      opportunityId: data.opportunityId,
      applicationId: data.applicationId
    }
  })
}

export async function updateDeadline(deadlineId: string, artistId: string, data: Partial<DeadlineData>) {
  return await prisma.deadline.update({
    where: { 
      id: deadlineId,
      artistId // Ensure ownership
    },
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      type: data.type
    }
  })
}

export async function deleteDeadline(deadlineId: string, artistId: string) {
  return await prisma.deadline.delete({
    where: { 
      id: deadlineId,
      artistId // Ensure ownership
    }
  })
}

export async function toggleDeadlineCompletion(deadlineId: string, artistId: string) {
  const deadline = await prisma.deadline.findUnique({
    where: { id: deadlineId, artistId }
  })
  
  if (!deadline) {
    throw new Error('Deadline not found')
  }

  return await prisma.deadline.update({
    where: { id: deadlineId },
    data: { isCompleted: !deadline.isCompleted }
  })
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high':
      return '#ef4444' // red-500
    case 'medium':
      return '#f59e0b' // amber-500
    case 'low':
      return '#10b981' // emerald-500
    default:
      return '#6b7280' // gray-500
  }
}

export function generateICSContent(events: CalendarEvent[], artistName: string): string {
  const now = new Date()
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudioMate//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${artistName}'s Art Deadlines`,
    'X-WR-TIMEZONE:UTC',
    'X-WR-CALDESC:Art opportunity deadlines and custom reminders'
  ]

  events.forEach(event => {
    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@artmatch.app`,
      `DTSTAMP:${formatDate(now)}`,
      `DTSTART:${formatDate(event.start)}`,
      `DTEND:${formatDate(event.end)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `PRIORITY:${event.priority === 'high' ? '1' : event.priority === 'medium' ? '5' : '9'}`,
      `STATUS:${event.isCompleted ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT'
    )
  })

  icsContent.push('END:VCALENDAR')

  return icsContent.join('\r\n')
}