'use client'

import React, { useState } from 'react'
import { User, Palette, Target, FileText, Lightbulb, Save, Loader2 } from 'lucide-react'

interface ProfileData {
  id: string
  userId: string
  name: string
  email: string
  bio?: string
  location?: string
  website?: string
  instagramHandle?: string
  careerStage?: string
  artisticFocus?: string
  interestedRegions?: string
  awards?: string
  cvData?: {
    education: string[]
    experience: string[]
    skills: string[]
    awards: string[]
    exhibitions: string[]
  }
  cvFileName?: string
  cvUploadedAt?: string
  completenessScore?: number
}


export default function ProfileEditor({ initialProfile }: { initialProfile: ProfileData }) {
  const [activeTab, setActiveTab] = useState('basic')
  const [profile, setProfile] = useState(initialProfile)
  const [saving, setSaving] = useState(false)
  const [generateStatement, setGenerateStatement] = useState(false)
  const [selectedFocus, setSelectedFocus] = useState<Set<string>>(
    new Set(profile.artisticFocus?.split(',').filter(Boolean) || [])
  )
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(
    new Set(profile.interestedRegions?.split(',').filter(Boolean) || [])
  )

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'artistic', label: 'Artistic Focus', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: Target },
    { id: 'statement', label: 'Artist Statement', icon: FileText }
  ]

  const artisticFocusOptions = [
    { value: 'painting', label: '🎨 Painting', category: 'Visual Arts' },
    { value: 'sculpture', label: '🗿 Sculpture', category: 'Visual Arts' },
    { value: 'photography', label: '📸 Photography', category: 'Visual Arts' },
    { value: 'drawing', label: '✏️ Drawing', category: 'Visual Arts' },
    { value: 'printmaking', label: '🖨️ Printmaking', category: 'Visual Arts' },
    { value: 'installation', label: '🏗️ Installation', category: 'Contemporary' },
    { value: 'performance', label: '🎭 Performance', category: 'Contemporary' },
    { value: 'video', label: '📹 Video Art', category: 'Digital' },
    { value: 'digital', label: '💻 Digital Art', category: 'Digital' },
    { value: 'ceramics', label: '🏺 Ceramics', category: 'Craft' },
    { value: 'textiles', label: '🧵 Textiles', category: 'Craft' },
    { value: 'jewelry', label: '💎 Jewelry', category: 'Craft' }
  ]

  const regionOptions = [
    { value: 'local', label: 'Local', description: 'Opportunities in your city/region' },
    { value: 'national', label: 'National', description: 'Opportunities across Australia' },
    { value: 'international', label: 'International', description: 'Global opportunities' }
  ]

  const groupedFocusOptions = artisticFocusOptions.reduce((acc, option) => {
    if (!acc[option.category]) acc[option.category] = []
    acc[option.category].push(option)
    return acc
  }, {} as Record<string, typeof artisticFocusOptions>)

  const calculateCompleteness = (profileData: ProfileData): number => {
    let score = 0
    
    // Basic information (40 points)
    if (profileData.name) score += 10
    if (profileData.email) score += 10
    if (profileData.location) score += 10
    if (profileData.website) score += 10
    
    // Artistic details (30 points)
    if (selectedFocus.size > 0) score += 15
    if (profileData.careerStage) score += 10
    if (profileData.bio && profileData.bio.length > 50) score += 5
    
    // CV and experience (20 points)  
    if (profileData.cvData) score += 20
    
    // Preferences (10 points)
    if (selectedRegions.size > 0) score += 5
    if (profileData.instagramHandle) score += 5
    
    return Math.min(score, 100)
  }

  const completenessScore = calculateCompleteness(profile)

  const getImprovementTips = () => {
    const tips = []
    
    if (!profile.bio || profile.bio.length < 50) {
      tips.push({ text: 'Add artist statement', points: 5 })
    }
    if (!profile.website) {
      tips.push({ text: 'Add portfolio website', points: 10 })
    }
    if (!profile.cvData) {
      tips.push({ text: 'Upload CV', points: 20 })
    }
    if (selectedFocus.size === 0) {
      tips.push({ text: 'Select artistic focus areas', points: 15 })
    }
    if (!profile.instagramHandle) {
      tips.push({ text: 'Add Instagram handle', points: 5 })
    }
    
    return tips
  }

  const toggleSelection = (value: string, set: Set<string>, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const newSet = new Set(set)
    if (newSet.has(value)) {
      newSet.delete(value)
    } else {
      newSet.add(value)
    }
    setter(newSet)
  }

  const handleGenerateStatement = async () => {
    setGenerateStatement(true)
    try {
      const response = await fetch('/api/ai/generate-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profileData: {
            ...profile,
            artisticFocus: Array.from(selectedFocus),
            regions: Array.from(selectedRegions)
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate statement')

      const data = await response.json()
      setProfile(prev => ({ ...prev, bio: data.statement }))
    } catch (error) {
      console.error('Statement generation error:', error)
      alert('Failed to generate artist statement. Please try again.')
    } finally {
      setGenerateStatement(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          artisticFocus: Array.from(selectedFocus).join(','),
          interestedRegions: Array.from(selectedRegions).join(',')
        })
      })

      if (!response.ok) throw new Error('Failed to save profile')

      alert('Profile saved successfully!')
    } catch (error) {
      console.error('Profile save error:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-primary">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Completeness Banner */}
        <div className="studio-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl times-condensed font-bold text-editorial-charcoal">
                Profile Completeness
              </h2>
              <p className="text-medium-gray crimson-text">
                Complete your profile to get better opportunity matches
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl times-condensed font-bold text-blue-interactive">
                {completenessScore}%
              </div>
              <div className="text-sm text-medium-gray">Complete</div>
            </div>
          </div>
          
          <div className="completeness-bar bg-cream-secondary rounded-full h-3 mb-4">
            <div 
              className="completeness-fill bg-gradient-to-r from-blue-interactive to-green-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completenessScore}%` }}
            />
          </div>
          
          {getImprovementTips().length > 0 && (
            <div className="improvement-tips">
              <h4 className="text-sm font-medium text-editorial-charcoal mb-2">
                💡 Suggestions to improve your profile:
              </h4>
              <div className="flex flex-wrap gap-2">
                {getImprovementTips().map((tip, index) => (
                  <div key={index} className="tip bg-cream-accent px-3 py-1 rounded-full text-sm">
                    {tip.text} (+{tip.points}%)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tab Navigation */}
          <div className="lg:col-span-1">
            <div className="edit-tabs studio-card p-4">
              <h3 className="times-condensed font-semibold text-editorial-charcoal mb-4">
                Edit Profile
              </h3>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors mb-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-interactive text-white'
                      : 'hover:bg-cream-accent text-editorial-charcoal'
                  }`}
                >
                  <tab.icon size={20} />
                  <span className="crimson-text">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            <div className="tab-content studio-card p-8">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div>
                  <h3 className="text-2xl times-condensed font-bold text-editorial-charcoal mb-6">
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={profile.name || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="form-input w-full"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={profile.email || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="form-input w-full"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profile.location || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        className="form-input w-full"
                        placeholder="Melbourne, VIC, Australia"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                        Portfolio Website
                      </label>
                      <input
                        type="url"
                        value={profile.website || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                        className="form-input w-full"
                        placeholder="https://your-portfolio.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        value={profile.instagramHandle || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, instagramHandle: e.target.value }))}
                        className="form-input w-full"
                        placeholder="@your_handle"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                        Career Stage
                      </label>
                      <select
                        value={profile.careerStage || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, careerStage: e.target.value }))}
                        className="form-input w-full"
                      >
                        <option value="">Select career stage</option>
                        <option value="emerging">Emerging (0-5 years)</option>
                        <option value="mid">Mid-Career (5-15 years)</option>
                        <option value="established">Established (15+ years)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Artistic Focus Tab */}
              {activeTab === 'artistic' && (
                <div>
                  <h3 className="text-2xl times-condensed font-bold text-editorial-charcoal mb-6">
                    Artistic Focus
                  </h3>
                  
                  <div className="focus-categories space-y-8">
                    {Object.entries(groupedFocusOptions).map(([category, options]) => (
                      <div key={category} className="category-group">
                        <h4 className="text-xl times-condensed font-semibold text-editorial-charcoal mb-4">
                          {category}
                        </h4>
                        <div className="selection-grid grid grid-cols-2 md:grid-cols-3 gap-3">
                          {options.map((option) => (
                            <button
                              key={option.value}
                              className={`selection-btn p-4 rounded-lg border-2 transition-all text-left ${
                                selectedFocus.has(option.value)
                                  ? 'bg-blue-interactive text-white border-blue-interactive'
                                  : 'bg-white text-editorial-charcoal border-cream-secondary hover:border-blue-interactive'
                              }`}
                              onClick={() => toggleSelection(option.value, selectedFocus, setSelectedFocus)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h3 className="text-2xl times-condensed font-bold text-editorial-charcoal mb-6">
                    Preferences
                  </h3>
                  
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xl times-condensed font-semibold text-editorial-charcoal mb-4">
                        Geographic Preferences
                      </h4>
                      <div className="region-selector grid grid-cols-1 md:grid-cols-3 gap-3">
                        {regionOptions.map((region) => (
                          <button
                            key={region.value}
                            className={`region-btn p-4 rounded-lg border-2 transition-all text-left ${
                              selectedRegions.has(region.value)
                                ? 'bg-blue-interactive text-white border-blue-interactive'
                                : 'bg-white text-editorial-charcoal border-cream-secondary hover:border-blue-interactive'
                            }`}
                            onClick={() => toggleSelection(region.value, selectedRegions, setSelectedRegions)}
                          >
                            <div className="font-medium">{region.label}</div>
                            <div className="text-sm opacity-80">{region.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Artist Statement Tab */}
              {activeTab === 'statement' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl times-condensed font-bold text-editorial-charcoal">
                        Artist Statement
                      </h3>
                      <p className="text-medium-gray crimson-text">
                        Describe your artistic practice and vision
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateStatement}
                      disabled={generateStatement}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-interactive text-white rounded-lg hover:bg-blue-hover transition-colors disabled:opacity-50"
                    >
                      {generateStatement ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Lightbulb size={16} />
                      )}
                      <span>{generateStatement ? 'Generating...' : 'AI Generate'}</span>
                    </button>
                  </div>
                  
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="form-input w-full h-64 resize-none"
                    placeholder="Write about your artistic practice, inspirations, techniques, and what drives your creative work..."
                  />
                  
                  <div className="mt-2 text-sm text-medium-gray">
                    {profile.bio?.length || 0} characters
                    {profile.bio && profile.bio.length > 500 && (
                      <span className="text-orange-500 ml-2">
                        (Consider shortening for better readability)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end mt-8 pt-6 border-t">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-interactive text-white rounded-lg hover:bg-blue-hover transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}