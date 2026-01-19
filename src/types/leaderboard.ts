/**
 * Leaderboard and League Type Definitions
 *
 * This file contains TypeScript interfaces for the league dashboard feature.
 * These types are used for client-side data transformation and API responses.
 */

/**
 * Represents a single player's aggregated statistics and ranking within a specific league.
 */
export interface LeaderboardEntry {
  /** Player unique identifier */
  playerId: string;

  /** Player display name (from Player entity) */
  playerName: string;

  /** Calculated rank position (1-indexed, shared ranks allowed) */
  rank: number;

  /** Total league points earned across all events in the league */
  leaguePoints: number;

  /** Total number of matches played (including draws) */
  matchesPlayed: number;

  /** Number of matches won (draws excluded) */
  matchesWon: number;

  /** Number of match points */
  matchPoints: number;

  /** Match win percentage: */
  matchWinPercentage: number;

  /** Number of games won (draws excluded) */
  gamesWon: number;

  /** Total game points scored across all matches */
  gamePoints: number;

  /** Game win percentage */
  gameWinPercentage: number;

  /** Average match win rate of all opponents faced */
  opponentsMatchWinPercentage: number;

  /** Average game win rate of all opponents faced */
  opponentsGameWinPercentage: number;
}

/**
 * League status based on start and end dates
 */
export type LeagueStatus = 'Active' | 'Upcoming' | 'Past';
