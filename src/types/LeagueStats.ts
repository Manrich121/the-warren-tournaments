export interface LeagueStats {
  /** Total number of leagues across the entire application (global) */
  totalLeagues: number;
  /** Number of active leagues (global) */
  activeLeagues: number;
  /** Number of events in the selected league */
  eventsCount: number;
  /** Number of unique players in the selected league */
  playersCount: number;
  /** Number of matches in the selected league */
  matchesCount: number;
}
