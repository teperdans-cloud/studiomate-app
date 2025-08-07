'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string
  type: 'deadline' | 'reminder' | 'event'
  opportunityId?: string
  status: 'upcoming' | 'overdue' | 'completed'
  reminderEnabled: boolean
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const fetchEvents = async () => {
      try {
        setError(null)
        const response = await fetch('/api/calendar')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch calendar events')
        }
        
        setEvents(data.events || [])
      } catch (error) {
        console.error('Error fetching calendar events:', error)
        setError(error instanceof Error ? error.message : 'Failed to load calendar')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [session, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200'
      case 'upcoming': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="mt-4 text-gray-600 font-source-sans">Loading your calendar...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage 
            title="Calendar Error"
            message={error}
            onRetry={() => window.location.reload()}
            className="max-w-md mx-auto"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 font-source-sans">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-900">Calendar</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-crimson font-bold text-gray-900 mb-2">Calendar & Deadlines</h1>
              <p className="text-gray-600 font-source-sans">Manage your application deadlines and reminders</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-organic p-1">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded-organic text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'month' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-organic text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>
              <Link
                href="/calendar/new"
                className="btn-primary"
              >
                Add Deadline
              </Link>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-organic flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-crimson font-semibold text-gray-900 mb-2">No Events Scheduled</h2>
            <p className="text-gray-600 font-source-sans mb-6">
              Start by adding application deadlines to stay organized
            </p>
            <Link href="/calendar/new" className="btn-primary">
              Add Your First Deadline
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Events List */}
            <div className="gallery-card p-6">
              <h2 className="text-xl font-crimson font-semibold text-gray-900 mb-4">
                Upcoming Events ({events.filter(e => e.status === 'upcoming').length})
              </h2>
              <div className="space-y-3">
                {events
                  .filter(e => e.status === 'upcoming')
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <div key={event.id} className={`p-4 rounded-lg border ${getStatusColor(event.status)} hover:shadow-md transition-all duration-300 cursor-pointer group`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold font-crimson group-hover:text-primary transition-colors duration-300">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm opacity-75 mt-1 font-source-sans">{event.description}</p>
                          )}
                          <p className="text-xs mt-2 font-source-sans">
                            {formatDate(event.date)}
                          </p>
                          {event.opportunityId && (
                            <div className="mt-2">
                              <Link
                                href={`/opportunities/${event.opportunityId}`}
                                className="text-xs text-primary hover:text-primary-600 font-medium transition-colors duration-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Opportunity →
                              </Link>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {event.reminderEnabled && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-source-sans">
                              Reminder On
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded font-source-sans capitalize ${
                            event.type === 'deadline' ? 'bg-red-100 text-red-800' :
                            event.type === 'reminder' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {events.filter(e => e.status === 'upcoming').length === 0 && (
                  <p className="text-gray-500 text-center py-4 font-source-sans">
                    No upcoming events
                  </p>
                )}
              </div>
              
              {events.filter(e => e.status === 'upcoming').length > 5 && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setViewMode('list')}
                    className="text-primary hover:text-primary-600 font-medium text-sm transition-colors duration-200"
                  >
                    View All Events →
                  </button>
                </div>
              )}
            </div>

            {/* Overdue Events */}
            {events.filter(e => e.status === 'overdue').length > 0 && (
              <div className="gallery-card p-6 border-l-4 border-red-500">
                <h2 className="text-xl font-crimson font-semibold text-red-900 mb-4">
                  Overdue ({events.filter(e => e.status === 'overdue').length})
                </h2>
                <div className="space-y-3">
                  {events
                    .filter(e => e.status === 'overdue')
                    .map((event) => (
                      <div key={event.id} className={`p-4 rounded-lg border ${getStatusColor(event.status)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold font-crimson">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm opacity-75 mt-1 font-source-sans">{event.description}</p>
                            )}
                            <p className="text-xs mt-2 font-source-sans">
                              Due: {formatDate(event.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="gallery-card p-6">
              <h2 className="text-xl font-crimson font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/calendar/export"
                  className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-blue-900 font-source-sans">Export Calendar</p>
                    <p className="text-xs text-blue-600 font-source-sans">Download as ICS file</p>
                  </div>
                </Link>
                
                <Link
                  href="/calendar/sync"
                  className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <div>
                    <p className="font-medium text-green-900 font-source-sans">Sync with Google</p>
                    <p className="text-xs text-green-600 font-source-sans">Connect Google Calendar</p>
                  </div>
                </Link>
                
                <Link
                  href="/calendar/settings"
                  className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-7.5 7.5H7.5a7.5 7.5 0 01-7.5-7.5v-5h5l-5-5 5-5h-5v5a7.5 7.5 0 017.5-7.5h5a7.5 7.5 0 017.5 7.5v5z" />
                  </svg>
                  <div>
                    <p className="font-medium text-purple-900 font-source-sans">Notification Settings</p>
                    <p className="text-xs text-purple-600 font-source-sans">Manage reminders</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}