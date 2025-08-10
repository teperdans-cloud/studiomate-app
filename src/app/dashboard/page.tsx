'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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

// interface Opportunity {
//   id: string
//   title: string
//   description: string
//   organizer: string
//   location: string
//   type: string
//   deadline: string
//   link: string
//   eligibility: string
//   artTypes: string
//   prize: string
//   matchScore?: number
//   matchReasons?: string[]
// }

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [artist, setArtist] = useState<Artist | null>(null)
  // const [opportunities, setOpportunities] = useState<Opportunity[]>([])
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
        
        // setOpportunities(matchesData.matches || [])
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
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="mt-4 text-gray-600 font-source-sans">Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Dashboard Error"
        message={error}
        onRetry={() => window.location.reload()}
        className="max-w-md mx-auto"
      />
    )
  }

  if (!artist) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-crimson font-bold text-gray-900 mb-4">Complete Your Profile</h1>
        <p className="text-gray-600 mb-6 font-source-sans">Please complete your artist profile to access your dashboard.</p>
        <Link href="/profile/setup" className="btn-primary inline-block">
          Complete Profile
        </Link>
      </div>
    )
  }

  return (
    <div>
        {/* Hero section with logo */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image
              src="/logos/artmatch-full-logo.png"
              alt="StudioMate logo"
              width={120}
              height={120}
              className="mx-auto w-24 h-24 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-crimson font-bold text-neutral mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Artist'}
          </h1>
          <p className="text-gray-600 font-source-sans text-lg">Here&apos;s what&apos;s happening in your creative workspace today.</p>
        </div>

        {/* Two-column grid matching screenshot */}
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Left: Upcoming Deadlines */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-crimson font-bold text-neutral">Upcoming Deadlines</h2>
              <Link href="/opportunities" className="text-primary hover:text-primary-focus font-source-sans transition-colors duration-300">
                View All →
              </Link>
            </div>

            <div className="space-y-4">
              {/* Mock deadline items matching screenshot */}
              <div className="card-soft p-4 deadline-urgent">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-crimson font-semibold text-lg text-neutral mb-1">Sydney Contemporary Art Prize</h3>
                    <p className="text-gray-600 font-source-sans">Entry deadline approaching</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-error rounded deadline-pill">2 days</span>
                    <p className="text-sm text-gray-500 mt-1">Mar 15</p>
                  </div>
                </div>
              </div>

              <div className="card-soft p-4 deadline-soon">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-crimson font-semibold text-lg text-neutral mb-1">Melbourne Gallery Submission</h3>
                    <p className="text-gray-600 font-source-sans">Portfolio review deadline</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-warning rounded deadline-pill">1 week</span>
                    <p className="text-sm text-gray-500 mt-1">Mar 22</p>
                  </div>
                </div>
              </div>

              <div className="card-soft p-4 deadline-later">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-crimson font-semibold text-lg text-neutral mb-1">Arts Council Grant</h3>
                    <p className="text-gray-600 font-source-sans">Funding application deadline</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-success rounded deadline-pill">3 weeks</span>
                    <p className="text-sm text-gray-500 mt-1">Apr 5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Active Applications + Recent Activity */}
          <div className="space-y-6">
            {/* Active Applications Card */}
            <div className="card-soft p-6 text-center">
              <h3 className="font-crimson font-semibold text-lg text-neutral mb-2">Active Applications</h3>
              <div className="text-6xl font-bold text-primary mb-2">12</div>
            </div>

            {/* Recent Activity */}
            <div className="card-soft p-6">
              <h3 className="font-crimson font-semibold text-lg text-neutral mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-source-sans text-neutral font-medium">Application submitted</p>
                    <p className="text-sm text-gray-500 font-source-sans">Modern Art Gallery • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-source-sans text-neutral font-medium">3 artworks uploaded</p>
                    <p className="text-sm text-gray-500 font-source-sans">Portfolio update • 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-source-sans text-neutral font-medium">Profile updated</p>
                    <p className="text-sm text-gray-500 font-source-sans">Career stage changed • 3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}