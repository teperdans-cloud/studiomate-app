'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ArtworkUpload from '@/components/ArtworkUpload'
import ArtworkGallery from '@/components/ArtworkGallery'
import ArtworkCollections from '@/components/ArtworkCollections'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

interface Artwork {
  id: string
  title: string
  description?: string
  medium?: string
  year?: number
  imageUrl?: string
  tags?: string
  createdAt: string
}

export default function PortfolioPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'collections'>('gallery')

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchArtworks()
  }, [session, router])

  const fetchArtworks = async () => {
    try {
      setError(null)
      const response = await fetch('/api/artworks')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch artworks')
      }

      setArtworks(data.artworks || [])
    } catch (error) {
      console.error('Error fetching artworks:', error)
      setError(error instanceof Error ? error.message : 'Failed to load artworks')
    } finally {
      setLoading(false)
    }
  }

  const handleArtworkUpload = (newArtwork: Artwork) => {
    setArtworks(prev => [newArtwork, ...prev])
    setActiveTab('gallery')
  }


  const handleArtworkDelete = (artworkId: string) => {
    setArtworks(prev => prev.filter(artwork => artwork.id !== artworkId))
  }

  if (loading) {
    return (
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="mt-4 text-gray-600 font-source-sans">Loading your portfolio...</p>
      </div>
    )
  }

  return (
    <div>
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 font-source-sans">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-900">Portfolio</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-crimson font-bold text-gray-900 mb-2">My Portfolio</h1>
          <p className="text-gray-600 font-source-sans">Manage your artwork collection and create stunning presentations</p>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage 
            message={error}
            onRetry={fetchArtworks}
            className="mb-6"
          />
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-organic-lg">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`
                flex-1 py-3 px-4 rounded-organic font-medium transition-all duration-300
                ${activeTab === 'gallery' 
                  ? 'bg-primary text-white shadow-warm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Gallery</span>
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {artworks.length}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('collections')}
              className={`
                flex-1 py-3 px-4 rounded-organic font-medium transition-all duration-300
                ${activeTab === 'collections' 
                  ? 'bg-primary text-white shadow-warm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Collections</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('upload')}
              className={`
                flex-1 py-3 px-4 rounded-organic font-medium transition-all duration-300
                ${activeTab === 'upload' 
                  ? 'bg-primary text-white shadow-warm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'gallery' && (
            <ArtworkGallery 
              artworks={artworks}
              onArtworkDelete={handleArtworkDelete}
            />
          )}
          
          {activeTab === 'collections' && (
            <ArtworkCollections 
              artworks={artworks}
            />
          )}
          
          {activeTab === 'upload' && (
            <ArtworkUpload 
              onUploadComplete={handleArtworkUpload}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="fixed bottom-8 right-8 flex flex-col space-y-3">
          {activeTab !== 'upload' && (
            <button
              onClick={() => setActiveTab('upload')}
              className="w-14 h-14 bg-secondary text-secondary-800 rounded-full shadow-warm hover:shadow-warm-lg transition-all duration-300 flex items-center justify-center hover:scale-110"
              title="Upload New Artwork"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
          
          {activeTab !== 'gallery' && artworks.length > 0 && (
            <button
              onClick={() => setActiveTab('gallery')}
              className="w-14 h-14 bg-primary text-white rounded-full shadow-warm hover:shadow-warm-lg transition-all duration-300 flex items-center justify-center hover:scale-110"
              title="View Gallery"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          
          {activeTab !== 'collections' && artworks.length > 0 && (
            <button
              onClick={() => setActiveTab('collections')}
              className="w-14 h-14 bg-creative text-creative-800 rounded-full shadow-warm hover:shadow-warm-lg transition-all duration-300 flex items-center justify-center hover:scale-110"
              title="Manage Collections"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
          )}
        </div>
    </div>
  )
}