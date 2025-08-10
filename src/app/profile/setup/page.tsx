'use client'

import { useSession } from 'next-auth/react'
import ProfileWizard from '@/components/ProfileWizard'

export default function ProfileSetup() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h1>
      </div>
    )
  }

  return <ProfileWizard />
}