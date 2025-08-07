'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import SuccessMessage from '@/components/SuccessMessage'

interface ProfileData {
  bio: string
  location: string
  website: string
  instagramHandle: string
  careerStage: string
  artisticFocus: string
  interestedRegions: string
}

export default function ProfileSetup() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: '',
    location: '',
    website: '',
    instagramHandle: '',
    careerStage: '',
    artisticFocus: '',
    interestedRegions: ''
  })

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          artisticFocus: profileData.artisticFocus.split(',').map(s => s.trim()).join(','),
          interestedRegions: profileData.interestedRegions.split(',').map(s => s.trim()).join(',')
        }),
      })

      if (response.ok) {
        setSuccess('Profile created successfully! Redirecting to dashboard...')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create profile. Please try again.')
      }
    } catch (error) {
      console.error('Profile creation error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Artist Profile</h1>
            <p className="text-gray-600">Help us match you with the perfect opportunities</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Step {step} of 3</span>
              <span className="text-sm text-gray-600">{Math.round((step / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
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
                className="mb-6"
              />
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself as an artist..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Sydney, NSW"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram Handle (Optional)
                  </label>
                  <input
                    type="text"
                    value={profileData.instagramHandle}
                    onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={nextStep}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Next Step'
                  )}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Artistic Focus</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Career Stage
                  </label>
                  <select
                    value={profileData.careerStage}
                    onChange={(e) => handleInputChange('careerStage', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select your career stage</option>
                    <option value="emerging">Emerging Artist</option>
                    <option value="early-career">Early Career</option>
                    <option value="mid-career">Mid-Career</option>
                    <option value="established">Established Artist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artistic Focus
                  </label>
                  <textarea
                    value={profileData.artisticFocus}
                    onChange={(e) => handleInputChange('artisticFocus', e.target.value)}
                    placeholder="e.g., painting, sculpture, digital art, photography (separate with commas)"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate multiple mediums with commas</p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Opportunity Preferences</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interested Regions
                  </label>
                  <textarea
                    value={profileData.interestedRegions}
                    onChange={(e) => handleInputChange('interestedRegions', e.target.value)}
                    placeholder="e.g., Australia, International, Victoria, NSW (separate with commas)"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate multiple regions with commas</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-900 mb-2">What&apos;s Next?</h3>
                  <p className="text-blue-700 text-sm">
                    Once you complete your profile, our AI will start matching you with relevant opportunities 
                    based on your artistic focus, career stage, and location preferences.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating Profile...
                      </>
                    ) : (
                      'Complete Profile'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}