// src/lib/utils/calculate-points.ts

import type { PointMetricType } from "@prisma/client";

/**
 * Player performance data for point calculation
 */
export type PlayerPerformanceData = {
  eventAttendance: number;
  matchWins: number;
  gameWins: number;
  firstPlaceFinishes: number;
  secondPlaceFinishes: number;
  thirdPlaceFinishes: number;
};

/**
 * Scoring formula with multiplier and point metric
 */
export type ScoringFormula = {
  multiplier: number;
  pointMetric: PointMetricType;
  order: number;
};

/**
 * Calculate league points for a player based on performance data and scoring formulas
 *
 * @param performanceData - Player's performance metrics
 * @param formulas - Array of scoring formulas to apply
 * @returns Total league points calculated
 *
 * @example
 * ```typescript
 * const points = calculateLeaguePoints(
 *   { eventAttendance: 5, matchWins: 10, gameWins: 25, firstPlaceFinishes: 1, secondPlaceFinishes: 2, thirdPlaceFinishes: 1 },
 *   [
 *     { multiplier: 1, pointMetric: 'EVENT_ATTENDANCE', order: 1 },
 *     { multiplier: 3, pointMetric: 'FIRST_PLACE', order: 2 }
 *   ]
 * );
 * // Returns: 5 + 3 = 8
 * ```
 */
export function calculateLeaguePoints(
  performanceData: PlayerPerformanceData,
  formulas: ScoringFormula[]
): number {
  // Edge case: No formulas provided
  if (!formulas || formulas.length === 0) {
    return 0;
  }

  // Calculate points for each formula and sum them
  const totalPoints = formulas.reduce((total, formula) => {
    const metricValue = getMetricValue(performanceData, formula.pointMetric);

    // Handle edge case: missing data treated as zero (FR-016a)
    const safeMetricValue = metricValue ?? 0;

    // Apply multiplier (can be zero or negative per edge case clarification)
    const points = formula.multiplier * safeMetricValue;

    return total + points;
  }, 0);

  return totalPoints;
}

/**
 * Extract the appropriate metric value from performance data
 *
 * @param performanceData - Player's performance metrics
 * @param metricType - The type of metric to extract
 * @returns The value of the requested metric, or 0 if not found
 */
function getMetricValue(
  performanceData: PlayerPerformanceData,
  metricType: PointMetricType
): number {
  switch (metricType) {
    case "EVENT_ATTENDANCE":
      return performanceData.eventAttendance;
    case "MATCH_WINS":
      return performanceData.matchWins;
    case "GAME_WINS":
      return performanceData.gameWins;
    case "FIRST_PLACE":
      return performanceData.firstPlaceFinishes;
    case "SECOND_PLACE":
      return performanceData.secondPlaceFinishes;
    case "THIRD_PLACE":
      return performanceData.thirdPlaceFinishes;
    default:
      // Unknown metric type - treat as zero
      return 0;
  }
}

/**
 * Calculate points for multiple players
 *
 * @param playersData - Array of player performance data with IDs
 * @param formulas - Array of scoring formulas to apply
 * @returns Array of player IDs with their calculated points
 */
export function calculatePointsForPlayers(
  playersData: Array<{ playerId: string } & PlayerPerformanceData>,
  formulas: ScoringFormula[]
): Array<{ playerId: string; leaguePoints: number }> {
  return playersData.map((playerData) => ({
    playerId: playerData.playerId,
    leaguePoints: calculateLeaguePoints(playerData, formulas),
  }));
}
