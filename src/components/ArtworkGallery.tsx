'use client'

import { useState } from 'react'
import Image from 'next/image'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import SuccessMessage from './SuccessMessage'

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

interface ArtworkGalleryProps {
  artworks: Artwork[]
  onArtworkDelete: (artworkId: string) => void
  className?: string
}

export default function ArtworkGallery({ 
  artworks, 
  onArtworkDelete, 
  className = '' 
}: ArtworkGalleryProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string>('')
  const [filterMedium, setFilterMedium] = useState<string>('')

  // Get unique tags and mediums for filtering
  const allTags = Array.from(new Set(
    artworks.flatMap(artwork => 
      artwork.tags ? artwork.tags.split(',').map(tag => tag.trim()) : []
    )
  )).filter(Boolean)

  const allMediums = Array.from(new Set(
    artworks.map(artwork => artwork.medium).filter(Boolean)
  ))

  // Filter artworks
  const filteredArtworks = artworks.filter(artwork => {
    const matchesTag = !filterTag || (artwork.tags && artwork.tags.includes(filterTag))
    const matchesMedium = !filterMedium || artwork.medium === filterMedium
    return matchesTag && matchesMedium
  })

  // Get Mediterranean color for medium
  const getMediumColor = (medium?: string) => {
    if (!medium) return 'bg-gray-100 text-gray-700'
    
    const colors = {
      'painting': 'bg-primary-100 text-primary-800',
      'sculpture': 'bg-secondary-100 text-secondary-800',
      'photography': 'bg-accent-100 text-accent-800',
      'digital': 'bg-success-100 text-success-800',
      'mixed-media': 'bg-creative-100 text-creative-800',
      'drawing': 'bg-primary-100 text-primary-700',
      'printmaking': 'bg-secondary-100 text-secondary-700',
      'installation': 'bg-accent-100 text-accent-700',
      'performance': 'bg-success-100 text-success-700',
      'video': 'bg-creative-100 text-creative-700',
      'textile': 'bg-primary-100 text-primary-600',
      'ceramics': 'bg-secondary-100 text-secondary-600',
      'other': 'bg-gray-100 text-gray-700'
    }
    
    return colors[medium as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const handleDelete = async (artworkId: string) => {
    if (!confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/artworks?id=${artworkId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete artwork')
      }

      setSuccess('Artwork deleted successfully!')
      onArtworkDelete(artworkId)
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete artwork')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-crimson font-semibold text-gray-900">
          Your Gallery ({filteredArtworks.length})
        </h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filterMedium}
            onChange={(e) => setFilterMedium(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-organic text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Mediums</option>
            {allMediums.map(medium => (
              <option key={medium} value={medium}>{medium}</option>
            ))}
          </select>
          
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-organic text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} className="mb-4" />
      )}
      
      {success && (
        <SuccessMessage message={success} onClose={() => setSuccess(null)} className="mb-4" />
      )}

      {/* Gallery Grid */}
      {filteredArtworks.length === 0 ? (
        <div className="gallery-card p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-crimson font-semibold text-gray-900 mb-2">
            {artworks.length === 0 ? 'No Artworks Yet' : 'No Matching Artworks'}
          </h3>
          <p className="text-gray-600 font-source-sans">
            {artworks.length === 0 
              ? 'Upload your first artwork to get started building your portfolio.'
              : 'Try adjusting your filters to see more artworks.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtworks.map((artwork) => (
            <div 
              key={artwork.id} 
              className="gallery-card overflow-hidden group hover:shadow-gallery-hover"
              style={{
                // Add subtle height variation for masonry-like effect
                height: `${300 + (artwork.id.length % 3) * 50}px`
              }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {artwork.imageUrl ? (
                  <Image 
                    src={artwork.imageUrl} 
                    alt={artwork.title}
                    width={300}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Medium Badge */}
                {artwork.medium && (
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMediumColor(artwork.medium)}`}>
                      {artwork.medium}
                    </span>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setSelectedArtwork(artwork)}
                      className="p-2 bg-neutral/80 text-white rounded-organic hover:bg-neutral/90 transition-colors"
                      title="View Details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(artwork.id)}
                      disabled={loading}
                      className="p-2 bg-accent/80 text-white rounded-organic hover:bg-accent transition-colors disabled:opacity-50"
                      title="Delete Artwork"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" className="w-4 h-4" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-crimson font-semibold text-gray-900 mb-2 line-clamp-2">
                  {artwork.title}
                </h3>
                
                {artwork.year && (
                  <p className="text-sm text-gray-500 font-source-sans mb-2">
                    {artwork.year}
                  </p>
                )}
                
                {artwork.description && (
                  <p className="text-sm text-gray-600 font-source-sans mb-3 line-clamp-3 flex-1">
                    {artwork.description}
                  </p>
                )}
                
                {/* Tags */}
                {artwork.tags && (
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {artwork.tags.split(',').map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-creative-100 text-creative-800 rounded text-xs font-medium"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for artwork details */}
      {selectedArtwork && (
        <div className="overlay-frost flex items-center justify-center p-4 z-50">
          <div className="bg-base-100 rounded-organic-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-crimson font-semibold text-gray-900">
                  {selectedArtwork.title}
                </h3>
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="p-2 hover:bg-gray-100 rounded-organic transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {selectedArtwork.imageUrl ? (
                    <Image 
                      src={selectedArtwork.imageUrl} 
                      alt={selectedArtwork.title}
                      width={400}
                      height={300}
                      className="w-full rounded-organic shadow-warm"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-organic flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 font-source-sans">Medium</h4>
                    {selectedArtwork.medium && (
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getMediumColor(selectedArtwork.medium)}`}>
                        {selectedArtwork.medium}
                      </span>
                    )}
                  </div>
                  
                  {selectedArtwork.year && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 font-source-sans">Year</h4>
                      <p className="text-gray-900 font-source-sans">{selectedArtwork.year}</p>
                    </div>
                  )}
                  
                  {selectedArtwork.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 font-source-sans">Description</h4>
                      <p className="text-gray-900 font-source-sans">{selectedArtwork.description}</p>
                    </div>
                  )}
                  
                  {selectedArtwork.tags && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 font-source-sans">Tags</h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedArtwork.tags.split(',').map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-creative-100 text-creative-800 rounded text-sm font-medium"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => handleDelete(selectedArtwork.id)}
                      disabled={loading}
                      className="btn-accent flex items-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}