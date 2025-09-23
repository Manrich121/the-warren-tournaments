import { Match } from '@prisma/client';

export interface PlayerStats {
  wins: number
  losses: number
  draws: number
  totalMatches: number
  winRate: number
}

export function calculatePlayerStats(playerId: string, matches: Match[]): PlayerStats {
  let wins = 0
  let losses = 0
  let draws = 0

  const playerMatches = matches.filter(
    match => match.player1Id === playerId || match.player2Id === playerId
  )

  playerMatches.forEach((match) => {
    if (match.draw) {
      draws++
      return
    }

    const isPlayer1 = match.player1Id === playerId
    if (isPlayer1) {
      if (match.player1Score > match.player2Score) {
        wins++
      } else {
        losses++
      }
    } else {
      if (match.player2Score > match.player1Score) {
        wins++
      } else {
        losses++
      }
    }
  })

  const totalMatches = playerMatches.length
  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0

  return { wins, losses, draws, totalMatches, winRate }
}

export function sortPlayersByWinRate(playerStats: Array<{ playerId: string; stats: PlayerStats }>): Array<{ playerId: string; stats: PlayerStats }> {
  return playerStats.sort((a, b) => {
    // Primary sort by win rate (descending)
    if (b.stats.winRate !== a.stats.winRate) {
      return b.stats.winRate - a.stats.winRate
    }
    
    // Secondary sort by total matches (descending) - more experienced players rank higher with same win rate
    if (b.stats.totalMatches !== a.stats.totalMatches) {
      return b.stats.totalMatches - a.stats.totalMatches
    }
    
    // Tertiary sort by wins (descending)
    return b.stats.wins - a.stats.wins
  })
}

export function calculatePrizePool(participantCount: number, baseAmount: number = 50): number {
  return participantCount * baseAmount
}