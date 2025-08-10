'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface TopBarProps {
  onMenuToggle: () => void
  isMenuOpen: boolean
}

export default function TopBar({ onMenuToggle, isMenuOpen }: TopBarProps) {
  const { data: session } = useSession()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="bg-base-100 border-b border-base-300 sticky top-0 z-40 card-shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Hamburger Menu Button - Always visible */}
          <button
            onClick={onMenuToggle}
            className="btn btn-ghost btn-square"
            aria-controls="app-drawer"
            aria-expanded={isMenuOpen}
            aria-label="Open navigation"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-200 motion-safe:transform ${
                isMenuOpen ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Empty space for center alignment */}
          <div className="flex-1"></div>

          {/* Notifications - Exact match to screenshot */}
          <div className="flex items-center">
            {isMounted && session && (
              <div className="indicator">
                <svg className="w-6 h-6 text-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 17h5l-5 5v-5zM12 3v1m0 0a7 7 0 017 7v4l2 2H5l2-2V11a7 7 0 017-7z" />
                </svg>
                <span className="badge badge-xs badge-error indicator-item">3</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}