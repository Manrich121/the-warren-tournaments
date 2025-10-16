import { Match, Player } from '@prisma/client';
import {
  calculateMatchPoints,
  calculateGamePoints,
  calculateMatchWinPercentage,
  calculateGameWinPercentage,
  calculateOpponentMatchWinPercentage,
  calculateOpponentGameWinPercentage,
  calculateEventRanking,
  calculateLeagueRanking,
  RankedPlayer,
} from '../lib/playerStats';

describe('Player Stats Calculations', () => {
  const playerId = 'player1';
  const matches: Match[] = [
    { id: 'm1', eventId: 'e1', player1Id: 'player1', player2Id: 'player2', player1Score: 2, player2Score: 1, round: 1, draw: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 'm2', eventId: 'e1', player1Id: 'player1', player2Id: 'player3', player1Score: 1, player2Score: 2, round: 2, draw: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 'm3', eventId: 'e1', player1Id: 'player2', player2Id: 'player1', player1Score: 0, player2Score: 0, round: 3, draw: true, createdAt: new Date(), updatedAt: new Date() },
  ];

  describe('calculateMatchPoints', () => {
    it('should calculate match points correctly', () => {
      const points = calculateMatchPoints(playerId, matches);
      expect(points).toBe(4); // 3 for the win, 1 for the draw
    });
  });

  describe('calculateGamePoints', () => {
    it('should calculate game points correctly', () => {
      const points = calculateGamePoints(playerId, matches);
      expect(points).toBe(3);
    });
  });

  describe('calculateMatchWinPercentage', () => {
    it('should calculate match win percentage correctly', () => {
      const percentage = calculateMatchWinPercentage(playerId, matches);
      expect(percentage).toBe((1 / 3) * 100);
    });
  });

  describe('calculateGameWinPercentage', () => {
    it('should calculate game win percentage correctly', () => {
      const percentage = calculateGameWinPercentage(playerId, matches);
      expect(percentage).toBe((3 / 6) * 100);
    });
  });

  describe('calculateOpponentMatchWinPercentage', () => {
    it('should calculate opponent match win percentage correctly', () => {
      const allMatches: Match[] = [
        { id: 'm1', eventId: 'e1', player1Id: 'player1', player2Id: 'player2', player1Score: 2, player2Score: 1, round: 1, draw: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'm2', eventId: 'e1', player1Id: 'player1', player2Id: 'player3', player1Score: 1, player2Score: 2, round: 2, draw: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'm3', eventId: 'e1', player1Id: 'player2', player2Id: 'player1', player1Score: 0, player2Score: 0, round: 3, draw: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      const percentage = calculateOpponentMatchWinPercentage(playerId, matches, allMatches);
      expect(percentage).toBe(50);
    });
  });

  describe('calculateOpponentGameWinPercentage', () => {
    it('should calculate opponent game win percentage correctly', () => {
      const allMatches: Match[] = [
        { id: 'm1', eventId: 'e1', player1Id: 'player1', player2Id: 'player2', player1Score: 2, player2Score: 1, round: 1, draw: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'm2', eventId: 'e1', player1Id: 'player1', player2Id: 'player3', player1Score: 1, player2Score: 2, round: 2, draw: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'm3', eventId: 'e1', player1Id: 'player2', player2Id: 'player1', player1Score: 0, player2Score: 0, round: 3, draw: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      const percentage = calculateOpponentGameWinPercentage(playerId, matches, allMatches);
      expect(percentage).toBeCloseTo(50);
    });
  });

  describe('calculateEventRanking', () => {
    it('should rank players correctly', () => {
      const players: Player[] = [
        { id: 'player1', name: 'Player 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'player2', name: 'Player 2', createdAt: new Date(), updatedAt: new Date() },
        { id: 'player3', name: 'Player 3', createdAt: new Date(), updatedAt: new Date() },
      ];

      const allMatches: Match[] = [
        { id: 'm1', eventId: 'e1', player1Id: 'player1', player2Id: 'player2', player1Score: 2, player2Score: 1, round: 1, draw: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'm2', eventId: 'e1', player1Id: 'player1', player2Id: 'player3', player1Score: 1, player2Score: 2, round: 1, draw: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'm3', eventId: 'e1', player1Id: 'player2', player2Id: 'player3', player1Score: 2, player2Score: 0, round: 2, draw: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'm4', eventId: 'e1', player1Id: 'player1', player2Id: 'player2', player1Score: 1, player2Score: 1, round: 3, draw: true, createdAt: new Date(), updatedAt: new Date() },
      ];

      const rankedPlayers = calculateEventRanking(players, allMatches);

      expect(rankedPlayers[0].player.id).toBe('player2');
      expect(rankedPlayers[1].player.id).toBe('player1');
      expect(rankedPlayers[2].player.id).toBe('player3');
    });
  });

  describe('calculateLeagueRanking', () => {
    it('should rank players correctly', () => {
      const players: Player[] = [
        { id: 'player1', name: 'Player 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'player2', name: 'Player 2', createdAt: new Date(), updatedAt: new Date() },
        { id: 'player3', name: 'Player 3', createdAt: new Date(), updatedAt: new Date() },
      ];

      const event1Rankings: RankedPlayer[] = [
        { rank: 1, player: players[0], matchPoints: 0, gamePoints: 0, matchWinPercentage: 0, gameWinPercentage: 0, opponentsMatchWinPercentage: 0, opponentsGameWinPercentage: 0 },
        { rank: 2, player: players[1], matchPoints: 0, gamePoints: 0, matchWinPercentage: 0, gameWinPercentage: 0, opponentsMatchWinPercentage: 0, opponentsGameWinPercentage: 0 },
        { rank: 3, player: players[2], matchPoints: 0, gamePoints: 0, matchWinPercentage: 0, gameWinPercentage: 0, opponentsMatchWinPercentage: 0, opponentsGameWinPercentage: 0 },
      ];

      const event2Rankings: RankedPlayer[] = [
        { rank: 3, player: players[0], matchPoints: 0, gamePoints: 0, matchWinPercentage: 0, gameWinPercentage: 0, opponentsMatchWinPercentage: 0, opponentsGameWinPercentage: 0 },
        { rank: 1, player: players[1], matchPoints: 0, gamePoints: 0, matchWinPercentage: 0, gameWinPercentage: 0, opponentsMatchWinPercentage: 0, opponentsGameWinPercentage: 0 },
        { rank: 2, player: players[2], matchPoints: 0, gamePoints: 0, matchWinPercentage: 0, gameWinPercentage: 0, opponentsMatchWinPercentage: 0, opponentsGameWinPercentage: 0 },
      ];

      const rankedPlayers = calculateLeagueRanking(players, [event1Rankings, event2Rankings]);

      expect(rankedPlayers[0].player.id).toBe('player2');
      expect(rankedPlayers[1].player.id).toBe('player1');
      expect(rankedPlayers[2].player.id).toBe('player3');
    });
  });
});