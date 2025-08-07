'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { getMatchDescription, getMatchColor } from '@/lib/matching'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

interface Artist {
  id: string
  bio: string
  location: string
  website: string
  instagramHandle: string
  careerStage: string
  artisticFocus: string
  interestedRegions: string
}

interface Opportunity {
  id: string
  title: string
  description: string
  organizer: string
  location: string
  type: string
  deadline: string
  link: string
  eligibility: string
  artTypes: string
  fee: string
  prize: string
  matchScore?: number
  matchReasons?: string[]
}

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const fetchData = async () => {
      try {
        setError(null)
        
        // Fetch artist profile
        const profileResponse = await fetch('/api/profile')
        const profileData = await profileResponse.json()
        
        if (!profileResponse.ok) {
          throw new Error(profileData.error || 'Failed to fetch profile')
        }
        
        if (!profileData.artist) {
          router.push('/profile/setup')
          return
        }
        
        setArtist(profileData.artist)
        
        // Fetch matched opportunities using AI algorithm
        const matchesResponse = await fetch('/api/matches')
        const matchesData = await matchesResponse.json()
        
        if (!matchesResponse.ok) {
          throw new Error(matchesData.error || 'Failed to fetch matches')
        }
        
        setOpportunities(matchesData.matches || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="mt-4 text-gray-600 font-source-sans">Loading your dashboard...</p>
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
            title="Dashboard Error"
            message={error}
            onRetry={() => window.location.reload()}
            className="max-w-md mx-auto"
          />
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-crimson font-bold text-gray-900 mb-4">Complete Your Profile</h1>
            <p className="text-gray-600 mb-6 font-source-sans">Please complete your artist profile to access your dashboard.</p>
            <Link href="/profile/setup" className="btn-primary inline-block">
              Complete Profile
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
        <div className="mb-8">
          <h1 className="text-4xl font-crimson font-bold text-gray-900 mb-2">Welcome back, {session?.user?.name}</h1>
          <p className="text-gray-600 font-source-sans">Your personalized art opportunities dashboard</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Artist Profile Summary */}
          <div className="gallery-card p-6">
            <h2 className="text-xl font-crimson font-semibold text-gray-900 mb-4">Your Profile</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 font-source-sans">Career Stage</p>
                <p className="font-medium capitalize font-source-sans">{artist.careerStage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-source-sans">Location</p>
                <p className="font-medium font-source-sans">{artist.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-source-sans">Artistic Focus</p>
                <p className="font-medium font-source-sans">{artist.artisticFocus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-source-sans">Interested Regions</p>
                <p className="font-medium font-source-sans">{artist.interestedRegions}</p>
              </div>
            </div>
            <Link 
              href="/profile/edit" 
              className="mt-4 block w-full bg-gray-600 text-white text-center py-2 px-4 rounded-organic hover:bg-gray-700 transition-colors duration-300"
            >
              Edit Profile
            </Link>
          </div>

          {/* Opportunities */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-crimson font-semibold text-gray-900">Recommended Opportunities</h2>
              <Link href="/opportunities" className="text-primary hover:text-primary-600 font-source-sans transition-colors duration-300">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {opportunities.slice(0, 5).map((opportunity) => (
                <div key={opportunity.id} className="gallery-card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-crimson font-semibold text-gray-900">{opportunity.title}</h3>
                        {opportunity.matchScore && (
                          <span className={`text-sm font-semibold ${getMatchColor(opportunity.matchScore)}`}>
                            {getMatchDescription(opportunity.matchScore)} ({opportunity.matchScore}%)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded font-source-sans">{opportunity.type}</span>
                        <span className="font-source-sans">{opportunity.location}</span>
                      </div>
                      {opportunity.matchReasons && opportunity.matchReasons.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 font-source-sans">Match reasons:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {opportunity.matchReasons.map((reason, index) => (
                              <span key={index} className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded font-source-sans">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 font-source-sans">Deadline</p>
                      <p className="font-semibold text-gray-900 font-source-sans">
                        {new Date(opportunity.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3 font-source-sans">{opportunity.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      {opportunity.prize && (
                        <span className="text-success-600 font-semibold font-source-sans">Prize: {opportunity.prize}</span>
                      )}
                      {opportunity.fee && (
                        <span className="text-accent font-source-sans">Fee: {opportunity.fee}</span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
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
                          className="bg-gray-600 text-white px-4 py-2 rounded-organic hover:bg-gray-700 transition-colors duration-300 text-sm"
                        >
                          View Details
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}