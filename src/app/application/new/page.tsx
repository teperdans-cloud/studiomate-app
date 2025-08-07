'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
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
}

interface Artist {
  id: string
  bio: string | null
  location: string | null
  careerStage: string | null
  artisticFocus: string | null
  interestedRegions: string | null
}

export default function NewApplicationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const opportunityId = searchParams.get('opportunityId')
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!opportunityId) {
      setError('No opportunity selected')
      setLoading(false)
      return
    }

    fetchData()
  }, [session, router, opportunityId])

  const fetchData = async () => {
    try {
      setError(null)
      
      // Fetch opportunity and artist profile in parallel
      const [opportunityResponse, profileResponse] = await Promise.all([
        fetch(`/api/opportunities?id=${opportunityId}`),
        fetch('/api/profile')
      ])

      if (!opportunityResponse.ok) {
        throw new Error('Opportunity not found')
      }
      
      if (!profileResponse.ok) {
        // If profile doesn't exist, redirect to setup
        router.push('/profile/setup')
        return
      }

      const opportunityData = await opportunityResponse.json()
      const profileData = await profileResponse.json()

      setOpportunity(opportunityData.opportunity)
      setArtist(profileData.artist)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateApplication = async () => {
    if (!opportunity || !artist) return

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          artistId: artist.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate application')
      }

      // Redirect to the generated application
      router.push(`/application/${data.applicationId}`)
    } catch (error) {
      console.error('Error generating application:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate application')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="mt-4 text-gray-600 font-source-sans">Loading opportunity details...</p>
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
            title="Application Generation Error"
            message={error}
            onRetry={() => window.location.reload()}
            className="max-w-md mx-auto"
          />
          <div className="text-center mt-6">
            <Link href="/opportunities" className="btn-secondary">
              Back to Opportunities
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-crimson font-bold text-gray-900 mb-4">Opportunity Not Found</h1>
            <Link href="/opportunities" className="btn-primary">
              Browse Opportunities
            </Link>
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
          <Link href="/opportunities" className="hover:text-primary transition-colors">Opportunities</Link>
          <span>/</span>
          <span className="text-gray-900">Generate Application</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-crimson font-bold text-gray-900 mb-2">Generate Application</h1>
            <p className="text-gray-600 font-source-sans">
              Review the opportunity details and generate a personalized application
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Opportunity Details */}
            <div className="gallery-card p-6">
              <h2 className="text-xl font-crimson font-semibold text-gray-900 mb-4">Opportunity Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-crimson font-medium text-gray-900">{opportunity.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded font-source-sans">{opportunity.type}</span>
                    <span className="font-source-sans">{opportunity.location}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-source-sans"><strong>Organizer:</strong> {opportunity.organizer}</p>
                  <p className="text-sm text-gray-600 font-source-sans"><strong>Deadline:</strong> {new Date(opportunity.deadline).toLocaleDateString()}</p>
                  {opportunity.fee && (
                    <p className="text-sm text-gray-600 font-source-sans"><strong>Application Fee:</strong> {opportunity.fee}</p>
                  )}
                  {opportunity.prize && (
                    <p className="text-sm text-gray-600 font-source-sans"><strong>Prize/Award:</strong> {opportunity.prize}</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 font-source-sans">Description</h4>
                  <p className="text-sm text-gray-600 font-source-sans">{opportunity.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 font-source-sans">Eligibility</h4>
                  <p className="text-sm text-gray-600 font-source-sans">{opportunity.eligibility}</p>
                </div>

                {opportunity.artTypes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 font-source-sans">Art Types</h4>
                    <p className="text-sm text-gray-600 font-source-sans">{opportunity.artTypes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Artist Profile Summary */}
            <div className="gallery-card p-6">
              <h2 className="text-xl font-crimson font-semibold text-gray-900 mb-4">Your Profile</h2>
              
              {artist ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 font-source-sans"><strong>Location:</strong> {artist.location || 'Not specified'}</p>
                    <p className="text-sm text-gray-600 font-source-sans"><strong>Career Stage:</strong> {artist.careerStage || 'Not specified'}</p>
                    <p className="text-sm text-gray-600 font-source-sans"><strong>Artistic Focus:</strong> {artist.artisticFocus || 'Not specified'}</p>
                    <p className="text-sm text-gray-600 font-source-sans"><strong>Interested Regions:</strong> {artist.interestedRegions || 'Not specified'}</p>
                  </div>

                  {artist.bio && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 font-source-sans">Bio</h4>
                      <p className="text-sm text-gray-600 font-source-sans">{artist.bio}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <button
                      onClick={handleGenerateApplication}
                      disabled={generating}
                      className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Generating Application...
                        </>
                      ) : (
                        'Generate AI Application'
                      )}
                    </button>
                    
                    <p className="text-xs text-gray-500 mt-2 text-center font-source-sans">
                      This will create a personalized artist statement and cover letter based on your profile and portfolio
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4 font-source-sans">Complete your profile to generate applications</p>
                  <Link href="/profile/setup" className="btn-primary">
                    Complete Profile
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/opportunities"
              className="text-gray-600 hover:text-primary transition-colors font-source-sans"
            >
              ← Back to Opportunities
            </Link>
            
            <Link
              href="/portfolio"
              className="text-primary hover:text-primary-600 transition-colors font-source-sans"
            >
              Manage Portfolio →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}