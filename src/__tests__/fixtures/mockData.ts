/**
 * Mock data fixtures for testing table components
 */

import { League, Event, Match, Player } from '@prisma/client';

/**
 * Mock leagues for testing
 */
export const mockLeagues: League[] = [
  {
    id: 'league-1',
    name: 'Summer League 2025',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-08-31'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'league-2',
    name: 'Winter League 2025',
    startDate: new Date('2025-12-01'),
    endDate: new Date('2026-02-28'),
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'league-3',
    name: 'Spring Championship',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-05-31'),
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
  },
];

/**
 * Mock players for testing
 */
export const mockPlayers: Player[] = [
  {
    id: 'player-1',
    name: 'Alice Johnson',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'player-2',
    name: 'Bob Smith',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'player-3',
    name: 'Charlie Brown',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: 'player-4',
    name: 'Diana Prince',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
];

/**
 * Mock events for testing
 */
export const mockEvents: Event[] = [
  {
    id: 'event-1',
    leagueId: 'league-1',
    name: 'Summer Tournament Round 1',
    date: new Date('2025-06-15'),
    createdAt: new Date('2025-05-01'),
    updatedAt: new Date('2025-05-01'),
  },
  {
    id: 'event-2',
    leagueId: 'league-1',
    name: 'Summer Tournament Round 2',
    date: new Date('2025-07-15'),
    createdAt: new Date('2025-05-01'),
    updatedAt: new Date('2025-05-01'),
  },
  {
    id: 'event-3',
    leagueId: 'league-2',
    name: 'Winter Championship Finals',
    date: new Date('2025-12-20'),
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-01'),
  },
];

/**
 * Mock matches for testing
 */
export const mockMatches: Match[] = [
  {
    id: 'match-1',
    eventId: 'event-1',
    player1Id: 'player-1',
    player2Id: 'player-2',
    player1Score: 10,
    player2Score: 8,
    round: 1,
    draw: false,
    createdAt: new Date('2025-06-15'),
    updatedAt: new Date('2025-06-15'),
  },
  {
    id: 'match-2',
    eventId: 'event-1',
    player1Id: 'player-3',
    player2Id: 'player-4',
    player1Score: 7,
    player2Score: 7,
    round: 1,
    draw: true,
    createdAt: new Date('2025-06-15'),
    updatedAt: new Date('2025-06-15'),
  },
  {
    id: 'match-3',
    eventId: 'event-2',
    player1Id: 'player-1',
    player2Id: 'player-3',
    player1Score: 12,
    player2Score: 9,
    round: 2,
    draw: false,
    createdAt: new Date('2025-07-15'),
    updatedAt: new Date('2025-07-15'),
  },
];

/**
 * Helper function to generate large dataset for performance testing
 */
export function generateMockLeagues(count: number): League[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `league-${i + 1}`,
    name: `League ${i + 1}`,
    startDate: new Date(2025, i % 12, 1),
    endDate: new Date(2025, (i + 2) % 12, 28),
    createdAt: new Date(2024, i % 12, 1),
    updatedAt: new Date(2024, i % 12, 1),
  }));
}

/**
 * Helper function to generate large player dataset for performance testing
 */
export function generateMockPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
    createdAt: new Date(2024, 0, i % 365 + 1),
    updatedAt: new Date(2024, 0, i % 365 + 1),
  }));
}
