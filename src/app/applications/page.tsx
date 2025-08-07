'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import SuccessMessage from '@/components/SuccessMessage'

interface Application {
  id: string
  status: string
  artistStatement: string
  coverLetter: string
  createdAt: string
  updatedAt: string
  opportunity: {
    id: string
    title: string
    organizer: string
    deadline: string
    type: string
    location: string
  }
}

export default function ApplicationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchApplications()
  }, [session, router])

  const fetchApplications = async () => {
    try {
      setError(null)
      const response = await fetch('/api/applications')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications')
      }

      setApplications(data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError(error instanceof Error ? error.message : 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/applications?id=${applicationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete application')
      }

      setSuccess('Application deleted successfully')
      setApplications(applications.filter(app => app.id !== applicationId))
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Error deleting application:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete application')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-primary-100 text-primary-800'
      case 'accepted':
        return 'bg-success-100 text-success-800'
      case 'rejected':
        return 'bg-accent-100 text-accent-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="mt-4 text-gray-600 font-source-sans">Loading your applications...</p>
          </div>
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
          <span className="text-gray-900">Applications</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-crimson font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 font-source-sans">Manage your generated applications and track their status</p>
          </div>
          <Link 
            href="/dashboard" 
            className="btn-primary"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <ErrorMessage 
            message={error}
            onRetry={() => setError(null)}
            className="mb-6"
          />
        )}

        {success && (
          <SuccessMessage 
            message={success}
            onClose={() => setSuccess(null)}
            className="mb-6"
          />
        )}

        {applications.length === 0 ? (
          <div className="gallery-card p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-crimson font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-4 font-source-sans">
              You haven&apos;t generated any applications yet. Start by exploring opportunities and generating your first application.
            </p>
            <Link 
              href="/dashboard"
              className="btn-primary inline-block"
            >
              Browse Opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.id} className="gallery-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-crimson font-semibold text-gray-900">
                        {application.opportunity.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 font-source-sans">
                      <p><strong>Organizer:</strong> {application.opportunity.organizer}</p>
                      <p><strong>Type:</strong> {application.opportunity.type}</p>
                      <p><strong>Location:</strong> {application.opportunity.location}</p>
                      <p><strong>Deadline:</strong> {new Date(application.opportunity.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 font-source-sans">
                    <p>Created: {new Date(application.createdAt).toLocaleDateString()}</p>
                    {application.updatedAt !== application.createdAt && (
                      <p>Updated: {new Date(application.updatedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 font-source-sans">Artist Statement</h4>
                      <p className="text-sm text-gray-600 line-clamp-3 font-source-sans">
                        {application.artistStatement?.substring(0, 200) || 'No artist statement'}...
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 font-source-sans">Cover Letter</h4>
                      <p className="text-sm text-gray-600 line-clamp-3 font-source-sans">
                        {application.coverLetter?.substring(0, 200) || 'No cover letter'}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Link
                        href={`/application/${application.id}`}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        View & Edit
                      </Link>
                      <button
                        onClick={() => navigator.clipboard.writeText(application.artistStatement + '\n\n' + application.coverLetter)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-organic hover:bg-gray-700 transition-colors duration-300 text-sm"
                      >
                        Copy Text
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      {application.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(application.id)}
                          className="bg-accent text-white px-4 py-2 rounded-organic hover:bg-accent-600 transition-colors duration-300 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}