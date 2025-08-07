'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
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

interface Collection {
  id: string
  name: string
  description?: string
  color: string
  artworks: Artwork[]
  createdAt: string
}

interface ArtworkCollectionsProps {
  artworks: Artwork[]
  className?: string
}

const COLLECTION_COLORS = [
  { name: 'Ocean Blue', bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-800' },
  { name: 'Sunset Peach', bg: 'bg-secondary-50', border: 'border-secondary-200', text: 'text-secondary-800' },
  { name: 'Terracotta Rose', bg: 'bg-accent-50', border: 'border-accent-200', text: 'text-accent-800' },
  { name: 'Soft Mint', bg: 'bg-success-50', border: 'border-success-200', text: 'text-success-800' },
  { name: 'Dusty Purple', bg: 'bg-creative-50', border: 'border-creative-200', text: 'text-creative-800' },
  { name: 'Warm Gray', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' },
]

export default function ArtworkCollections({ artworks, className = '' }: ArtworkCollectionsProps) {
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: '1',
      name: 'Recent Works',
      description: 'My latest artistic creations',
      color: 'primary',
      artworks: artworks.slice(0, 3),
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Landscapes',
      description: 'Nature-inspired pieces',
      color: 'success',
      artworks: artworks.filter(a => a.tags?.includes('landscape')),
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Portraits',
      description: 'Human subjects and character studies',
      color: 'accent',
      artworks: artworks.filter(a => a.tags?.includes('portrait')),
      createdAt: new Date().toISOString()
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    color: 'primary'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const getColorClasses = (color: string) => {
    const colorMap = {
      primary: COLLECTION_COLORS[0],
      secondary: COLLECTION_COLORS[1],
      accent: COLLECTION_COLORS[2],
      success: COLLECTION_COLORS[3],
      creative: COLLECTION_COLORS[4],
      gray: COLLECTION_COLORS[5]
    }
    return colorMap[color as keyof typeof colorMap] || COLLECTION_COLORS[0]
  }

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) {
      setError('Collection name is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const collection: Collection = {
        id: Date.now().toString(),
        name: newCollection.name,
        description: newCollection.description,
        color: newCollection.color,
        artworks: [],
        createdAt: new Date().toISOString()
      }

      setCollections(prev => [...prev, collection])
      setNewCollection({ name: '', description: '', color: 'primary' })
      setShowCreateForm(false)
      setSuccess('Collection created successfully!')
      
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Failed to create collection')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setCollections(prev => prev.filter(col => col.id !== collectionId))
      setSuccess('Collection deleted successfully!')
      
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Failed to delete collection')
    } finally {
      setLoading(false)
    }
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result

    // If dropping in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // Handle moving artworks between collections
    if (source.droppableId !== destination.droppableId) {
      const sourceCollection = collections.find(col => col.id === source.droppableId)
      const destinationCollection = collections.find(col => col.id === destination.droppableId)

      if (sourceCollection && destinationCollection) {
        const sourceArtworks = [...sourceCollection.artworks]
        const destinationArtworks = [...destinationCollection.artworks]
        const [movedArtwork] = sourceArtworks.splice(source.index, 1)
        destinationArtworks.splice(destination.index, 0, movedArtwork)

        setCollections(prev => prev.map(col => {
          if (col.id === source.droppableId) {
            return { ...col, artworks: sourceArtworks }
          }
          if (col.id === destination.droppableId) {
            return { ...col, artworks: destinationArtworks }
          }
          return col
        }))

        setSuccess('Artwork moved successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-crimson font-semibold text-gray-900">Collections</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>New Collection</span>
        </button>
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} className="mb-4" />
      )}
      
      {success && (
        <SuccessMessage message={success} onClose={() => setSuccess(null)} className="mb-4" />
      )}

      {/* Create Collection Form */}
      {showCreateForm && (
        <div className="gallery-card p-6">
          <h3 className="text-lg font-crimson font-semibold text-gray-900 mb-4">Create New Collection</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-source-sans mb-2">
                Collection Name <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={newCollection.name}
                onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                placeholder="Enter collection name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-source-sans mb-2">
                Description
              </label>
              <textarea
                value={newCollection.description}
                onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                className="form-input resize-none"
                rows={3}
                placeholder="Describe this collection..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-source-sans mb-2">
                Color Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COLLECTION_COLORS.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setNewCollection(prev => ({ ...prev, color: Object.keys(getColorClasses(''))[index] || 'primary' }))}
                    className={`
                      p-3 rounded-organic border-2 transition-all duration-300
                      ${color.bg} ${color.border} ${color.text}
                      ${newCollection.color === Object.keys(getColorClasses(''))[index] ? 'ring-2 ring-offset-2 ring-primary' : ''}
                    `}
                  >
                    <div className="text-sm font-medium">{color.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewCollection({ name: '', description: '', color: 'primary' })
                  setError(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-organic text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={loading || !newCollection.name.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Create Collection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => {
            const colorClasses = getColorClasses(collection.color)
            
            return (
              <Droppable key={collection.id} droppableId={collection.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      gallery-card overflow-hidden transition-all duration-300
                      ${snapshot.isDraggingOver ? 'ring-2 ring-primary/50 shadow-gallery-hover' : ''}
                    `}
                  >
                    {/* Collection Header */}
                    <div className={`${colorClasses.bg} ${colorClasses.border} border-b p-4`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`text-lg font-crimson font-semibold ${colorClasses.text}`}>
                            {collection.name}
                          </h3>
                          {collection.description && (
                            <p className={`text-sm mt-1 ${colorClasses.text} opacity-80`}>
                              {collection.description}
                            </p>
                          )}
                          <p className={`text-xs mt-2 ${colorClasses.text} opacity-60`}>
                            {collection.artworks.length} artworks
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCollection(collection.id)}
                          className={`p-1 hover:bg-white/20 rounded transition-colors ${colorClasses.text}`}
                          title="Delete Collection"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Artworks */}
                    <div className="p-4 space-y-3 min-h-[200px]">
                      {collection.artworks.map((artwork, index) => (
                        <Draggable key={artwork.id} draggableId={artwork.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                flex items-center space-x-3 p-3 rounded-organic border border-gray-200 
                                bg-background hover:shadow-warm cursor-move transition-all duration-300
                                ${snapshot.isDragging ? 'shadow-warm-lg rotate-2' : ''}
                              `}
                            >
                              <div className="w-12 h-12 rounded-organic overflow-hidden flex-shrink-0">
                                {artwork.imageUrl ? (
                                  <Image 
                                    src={artwork.imageUrl} 
                                    alt={artwork.title}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 font-source-sans truncate">
                                  {artwork.title}
                                </p>
                                <p className="text-xs text-gray-500 font-source-sans">
                                  {artwork.medium} {artwork.year && `• ${artwork.year}`}
                                </p>
                              </div>
                              
                              <div className="flex-shrink-0">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      
                      {provided.placeholder}
                      
                      {collection.artworks.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p className="text-sm font-source-sans">Drop artworks here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}