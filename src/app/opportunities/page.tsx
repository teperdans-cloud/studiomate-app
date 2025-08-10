'use client'

import { useEffect, useState } from 'react'
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
  prize: string
  link: string
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setError(null)
        const response = await fetch('/api/opportunities')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch opportunities')
        }

        setOpportunities(data.opportunities || [])
      } catch (error) {
        console.error('Error fetching opportunities:', error)
        setError(error instanceof Error ? error.message : 'Failed to load opportunities')
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [])

  if (loading) {
    return (
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="mt-4 text-gray-600 font-source-sans">Loading opportunities...</p>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Failed to Load Opportunities"
        message={error}
        onRetry={() => window.location.reload()}
        className="max-w-md mx-auto"
      />
    )
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 font-source-sans">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Opportunities</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-crimson font-bold text-gray-900">Art Opportunities</h1>
          <p className="text-gray-600 font-source-sans">Discover grants, residencies, and exhibitions for Australian artists</p>
        </div>
        <Link 
          href="/" 
          className="btn-primary"
        >
          Back to Home
        </Link>
      </div>

      <div className="grid gap-6">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="gallery-card p-6 hover:shadow-gallery-hover transition-all duration-300 group">
            <Link href={`/opportunities/${opportunity.id}`} className="block">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-crimson font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">{opportunity.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded font-source-sans">{opportunity.type}</span>
                    <span className="font-source-sans">{opportunity.location}</span>
                    <span className="font-source-sans">{opportunity.organizer}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-source-sans">Deadline</p>
                  <p className="font-semibold text-gray-900 font-source-sans">
                    {new Date(opportunity.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 font-source-sans line-clamp-3">{opportunity.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  {opportunity.prize && (
                    <span className="text-success font-semibold font-source-sans">Prize: {opportunity.prize}</span>
                  )}
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-primary font-medium text-sm font-source-sans">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
            
            {/* Action buttons - prevent event bubbling */}
            <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
              <Link
                href={`/application/new?opportunityId=${opportunity.id}`}
                className="btn-primary text-sm px-4 py-2"
              >
                Generate Application
              </Link>
              {opportunity.link && (
                <a
                  href={opportunity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-sm px-4 py-2"
                >
                  Official Details
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}