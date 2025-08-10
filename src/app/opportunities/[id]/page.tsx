'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

interface Opportunity {
  id: string
  title: string
  description: string
  organizer: string
  location: string
  type: string
  deadline: string
  eligibility: string
  artTypes: string
  fee: string
  prize: string
  link: string
}

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const opportunityId = params.id as string
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOpportunity = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`/api/opportunities?id=${opportunityId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch opportunity')
      }

      setOpportunity(data.opportunity)
    } catch (error) {
      console.error('Error fetching opportunity:', error)
      setError(error instanceof Error ? error.message : 'Failed to load opportunity')
    } finally {
      setLoading(false)
    }
  }, [opportunityId])

  useEffect(() => {
    if (opportunityId) {
      fetchOpportunity()
    }
  }, [opportunityId, fetchOpportunity])

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  if (loading) {
    return (
      <div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="mt-4 text-gray-600 font-source-sans">Loading opportunity details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !opportunity) {
    return (
      <div>
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage 
            title="Opportunity Not Found"
            message={error || 'The requested opportunity could not be found.'}
            onRetry={() => router.push('/opportunities')}
            className="max-w-md mx-auto"
          />
        </div>
      </div>
    )
  }

  const deadlinePassed = isDeadlinePassed(opportunity.deadline)

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 font-source-sans">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/opportunities" className="hover:text-primary transition-colors">Opportunities</Link>
          <span>/</span>
          <span className="text-gray-900">{opportunity.title}</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="gallery-card p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-crimson font-bold text-gray-900 mb-4">{opportunity.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-medium font-source-sans">
                    {opportunity.type}
                  </span>
                  <span className="text-gray-600 font-source-sans">
                    <strong>Organizer:</strong> {opportunity.organizer}
                  </span>
                  <span className="text-gray-600 font-source-sans">
                    <strong>Location:</strong> {opportunity.location}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-semibold ${deadlinePassed ? 'text-red-600' : 'text-gray-900'}`}>
                  {deadlinePassed ? 'DEADLINE PASSED' : 'DEADLINE'}
                </div>
                <div className="text-2xl font-crimson font-bold text-gray-900">
                  {new Date(opportunity.deadline).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600 font-source-sans">
                  {Math.ceil((new Date(opportunity.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                </div>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {opportunity.prize && (
                <div className="bg-success-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-success-800 mb-1 font-source-sans">Prize/Award</h3>
                  <p className="text-success-700 font-semibold font-source-sans">{opportunity.prize}</p>
                </div>
              )}
              
              {opportunity.fee && (
                <div className="bg-accent-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-accent-800 mb-1 font-source-sans">Application Fee</h3>
                  <p className="text-accent-700 font-semibold font-source-sans">{opportunity.fee}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {!deadlinePassed && session && (
                <Link
                  href={`/application/new?opportunityId=${opportunity.id}`}
                  className="btn-primary"
                >
                  Generate AI Application
                </Link>
              )}
              
              {!session && (
                <Link
                  href="/auth/signin"
                  className="btn-primary"
                >
                  Sign In to Apply
                </Link>
              )}
              
              {opportunity.link && (
                <a
                  href={opportunity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  View Official Details
                </a>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="gallery-card p-6">
                <h2 className="text-xl font-crimson font-semibold text-gray-900 mb-4">Description</h2>
                <div className="prose prose-gray max-w-none font-source-sans">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{opportunity.description}</p>
                </div>
              </div>

              {/* Eligibility */}
              <div className="gallery-card p-6">
                <h2 className="text-xl font-crimson font-semibold text-gray-900 mb-4">Eligibility Requirements</h2>
                <div className="prose prose-gray max-w-none font-source-sans">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{opportunity.eligibility}</p>
                </div>
              </div>

              {/* Art Types */}
              {opportunity.artTypes && (
                <div className="gallery-card p-6">
                  <h2 className="text-xl font-crimson font-semibold text-gray-900 mb-4">Accepted Art Types</h2>
                  <p className="text-gray-700 font-source-sans">{opportunity.artTypes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="gallery-card p-6">
                <h3 className="text-lg font-crimson font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {session && (
                    <>
                      <Link
                        href="/portfolio"
                        className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg transition-colors duration-200 font-source-sans"
                      >
                        Review Portfolio
                      </Link>
                      
                      <Link
                        href="/applications"
                        className="block w-full text-center bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg transition-colors duration-200 font-source-sans"
                      >
                        View My Applications
                      </Link>
                      
                      <Link
                        href="/calendar"
                        className="block w-full text-center bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg transition-colors duration-200 font-source-sans"
                      >
                        Add to Calendar
                      </Link>
                    </>
                  )}
                  
                  <Link
                    href="/opportunities"
                    className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg transition-colors duration-200 font-source-sans"
                  >
                    Browse More Opportunities
                  </Link>
                </div>
              </div>

              {/* Deadline Info */}
              <div className="gallery-card p-6">
                <h3 className="text-lg font-crimson font-semibold text-gray-900 mb-4">Important Dates</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-source-sans">Application Deadline:</span>
                    <span className="font-medium text-gray-900 font-source-sans">
                      {new Date(opportunity.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-source-sans">Days Remaining:</span>
                    <span className={`font-medium ${deadlinePassed ? 'text-red-600' : 'text-gray-900'} font-source-sans`}>
                      {deadlinePassed ? 'Expired' : Math.ceil((new Date(opportunity.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="gallery-card p-6">
                <h3 className="text-lg font-crimson font-semibold text-gray-900 mb-4">Application Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600 font-source-sans">
                  <li>• Read all requirements carefully</li>
                  <li>• Prepare your portfolio in advance</li>
                  <li>• Allow time for review and editing</li>
                  <li>• Submit before the deadline</li>
                  <li>• Keep copies of all materials</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/opportunities"
              className="text-gray-600 hover:text-primary transition-colors font-source-sans"
            >
              ← Back to All Opportunities
            </Link>
            
            {!deadlinePassed && session && (
              <Link
                href={`/application/new?opportunityId=${opportunity.id}`}
                className="btn-primary"
              >
                Generate Application →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}