interface Artist {
  id: string
  bio: string | null
  location: string | null
  careerStage: string | null
  artisticFocus: string | null
  interestedRegions: string | null
}

interface Opportunity {
  id: string
  title: string
  description: string
  organizer: string
  location: string
  type: string
  deadline: Date
  link: string | null
  eligibility: string
  artTypes: string | null
  fee: string | null
  prize: string | null
}

interface ScoredOpportunity extends Opportunity {
  matchScore: number
  matchReasons: string[]
}

export function scoreOpportunityMatch(artist: Artist, opportunity: Opportunity): ScoredOpportunity {
  let score = 0
  const reasons: string[] = []

  // Location matching (30 points max)
  if (artist.location && artist.interestedRegions) {
    const artistLocation = artist.location.toLowerCase()
    const interestedRegions = artist.interestedRegions.toLowerCase().split(',').map(r => r.trim())
    const opportunityLocation = opportunity.location.toLowerCase()
    
    // Check if opportunity location matches artist's location or interested regions
    if (opportunityLocation.includes(artistLocation) || 
        interestedRegions.some(region => opportunityLocation.includes(region))) {
      score += 30
      reasons.push('Location match')
    }
    
    // Check if opportunity is in Australia and artist is interested in Australia
    if (interestedRegions.includes('australia') && 
        (opportunityLocation.includes('australia') || 
         opportunityLocation.includes('nsw') || 
         opportunityLocation.includes('vic') || 
         opportunityLocation.includes('qld') || 
         opportunityLocation.includes('wa') || 
         opportunityLocation.includes('sa') || 
         opportunityLocation.includes('tas') || 
         opportunityLocation.includes('nt') || 
         opportunityLocation.includes('act'))) {
      score += 25
      reasons.push('Australia focus')
    }
  }

  // Career stage matching (25 points max)
  if (artist.careerStage) {
    const eligibility = opportunity.eligibility.toLowerCase()
    const careerStage = artist.careerStage.toLowerCase()
    
    if (eligibility.includes('all artists') || eligibility.includes('any artist')) {
      score += 20
      reasons.push('Open to all career stages')
    } else if (eligibility.includes(careerStage)) {
      score += 25
      reasons.push('Career stage match')
    } else if (careerStage === 'emerging' && eligibility.includes('early')) {
      score += 20
      reasons.push('Suitable for emerging artists')
    }
  }

  // Artistic medium matching (25 points max)
  if (artist.artisticFocus && opportunity.artTypes) {
    const artisticFocus = artist.artisticFocus.toLowerCase().split(',').map(f => f.trim())
    const opportunityTypes = opportunity.artTypes.toLowerCase()
    
    if (opportunityTypes.includes('all mediums') || opportunityTypes.includes('all medium')) {
      score += 20
      reasons.push('Open to all mediums')
    } else {
      let mediumMatches = 0
      artisticFocus.forEach(focus => {
        if (opportunityTypes.includes(focus)) {
          mediumMatches++
        }
      })
      
      if (mediumMatches > 0) {
        score += Math.min(25, mediumMatches * 8)
        reasons.push(`Medium match (${mediumMatches} matches)`)
      }
    }
  }

  // Opportunity type bonus (10 points max)
  const opportunityType = opportunity.type.toLowerCase()
  if (opportunityType.includes('grant')) {
    score += 5
    reasons.push('Grant opportunity')
  } else if (opportunityType.includes('exhibition')) {
    score += 8
    reasons.push('Exhibition opportunity')
  } else if (opportunityType.includes('residency')) {
    score += 7
    reasons.push('Residency opportunity')
  } else if (opportunityType.includes('prize')) {
    score += 6
    reasons.push('Prize opportunity')
  }

  // Prize/funding bonus (10 points max)
  if (opportunity.prize && opportunity.prize !== 'NA') {
    score += 10
    reasons.push('Prize/funding available')
  }

  // Deadline urgency (boost recent opportunities)
  const daysUntilDeadline = Math.ceil((opportunity.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysUntilDeadline > 0 && daysUntilDeadline <= 30) {
    score += 5
    reasons.push('Deadline approaching')
  } else if (daysUntilDeadline > 30 && daysUntilDeadline <= 90) {
    score += 3
    reasons.push('Good timing')
  }

  return {
    ...opportunity,
    matchScore: Math.min(100, score), // Cap at 100
    matchReasons: reasons
  }
}

export function getMatchedOpportunities(artist: Artist, opportunities: Opportunity[]): ScoredOpportunity[] {
  return opportunities
    .map(opportunity => scoreOpportunityMatch(artist, opportunity))
    .filter(scored => scored.matchScore >= 30) // Only show opportunities with decent match
    .sort((a, b) => b.matchScore - a.matchScore) // Sort by score descending
}

export function getMatchDescription(score: number): string {
  if (score >= 80) return 'Excellent Match'
  if (score >= 60) return 'Good Match'
  if (score >= 40) return 'Fair Match'
  return 'Possible Match'
}

export function getMatchColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-gray-600'
}