'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!email || !name) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      // First check if user already exists
      const checkResponse = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      const checkData = await checkResponse.json()
      
      if (checkData.exists) {
        setError('An account with this email already exists. Please sign in instead.')
        setIsLoading(false)
        return
      }

      // Create account by signing in (which will create the user)
      const result = await signIn('credentials', {
        email,
        name,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/dashboard')
      } else {
        setError('Failed to create account. Please try again.')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-crimson font-bold text-gray-900">
            Create your StudioMate account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-source-sans">
            Join the Australian art community
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="gallery-card p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-source-sans">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 form-input"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-source-sans">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 form-input"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 font-source-sans">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:text-primary-600 font-medium transition-colors duration-300">
              Sign in
            </Link>
          </p>
          <Link href="/" className="block text-primary hover:text-primary-600 font-source-sans transition-colors duration-300">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}