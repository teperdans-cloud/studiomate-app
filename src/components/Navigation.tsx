'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  const navigationLinks = [
    { href: '/opportunities', label: 'Opportunities', public: true },
    { href: '/dashboard', label: 'Dashboard', protected: true },
    { href: '/portfolio', label: 'Portfolio', protected: true },
    { href: '/applications', label: 'Applications', protected: true },
    { href: '/calendar', label: 'Calendar', protected: true },
    { href: '/profile/setup', label: 'Profile Settings', protected: true },
  ]

  return (
    <nav className="bg-background shadow-warm border-b border-secondary-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-crimson font-bold text-primary">
            StudioMate
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => {
              if (link.protected && !session) return null
              if (!link.protected && !link.public) return null
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-body text-gray-600 hover:text-primary transition-colors duration-300"
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
          
          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-body text-gray-700 hidden lg:block">
                  Welcome, {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-gray-600 text-white px-4 py-2 rounded-organic hover:bg-gray-700 shadow-warm-sm hover:shadow-warm transition-all duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-primary transition-colors duration-300 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`}
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
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationLinks.map((link) => {
                if (link.protected && !session) return null
                if (!link.protected && !link.public) return null
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                )
              })}
              
              {/* Mobile Auth Actions */}
              <div className="border-t border-secondary-200 pt-4 mt-4">
                {session ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Welcome, {session.user?.name || session.user?.email}
                    </div>
                    <button
                      onClick={() => {
                        signOut()
                        closeMenu()
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/signin"
                      onClick={closeMenu}
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={closeMenu}
                      className="block mx-3 mb-2 btn-primary text-center"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}