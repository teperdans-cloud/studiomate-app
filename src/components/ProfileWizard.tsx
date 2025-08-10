'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Upload, Check } from 'lucide-react'

interface ProfileData {
  basicInfo: {
    fullName: string
    email: string
    location: string
    phone: string
    website: string
    instagramHandle: string
  }
  cvData?: {
    education: string[]
    experience: string[]
    skills: string[]
    awards: string[]
    exhibitions: string[]
  }
  artisticFocus: string[]
  careerStage: string
  preferences: {
    regions: string[]
    opportunityTypes: string[]
    goals: string[]
  }
}


export default function ProfileWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [profileData, setProfileData] = useState<ProfileData>({
    basicInfo: {
      fullName: '',
      email: '',
      location: '',
      phone: '',
      website: '',
      instagramHandle: ''
    },
    artisticFocus: [],
    careerStage: '',
    preferences: {
      regions: [],
      opportunityTypes: [],
      goals: []
    }
  })
  const [cvParsing, setCvParsing] = useState(false)
  const [cvParsed, setCvParsed] = useState(false)
  const [extractedData, setExtractedData] = useState<{
    education: string[]
    experience: string[]
    skills: string[]
    awards: string[]
    exhibitions: string[]
  } | null>(null)
  const [selectedFocus, setSelectedFocus] = useState<Set<string>>(new Set())
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set())
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set())
  const [selectedOpportunities, setSelectedOpportunities] = useState<Set<string>>(new Set())
  
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const goalOptions = [
    { value: 'exposure', label: '👁️ Increase Exposure', description: 'Get your work seen by more people' },
    { value: 'income', label: '💰 Generate Income', description: 'Earn money from your art' },
    { value: 'skills', label: '📚 Develop Skills', description: 'Learn new techniques and methods' },
    { value: 'network', label: '🤝 Build Network', description: 'Connect with other artists and professionals' },
    { value: 'recognition', label: '🏆 Gain Recognition', description: 'Win awards and critical acclaim' },
    { value: 'career', label: '🚀 Advance Career', description: 'Progress to the next level professionally' }
  ]

  const handleCVUpload = async (file: File) => {
    if (!file) return

    setCvParsing(true)
    const formData = new FormData()
    formData.append('cv', file)

    try {
      const response = await fetch('/api/profile/parse-cv', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to parse CV')

      const data = await response.json()
      setExtractedData(data.parsedData)
      setProfileData(prev => ({ ...prev, cvData: data.parsedData }))
      setCvParsed(true)
    } catch (error) {
      console.error('CV parsing error:', error)
      alert('Failed to parse CV. Please try again.')
    } finally {
      setCvParsing(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleCVUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleCVUpload(file)
    }
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

  const toggleGoal = (goal: string) => {
    const newSet = new Set(selectedGoals)
    if (newSet.has(goal)) {
      newSet.delete(goal)
    } else if (newSet.size < 3) {
      newSet.add(goal)
    }
    setSelectedGoals(newSet)
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitProfile = async () => {
    const finalProfileData = {
      ...profileData,
      artisticFocus: Array.from(selectedFocus),
      preferences: {
        regions: Array.from(selectedRegions),
        opportunityTypes: Array.from(selectedOpportunities),
        goals: Array.from(selectedGoals)
      }
    }

    try {
      console.log('Submitting profile data:', finalProfileData)
      
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalProfileData)
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error:', errorData)
        throw new Error(`Failed to create profile: ${response.status} ${errorData}`)
      }

      const result = await response.json()
      console.log('Profile created successfully:', result)
      router.push('/dashboard')
    } catch (error) {
      console.error('Profile creation error:', error)
      alert(`Failed to create profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const groupedFocusOptions = artisticFocusOptions.reduce((acc, option) => {
    if (!acc[option.category]) acc[option.category] = []
    acc[option.category].push(option)
    return acc
  }, {} as Record<string, typeof artisticFocusOptions>)

  return (
    <div className="min-h-screen bg-cream-primary py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step 
                      ? 'bg-blue-interactive text-white border-blue-interactive'
                      : 'bg-white text-medium-gray border-medium-gray'
                  }`}>
                    {currentStep > step ? <Check size={16} /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-0.5 ${
                      currentStep > step ? 'bg-blue-interactive' : 'bg-medium-gray'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex justify-center text-sm text-medium-gray">
            Step {currentStep} of 4
          </div>
        </div>

        {/* Step Content */}
        <div className="studio-card p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="profile-step">
              <div className="text-center mb-8">
                <h2 className="text-3xl times-condensed font-bold text-editorial-charcoal mb-2">
                  Welcome to StudioMate!
                </h2>
                <p className="text-medium-gray crimson-text">
                  Let&apos;s start by getting to know you
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.basicInfo.fullName}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, fullName: e.target.value }
                    }))}
                    className="form-input w-full"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={profileData.basicInfo.email}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, email: e.target.value }
                    }))}
                    className="form-input w-full"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={profileData.basicInfo.location}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, location: e.target.value }
                    }))}
                    className="form-input w-full"
                    placeholder="Melbourne, VIC, Australia"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profileData.basicInfo.phone}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, phone: e.target.value }
                    }))}
                    className="form-input w-full"
                    placeholder="+61 xxx xxx xxx"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                    Portfolio Website
                  </label>
                  <input
                    type="url"
                    value={profileData.basicInfo.website}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, website: e.target.value }
                    }))}
                    className="form-input w-full"
                    placeholder="https://your-portfolio.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-editorial-charcoal mb-2 crimson-text">
                    Instagram Handle
                    <span className="text-xs text-gray-500 ml-2">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                    <input
                      type="text"
                      value={profileData.basicInfo.instagramHandle}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, instagramHandle: e.target.value }
                      }))}
                      className="form-input w-full pl-8"
                      placeholder="your_username"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Help collectors and curators find your work</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: CV Upload */}
          {currentStep === 2 && (
            <div className="profile-step">
              <div className="text-center mb-8">
                <h2 className="text-3xl times-condensed font-bold text-editorial-charcoal mb-2">
                  Upload Your CV
                </h2>
                <p className="text-medium-gray crimson-text">
                  We&apos;ll automatically extract your experience, education, and skills
                </p>
              </div>
              
              <div className="cv-upload-area">
                <div
                  className={`upload-zone border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    cvParsed ? 'border-green-500 bg-green-50' : 'border-cream-secondary bg-white'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {cvParsing ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-interactive"></div>
                      <h3 className="text-xl times-condensed font-semibold text-editorial-charcoal">
                        Analyzing CV...
                      </h3>
                      <p className="text-medium-gray crimson-text">
                        Please wait while we extract your information
                      </p>
                    </div>
                  ) : cvParsed ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="text-white" size={24} />
                      </div>
                      <h3 className="text-xl times-condensed font-semibold text-editorial-charcoal">
                        ✅ Analysis Complete
                      </h3>
                      <p className="text-medium-gray crimson-text">
                        Your CV has been successfully processed
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-cream-accent rounded-full flex items-center justify-center">
                        <Upload className="text-blue-interactive" size={32} />
                      </div>
                      <h3 className="text-xl times-condensed font-semibold text-editorial-charcoal">
                        Drop CV here or click to browse
                      </h3>
                      <p className="text-medium-gray crimson-text">
                        PDF, DOC, DOCX up to 10MB
                      </p>
                    </div>
                  )}
                </div>
                
                {cvParsed && extractedData && (
                  <div className="mt-8 cv-analysis-results">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {extractedData.education && extractedData.education.length > 0 && (
                        <div className="data-section">
                          <h4 className="text-lg times-condensed font-semibold text-editorial-charcoal mb-3">
                            Education
                          </h4>
                          <div className="space-y-2" id="extractedEducation">
                            {extractedData.education.map((edu, index: number) => (
                              <div key={index} className="edu-item p-3 bg-cream-accent rounded-lg">
                                <div className="font-medium">{edu}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {extractedData.experience && extractedData.experience.length > 0 && (
                        <div className="data-section">
                          <h4 className="text-lg times-condensed font-semibold text-editorial-charcoal mb-3">
                            Experience
                          </h4>
                          <div className="space-y-2" id="extractedExperience">
                            {extractedData.experience.map((exp, index: number) => (
                              <div key={index} className="exp-item p-3 bg-cream-accent rounded-lg">
                                <div className="font-medium">{exp}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {extractedData.skills && extractedData.skills.length > 0 && (
                        <div className="data-section">
                          <h4 className="text-lg times-condensed font-semibold text-editorial-charcoal mb-3">
                            Skills
                          </h4>
                          <div className="flex flex-wrap gap-2" id="extractedSkills">
                            {extractedData.skills.map((skill: string, index: number) => (
                              <span key={index} className="skill-tag px-3 py-1 bg-blue-interactive text-white text-sm rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Artistic Focus */}
          {currentStep === 3 && (
            <div className="profile-step">
              <div className="text-center mb-8">
                <h2 className="text-3xl times-condensed font-bold text-editorial-charcoal mb-2">
                  Your Artistic Focus
                </h2>
                <p className="text-medium-gray crimson-text">
                  Select the mediums and styles that best describe your work
                </p>
              </div>
              
              <div className="focus-categories space-y-8">
                {Object.entries(groupedFocusOptions).map(([category, options]) => (
                  <div key={category} className="category-group">
                    <h3 className="text-xl times-condensed font-semibold text-editorial-charcoal mb-4">
                      {category}
                    </h3>
                    <div className="selection-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
              
              <div className="career-stage mt-8">
                <h3 className="text-xl times-condensed font-semibold text-editorial-charcoal mb-4">
                  Career Stage
                </h3>
                <div className="space-y-3">
                  {[
                    { value: 'emerging', label: 'Emerging (0-5 years)', description: 'Just starting your professional art career' },
                    { value: 'mid', label: 'Mid-Career (5-15 years)', description: 'Established practice with growing recognition' },
                    { value: 'established', label: 'Established (15+ years)', description: 'Well-known artist with significant experience' }
                  ].map((stage) => (
                    <label key={stage.value} className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-cream-accent transition-colors">
                      <input
                        type="radio"
                        name="careerStage"
                        value={stage.value}
                        checked={profileData.careerStage === stage.value}
                        onChange={(e) => setProfileData(prev => ({ ...prev, careerStage: e.target.value }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-editorial-charcoal">{stage.label}</div>
                        <div className="text-sm text-medium-gray">{stage.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferences & Goals */}
          {currentStep === 4 && (
            <div className="profile-step">
              <div className="text-center mb-8">
                <h2 className="text-3xl times-condensed font-bold text-editorial-charcoal mb-2">
                  Preferences & Goals
                </h2>
                <p className="text-medium-gray crimson-text">
                  Help us match you with the most relevant opportunities
                </p>
              </div>
              
              <div className="preferences-grid space-y-8">
                {/* Geographic Preferences */}
                <div className="pref-section">
                  <h3 className="text-xl times-condensed font-semibold text-editorial-charcoal mb-4">
                    Geographic Preferences
                  </h3>
                  <div className="region-selector grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'local', label: 'Local', description: 'Opportunities in your city/region' },
                      { value: 'national', label: 'National', description: 'Opportunities across Australia' },
                      { value: 'international', label: 'International', description: 'Global opportunities' }
                    ].map((region) => (
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
                
                {/* Opportunity Types */}
                <div className="pref-section">
                  <h3 className="text-xl times-condensed font-semibold text-editorial-charcoal mb-4">
                    Opportunity Types
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'grants', label: '💰 Grants', description: 'Funding opportunities' },
                      { value: 'exhibitions', label: '🖼️ Exhibitions', description: 'Show opportunities' },
                      { value: 'residencies', label: '🏛️ Residencies', description: 'Artist residencies' },
                      { value: 'competitions', label: '🏆 Competitions', description: 'Art contests & awards' },
                      { value: 'workshops', label: '🎓 Workshops', description: 'Learning opportunities' },
                      { value: 'commissions', label: '🎨 Commissions', description: 'Paid art projects' }
                    ].map((type) => (
                      <label key={type.value} className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-cream-accent transition-colors">
                        <input
                          type="checkbox"
                          value={type.value}
                          checked={selectedOpportunities.has(type.value)}
                          onChange={() => toggleSelection(type.value, selectedOpportunities, setSelectedOpportunities)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-editorial-charcoal">{type.label}</div>
                          <div className="text-sm text-medium-gray">{type.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Goals */}
                <div className="pref-section">
                  <h3 className="text-xl times-condensed font-semibold text-editorial-charcoal mb-4">
                    Goals (Select up to 3)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal.value}
                        className={`goal-btn p-4 rounded-lg border-2 transition-all text-left ${
                          selectedGoals.has(goal.value)
                            ? 'bg-blue-interactive text-white border-blue-interactive'
                            : selectedGoals.size >= 3
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-editorial-charcoal border-cream-secondary hover:border-blue-interactive'
                        }`}
                        onClick={() => toggleGoal(goal.value)}
                        disabled={selectedGoals.size >= 3 && !selectedGoals.has(goal.value)}
                      >
                        <div className="font-medium">{goal.label}</div>
                        <div className="text-sm opacity-80">{goal.description}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-medium-gray mt-2">
                    Selected: {selectedGoals.size}/3
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg border transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'text-editorial-charcoal border-cream-secondary hover:border-blue-interactive hover:text-blue-interactive'
              }`}
            >
              <ArrowLeft size={20} />
              <span>Previous</span>
            </button>
            
            <div className="text-center">
              <div className="text-sm text-medium-gray">
                Step {currentStep} of 4
              </div>
            </div>
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-interactive text-white rounded-lg hover:bg-blue-hover transition-colors"
              >
                <span>Continue</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={submitProfile}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-interactive text-white rounded-lg hover:bg-blue-hover transition-colors font-medium"
              >
                <span>Complete Profile</span>
                <Check size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}