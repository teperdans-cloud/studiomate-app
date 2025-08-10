'use client'

import { useEffect, useRef, ReactNode, useState } from 'react'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

interface SidebarDrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  pinAt?: 'xl' | null
}

export default function SidebarDrawer({ open, onClose, children }: SidebarDrawerProps) {
  const [isMounted, setIsMounted] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Lock body scroll when drawer is open
  useLockBodyScroll(open && isMounted)

  // Focus management
  useEffect(() => {
    if (open) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Focus the drawer container after a short delay to allow rendering
      setTimeout(() => {
        if (drawerRef.current) {
          const firstFocusableElement = drawerRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement
          
          if (firstFocusableElement) {
            firstFocusableElement.focus()
          } else {
            drawerRef.current.focus()
          }
        }
      }, 100)
    } else {
      // Return focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [open])

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on Escape
      if (event.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap
      if (event.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      onClose()
    }
  }

  // Don't render anything during SSR to avoid hydration mismatch
  if (!isMounted) {
    return null
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="overlay-frost z-40 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <aside
        id="app-drawer"
        ref={drawerRef}
        className="fixed top-0 left-0 h-full w-80 border-r border-base-300 shadow-xl z-50 motion-safe:animate-in motion-safe:slide-in-from-left motion-safe:duration-250 overflow-y-auto"
        style={{ backgroundColor: '#f5e6d3' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <h2 id="drawer-title" className="text-lg font-crimson font-semibold text-neutral">
              Navigation
            </h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-square btn-sm"
              aria-label="Close navigation"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </aside>
    </>
  )
}