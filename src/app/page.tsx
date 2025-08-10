'use client'

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const navigateToSignIn = () => {
    router.push('/auth/signin')
  }

  const navigateToSignUp = () => {
    router.push('/auth/signup')
  }

  const navigateToOpportunities = () => {
    router.push('/opportunities')
  }

  return (
    <div className="landing-page">
      {/* Fixed Navigation Header */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-left">
            <div className="logo-brand">
              <Image
                src="/logos/artmatch-full-logo.png"
                alt="StudioMate logo"
                width={40}
                height={40}
                className="nav-logo w-10 h-10 object-contain"
              />
              <span className="brand-name">StudioMate</span>
            </div>
          </div>
          <div className="nav-right">
            <button 
              onClick={navigateToOpportunities} 
              className="btn btn-ghost nav-link"
            >
              Opportunities
            </button>
            <button 
              onClick={navigateToSignIn} 
              className="btn btn-secondary sign-in-btn"
            >
              Sign In
            </button>
            <button 
              onClick={navigateToSignUp} 
              className="btn btn-primary create-account-btn"
            >
              Create Account
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Logo */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            {/* Use the same logo as dashboard */}
            <div className="hero-logo-container">
              <Image
                src="/logos/artmatch-full-logo.png"
                alt="StudioMate logo"
                width={120}
                height={120}
                className="hero-logo w-24 h-24 mx-auto object-contain"
              />
            </div>
            
            <h1 className="hero-title">StudioMate</h1>
            <p className="hero-subtitle">
              AI-powered matching platform connecting Australian artists with relevant 
              opportunities and generating tailored applications.
            </p>
            
            <div className="hero-actions">
              <button 
                onClick={navigateToSignUp} 
                className="btn btn-primary btn-lg hero-cta shadow-soft"
              >
                <span className="btn-icon">✨</span>
                Get Started
              </button>
              <button 
                onClick={navigateToSignIn} 
                className="btn btn-secondary btn-lg hero-secondary shadow-soft"
              >
                <span className="btn-icon">🔑</span>
                Sign In
              </button>
            </div>
            
            <p className="hero-tagline">
              Join the Australian art community and take your career to the next level.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section with Modern Icons */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">Everything you need to advance your artistic career</h2>
          
          <div className="features-grid">
            <div className="card bg-base-100 shadow-xl feature-card">
              <div className="feature-icon smart-matching">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                </svg>
              </div>
              <h3>Smart Matching</h3>
              <p>AI analyzes your profile and matches you with relevant grants, residencies, and exhibitions.</p>
            </div>
            
            <div className="card bg-base-100 shadow-xl feature-card">
              <div className="feature-icon portfolio">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>
              <h3>Portfolio Management</h3>
              <p>Upload, organize, and showcase your artwork with professional presentation tools.</p>
            </div>
            
            <div className="card bg-base-100 shadow-xl feature-card">
              <div className="feature-icon applications">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <h3>Application Tracking</h3>
              <p>Track all your submissions and generate personalized artist statements for each opportunity.</p>
            </div>
            
            <div className="card bg-base-100 shadow-xl feature-card">
              <div className="feature-icon calendar">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3>Deadline Calendar</h3>
              <p>Never miss an opportunity with our calendar system and smart reminder notifications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to advance your artistic career?</h2>
          <p>Join hundreds of Australian artists already using StudioMate</p>
          <div className="cta-actions">
            <button 
              onClick={navigateToSignUp} 
              className="btn btn-primary btn-lg cta-primary shadow-soft"
            >
              Create Your Profile
            </button>
            <button 
              onClick={navigateToOpportunities} 
              className="btn btn-ghost btn-lg cta-secondary"
            >
              Browse Opportunities →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
