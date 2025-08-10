// Simple in-memory rate limiting for profile system
interface RateLimit {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimit>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const entry of Array.from(rateLimitStore.entries())) {
    const [key, limit] = entry;
    if (now > limit.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; remainingAttempts: number; resetTime: number } {
  const now = Date.now()
  const resetTime = now + windowMs
  
  const current = rateLimitStore.get(identifier)
  
  if (!current || now > current.resetTime) {
    // First request or window has reset
    rateLimitStore.set(identifier, { count: 1, resetTime })
    return { success: true, remainingAttempts: limit - 1, resetTime }
  }
  
  if (current.count >= limit) {
    // Rate limit exceeded
    return { success: false, remainingAttempts: 0, resetTime: current.resetTime }
  }
  
  // Increment and allow
  current.count++
  return { success: true, remainingAttempts: limit - current.count, resetTime: current.resetTime }
}

// Get client IP address from request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}