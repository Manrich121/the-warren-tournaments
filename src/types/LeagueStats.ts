export interface LeagueStats {
  /** Total number of leagues across the entire application (global) */
  totalLeagues: number;
  /** Number of active leagues (global) */
  activeLeagues: number;
  /** Number of events (global) */
  eventsCount: number;
  /** Number of unique players (global) */
  playersCount: number;
  /** Number of matches (global) */
  matchesCount: number;
}
