'use client'

import { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import FormInput from './FormInput'
import FormSelect from './FormSelect'
import LoadingSpinner from './LoadingSpinner'
import SuccessMessage from './SuccessMessage'
import ErrorMessage from './ErrorMessage'

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

interface ArtworkUploadProps {
  onUploadComplete: (artwork: Artwork) => void
  className?: string
}

export default function ArtworkUpload({ onUploadComplete, className = '' }: ArtworkUploadProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    medium: '',
    year: new Date().getFullYear(),
    tags: '',
    imageUrl: ''
  })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mediumOptions = [
    { value: 'painting', label: 'Painting' },
    { value: 'sculpture', label: 'Sculpture' },
    { value: 'photography', label: 'Photography' },
    { value: 'digital', label: 'Digital Art' },
    { value: 'mixed-media', label: 'Mixed Media' },
    { value: 'drawing', label: 'Drawing' },
    { value: 'printmaking', label: 'Printmaking' },
    { value: 'installation', label: 'Installation' },
    { value: 'performance', label: 'Performance' },
    { value: 'video', label: 'Video Art' },
    { value: 'textile', label: 'Textile Art' },
    { value: 'ceramics', label: 'Ceramics' },
    { value: 'other', label: 'Other' }
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      simulateFileUpload(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false)
  })

  const simulateFileUpload = (file: File) => {
    setUploading(true)
    setUploadProgress(0)
    setError(null)
    setIsDragOver(false)

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          // Simulate completing upload
          setTimeout(() => {
            const imageUrl = URL.createObjectURL(file)
            setFormData(prev => ({ ...prev, imageUrl }))
            setUploading(false)
            setUploadProgress(100)
            setSuccess('Image uploaded successfully!')
            setTimeout(() => setSuccess(null), 3000)
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.imageUrl) {
      setError('Please upload an image')
      return
    }

    try {
      setUploading(true)
      
      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          medium: formData.medium,
          year: formData.year,
          tags: formData.tags,
          imageUrl: formData.imageUrl
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save artwork')
      }

      setSuccess('Artwork added to portfolio successfully!')
      onUploadComplete(data.artwork)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        medium: '',
        year: new Date().getFullYear(),
        tags: '',
        imageUrl: ''
      })
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save artwork')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`gallery-card p-6 ${className}`}>
      <h2 className="text-xl font-crimson font-semibold text-gray-900 mb-6">Add New Artwork</h2>
      
      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} className="mb-4" />
      )}
      
      {success && (
        <SuccessMessage message={success} onClose={() => setSuccess(null)} className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Zone */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 font-source-sans">
            Artwork Image <span className="text-accent ml-1">*</span>
          </label>
          
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-organic-lg p-8 text-center cursor-pointer transition-all duration-300
              ${isDragActive || isDragOver 
                ? 'border-secondary-400 bg-secondary-50' 
                : 'border-secondary-200 bg-secondary-50 hover:border-secondary-300 hover:bg-secondary-100'
              }
            `}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            
            {formData.imageUrl ? (
              <div className="space-y-4">
                <Image 
                  src={formData.imageUrl} 
                  alt="Artwork preview" 
                  width={192}
                  height={192}
                  className="max-h-48 mx-auto rounded-organic shadow-warm"
                />
                <p className="text-sm text-gray-600 font-source-sans">Click or drag to replace image</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-secondary-200 rounded-organic flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-source-sans text-gray-700">
                    {isDragActive ? 'Drop your image here' : 'Drag & drop an image, or click to select'}
                  </p>
                  <p className="text-sm text-gray-500 font-source-sans mt-2">
                    JPG, PNG, GIF, or WebP up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-source-sans">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-primary font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-primary-100 rounded-organic h-2">
                <div 
                  className="bg-primary h-2 rounded-organic transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormInput
            label="Title"
            value={formData.title}
            onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
            required
            placeholder="Enter artwork title"
          />
          
          <FormSelect
            label="Medium"
            value={formData.medium}
            onChange={(value) => setFormData(prev => ({ ...prev, medium: value }))}
            options={mediumOptions}
            placeholder="Select medium"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormInput
            label="Year"
            type="text"
            value={formData.year.toString()}
            onChange={(value) => setFormData(prev => ({ ...prev, year: parseInt(value) || new Date().getFullYear() }))}
            placeholder="Enter year created"
          />
          
          <FormInput
            label="Tags"
            value={formData.tags}
            onChange={(value) => setFormData(prev => ({ ...prev, tags: value }))}
            placeholder="landscape, oil, abstract (comma separated)"
            description="Add tags to help organize your artwork"
          />
        </div>

        <FormInput
          label="Description"
          type="textarea"
          value={formData.description}
          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Describe your artwork, inspiration, or techniques used..."
          rows={4}
        />

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                medium: '',
                year: new Date().getFullYear(),
                tags: '',
                imageUrl: ''
              })
              setError(null)
              setSuccess(null)
            }}
            className="px-6 py-3 border border-gray-300 rounded-organic text-gray-700 hover:bg-gray-50 transition-all duration-300"
            disabled={uploading}
          >
            Clear
          </button>
          
          <button
            type="submit"
            disabled={uploading || !formData.title.trim() || !formData.imageUrl}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add to Portfolio</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}