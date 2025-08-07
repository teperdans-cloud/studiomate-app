import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

interface Artist {
  id: string
  bio: string | null
  location: string | null
  careerStage: string | null
  artisticFocus: string | null
  interestedRegions: string | null
  artworks?: Artwork[]
}

interface Artwork {
  id: string
  title: string
  description: string | null
  medium: string | null
  year: number | null
  dimensions: string | null
  tags: string | null
  collections: string | null
}

interface Opportunity {
  title: string
  description: string
  organizer: string
  location: string
  type: string
  eligibility: string
  artTypes: string | null
}

export async function generateArtistStatement(artist: Artist, opportunity: Opportunity): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }
  // Format portfolio information
  const portfolioInfo = artist.artworks && artist.artworks.length > 0 
    ? artist.artworks.map(artwork => {
        const tags = artwork.tags ? JSON.parse(artwork.tags) : []
        return `• ${artwork.title} (${artwork.year || 'Date unknown'}) - ${artwork.medium || 'Medium not specified'} ${artwork.dimensions ? `- ${artwork.dimensions}` : ''} ${tags.length > 0 ? `- Tags: ${tags.join(', ')}` : ''}`
      }).join('\n')
    : 'No artworks in portfolio yet'

  const prompt = `
As a professional grant writer specializing in arts applications, generate a compelling artist statement for the following opportunity:

OPPORTUNITY:
- Title: ${opportunity.title}
- Organizer: ${opportunity.organizer}
- Type: ${opportunity.type}
- Location: ${opportunity.location}
- Eligibility: ${opportunity.eligibility}
- Description: ${opportunity.description}
- Art Types: ${opportunity.artTypes || 'Various'}

ARTIST PROFILE:
- Career Stage: ${artist.careerStage || 'Not specified'}
- Location: ${artist.location || 'Not specified'}
- Artistic Focus: ${artist.artisticFocus || 'Not specified'}
- Bio: ${artist.bio || 'Not provided'}
- Interested Regions: ${artist.interestedRegions || 'Not specified'}

RECENT PORTFOLIO WORKS:
${portfolioInfo}

Please write a professional, compelling artist statement (300-500 words) that:
1. Clearly articulates the artist's practice and vision
2. Demonstrates alignment with the opportunity's goals
3. Shows understanding of the opportunity's context
4. Highlights relevant experience and artistic development
5. References specific artworks from the portfolio when relevant
6. Uses professional, engaging language appropriate for arts funding applications

The statement should be written in first person and feel authentic to the artist's profile and portfolio.
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert grant writer specializing in arts applications. Write compelling, professional artist statements that help artists secure funding and opportunities."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    })

    return completion.choices[0].message.content || "Unable to generate artist statement."
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate artist statement')
  }
}

export async function generateCoverLetter(artist: Artist, opportunity: Opportunity): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }
  const prompt = `
As a professional grant writer, create a compelling cover letter for this arts opportunity:

OPPORTUNITY:
- Title: ${opportunity.title}
- Organizer: ${opportunity.organizer}
- Type: ${opportunity.type}
- Location: ${opportunity.location}
- Description: ${opportunity.description}

ARTIST PROFILE:
- Career Stage: ${artist.careerStage || 'Not specified'}
- Location: ${artist.location || 'Not specified'}
- Artistic Focus: ${artist.artisticFocus || 'Not specified'}
- Bio: ${artist.bio || 'Not provided'}

Write a professional cover letter (200-300 words) that:
1. Opens with a strong, engaging introduction
2. Clearly states the purpose and specific opportunity being applied for
3. Demonstrates knowledge of the organizer/institution
4. Highlights why the artist is a good fit for this opportunity
5. Shows enthusiasm and professional commitment
6. Includes a professional closing

Format as a proper business letter with appropriate salutation and closing.
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert grant writer specializing in arts applications. Write professional, compelling cover letters that help artists secure opportunities."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.7,
    })

    return completion.choices[0].message.content || "Unable to generate cover letter."
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate cover letter')
  }
}

export async function generateApplicationSummary(artist: Artist, opportunity: Opportunity): Promise<{
  artistStatement: string
  coverLetter: string
  tips: string[]
}> {
  try {
    const [artistStatement, coverLetter] = await Promise.all([
      generateArtistStatement(artist, opportunity),
      generateCoverLetter(artist, opportunity)
    ])

    const tips = [
      "Review and personalize the generated content to match your authentic voice",
      "Ensure all application requirements are met before submitting",
      "Double-check submission deadline and format requirements",
      "Consider having a colleague review your application before submission",
      "Keep copies of all submitted materials for your records"
    ]

    return {
      artistStatement,
      coverLetter,
      tips
    }
  } catch (error) {
    console.error('Application generation error:', error)
    throw new Error('Failed to generate application materials')
  }
}