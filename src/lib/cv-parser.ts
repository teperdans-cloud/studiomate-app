// Use dynamic import to avoid build issues with pdf-parse

interface ParsedCVData {
  bio?: string
  education: Array<{
    degree: string
    institution: string
    year?: string
    qualification?: string
  }>
  experience: Array<{
    title: string
    organization: string
    duration?: string
    description?: string
    position?: string
    company?: string
  }>
  skills: string[]
  awards?: Array<{
    title: string
    year?: string
    organization?: string
  }>
  exhibitions?: Array<{
    title: string
    venue: string
    year?: string
    type?: string
  }>
  contact?: {
    email?: string
    phone?: string
    website?: string
    location?: string
  }
}

export async function parseCV(buffer: Buffer): Promise<ParsedCVData> {
  try {
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    const text = data.text
    
    // Parse different sections with enhanced extraction
    const education = parseEducation(text)
    const experience = parseExperience(text)
    const skills = parseSkills(text)
    const awards = parseAwards(text)
    const exhibitions = parseExhibitions(text)
    const bio = parseBio(text)
    const contact = parseContact(text)
    
    return {
      bio,
      education,
      experience,
      skills,
      awards,
      exhibitions,
      contact
    }
  } catch (error) {
    console.error('CV parsing error:', error)
    throw new Error('Failed to parse CV. Please ensure it\'s a valid PDF with readable text.')
  }
}

function parseEducation(text: string): Array<{ degree: string; institution: string; year?: string; qualification?: string }> {
  const education = []
  
  // Look for education section with more variations
  const educationSection = extractSection(text, ['education', 'qualifications', 'academic', 'training', 'degrees'])
  
  if (educationSection) {
    // Enhanced degree matching patterns
    const degreePatterns = [
      /.*(?:bachelor|master|phd|doctorate|diploma|certificate|bfa|mfa|ba|ma).*\n?.*/gi,
      /.*(?:university|college|institute|school|academy).*\n?.*/gi,
      /.*(?:degree|qualification|certification).*\n?.*/gi
    ]
    
    for (const pattern of degreePatterns) {
      const matches = educationSection.match(pattern) || []
      
      for (const match of matches) {
        const line = match.trim()
        if (line.length < 10) continue // Skip too short lines
        
        const yearMatch = line.match(/\b(19|20)\d{2}\b/)
        const institutionPatterns = [
          /(?:at|from|,|\-)\s+([A-Z][^,\n\d]+(?:university|college|institute|school|academy)[^,\n]*)/i,
          /([A-Z][^,\n]+(?:university|college|institute|school|academy))/i
        ]
        
        let institution = 'Unknown Institution'
        for (const pattern of institutionPatterns) {
          const instMatch = line.match(pattern)
          if (instMatch) {
            institution = instMatch[1].trim()
            break
          }
        }
        
        // Extract degree/qualification
        const degreeMatch = line.match(/(bachelor|master|phd|doctorate|diploma|certificate|bfa|mfa|ba|ma)[^,\n]*/i)
        const degree = degreeMatch ? degreeMatch[0] : line.split(',')[0] || line.split('-')[0]
        
        if (degree && degree.length > 3) {
          education.push({
            degree: degree.trim(),
            institution: institution,
            year: yearMatch?.[0],
            qualification: degreeMatch?.[0]
          })
        }
      }
    }
  }
  
  return education.slice(0, 10) // Limit to reasonable number
}

function parseExperience(text: string): Array<{ title: string; organization: string; duration?: string; description?: string; position?: string; company?: string }> {
  const experience = []
  
  // Look for experience section with more variations
  const experienceSection = extractSection(text, ['experience', 'work', 'employment', 'career', 'professional', 'positions'])
  
  if (experienceSection) {
    // Split by likely job entry patterns
    const jobPatterns = [
      /\n(?=[A-Z].*(?:artist|designer|curator|teacher|manager|director|coordinator|assistant|lead|senior|junior))/i,
      /\n(?=\d{4}[-–—]\d{4}|\d{4}[-–—]present)/i,
      /\n(?=[A-Z][^,\n]+,\s*[A-Z][^,\n]+)/
    ]
    
    let entries = [experienceSection]
    for (const pattern of jobPatterns) {
      entries = entries.flatMap(entry => entry.split(pattern))
    }
    
    for (const entry of entries) {
      const lines = entry.trim().split('\n').filter(line => line.trim())
      if (lines.length === 0) continue
      
      const firstLine = lines[0]
      
      // Extract title and organization
      let title = '', organization = ''
      
      if (firstLine.includes(' at ')) {
        [title, organization] = firstLine.split(' at ', 2)
      } else if (firstLine.includes(', ')) {
        [title, organization] = firstLine.split(', ', 2)
      } else if (firstLine.includes(' - ')) {
        [title, organization] = firstLine.split(' - ', 2)
      } else {
        title = firstLine
        organization = lines[1] || 'Unknown Organization'
      }
      
      // Look for duration patterns
      const durationPatterns = [
        /\b(19|20)\d{2}\s*[-–—]\s*(19|20)\d{2}/,
        /\b(19|20)\d{2}\s*[-–—]\s*present/i,
        /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{4}/i
      ]
      
      let duration = ''
      for (const pattern of durationPatterns) {
        const match = entry.match(pattern)
        if (match) {
          duration = match[0]
          break
        }
      }
      
      if (title.trim() && title.length > 2) {
        experience.push({
          title: title.trim(),
          organization: organization.trim() || 'Unknown Organization',
          duration: duration || undefined,
          description: lines.slice(1).join(' ').trim().substring(0, 200),
          position: title.trim(),
          company: organization.trim()
        })
      }
    }
  }
  
  return experience.slice(0, 15) // Limit to reasonable number
}

function parseSkills(text: string): string[] {
  const skills = new Set<string>()
  
  // Look for skills section
  const skillsSection = extractSection(text, ['skills', 'expertise', 'competencies', 'technical skills', 'software'])
  
  if (skillsSection) {
    // Extract skills from various formats
    const skillPatterns = [
      /(?:^|\n)\s*[•·\-*]?\s*([A-Z][^,\n•·\-*]{2,40})/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
    ]
    
    for (const pattern of skillPatterns) {
      const matches = skillsSection.match(pattern) || []
      for (const match of matches) {
        const skill = match.replace(/^[•·\-*\s]+/, '').trim()
        if (skill && skill.length > 2 && skill.length < 30 && !/\d{4}/.test(skill)) {
          skills.add(skill)
        }
      }
    }
  }
  
  // Art-specific skills to look for in full text
  const artSkills = [
    'Oil Painting', 'Acrylic Painting', 'Watercolor', 'Drawing', 'Sculpture', 'Photography',
    'Digital Art', 'Printmaking', 'Installation Art', 'Performance Art', 'Video Art',
    'Ceramics', 'Pottery', 'Textiles', 'Fiber Art', 'Jewelry Making', 'Metalworking',
    'Woodworking', 'Mixed Media', 'Collage', 'Screen Printing', 'Lithography',
    'Photoshop', 'Illustrator', 'InDesign', 'Lightroom', 'Premiere Pro', 'After Effects',
    'Blender', '3D Modeling', 'Animation', 'Web Design', 'Graphic Design'
  ]
  
  const lowerText = text.toLowerCase()
  for (const skill of artSkills) {
    if (lowerText.includes(skill.toLowerCase()) && 
        !Array.from(skills).some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
      skills.add(skill)
    }
  }
  
  return Array.from(skills).slice(0, 25) // Limit to top 25 skills
}

function parseExhibitions(text: string): Array<{ title: string; venue: string; year?: string; type?: string }> {
  const exhibitions = []
  
  // Look for exhibitions section
  const exhibitionSection = extractSection(text, ['exhibitions', 'shows', 'displays', 'gallery shows'])
  
  if (exhibitionSection) {
    const lines = exhibitionSection.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/)
      
      // Try to identify exhibition format: "Title", Venue, Year
      const titleMatch = line.match(/"([^"]+)"/); // Quoted title
      const title = titleMatch ? titleMatch[1] : line.split(',')[0]
      
      const venuePatterns = [
        /,\s*([A-Z][^,\n]+(?:gallery|museum|center|space|studio|institute))/i,
        /at\s+([A-Z][^,\n]+)/i
      ]
      
      let venue = 'Unknown Venue'
      for (const pattern of venuePatterns) {
        const match = line.match(pattern)
        if (match) {
          venue = match[1].trim()
          break
        }
      }
      
      // Determine exhibition type
      let type = 'Group'
      if (line.toLowerCase().includes('solo') || line.toLowerCase().includes('individual')) {
        type = 'Solo'
      }
      
      if (title && title.trim().length > 3) {
        exhibitions.push({
          title: title.trim(),
          venue: venue,
          year: yearMatch?.[0],
          type: type
        })
      }
    }
  }
  
  return exhibitions.slice(0, 20)
}

function parseAwards(text: string): Array<{ title: string; year?: string; organization?: string }> {
  const awards = []
  
  // Look for awards section with more variations
  const awardsSection = extractSection(text, ['awards', 'honors', 'achievements', 'grants', 'fellowships', 'prizes'])
  
  if (awardsSection) {
    const lines = awardsSection.split('\n').filter(line => line.trim().length > 5)
    
    for (const line of lines) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/)
      let title = line.replace(/\b(19|20)\d{2}\b/, '').trim()
      
      // Try to separate organization from title
      const parts = title.split(',').map(p => p.trim())
      if (parts.length > 1) {
        title = parts[0]
      }
      
      if (title && title.length > 5) {
        awards.push({
          title: title,
          year: yearMatch?.[0],
          organization: parts[1] || 'Unknown'
        })
      }
    }
  }
  
  return awards.slice(0, 15)
}

function parseContact(text: string): { email?: string; phone?: string; website?: string; location?: string } {
  const contact: { email?: string; phone?: string; website?: string; location?: string } = {}
  
  // Email patterns
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  if (emailMatch) {
    contact.email = emailMatch[0]
  }
  
  // Phone patterns
  const phonePatterns = [
    /\+?\d{1,3}[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/,
    /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/
  ]
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern)
    if (match) {
      contact.phone = match[0]
      break
    }
  }
  
  // Website/URL patterns
  const urlMatch = text.match(/https?:\/\/[^\s]+/)
  if (urlMatch) {
    contact.website = urlMatch[0]
  }
  
  // Location patterns (look for city, state combinations)
  const locationPatterns = [
    /([A-Z][a-z]+,\s*[A-Z]{2,3}(?:,\s*[A-Z][a-z]+)?)/,
    /([A-Z][a-z]+\s*,\s*Australia)/i
  ]
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern)
    if (match) {
      contact.location = match[1]
      break
    }
  }
  
  return contact
}

function parseBio(text: string): string | undefined {
  // Look for bio/summary section with more variations
  const bioSection = extractSection(text, ['summary', 'bio', 'biography', 'about', 'profile', 'statement', 'artist statement'])
  
  if (bioSection) {
    // Get the meaningful content, excluding headers
    const lines = bioSection.split('\n').filter(line => {
      const trimmed = line.trim()
      return trimmed.length > 20 && 
             !trimmed.toLowerCase().match(/^(summary|bio|biography|about|profile|statement)$/i)
    })
    
    if (lines.length > 0) {
      return lines[0].trim().substring(0, 500)
    }
  }
  
  // Fallback: look for descriptive paragraphs in the first part of the document
  const firstHalf = text.split('\n').slice(0, 20)
  for (const line of firstHalf) {
    const trimmed = line.trim()
    if (trimmed.length > 100 && 
        !trimmed.match(/\b(phone|email|address|linkedin|website|experience|education)\b/i) &&
        !trimmed.match(/^\d/) && // Not starting with year
        trimmed.includes(' ')) { // Contains spaces (likely prose)
      return trimmed.substring(0, 500)
    }
  }
  
  return undefined
}

function extractSection(text: string, sectionNames: string[]): string | null {
  const lowerText = text.toLowerCase()
  
  for (const sectionName of sectionNames) {
    // More flexible section matching
    const patterns = [
      new RegExp(`^\\s*${sectionName}\\s*:?\\s*$[\\s\\S]*?(?=^\\s*(?:education|experience|skills|awards|exhibitions|contact|references|objective|summary)\\s*:?\\s*$|$)`, 'im'),
      new RegExp(`\\b${sectionName}\\b[\\s\\S]*?(?=\\b(?:education|experience|skills|awards|exhibitions|contact|references|objective|summary)\\b|$)`, 'i')
    ]
    
    for (const pattern of patterns) {
      const match = lowerText.match(pattern)
      if (match) {
        const startIndex = lowerText.indexOf(match[0])
        return text.substring(startIndex, startIndex + match[0].length)
      }
    }
  }
  
  return null
}