'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

interface ApplicationData {
  id: string
  artistStatement: string
  coverLetter: string
  tips: string[]
  opportunity?: {
    title: string
    organizer: string
    deadline: string
    link: string
  }
}

export default function ApplicationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [application, setApplication] = useState<ApplicationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (params.id === 'new') {
      // Handle new application generation
      const opportunityId = new URLSearchParams(window.location.search).get('opportunityId')
      if (opportunityId) {
        generateApplication(opportunityId)
      } else {
        router.push('/dashboard')
      }
    } else {
      // Load existing application
      fetchApplication(params.id as string)
    }
  }, [session, router, params.id])

  const generateApplication = async (opportunityId: string) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opportunityId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate application')
      }

      const data = await response.json()
      setApplication(data.application)
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate application. Please try again.')
    } finally {
      setIsGenerating(false)
      setIsLoading(false)
    }
  }

  const fetchApplication = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`)
      if (response.ok) {
        const data = await response.json()
        setApplication(data.application)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || isGenerating) {
    return (
      <div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isGenerating ? 'Generating your application...' : 'Loading application...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generated Application</h1>
              {application.opportunity && (
                <p className="text-gray-600">
                  For: {application.opportunity.title} - {application.opportunity.organizer}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Artist Statement */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Artist Statement</h2>
                <div className="prose prose-sm max-w-none">
                  <textarea
                    value={application.artistStatement}
                    onChange={(e) => setApplication({
                      ...application,
                      artistStatement: e.target.value
                    })}
                    className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your artist statement..."
                  />
                </div>
              </div>

              {/* Cover Letter */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cover Letter</h2>
                <div className="prose prose-sm max-w-none">
                  <textarea
                    value={application.coverLetter}
                    onChange={(e) => setApplication({
                      ...application,
                      coverLetter: e.target.value
                    })}
                    className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your cover letter..."
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Tips */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {application.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                    Save Draft
                  </button>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                    Copy to Clipboard
                  </button>
                  <button className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">
                    Export as PDF
                  </button>
                  {application.opportunity?.link && (
                    <a
                      href={application.opportunity.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 text-center"
                    >
                      Apply Now
                    </a>
                  )}
                </div>
              </div>

              {/* Opportunity Details */}
              {application.opportunity && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunity Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Organizer</p>
                      <p className="font-medium">{application.opportunity.organizer}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Deadline</p>
                      <p className="font-medium">
                        {new Date(application.opportunity.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}