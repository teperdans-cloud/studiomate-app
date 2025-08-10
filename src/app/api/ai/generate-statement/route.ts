import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { sanitizeObject } from '@/lib/sanitization'

interface ProfileData {
  name?: string
  location?: string
  careerStage?: string
  artisticFocus?: string[]
  bio?: string
  regions?: string[]
  goals?: string[]
  cvData?: {
    education?: { degree: string; institution: string; year?: string }[]
    experience?: { title: string; organization: string }[]
    exhibitions?: { title: string; venue: string; year?: string }[]
    awards?: { title: string; year?: string }[]
    skills?: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 AI generation requests per hour
    const clientIP = getClientIP(request)
    const { success } = rateLimit(`ai-generate:${clientIP}`, 5, 60 * 60 * 1000) // 1 hour
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many AI generation requests. Please try again later.' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profileData } = sanitizeObject(body)

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      )
    }

    // Build context for AI from profile data
    const context = buildArtistContext(profileData)

    const prompt = `You are a professional art advisor helping an artist write their artist statement. 

Based on the following artist profile information:
${context}

Please write a compelling, professional artist statement (250-400 words) that:
1. Describes their artistic practice and approach
2. Explains their chosen mediums and techniques  
3. Discusses themes or concepts that drive their work
4. Connects their background/experience to their current practice
5. Uses a professional but personal tone
6. Avoids generic art jargon and focuses on specific, meaningful details

The statement should be engaging for gallery directors, curators, and art collectors while remaining authentic to the artist's voice.`

    if (!openai) {
      return NextResponse.json(
        { error: 'AI service unavailable. Please check configuration.' },
        { status: 503 }
      )
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert art advisor and writer who helps artists craft compelling artist statements. You write in a clear, professional yet personal style that avoids clichés and focuses on the unique aspects of each artist's practice."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.7
      })

      const statement = completion.choices[0]?.message?.content?.trim()

      if (!statement) {
        return NextResponse.json(
          { error: 'Failed to generate artist statement' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        statement,
        suggestions: generateImprovementSuggestions(profileData)
      })

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('AI generate statement error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

function buildArtistContext(profileData: ProfileData): string {
  const context = []
  
  if (profileData.name) {
    context.push(`Artist Name: ${profileData.name}`)
  }
  
  if (profileData.location) {
    context.push(`Location: ${profileData.location}`)
  }
  
  if (profileData.careerStage) {
    context.push(`Career Stage: ${profileData.careerStage}`)
  }
  
  if (profileData.artisticFocus && Array.isArray(profileData.artisticFocus)) {
    context.push(`Artistic Focus: ${profileData.artisticFocus.join(', ')}`)
  }
  
  if (profileData.cvData) {
    if (profileData.cvData.education && profileData.cvData.education.length > 0) {
      const education = profileData.cvData.education.map((edu) => 
        `${edu.degree} - ${edu.institution} (${edu.year || 'N/A'})`
      ).join('; ')
      context.push(`Education: ${education}`)
    }
    
    if (profileData.cvData.experience && profileData.cvData.experience.length > 0) {
      const experience = profileData.cvData.experience.slice(0, 3).map((exp) => 
        `${exp.title} at ${exp.organization}`
      ).join('; ')
      context.push(`Recent Experience: ${experience}`)
    }
    
    if (profileData.cvData.exhibitions && profileData.cvData.exhibitions.length > 0) {
      const exhibitions = profileData.cvData.exhibitions.slice(0, 3).map((ex) => 
        `"${ex.title}" at ${ex.venue} (${ex.year || 'N/A'})`
      ).join('; ')
      context.push(`Recent Exhibitions: ${exhibitions}`)
    }
    
    if (profileData.cvData.awards && profileData.cvData.awards.length > 0) {
      const awards = profileData.cvData.awards.slice(0, 3).map((award) => 
        `${award.title} (${award.year || 'N/A'})`
      ).join('; ')
      context.push(`Awards: ${awards}`)
    }
    
    if (profileData.cvData.skills && profileData.cvData.skills.length > 0) {
      context.push(`Skills/Techniques: ${profileData.cvData.skills.slice(0, 8).join(', ')}`)
    }
  }
  
  if (profileData.bio && profileData.bio.length > 20) {
    context.push(`Existing Statement/Bio: ${profileData.bio.substring(0, 200)}${profileData.bio.length > 200 ? '...' : ''}`)
  }
  
  if (profileData.regions && Array.isArray(profileData.regions)) {
    context.push(`Geographic Focus: ${profileData.regions.join(', ')}`)
  }
  
  if (profileData.goals && Array.isArray(profileData.goals)) {
    context.push(`Professional Goals: ${profileData.goals.join(', ')}`)
  }
  
  return context.join('\n')
}

function generateImprovementSuggestions(profileData: ProfileData): string[] {
  const suggestions = []
  
  if (!profileData.cvData || !profileData.cvData.exhibitions) {
    suggestions.push("Consider adding exhibition history to strengthen your statement")
  }
  
  if (!profileData.cvData || !profileData.cvData.education) {
    suggestions.push("Include educational background to provide context for your practice")
  }
  
  if (!profileData.artisticFocus || profileData.artisticFocus.length === 0) {
    suggestions.push("Select your artistic focus areas to help tailor the statement")
  }
  
  if (!profileData.careerStage) {
    suggestions.push("Specify your career stage to adjust the tone and focus")
  }
  
  if (!profileData.location) {
    suggestions.push("Add your location to provide geographic context")
  }
  
  if (profileData.bio && profileData.bio.length > 500) {
    suggestions.push("Consider a more concise statement for better impact")
  }
  
  return suggestions
}