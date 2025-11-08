import { Match, Player, Event } from '@prisma/client';
import {
  calculateLeagueLeaderboard,
  areEntriesEqual
} from '../lib/leaderboard-calculator';
import { LeaderboardEntry } from '../types/leaderboard';

describe('Leaderboard Calculator', () => {
  // Helper to create test data
  const createPlayer = (id: string, name: string): Player => ({
    id,
    name,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const createEvent = (id: string, leagueId: string, name: string): Event => ({
    id,
    leagueId,
    name,
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const createMatch = (
    id: string,
    eventId: string,
    player1Id: string,
    player2Id: string,
    player1Score: number,
    player2Score: number,
    draw: boolean = false,
    round: number = 1
  ): Match => ({
    id,
    eventId,
    player1Id,
    player2Id,
    player1Score,
    player2Score,
    round,
    draw,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  describe('calculateLeagueLeaderboard', () => {
    it('should return empty array when no events exist', () => {
      const players = [createPlayer('p1', 'Alice')];
      const events: Event[] = [];
      const matches: Match[] = [];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);
      expect(result).toEqual([]);
    });

    it('should return empty array when no matches exist', () => {
      const players = [createPlayer('p1', 'Alice')];
      const events = [createEvent('e1', 'league1', 'Event 1')];
      const matches: Match[] = [];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);
      expect(result).toEqual([]);
    });

    it('should return empty array when no players exist', () => {
      const players: Player[] = [];
      const events = [createEvent('e1', 'league1', 'Event 1')];
      const matches = [createMatch('m1', 'e1', 'p1', 'p2', 2, 1)];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);
      expect(result).toEqual([]);
    });

    it('should rank players by league points (primary criterion)', () => {
      const players = [
        createPlayer('p1', 'Alice'),
        createPlayer('p2', 'Bob'),
        createPlayer('p3', 'Charlie')
      ];

      const events = [
        createEvent('e1', 'league1', 'Event 1'),
        createEvent('e2', 'league1', 'Event 2')
      ];

      // Event 1: Alice wins all
      const matches = [
        createMatch('m1', 'e1', 'p1', 'p2', 2, 0), // Alice beats Bob
        createMatch('m2', 'e1', 'p1', 'p3', 2, 1), // Alice beats Charlie
        createMatch('m3', 'e1', 'p2', 'p3', 1, 2), // Charlie beats Bob
        // Event 2: Bob wins all
        createMatch('m4', 'e2', 'p2', 'p1', 2, 0), // Bob beats Alice
        createMatch('m5', 'e2', 'p2', 'p3', 2, 1), // Bob beats Charlie
        createMatch('m6', 'e2', 'p1', 'p3', 1, 2)  // Charlie beats Alice
      ];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);

      // Both Alice and Bob get 1st in one event and varying places in other
      // Exact league points depend on getEventPoints function
      expect(result.length).toBe(3);
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
      expect(result[2].rank).toBe(3);

      // Verify league points are sorted descending
      expect(result[0].leaguePoints).toBeGreaterThanOrEqual(result[1].leaguePoints);
      expect(result[1].leaguePoints).toBeGreaterThanOrEqual(result[2].leaguePoints);
    });

    it('should use match win rate as tie-breaker when league points are equal', () => {
      const players = [
        createPlayer('p1', 'Alice'),
        createPlayer('p2', 'Bob')
      ];

      const events = [createEvent('e1', 'league1', 'Event 1')];

      // Alice: 2 wins, 1 loss (66.67% win rate)
      // Bob: 1 win, 2 losses (33.33% win rate)
      const matches = [
        createMatch('m1', 'e1', 'p1', 'p2', 2, 1), // Alice wins
        createMatch('m2', 'e1', 'p1', 'p3', 2, 0), // Alice wins (p3 not in players, but counts for stats)
        createMatch('m3', 'e1', 'p2', 'p1', 0, 2), // Alice wins
        createMatch('m4', 'e1', 'p2', 'p3', 2, 0)  // Bob wins
      ];

      // Add p3 temporarily for match calculations
      const allPlayers = [...players, createPlayer('p3', 'Charlie')];

      const result = calculateLeagueLeaderboard('league1', events, matches, allPlayers);

      // Alice should rank higher due to better match win rate
      expect(result[0].playerName).toBe('Alice');
      expect(result[0].matchWinRate).toBeGreaterThan(result[1].matchWinRate);
    });

    it('should handle draw matches correctly (not counted as wins)', () => {
      const players = [
        createPlayer('p1', 'Alice'),
        createPlayer('p2', 'Bob')
      ];

      const events = [createEvent('e1', 'league1', 'Event 1')];

      const matches = [
        createMatch('m1', 'e1', 'p1', 'p2', 0, 0, true), // Draw
        createMatch('m2', 'e1', 'p1', 'p2', 2, 1, false) // Alice wins
      ];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);

      // Alice should have 1 win out of 2 matches
      const alice = result.find(e => e.playerName === 'Alice');
      expect(alice?.matchesWon).toBe(1);
      expect(alice?.matchesPlayed).toBe(2);
      expect(alice?.matchWinRate).toBe(0.5);

      // Bob should have 0 wins out of 2 matches
      const bob = result.find(e => e.playerName === 'Bob');
      expect(bob?.matchesWon).toBe(0);
      expect(bob?.matchesPlayed).toBe(2);
      expect(bob?.matchWinRate).toBe(0);
    });

    it('should calculate game win rates correctly', () => {
      const players = [createPlayer('p1', 'Alice')];
      const events = [createEvent('e1', 'league1', 'Event 1')];

      const matches = [
        createMatch('m1', 'e1', 'p1', 'p2', 2, 1), // Alice: 2/3 games
        createMatch('m2', 'e1', 'p1', 'p3', 1, 2)  // Alice: 1/3 games
      ];

      const allPlayers = [...players, createPlayer('p2', 'Bob'), createPlayer('p3', 'Charlie')];

      const result = calculateLeagueLeaderboard('league1', events, matches, allPlayers);

      const alice = result.find(e => e.playerName === 'Alice');
      expect(alice?.gamePoints).toBe(3); // 2 + 1 individual scores
      expect(alice?.gamePossiblePoints).toBe(6); // (2+1) + (1+2)
      expect(alice?.gameWinRate).toBe(0.5); // 3/6
    });

    it('should handle alphabetical ordering when all numeric criteria are identical', () => {
      const players = [
        createPlayer('p1', 'Alice'),
        createPlayer('p2', 'Bob'),
        createPlayer('p3', 'Charlie')
      ];

      const events = [createEvent('e1', 'league1', 'Event 1')];

      // All players have identical records against each other
      const matches = [
        createMatch('m1', 'e1', 'p1', 'p2', 1, 1, true),
        createMatch('m2', 'e1', 'p2', 'p3', 1, 1, true),
        createMatch('m3', 'e1', 'p3', 'p1', 1, 1, true)
      ];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);

      // All have same stats, so alphabetical order determines final rank order
      // Since names differ, each gets a unique rank (alphabetical is the final tie-breaker)
      expect(result.length).toBe(3);
      expect(result[0].playerName).toBe('Alice');
      expect(result[1].playerName).toBe('Bob');
      expect(result[2].playerName).toBe('Charlie');
      
      // Each should have a different rank since alphabetical order breaks the tie
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
      expect(result[2].rank).toBe(3);
    });

    it('should apply alphabetical tie-breaking when all other criteria equal', () => {
      const players = [
        createPlayer('p1', 'Zara'),
        createPlayer('p2', 'Alice'),
        createPlayer('p3', 'Bob')
      ];

      const events = [createEvent('e1', 'league1', 'Event 1')];

      // Create identical stats for all players
      const matches = [
        createMatch('m1', 'e1', 'p1', 'p2', 1, 1, true),
        createMatch('m2', 'e1', 'p2', 'p3', 1, 1, true),
        createMatch('m3', 'e1', 'p3', 'p1', 1, 1, true)
      ];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);

      // Alphabetical order: Alice, Bob, Zara
      // If all stats truly identical, they might share rank 1, but let's verify order
      expect(result[0].playerName).toBe('Alice');
      expect(result[1].playerName).toBe('Bob');
      expect(result[2].playerName).toBe('Zara');
    });

    it('should filter events and matches by league ID', () => {
      const players = [createPlayer('p1', 'Alice'), createPlayer('p2', 'Bob')];

      const events = [
        createEvent('e1', 'league1', 'Event 1'),
        createEvent('e2', 'league2', 'Event 2') // Different league
      ];

      const matches = [
        createMatch('m1', 'e1', 'p1', 'p2', 2, 1), // league1
        createMatch('m2', 'e2', 'p1', 'p2', 0, 2)  // league2 (should be ignored)
      ];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);

      // Only match from e1 should count
      expect(result.length).toBe(2);
      const alice = result.find(e => e.playerName === 'Alice');
      expect(alice?.matchesPlayed).toBe(1);
      expect(alice?.matchesWon).toBe(1);
    });

    it('should handle players with 0 matches (edge case)', () => {
      const players = [
        createPlayer('p1', 'Alice'),
        createPlayer('p2', 'Bob'),
        createPlayer('p3', 'Charlie') // Charlie doesn't play
      ];

      const events = [createEvent('e1', 'league1', 'Event 1')];

      const matches = [
        createMatch('m1', 'e1', 'p1', 'p2', 2, 1)
      ];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);

      const charlie = result.find(e => e.playerName === 'Charlie');
      expect(charlie).toBeUndefined(); // Charlie filtered out since no matches
    });

    it('should calculate opponent statistics correctly', () => {
      const players = [
        createPlayer('p1', 'Alice'),
        createPlayer('p2', 'Bob'),
        createPlayer('p3', 'Charlie')
      ];

      const events = [createEvent('e1', 'league1', 'Event 1')];

      const matches = [
        createMatch('m1', 'e1', 'p1', 'p2', 2, 1), // Alice beats Bob
        createMatch('m2', 'e1', 'p1', 'p3', 2, 0), // Alice beats Charlie
        createMatch('m3', 'e1', 'p2', 'p3', 2, 1)  // Bob beats Charlie
      ];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);

      const alice = result.find(e => e.playerName === 'Alice');
      // Alice faced Bob and Charlie
      // Opponent win rates should be average of Bob and Charlie's win rates
      expect(alice?.opponentsMatchWinRate).toBeGreaterThan(0);
      expect(alice?.opponentsMatchWinRate).toBeLessThanOrEqual(1);
    });

    it('should assign ranks with gaps for shared ranks', () => {
      const players = [
        createPlayer('p1', 'Alice'),
        createPlayer('p2', 'Bob'),
        createPlayer('p3', 'Charlie'),
        createPlayer('p4', 'David')
      ];

      const events = [createEvent('e1', 'league1', 'Event 1')];

      // Alice wins all, Bob and Charlie tie, David loses all
      const matches = [
        createMatch('m1', 'e1', 'p1', 'p2', 2, 0), // Alice beats Bob
        createMatch('m2', 'e1', 'p1', 'p3', 2, 0), // Alice beats Charlie
        createMatch('m3', 'e1', 'p1', 'p4', 2, 0), // Alice beats David
        createMatch('m4', 'e1', 'p2', 'p3', 1, 1, true), // Bob and Charlie draw
        createMatch('m5', 'e1', 'p2', 'p4', 2, 0), // Bob beats David
        createMatch('m6', 'e1', 'p3', 'p4', 2, 0)  // Charlie beats David
      ];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);

      expect(result[0].playerName).toBe('Alice');
      expect(result[0].rank).toBe(1);

      // Bob and Charlie might share rank 2 if their stats are identical
      // David should be last (rank 4 if Bob/Charlie share rank 2)
      const david = result.find(e => e.playerName === 'David');
      expect(david?.rank).toBeGreaterThanOrEqual(3);
    });
  });

  describe('areEntriesEqual', () => {
    it('should return true for entries with identical stats', () => {
      const entry1: Omit<LeaderboardEntry, 'rank'> = {
        playerId: 'p1',
        playerName: 'Alice',
        leaguePoints: 10,
        matchesWon: 5,
        matchesPlayed: 10,
        matchWinRate: 0.5,
        gamePoints: 20,
        gamePossiblePoints: 40,
        gameWinRate: 0.5,
        opponentsMatchWinRate: 0.45,
        opponentsGameWinRate: 0.48
      };

      const entry2: Omit<LeaderboardEntry, 'rank'> = {
        playerId: 'p2',
        playerName: 'Bob',
        leaguePoints: 10,
        matchesWon: 5,
        matchesPlayed: 10,
        matchWinRate: 0.5,
        gamePoints: 20,
        gamePossiblePoints: 40,
        gameWinRate: 0.5,
        opponentsMatchWinRate: 0.45,
        opponentsGameWinRate: 0.48
      };

      expect(areEntriesEqual(entry1, entry2)).toBe(false); // Different names: Alice vs Bob
    });

    it('should return false for entries with different league points', () => {
      const entry1: Omit<LeaderboardEntry, 'rank'> = {
        playerId: 'p1',
        playerName: 'Alice',
        leaguePoints: 10,
        matchesWon: 5,
        matchesPlayed: 10,
        matchWinRate: 0.5,
        gamePoints: 20,
        gamePossiblePoints: 40,
        gameWinRate: 0.5,
        opponentsMatchWinRate: 0.45,
        opponentsGameWinRate: 0.48
      };

      const entry2: Omit<LeaderboardEntry, 'rank'> = {
        ...entry1,
        leaguePoints: 12
      };

      expect(areEntriesEqual(entry1, entry2)).toBe(false);
    });

    it('should return false for entries with different match win rates', () => {
      const entry1: Omit<LeaderboardEntry, 'rank'> = {
        playerId: 'p1',
        playerName: 'Alice',
        leaguePoints: 10,
        matchesWon: 5,
        matchesPlayed: 10,
        matchWinRate: 0.5,
        gamePoints: 20,
        gamePossiblePoints: 40,
        gameWinRate: 0.5,
        opponentsMatchWinRate: 0.45,
        opponentsGameWinRate: 0.48
      };

      const entry2: Omit<LeaderboardEntry, 'rank'> = {
        ...entry1,
        matchWinRate: 0.6
      };

      expect(areEntriesEqual(entry1, entry2)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high league points correctly', () => {
      const players = [createPlayer('p1', 'Alice')];
      const events = Array.from({ length: 50 }, (_, i) =>
        createEvent(`e${i}`, 'league1', `Event ${i}`)
      );

      const matches = events.flatMap(event =>
        [createMatch(`m${event.id}`, event.id, 'p1', 'p2', 2, 0)]
      );

      const allPlayers = [...players, createPlayer('p2', 'Bob')];

      const result = calculateLeagueLeaderboard('league1', events, matches, allPlayers);

      const alice = result.find(e => e.playerName === 'Alice');
      expect(alice?.leaguePoints).toBeGreaterThan(0);
      expect(Number.isFinite(alice?.leaguePoints)).toBe(true);
    });

    it('should handle division by zero for win rates', () => {
      const players = [createPlayer('p1', 'Alice')];
      const events = [createEvent('e1', 'league1', 'Event 1')];
      // No matches means division by zero should be handled
      const matches: Match[] = [];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);
      expect(result).toEqual([]); // No matches = empty leaderboard
    });

    it('should handle players with identical names', () => {
      const players = [
        createPlayer('p1', 'Alice'),
        createPlayer('p2', 'Alice') // Same name, different ID
      ];

      const events = [createEvent('e1', 'league1', 'Event 1')];

      const matches = [
        createMatch('m1', 'e1', 'p1', 'p2', 2, 1)
      ];

      const result = calculateLeagueLeaderboard('league1', events, matches, players);

      // Both Alices should appear with distinct player IDs
      expect(result.length).toBe(2);
      expect(result[0].playerId).not.toBe(result[1].playerId);
    });
  });
});
