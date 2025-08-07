'use client'

import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary-50">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-crimson font-bold text-gray-900 mb-4">StudioMate</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-source-sans">
            AI-powered matching platform connecting Australian artists with relevant opportunities and generating tailored applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Link href={session ? "/dashboard" : "/auth/signin"} className="gallery-card p-6 hover:shadow-gallery-hover transition-all duration-300 cursor-pointer group">
            <div className="w-12 h-12 bg-primary-100 rounded-organic flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors duration-300">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-crimson font-semibold mb-3 text-gray-900 group-hover:text-primary transition-colors duration-300">Smart Matching</h3>
            <p className="text-gray-600 font-source-sans">
              AI analyzes your profile and matches you with relevant grants, residencies, and exhibitions.
            </p>
            <div className="mt-4 text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {session ? "Go to Dashboard →" : "Sign in to explore →"}
            </div>
          </Link>
          
          <Link href={session ? "/portfolio" : "/auth/signin"} className="gallery-card p-6 hover:shadow-gallery-hover transition-all duration-300 cursor-pointer group">
            <div className="w-12 h-12 bg-secondary-100 rounded-organic flex items-center justify-center mb-4 group-hover:bg-secondary-200 transition-colors duration-300">
              <svg className="w-6 h-6 text-secondary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-crimson font-semibold mb-3 text-gray-900 group-hover:text-secondary-700 transition-colors duration-300">Portfolio Management</h3>
            <p className="text-gray-600 font-source-sans">
              Upload, organize, and showcase your artwork with professional presentation tools.
            </p>
            <div className="mt-4 text-secondary-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {session ? "Manage Portfolio →" : "Sign in to start →"}
            </div>
          </Link>
          
          <Link href={session ? "/applications" : "/auth/signin"} className="gallery-card p-6 hover:shadow-gallery-hover transition-all duration-300 cursor-pointer group">
            <div className="w-12 h-12 bg-accent-100 rounded-organic flex items-center justify-center mb-4 group-hover:bg-accent-200 transition-colors duration-300">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-crimson font-semibold mb-3 text-gray-900 group-hover:text-accent transition-colors duration-300">Application Tracking</h3>
            <p className="text-gray-600 font-source-sans">
              Track all your submissions and generate personalized artist statements for each opportunity.
            </p>
            <div className="mt-4 text-accent font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {session ? "View Applications →" : "Sign in to track →"}
            </div>
          </Link>
          
          <Link href={session ? "/calendar" : "/auth/signin"} className="gallery-card p-6 hover:shadow-gallery-hover transition-all duration-300 cursor-pointer group md:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-success-100 rounded-organic flex items-center justify-center mb-4 group-hover:bg-success-200 transition-colors duration-300">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-crimson font-semibold mb-3 text-gray-900 group-hover:text-success-600 transition-colors duration-300">Deadline Calendar</h3>
            <p className="text-gray-600 font-source-sans">
              Never miss an opportunity with our calendar system and smart reminder notifications.
            </p>
            <div className="mt-4 text-success-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {session ? "Open Calendar →" : "Sign in to schedule →"}
            </div>
          </Link>
        </div>

        <div className="text-center space-y-4">
          <div className="space-x-4">
            <Link 
              href="/opportunities" 
              className="btn-primary inline-block"
            >
              Browse Opportunities
            </Link>
            {!session && (
              <Link 
                href="/auth/signin" 
                className="btn-secondary inline-block"
              >
                Sign In
              </Link>
            )}
          </div>
          <p className="text-gray-600 text-sm font-source-sans">
            Join the Australian art community and take your career to the next level.
          </p>
        </div>
      </div>
    </div>
  );
}
