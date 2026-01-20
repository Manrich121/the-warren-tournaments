/**
 * League Utility Functions
 *
 * This file contains utility functions for league-related operations such as
 * determining the most recent league, calculating league status, and formatting
 * date ranges for display.
 */

import { LeagueStatus } from '@/types/leaderboard';
import { formatDateRange } from '@/lib/utils/format';

export interface League {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Determines the most recent league from a list of leagues.
 *
 * The most recent league is determined by:
 * 1. League with the latest end date
 * 2. If end dates are equal, the league with the most recent createdAt timestamp
 *
 * @param leagues - Array of leagues to evaluate
 * @returns The most recent league, or null if the array is empty
 *
 * @example
 * ```typescript
 * const leagues = [
 *   { id: '1', endDate: new Date('2024-08-31'), createdAt: new Date('2024-06-01') },
 *   { id: '2', endDate: new Date('2024-12-31'), createdAt: new Date('2024-09-01') }
 * ];
 * const mostRecent = getMostRecentLeague(leagues);
 * // Returns league with id '2' (latest end date)
 * ```
 */
export function getMostRecentLeague(leagues: League[]): League | null {
  if (!leagues || leagues.length === 0) {
    return null;
  }

  return leagues.reduce((mostRecent, league) => {
    if (!mostRecent) return league;

    const currentEndDate = new Date(league.endDate);
    const mostRecentEndDate = new Date(mostRecent.endDate);

    // Primary sort: end date (most recent wins)
    if (currentEndDate > mostRecentEndDate) return league;
    if (currentEndDate < mostRecentEndDate) return mostRecent;

    // Tie-breaker: creation date (most recently created wins)
    const currentCreatedAt = new Date(league.createdAt);
    const mostRecentCreatedAt = new Date(mostRecent.createdAt);

    return currentCreatedAt > mostRecentCreatedAt ? league : mostRecent;
  }, null as League | null);
}

/**
 * Determines the status of a league based on its start and end dates.
 *
 * Status definitions:
 * - "Upcoming": League has not started yet (startDate > now)
 * - "Active": League is currently ongoing (startDate <= now <= endDate)
 * - "Past": League has ended (endDate < now)
 *
 * @param league - The league to evaluate
 * @param now - Current date/time (defaults to new Date(), injectable for testing)
 * @returns The league status
 *
 * @example
 * ```typescript
 * const activeLeague = {
 *   startDate: new Date('2024-06-01'),
 *   endDate: new Date('2024-12-31')
 * };
 * const status = getLeagueStatus(activeLeague, new Date('2024-08-15'));
 * // Returns "Active"
 * ```
 */
export function getLeagueStatus(
  league: Pick<League, 'startDate' | 'endDate'>,
  now: Date = new Date()
): LeagueStatus {
  const startDate = new Date(league.startDate);
  const endDate = new Date(league.endDate);

  // Reset time components for accurate date comparison
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (start > nowDate) return "Upcoming";
  if (start <= nowDate && end >= nowDate) return "Active";
  return "Past";
}


/**
 * Formats a league option for display in a selector.
 *
 * Format: "{League Name} ({Date Range})"
 *
 * @param league - The league to format
 * @returns Formatted league option string
 *
 * @example
 * ```typescript
 * const league = {
 *   name: 'Summer League 2024',
 *   startDate: new Date('2024-06-01'),
 *   endDate: new Date('2024-08-31')
 * };
 * const option = formatLeagueOption(league);
 * // Returns "Summer League 2024 (Jun 1 - Aug 31)"
 * ```
 */
export function formatLeagueOption(league: Pick<League, 'name' | 'startDate' | 'endDate'>): string {
  const dateRange = formatDateRange(league.startDate, league.endDate);
  return `${league.name} (${dateRange})`;
}
