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

  /** Number of matches won (draws excluded) */
  matchesWon: number;

  /** Total number of matches played (including draws) */
  matchesPlayed: number;

  /** Match win rate: matchesWon / matchesPlayed (0 if no matches) */
  matchWinRate: number;

  /** Total game points scored across all matches */
  gamePoints: number;

  /** Total game points possible (sum of both players' scores in all matches) */
  gamePossiblePoints: number;

  /** Game win rate: gamePoints / gamePossiblePoints (0 if no games) */
  gameWinRate: number;

  /** Average match win rate of all opponents faced */
  opponentsMatchWinRate: number;

  /** Average game win rate of all opponents faced */
  opponentsGameWinRate: number;
}

/**
 * League status based on start and end dates
 */
export type LeagueStatus = "Active" | "Upcoming" | "Past";

/**
 * Extended league interface with formatted date strings for UI display
 */
export interface LeagueWithDates {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;

  /** Formatted date range for display: "Jun 1 - Aug 31" */
  dateRangeDisplay: string;

  /** Calculated status: "Active" | "Upcoming" | "Past" */
  status: LeagueStatus;
}

/**
 * Aggregated statistics for a specific league, used by Quick Stats cards
 */
export interface LeagueStats {
  /** League identifier */
  leagueId: string;

  /** Number of events in this league */
  eventsCount: number;

  /** Number of matches across all events in this league */
  matchesCount: number;

  /** Number of unique players who participated in any match */
  playersCount: number;

  /** Prize pool amount for this league (from PrizePool entity) */
  prizePoolAmount: number;
}

/**
 * Intermediate data structure for calculating leaderboard statistics
 * Internal to leaderboard calculator - not exposed in API responses
 */
export interface PlayerMatchData {
  playerId: string;
  playerName: string;
  matches: Array<{
    matchId: string;
    opponentId: string;
    isWin: boolean;
    isDraw: boolean;
    playerScore: number;
    opponentScore: number;
  }>;
}