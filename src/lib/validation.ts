export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export function validateEmail(email: string): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return { field: 'email', message: 'Email is required' }
  }
  
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' }
  }
  
  return null
}

export function validateRequired(value: string, fieldName: string): ValidationError | null {
  if (!value || value.trim() === '') {
    return { field: fieldName, message: `${fieldName} is required` }
  }
  
  return null
}

export function validateUrl(url: string, fieldName: string): ValidationError | null {
  if (!url) return null // URL is optional
  
  try {
    new URL(url)
    return null
  } catch {
    return { field: fieldName, message: `Please enter a valid URL` }
  }
}

export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationError | null {
  if (value && value.length < minLength) {
    return { field: fieldName, message: `${fieldName} must be at least ${minLength} characters long` }
  }
  
  return null
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationError | null {
  if (value && value.length > maxLength) {
    return { field: fieldName, message: `${fieldName} must be no more than ${maxLength} characters long` }
  }
  
  return null
}

export function validateProfileData(data: {
  bio?: string
  location?: string
  website?: string
  instagramHandle?: string
  careerStage?: string
  artisticFocus?: string
  interestedRegions?: string
}): ValidationResult {
  const errors: ValidationError[] = []

  // Required fields
  if (!data.location) {
    errors.push({ field: 'location', message: 'Location is required' })
  }

  if (!data.careerStage) {
    errors.push({ field: 'careerStage', message: 'Career stage is required' })
  }

  if (!data.artisticFocus) {
    errors.push({ field: 'artisticFocus', message: 'Artistic focus is required' })
  }

  if (!data.interestedRegions) {
    errors.push({ field: 'interestedRegions', message: 'Interested regions is required' })
  }

  // Optional field validations
  if (data.website) {
    const urlError = validateUrl(data.website, 'website')
    if (urlError) errors.push(urlError)
  }

  if (data.bio) {
    const minLengthError = validateMinLength(data.bio, 50, 'bio')
    if (minLengthError) errors.push(minLengthError)
    
    const maxLengthError = validateMaxLength(data.bio, 1000, 'bio')
    if (maxLengthError) errors.push(maxLengthError)
  }

  if (data.instagramHandle) {
    if (!data.instagramHandle.startsWith('@')) {
      errors.push({ field: 'instagramHandle', message: 'Instagram handle must start with @' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateSignInData(data: {
  email: string
  name: string
}): ValidationResult {
  const errors: ValidationError[] = []

  const emailError = validateEmail(data.email)
  if (emailError) errors.push(emailError)

  const nameError = validateRequired(data.name, 'name')
  if (nameError) errors.push(nameError)

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function getFieldError(errors: ValidationError[], field: string): string | null {
  const error = errors.find(e => e.field === field)
  return error ? error.message : null
}