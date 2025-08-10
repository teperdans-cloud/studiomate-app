'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NavigationProps {
  onLinkClick?: () => void
}

export default function Navigation({ onLinkClick }: NavigationProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const navigationLinks = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      protected: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    { 
      href: '/opportunities', 
      label: 'Opportunities', 
      public: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      href: '/portfolio', 
      label: 'Portfolio', 
      protected: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      href: '/applications', 
      label: 'Applications', 
      protected: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      href: '/calendar', 
      label: 'Calendar', 
      protected: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      href: '/profile/setup', 
      label: 'Profile Settings', 
      protected: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ]

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick()
    }
  }

  const isActiveLink = (href: string) => {
    return pathname === href
  }

  if (!isMounted) {
    return (
      <nav className="flex flex-col h-full">
        <div className="flex-1 py-4">
          <ul className="space-y-2 px-3">
            <li className="animate-pulse">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="w-5 h-5 bg-base-300 rounded"></div>
                <div className="w-20 h-4 bg-base-300 rounded"></div>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    )
  }

  return (
    <nav className="flex flex-col h-full">
      {/* User Profile Section - Match screenshot */}
      {session && (
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10">
                <span className="text-sm font-semibold">
                  {session.user?.name?.charAt(0) || 'P'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-crimson font-semibold text-neutral text-lg">
                {session.user?.name || 'Pedro Guarracino'}
              </p>
              <p className="text-sm text-gray-500 font-source-sans">
                Creative Workspace
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 py-4">
        <div className="px-3 mb-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-source-sans">NAVIGATION</h4>
        </div>
        <ul className="space-y-1 px-3">
          {navigationLinks.map((link) => {
            if (link.protected && !session) return null
            if (!link.protected && !link.public) return null
            
            const isActive = isActiveLink(link.href)
            
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-neutral hover:bg-white/50 hover:text-primary'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Account Section */}
      <div className="flex-1 py-4 mt-6">
        <div className="px-3 mb-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-source-sans">ACCOUNT</h4>
        </div>
        <ul className="space-y-1 px-3">
          <li>
            <Link
              href="/profile/setup"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-neutral hover:bg-white/50 hover:text-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-neutral hover:bg-white/50 hover:text-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <Link
              href="/help"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-neutral hover:bg-white/50 hover:text-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help</span>
            </Link>
          </li>
          <li>
            <Link
              href="/billing"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-neutral hover:bg-white/50 hover:text-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Billing</span>
            </Link>
          </li>
          {session && (
            <li>
              <button
                onClick={() => {
                  signOut()
                  handleLinkClick()
                }}
                className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-neutral hover:bg-white/50 hover:text-error rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}