// Input sanitization utilities for security

export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''
  
  // Basic XSS prevention - remove script tags and dangerous attributes
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove potentially dangerous patterns
  const dangerousPatterns = /(javascript:|data:|vbscript:|onload|onerror|onclick|onmouseover|onfocus|onblur|onchange|onsubmit)/gi
  sanitized = sanitized.replace(dangerousPatterns, '')
  
  // Remove HTML tags for most fields (keeping basic formatting safe)
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  
  return sanitized.trim()
}

export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return ''
  
  const sanitized = input.toLowerCase().trim()
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format')
  }
  
  return sanitized
}

export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      )
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}