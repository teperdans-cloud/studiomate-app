import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions) as { user?: { email?: string; name?: string; id?: string } } | null
  
  if (!session?.user?.email) {
    return null
  }
  
  return {
    email: session.user.email,
    name: session.user.name,
    id: session.user.id
  }
}

export async function requireAuthentication() {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}