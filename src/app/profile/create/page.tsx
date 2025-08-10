import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileWizard from '@/components/ProfileWizard'

export default async function ProfileCreatePage() {
  const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  // Check if user already has a complete profile
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { artist: true }
  })

  // If user already has a profile, redirect to edit instead
  if (user?.artist && user.artist.artisticFocus) {
    redirect('/profile/edit')
  }

  return <ProfileWizard />
}