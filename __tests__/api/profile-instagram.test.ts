import { NextRequest } from 'next/server'
import { POST } from '@/app/api/profile/create/route'
import { prisma } from '@/lib/prisma'

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: { email: 'test@example.com', id: 'test-user-id' }
  }))
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    artist: {
      create: jest.fn(),
      update: jest.fn(),
    },
    notificationPreference: {
      findUnique: jest.fn(() => Promise.resolve(null)),
      create: jest.fn(),
    }
  }
}))

describe('Profile Creation API - Instagram Handle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create profile with Instagram handle', async () => {
    const mockUser = { 
      id: 'user-123', 
      email: 'test@example.com', 
      artist: null 
    }
    const mockArtist = { 
      id: 'artist-123', 
      userId: 'user-123',
      instagramHandle: 'test_artist'
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.artist.create as jest.Mock).mockResolvedValue(mockArtist)

    const requestBody = {
      basicInfo: {
        fullName: 'Test Artist',
        email: 'test@example.com',
        location: 'Sydney, Australia',
        website: 'https://testartist.com',
        instagramHandle: 'test_artist'
      },
      artisticFocus: ['painting'],
      careerStage: 'emerging',
      preferences: {
        regions: ['NSW'],
        opportunityTypes: ['grants'],
        goals: ['exhibitions']
      }
    }

    const request = new NextRequest('http://localhost/api/profile/create', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(201)
    expect(result.message).toBe('Profile created successfully')
    
    // Verify that artist.create was called with instagramHandle
    expect(prisma.artist.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        instagramHandle: 'test_artist'
      })
    })
  })

  it('should handle empty Instagram handle gracefully', async () => {
    const mockUser = { 
      id: 'user-123', 
      email: 'test@example.com', 
      artist: null 
    }
    const mockArtist = { 
      id: 'artist-123', 
      userId: 'user-123',
      instagramHandle: null
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.artist.create as jest.Mock).mockResolvedValue(mockArtist)

    const requestBody = {
      basicInfo: {
        fullName: 'Test Artist',
        email: 'test@example.com',
        location: 'Sydney, Australia',
        instagramHandle: '' // Empty string
      },
      artisticFocus: ['painting'],
      careerStage: 'emerging',
      preferences: {
        regions: ['NSW'],
        opportunityTypes: ['grants'],
        goals: ['exhibitions']
      }
    }

    const request = new NextRequest('http://localhost/api/profile/create', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    
    // Verify that empty string is converted to null
    expect(prisma.artist.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        instagramHandle: null
      })
    })
  })
})