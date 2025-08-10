import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

interface OpportunityRow {
  title: string
  organizer: string
  description: string
  location: string
  type: string
  deadline: string
  eligibility: string
  artTypes: string
  prize: string
  link: string
}

function generateDeterministicId(title: string, organizer: string, deadline: string, link: string): string {
  const content = `${title}|${organizer}|${deadline}|${link}`
  return createHash('sha256').update(content).digest('hex').substring(0, 24)
}

function parseDeadline(deadlineStr: string): Date | null {
  try {
    // Handle various date formats in the CSV
    // Examples: "2 Sep 2025, 3 pm AEST (MGNSW, Creative Australia)", "Rolling in 2025", "June 2, 2025"
    
    // Extract main date part before any parentheses or additional info
    let cleanDeadline = deadlineStr.split('(')[0].split(',')[0].trim()
    
    // Handle "Rolling" dates by setting to end of year
    if (cleanDeadline.toLowerCase().includes('rolling')) {
      const yearMatch = deadlineStr.match(/\b(20\d{2})\b/)
      if (yearMatch) {
        return new Date(`December 31, ${yearMatch[1]}`)
      }
      return new Date('December 31, 2025') // Default fallback
    }
    
    // Handle "Applications open for" format
    if (cleanDeadline.toLowerCase().includes('applications open for')) {
      const yearMatch = deadlineStr.match(/\b(20\d{2})\b/)
      if (yearMatch) {
        return new Date(`December 31, ${yearMatch[1]}`)
      }
      return new Date('December 31, 2025') // Default fallback
    }
    
    // Try parsing standard date formats
    const parsed = new Date(cleanDeadline)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
    
    // Fallback: try with current year if no year specified
    const currentYear = new Date().getFullYear()
    const withYear = `${cleanDeadline} ${currentYear}`
    const parsedWithYear = new Date(withYear)
    if (!isNaN(parsedWithYear.getTime())) {
      return parsedWithYear
    }
    
    console.warn(`Unable to parse deadline: ${deadlineStr}, using default`)
    return new Date('December 31, 2025') // Safe fallback
  } catch (error) {
    console.warn(`Error parsing deadline "${deadlineStr}":`, error)
    return null
  }
}

async function processOpportunitiesInBatches(opportunities: OpportunityRow[], batchSize: number = 100) {
  const validOpportunities: OpportunityRow[] = []
  
  // Filter out rows with invalid deadlines
  for (const opp of opportunities) {
    const parsedDeadline = parseDeadline(opp.deadline)
    if (parsedDeadline) {
      validOpportunities.push(opp)
    } else {
      console.warn(`Skipping opportunity "${opp.title}" due to invalid deadline: ${opp.deadline}`)
    }
  }
  
  console.log(`Processing ${validOpportunities.length} valid opportunities in batches of ${batchSize}`)
  
  for (let i = 0; i < validOpportunities.length; i += batchSize) {
    const batch = validOpportunities.slice(i, i + batchSize)
    const upsertPromises = batch.map(async (opp) => {
      const id = generateDeterministicId(opp.title, opp.organizer, opp.deadline, opp.link)
      const parsedDeadline = parseDeadline(opp.deadline)!
      
      return prisma.opportunity.upsert({
        where: { id },
        create: {
          id,
          title: opp.title.trim(),
          description: opp.description.trim(),
          organizer: opp.organizer.trim(),
          location: opp.location.trim(),
          type: opp.type.trim(),
          deadline: parsedDeadline,
          link: opp.link.trim() || null,
          eligibility: opp.eligibility.trim(),
          artTypes: opp.artTypes.trim() || null,
          prize: opp.prize.trim() || null,
        },
        update: {
          title: opp.title.trim(),
          description: opp.description.trim(),
          organizer: opp.organizer.trim(),
          location: opp.location.trim(),
          type: opp.type.trim(),
          deadline: parsedDeadline,
          link: opp.link.trim() || null,
          eligibility: opp.eligibility.trim(),
          artTypes: opp.artTypes.trim() || null,
          prize: opp.prize.trim() || null,
        },
      })
    })
    
    await Promise.all(upsertPromises)
    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validOpportunities.length / batchSize)}`)
  }
  
  console.log(`Successfully processed ${validOpportunities.length} opportunities`)
}

async function main() {
  try {
    console.log('🌱 Starting opportunities seed...')
    
    const csvPath = join(__dirname, 'seed-data', 'artist-opportunities-database.csv')
    const csvContent = readFileSync(csvPath, 'utf-8')
    
    const records: OpportunityRow[] = await new Promise((resolve, reject) => {
      parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (err, records) => {
        if (err) reject(err)
        else resolve(records as OpportunityRow[])
      })
    })
    
    console.log(`📁 Loaded ${records.length} opportunities from CSV`)
    
    await processOpportunitiesInBatches(records)
    
    // Get final count
    const totalCount = await prisma.opportunity.count()
    console.log(`✅ Seeding complete! Total opportunities in database: ${totalCount}`)
    
  } catch (error) {
    console.error('❌ Error during seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })