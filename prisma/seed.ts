const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split('\n')
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ''
    })
    return obj
  })
}

function parseDeadline(deadlineStr: string): Date {
  if (!deadlineStr || deadlineStr === 'Accepting Invitations') {
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  }
  
  const parts = deadlineStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = parseInt(parts[1])
    const year = parseInt(parts[2])
    return new Date(year, month - 1, day)
  }
  
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
}

async function main() {
  const csvPath = path.join(__dirname, '..', 'opportunities-data.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const opportunities = parseCSV(csvContent)
  
  console.log('Seeding database with opportunities...')
  
  for (const opp of opportunities) {
    await prisma.opportunity.create({
      data: {
        title: opp.title,
        description: opp.description,
        organizer: opp.organizer,
        location: opp.location,
        type: opp.type,
        deadline: parseDeadline(opp.deadline),
        link: opp.link || null,
        eligibility: opp.eligibility,
        artTypes: opp.artTypes,
        fee: opp.fee === 'na' ? null : opp.fee,
        prize: opp.prize === 'NA' ? null : opp.prize,
      }
    })
  }
  
  console.log('Database seeded successfully!')
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