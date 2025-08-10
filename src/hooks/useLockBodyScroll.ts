'use client'

import { useEffect } from 'react'

export function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const originalStyle = window.getComputedStyle(document.body).overflow
    
    if (lock) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = originalStyle
    }

    // Cleanup function to restore original overflow
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [lock])
}