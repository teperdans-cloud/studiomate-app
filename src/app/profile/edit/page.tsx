import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileEditor from '@/components/ProfileEditor'

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { artist: true }
  })

  if (!user?.artist) {
    redirect('/profile/setup')
  }

  // Transform data for ProfileEditor
  const profileData = {
    id: user.artist.id,
    userId: user.id,
    name: user.name || '',
    email: user.email,
    bio: user.artist.bio || undefined,
    location: user.artist.location || undefined,
    website: user.artist.website || undefined,
    instagramHandle: user.artist.instagramHandle || undefined,
    careerStage: user.artist.careerStage || undefined,
    artisticFocus: user.artist.artisticFocus || undefined,
    interestedRegions: user.artist.interestedRegions || undefined,
    awards: user.artist.awards || undefined,
    cvData: user.artist.cvData ? JSON.parse(user.artist.cvData) : null,
    cvFileName: user.artist.cvFileName || undefined,
    cvUploadedAt: user.artist.cvUploadedAt?.toISOString()
  }

  return <ProfileEditor initialProfile={profileData} />
}