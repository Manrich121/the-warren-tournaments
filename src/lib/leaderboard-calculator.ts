/**
 * Leaderboard Calculator
 *
 * This file contains the logic for calculating league leaderboard rankings
 * with 4-level tie-breaking as specified in the feature requirements.
 *
 * Tie-breaking order (per spec):
 * 1. League points (higher is better)
 * 2. Match win rate (higher is better)
 * 3. Opponents' match win rate (higher is better)
 * 4. Game win rate (higher is better)
 * 5. Opponents' game win rate (higher is better)
 * 6. Player name alphabetically (A-Z)
 */

import { Match, Player, Event, ScoringSystem, ScoreFormula } from '@prisma/client';
import { LeaderboardEntry } from '@/types/leaderboard';
import {
  calculateMatchPoints,
  calculateGamePoints,
  calculateMatchWinPercentage,
  calculateGameWinPercentage,
  calculateOpponentMatchWinPercentage,
  calculateOpponentGameWinPercentage,
  calculateEventRanking,
} from './playerStats';
import { calculateLeaguePoints, type PlayerPerformanceData } from './utils/calculate-points';

/**
 * Calculates the complete leaderboard for a league with proper tie-breaking.
 *
 * This function:
 * 1. Filters events and matches for the specified league
 * 2. Calculates event rankings for each event in the league
 * 3. Aggregates league points based on event placements
 * 4. Calculates match and game statistics for each player
 * 5. Sorts players using the 5-level tie-breaking algorithm
 * 6. Assigns rank positions (with support for shared ranks)
 *
 * @param leagueId - The ID of the league to calculate rankings for
 * @param events - All events (will be filtered to league events)
 * @param matches - All matches (will be filtered to league matches)
 * @param players - All players (will be filtered to league participants)
 * @param scoringSystem - The scoring system with formulas to use for point calculation
 * @returns Sorted array of leaderboard entries with ranks
 *
 * @example
 * ```typescript
 * const leaderboard = calculateLeagueLeaderboard(
 *   'league-123',
 *   allEvents,
 *   allMatches,
 *   allPlayers
 * );
 * // Returns: [
 * //   { rank: 1, playerId: 'p1', playerName: 'Alice', leaguePoints: 12, ... },
 * //   { rank: 2, playerId: 'p2', playerName: 'Bob', leaguePoints: 10, ... },
 * // ]
 * ```
 */
export function calculateLeagueLeaderboard(
  leagueId: string,
  events: Event[],
  matches: Match[],
  players: Player[],
  scoringSystem: (ScoringSystem & { formulas: ScoreFormula[] }) | null
): LeaderboardEntry[] {
  // Filter events for this league
  const leagueEvents = events.filter((e) => e.leagueId === leagueId);

  if (leagueEvents.length === 0) {
    return []; // No events in this league, return empty leaderboard
  }

  // Get all event IDs for filtering matches
  const leagueEventIds = new Set(leagueEvents.map((e) => e.id));

  // Filter matches for this league
  const leagueMatches = matches.filter((m) => leagueEventIds.has(m.eventId));

  if (leagueMatches.length === 0) {
    return []; // No matches played, return empty leaderboard
  }

  // Get all player IDs who participated in this league
  const leaguePlayerIds = new Set<string>();
  for (const match of leagueMatches) {
    leaguePlayerIds.add(match.player1Id);
    leaguePlayerIds.add(match.player2Id);
  }

  // Filter players to only those who participated
  const leaguePlayers = players.filter((p) => leaguePlayerIds.has(p.id));

  if (leaguePlayers.length === 0) {
    return []; // No players, return empty leaderboard
  }

  // Calculate event rankings for each event
  const eventRankings = leagueEvents.map((event) => {
    const eventMatches = leagueMatches.filter((m) => m.eventId === event.id);
    return calculateEventRanking(leaguePlayers, eventMatches);
  });

  // Calculate league points for each player using scoring system formulas
  const leaguePoints: { [playerId: string]: number } = {};
  
  if (scoringSystem && scoringSystem.formulas && scoringSystem.formulas.length > 0) {
    // Use scoring system formulas to calculate points
    for (const player of leaguePlayers) {
      // Collect player performance data
      const performanceData: PlayerPerformanceData = extractPlayerPerformance(
        player.id,
        eventRankings,
        leagueMatches
      );
      
      // Calculate points using formulas
      leaguePoints[player.id] = calculateLeaguePoints(performanceData, scoringSystem.formulas);
    }
  } else {
    // Fallback: use legacy point calculation if no scoring system
    for (const player of leaguePlayers) {
      leaguePoints[player.id] = 0;
    }
    
    for (const eventRanking of eventRankings) {
      for (const rankedPlayer of eventRanking) {
        if (leaguePoints[rankedPlayer.player.id] !== undefined) {
          // Legacy: 1 point per event + bonus for placements
          const eventPoints = rankedPlayer.rank === 1 ? 4 : rankedPlayer.rank === 2 ? 3 : rankedPlayer.rank === 3 ? 2 : 1;
          leaguePoints[rankedPlayer.player.id] += eventPoints;
        }
      }
    }
  }

  // Calculate match and game statistics for each player
  const leaderboardEntries: Omit<LeaderboardEntry, 'rank'>[] = leaguePlayers.map((player) => {
    const playerMatches = leagueMatches.filter(
      (m) => m.player1Id === player.id || m.player2Id === player.id
    );

    // Count matches won (exclude draws)
    const matchesWon = playerMatches.filter((m) => {
      if (m.draw) return false;
      if (m.player1Id === player.id && m.player1Score > m.player2Score) return true;
      if (m.player2Id === player.id && m.player2Score > m.player1Score) return true;
      return false;
    }).length;

    const matchesPlayed = playerMatches.length;

    // Calculate match win rate (0 if no matches)
    const matchWinRate = matchesPlayed > 0 ? matchesWon / matchesPlayed : 0;

    // Calculate game points and possible points
    let gamePoints = 0;
    let gamePossiblePoints = 0;

    for (const match of playerMatches) {
      if (match.player1Id === player.id) {
        gamePoints += match.player1Score;
      } else if (match.player2Id === player.id) {
        gamePoints += match.player2Score;
      }
      gamePossiblePoints += match.player1Score + match.player2Score;
    }

    // Calculate game win rate (0 if no games)
    const gameWinRate = gamePossiblePoints > 0 ? gamePoints / gamePossiblePoints : 0;

    // Calculate opponent stats using existing functions
    // Convert percentages (0-100) to rates (0-1) for consistency
    const opponentsMatchWinRate =
      calculateOpponentMatchWinPercentage(player.id, playerMatches, leagueMatches) / 100;
    const opponentsGameWinRate =
      calculateOpponentGameWinPercentage(player.id, playerMatches, leagueMatches) / 100;

    return {
      playerId: player.id,
      playerName: player.name,
      leaguePoints: leaguePoints[player.id] || 0,
      matchesWon,
      matchesPlayed,
      matchWinRate,
      gamePoints,
      gamePossiblePoints,
      gameWinRate,
      opponentsMatchWinRate,
      opponentsGameWinRate,
    };
  });

  // Sort using the 5-level tie-breaking comparator
  const sortedEntries = [...leaderboardEntries].sort(compareLeaderboardEntries);

  // Assign ranks (with support for shared ranks)
  return assignRanks(sortedEntries);
}

/**
 * Compares two leaderboard entries using the 5-level tie-breaking algorithm.
 *
 * Tie-breaking order:
 * 1. League points (descending - higher is better)
 * 2. Match win rate (descending - higher is better)
 * 3. Opponents' match win rate (descending - higher is better)
 * 4. Game win rate (descending - higher is better)
 * 5. Opponents' game win rate (descending - higher is better)
 * 6. Player name (ascending - alphabetical)
 *
 * @param a - First leaderboard entry
 * @param b - Second leaderboard entry
 * @returns Negative if a < b, positive if a > b, 0 if equal
 */
function compareLeaderboardEntries(
  a: Omit<LeaderboardEntry, 'rank'>,
  b: Omit<LeaderboardEntry, 'rank'>
): number {
  // 1. League points (higher is better)
  if (a.leaguePoints !== b.leaguePoints) {
    return b.leaguePoints - a.leaguePoints;
  }

  // 2. Match win rate (higher is better)
  if (a.matchWinRate !== b.matchWinRate) {
    return b.matchWinRate - a.matchWinRate;
  }

  // 3. Opponents' match win rate (higher is better)
  if (a.opponentsMatchWinRate !== b.opponentsMatchWinRate) {
    return b.opponentsMatchWinRate - a.opponentsMatchWinRate;
  }

  // 4. Game win rate (higher is better)
  if (a.gameWinRate !== b.gameWinRate) {
    return b.gameWinRate - a.gameWinRate;
  }

  // 5. Opponents' game win rate (higher is better)
  if (a.opponentsGameWinRate !== b.opponentsGameWinRate) {
    return b.opponentsGameWinRate - a.opponentsGameWinRate;
  }

  // 6. Alphabetical by player name (A-Z)
  return a.playerName.localeCompare(b.playerName);
}

/**
 * Assigns rank positions to sorted leaderboard entries.
 *
 * Supports shared ranks: if two players have identical stats across all
 * tie-breaking criteria, they receive the same rank number. The next
 * player's rank will skip the shared positions.
 *
 * Example: If two players tie for rank 2, the next player is rank 4.
 *
 * @param sortedEntries - Array of leaderboard entries already sorted by compareLeaderboardEntries
 * @returns Array of complete leaderboard entries with rank numbers
 */
function assignRanks(sortedEntries: Omit<LeaderboardEntry, 'rank'>[]): LeaderboardEntry[] {
  if (sortedEntries.length === 0) {
    return [];
  }

  const rankedEntries: LeaderboardEntry[] = [];
  let currentRank = 1;

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];

    // Check if this entry is different from the previous one
    if (i > 0) {
      const previousEntry = sortedEntries[i - 1];
      const comparison = compareLeaderboardEntries(entry, previousEntry);

      // If entries are different, advance the rank
      if (comparison !== 0) {
        currentRank = i + 1;
      }
      // If comparison === 0, entries are identical, keep same rank
    }

    rankedEntries.push({
      ...entry,
      rank: currentRank,
    });
  }

  return rankedEntries;
}

/**
 * Extract player performance data for scoring system calculation
 * 
 * @param playerId - The player's ID
 * @param eventRankings - Array of ranked players for each event
 * @param leagueMatches - All matches in the league
 * @returns Player performance data
 */
function extractPlayerPerformance(
  playerId: string,
  eventRankings: ReturnType<typeof calculateEventRanking>[],
  leagueMatches: Match[]
): PlayerPerformanceData {
  let eventAttendance = 0;
  let firstPlaceFinishes = 0;
  let secondPlaceFinishes = 0;
  let thirdPlaceFinishes = 0;

  // Count placements across all events
  for (const eventRanking of eventRankings) {
    const playerResult = eventRanking.find(r => r.player.id === playerId);
    
    if (playerResult) {
      eventAttendance++;
      
      if (playerResult.rank === 1) {
        firstPlaceFinishes++;
      } else if (playerResult.rank === 2) {
        secondPlaceFinishes++;
      } else if (playerResult.rank === 3) {
        thirdPlaceFinishes++;
      }
    }
  }

  // Count match wins and game wins
  const playerMatches = leagueMatches.filter(
    (m) => m.player1Id === playerId || m.player2Id === playerId
  );

  let matchWins = 0;
  let gameWins = 0;

  for (const match of playerMatches) {
    // Count match wins (exclude draws)
    if (!match.draw) {
      if (match.player1Id === playerId && match.player1Score > match.player2Score) {
        matchWins++;
      } else if (match.player2Id === playerId && match.player2Score > match.player1Score) {
        matchWins++;
      }
    }

    // Count game wins
    if (match.player1Id === playerId) {
      gameWins += match.player1Score;
    } else if (match.player2Id === playerId) {
      gameWins += match.player2Score;
    }
  }

  return {
    eventAttendance,
    matchWins,
    gameWins,
    firstPlaceFinishes,
    secondPlaceFinishes,
    thirdPlaceFinishes,
  };
}

/**
 * Helper function to check if two leaderboard entries are equal across all criteria.
 *
 * This is useful for testing and validation purposes.
 *
 * @param a - First entry
 * @param b - Second entry
 * @returns True if entries are identical, false otherwise
 */
export function areEntriesEqual(
  a: Omit<LeaderboardEntry, 'rank'>,
  b: Omit<LeaderboardEntry, 'rank'>
): boolean {
  return compareLeaderboardEntries(a, b) === 0;
}
