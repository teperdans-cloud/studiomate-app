import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('📊 Checking opportunities database...')
    
    const totalCount = await prisma.opportunity.count()
    console.log(`📝 Total opportunities: ${totalCount}`)
    
    if (totalCount > 0) {
      // Show breakdown by type
      const typeBreakdown = await prisma.opportunity.groupBy({
        by: ['type'],
        _count: {
          type: true
        },
        orderBy: {
          _count: {
            type: 'desc'
          }
        }
      })
      
      console.log('\n📊 Breakdown by type:')
      typeBreakdown.forEach(({ type, _count }) => {
        console.log(`  ${type}: ${_count.type}`)
      })
      
      // Show some sample records
      console.log('\n📄 Sample opportunities:')
      const samples = await prisma.opportunity.findMany({
        take: 3,
        select: {
          id: true,
          title: true,
          organizer: true,
          type: true,
          deadline: true
        },
        orderBy: {
          deadline: 'asc'
        }
      })
      
      samples.forEach((opp, index) => {
        console.log(`  ${index + 1}. ${opp.title} (${opp.organizer})`)
        console.log(`     Type: ${opp.type}, Deadline: ${opp.deadline.toLocaleDateString()}`)
        console.log(`     ID: ${opp.id}\n`)
      })
    }
    
    console.log('✅ Verification complete!')
    
  } catch (error) {
    console.error('❌ Error during verification:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })