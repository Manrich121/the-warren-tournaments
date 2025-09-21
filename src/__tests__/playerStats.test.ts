import { calculatePlayerStats, sortPlayersByWinRate, calculatePrizePool, Match, PlayerStats } from '@/lib/playerStats'

describe('Player Statistics Utilities', () => {
  const mockMatches: Match[] = [
    {
      id: 1,
      eventId: 1,
      player1Id: 1,
      player2Id: 2,
      player1Score: 2,
      player2Score: 1,
      draw: false,
      createdAt: '2023-01-01'
    },
    {
      id: 2,
      eventId: 1,
      player1Id: 1,
      player2Id: 3,
      player1Score: 0,
      player2Score: 2,
      draw: false,
      createdAt: '2023-01-02'
    },
    {
      id: 3,
      eventId: 1,
      player1Id: 2,
      player2Id: 1,
      player1Score: 1,
      player2Score: 1,
      draw: true,
      createdAt: '2023-01-03'
    },
    {
      id: 4,
      eventId: 2,
      player1Id: 2,
      player2Id: 3,
      player1Score: 2,
      player2Score: 0,
      draw: false,
      createdAt: '2023-01-04'
    }
  ]

  describe('calculatePlayerStats', () => {
    it('calculates correct stats for player with wins, losses, and draws', () => {
      const stats = calculatePlayerStats(1, mockMatches)
      
      expect(stats).toEqual({
        wins: 1,
        losses: 1, 
        draws: 1,
        totalMatches: 3,
        winRate: 33.33333333333333
      })
    })

    it('calculates correct stats for player with only wins', () => {
      const stats = calculatePlayerStats(2, mockMatches)
      
      expect(stats).toEqual({
        wins: 1,
        losses: 1,
        draws: 1,
        totalMatches: 3,
        winRate: 33.33333333333333
      })
    })

    it('calculates correct stats for player with only losses', () => {
      const stats = calculatePlayerStats(3, mockMatches)
      
      expect(stats).toEqual({
        wins: 1,
        losses: 1,
        draws: 0,
        totalMatches: 2,
        winRate: 50
      })
    })

    it('returns zero stats for player with no matches', () => {
      const stats = calculatePlayerStats(999, mockMatches)
      
      expect(stats).toEqual({
        wins: 0,
        losses: 0,
        draws: 0,
        totalMatches: 0,
        winRate: 0
      })
    })

    it('handles empty matches array', () => {
      const stats = calculatePlayerStats(1, [])
      
      expect(stats).toEqual({
        wins: 0,
        losses: 0,
        draws: 0,
        totalMatches: 0,
        winRate: 0
      })
    })
  })

  describe('sortPlayersByWinRate', () => {
    it('sorts players by win rate descending', () => {
      const playerStats = [
        { playerId: 1, stats: { wins: 1, losses: 2, draws: 0, totalMatches: 3, winRate: 33.33 } },
        { playerId: 2, stats: { wins: 2, losses: 0, draws: 0, totalMatches: 2, winRate: 100 } },
        { playerId: 3, stats: { wins: 3, losses: 1, draws: 0, totalMatches: 4, winRate: 75 } }
      ]

      const sorted = sortPlayersByWinRate(playerStats)
      
      expect(sorted[0].playerId).toBe(2) // 100% win rate
      expect(sorted[1].playerId).toBe(3) // 75% win rate
      expect(sorted[2].playerId).toBe(1) // 33.33% win rate
    })

    it('breaks ties by total matches (more experienced first)', () => {
      const playerStats = [
        { playerId: 1, stats: { wins: 2, losses: 2, draws: 0, totalMatches: 4, winRate: 50 } },
        { playerId: 2, stats: { wins: 1, losses: 1, draws: 0, totalMatches: 2, winRate: 50 } }
      ]

      const sorted = sortPlayersByWinRate(playerStats)
      
      expect(sorted[0].playerId).toBe(1) // Same win rate but more matches
      expect(sorted[1].playerId).toBe(2)
    })

    it('breaks ties by wins when win rate and total matches are equal', () => {
      const playerStats = [
        { playerId: 1, stats: { wins: 1, losses: 1, draws: 0, totalMatches: 2, winRate: 50 } },
        { playerId: 2, stats: { wins: 2, losses: 2, draws: 0, totalMatches: 4, winRate: 50 } }
      ]

      const sorted = sortPlayersByWinRate(playerStats)
      
      expect(sorted[0].playerId).toBe(2) // More total matches
      expect(sorted[1].playerId).toBe(1)
    })

    it('handles empty array', () => {
      const sorted = sortPlayersByWinRate([])
      expect(sorted).toEqual([])
    })
  })

  describe('calculatePrizePool', () => {
    it('calculates prize pool with default base amount', () => {
      expect(calculatePrizePool(10)).toBe(500) // 10 * 50
    })

    it('calculates prize pool with custom base amount', () => {
      expect(calculatePrizePool(5, 100)).toBe(500) // 5 * 100
    })

    it('handles zero participants', () => {
      expect(calculatePrizePool(0)).toBe(0)
    })

    it('handles single participant', () => {
      expect(calculatePrizePool(1)).toBe(50)
    })
  })
})