import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // If ID is provided, return single opportunity
    if (id) {
      const opportunity = await prisma.opportunity.findUnique({
        where: { id }
      })

      if (!opportunity) {
        return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
      }

      return NextResponse.json({ opportunity })
    }

    // Otherwise return all opportunities
    const opportunities = await prisma.opportunity.findMany({
      orderBy: {
        deadline: 'asc'
      },
      where: {
        deadline: {
          gte: new Date() // Only show future opportunities
        }
      }
    })

    return NextResponse.json({ opportunities })
  } catch (error) {
    console.error('Opportunities fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}