// src/lib/utils/apply-tie-breakers.ts

import type { TieBreakerType } from "@prisma/client";

/**
 * Player data with all metrics needed for tie-breaking
 */
export type PlayerWithMetrics = {
  playerId: string;
  playerName: string;
  leaguePoints: number;
  matchPoints: number;
  gameWinPercentage: number;
  oppMatchWinPercentage: number;
  oppGameWinPercentage: number;
  eventAttendance: number;
  matchWins: number;
};

/**
 * Tie-breaker configuration
 */
export type TieBreaker = {
  type: TieBreakerType;
  order: number;
};

/**
 * Player with calculated rank
 */
export type RankedPlayer = PlayerWithMetrics & {
  rank: number;
};

/**
 * Apply tie-breakers to rank players with equal league points
 *
 * @param players - Array of players to rank
 * @param tieBreakers - Ordered array of tie-breakers to apply
 * @returns Array of players with ranks assigned
 *
 * @description
 * - Players are first sorted by league points (descending)
 * - When players have equal points, tie-breakers are applied in order
 * - Missing data is treated as zero (FR-016a)
 * - Players tied on all metrics share the same rank (FR-016b)
 * - Subsequent ranks skip positions after shared ranks
 *
 * @example
 * ```typescript
 * const ranked = applyTieBreakers(
 *   [
 *     { playerId: '1', leaguePoints: 10, eventAttendance: 5, ... },
 *     { playerId: '2', leaguePoints: 10, eventAttendance: 3, ... }
 *   ],
 *   [{ type: 'EVENT_ATTENDANCE_TIE', order: 1 }]
 * );
 * // Player 1 ranks higher due to more event attendance
 * ```
 */
export function applyTieBreakers(
  players: PlayerWithMetrics[],
  tieBreakers: TieBreaker[]
): RankedPlayer[] {
  // Edge case: No players
  if (!players || players.length === 0) {
    return [];
  }

  // Sort players by league points first (descending)
  const sortedPlayers = [...players].sort((a, b) => {
    // Primary sort: league points (descending)
    if (b.leaguePoints !== a.leaguePoints) {
      return b.leaguePoints - a.leaguePoints;
    }

    // If points are equal, apply tie-breakers
    return applyTieBreakersComparison(a, b, tieBreakers);
  });

  // Assign ranks with shared rank handling
  const rankedPlayers: RankedPlayer[] = [];
  let currentRank = 1;
  let previousPlayer: PlayerWithMetrics | null = null;

  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i]!;

    // Check if this player should share rank with previous
    if (previousPlayer && arePlayersTied(previousPlayer, player, tieBreakers)) {
      // Share the same rank as previous player
      rankedPlayers.push({
        ...player,
        rank: rankedPlayers[rankedPlayers.length - 1]!.rank,
      });
    } else {
      // Assign new rank (accounting for skipped positions)
      rankedPlayers.push({
        ...player,
        rank: currentRank,
      });
    }

    previousPlayer = player;
    currentRank++;
  }

  return rankedPlayers;
}

/**
 * Compare two players using tie-breakers
 *
 * @param a - First player
 * @param b - Second player
 * @param tieBreakers - Ordered tie-breakers
 * @returns Negative if a ranks higher, positive if b ranks higher, 0 if tied
 */
function applyTieBreakersComparison(
  a: PlayerWithMetrics,
  b: PlayerWithMetrics,
  tieBreakers: TieBreaker[]
): number {
  // If no tie-breakers, consider them tied
  if (!tieBreakers || tieBreakers.length === 0) {
    return 0;
  }

  // Sort tie-breakers by order and apply them sequentially
  const sortedTieBreakers = [...tieBreakers].sort((x, y) => x.order - y.order);

  for (const tieBreaker of sortedTieBreakers) {
    const aValue = getTieBreakerValue(a, tieBreaker.type);
    const bValue = getTieBreakerValue(b, tieBreaker.type);

    // Higher value wins (descending order)
    if (bValue !== aValue) {
      return bValue - aValue;
    }

    // If equal, continue to next tie-breaker
  }

  // All tie-breakers exhausted and still tied
  return 0;
}

/**
 * Check if two players are completely tied on all metrics
 *
 * @param a - First player
 * @param b - Second player
 * @param tieBreakers - Tie-breakers to check
 * @returns True if players are tied on all metrics
 */
function arePlayersTied(
  a: PlayerWithMetrics,
  b: PlayerWithMetrics,
  tieBreakers: TieBreaker[]
): boolean {
  // Must have equal league points
  if (a.leaguePoints !== b.leaguePoints) {
    return false;
  }

  // Check all tie-breakers
  return applyTieBreakersComparison(a, b, tieBreakers) === 0;
}

/**
 * Extract tie-breaker metric value from player data
 *
 * @param player - Player data
 * @param tieBreakerType - Type of tie-breaker metric
 * @returns Metric value, treating missing data as zero (FR-016a)
 */
function getTieBreakerValue(
  player: PlayerWithMetrics,
  tieBreakerType: TieBreakerType
): number {
  switch (tieBreakerType) {
    case "LEAGUE_POINTS":
      return player.leaguePoints ?? 0;
    case "MATCH_POINTS":
      return player.matchPoints ?? 0;
    case "OPP_MATCH_WIN_PCT":
      return player.oppMatchWinPercentage ?? 0;
    case "GAME_WIN_PCT":
      return player.gameWinPercentage ?? 0;
    case "OPP_GAME_WIN_PCT":
      return player.oppGameWinPercentage ?? 0;
    case "EVENT_ATTENDANCE_TIE":
      return player.eventAttendance ?? 0;
    case "MATCH_WINS_TIE":
      return player.matchWins ?? 0;
    default:
      // Unknown tie-breaker type - treat as zero
      return 0;
  }
}

/**
 * Rank players by league points only (no tie-breakers)
 *
 * @param players - Array of players to rank
 * @returns Array of players with ranks assigned
 */
export function rankPlayersByPoints(
  players: PlayerWithMetrics[]
): RankedPlayer[] {
  return applyTieBreakers(players, []);
}
