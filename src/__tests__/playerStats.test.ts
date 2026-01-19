import { Match, Player } from '@prisma/client';
import {
  calculateMatchPoints,
  calculateGamePoints,
  calculateMatchWinPercentage,
  calculateGameWinPercentage,
  calculateOpponentMatchWinPercentage,
  calculateOpponentGameWinPercentage,
  calculateEventRanking
} from '@/lib/PlayerStats';

describe('Player Stats Calculations', () => {
  const playerId = 'player1';
  const matches: Match[] = [
    // Player 1 wins 2-1 against Player 2
    {
      id: 'm1',
      eventId: 'e1',
      player1Id: 'player1',
      player2Id: 'player2',
      player1Score: 2,
      player2Score: 1,
      round: 1,
      draw: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Player 1 loses 1-2 against Player 3
    {
      id: 'm2',
      eventId: 'e1',
      player1Id: 'player1',
      player2Id: 'player3',
      player1Score: 1,
      player2Score: 2,
      round: 2,
      draw: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Player 1 draws 0-0 against Player 2
    {
      id: 'm3',
      eventId: 'e1',
      player1Id: 'player2',
      player2Id: 'player1',
      player1Score: 0,
      player2Score: 0,
      round: 3,
      draw: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  describe('calculateMatchPoints', () => {
    it('should calculate player1 match points correctly', () => {
      const points = calculateMatchPoints(playerId, matches);
      expect(points).toBe(4); // 3 for the win, 1 for the draw
    });

    it('should calculate player2 match points correctly', () => {
      const points = calculateMatchPoints('player2', matches);
      expect(points).toBe(1); // 1 for the draw
    });
  });

  describe('calculateGamePoints', () => {
    it('should calculate player1 game points correctly', () => {
      const points = calculateGamePoints(playerId, matches);
      expect(points).toBe(10);
    });

    it('should calculate player2 game points correctly', () => {
      const points = calculateGamePoints('player2', matches);
      expect(points).toBe(4);
    });
  });

  describe('calculateMatchWinPercentage', () => {
    it('should calculate player1 match win percentage', () => {
      const percentage = calculateMatchWinPercentage(playerId, matches);
      expect(percentage).toBe(4 / (3 * 3));
    });

    it('should calculate player1 match win percentage 5-2-1', () => {
      const matches: Match[] = [
        {
          id: 'm1',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 1,
          round: 1,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm2',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 0,
          round: 2,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm3',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 0,
          player2Score: 0,
          round: 3,
          draw: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm4',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 0,
          player2Score: 2,
          round: 4,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm5',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 0,
          round: 5,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm6',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 0,
          player2Score: 2,
          round: 6,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm7',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 0,
          round: 7,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm8',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 0,
          round: 8,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const percentage = calculateMatchWinPercentage(playerId, matches);
      expect(percentage).toBe(16 / (8 * 3));
    });

    it('should calculate player1 match win percentage 1-3-0', () => {
      const matches: Match[] = [
        {
          id: 'm1',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 1,
          round: 1,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm2',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 0,
          player2Score: 2,
          round: 2,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm3',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 0,
          player2Score: 2,
          round: 3,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm4',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 0,
          player2Score: 2,
          round: 4,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const percentage = calculateMatchWinPercentage(playerId, matches);
      // would be 25%, but minimum is 33%
      expect(percentage).toBeCloseTo(0.33);
    });

    it('should calculate player2 match win percentage correctly', () => {
      const playerId = 'player2';
      const percentage = calculateMatchWinPercentage(playerId, matches);
      // Would be 16.67%, but minimum is 33%
      expect(percentage).toBe(0.33);
    });
  });

  describe('calculateGameWinPercentage', () => {
    it('should calculate player1 game win percentage correctly', () => {
      const percentage = calculateGameWinPercentage(playerId, matches);
      expect(percentage).toBe(10 / (3 * 6));
    });

    it('should calculate player2 game win percentage correctly', () => {
      const playerId = 'player2';
      const percentage = calculateGameWinPercentage(playerId, matches);
      expect(percentage).toBe(4 / (3 * 3));
    });

    it('should calculate player1 game win percentage 21 GPs / 10 games', () => {
      const matches: Match[] = [
        {
          id: 'm1',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 0,
          round: 1,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm2',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 1,
          round: 2,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm3',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 1,
          player2Score: 2,
          round: 3,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm4',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 0,
          round: 4,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const percentage = calculateGameWinPercentage(playerId, matches);
      expect(percentage).toBe(21 / (3 * 10));
    });
    it('should calculate player1 game win percentage 9 GPs / 11 games', () => {
      const matches: Match[] = [
        {
          id: 'm1',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 1,
          player2Score: 2,
          round: 1,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm2',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 1,
          player2Score: 2,
          round: 2,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm3',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 0,
          player2Score: 2,
          round: 3,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm4',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 1,
          player2Score: 2,
          round: 4,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const percentage = calculateGameWinPercentage(playerId, matches);
      // Would be (9 / (3 * 11))
      expect(percentage).toBe(0.33);
    });
  });

  describe('calculateOpponentMatchWinPercentage', () => {
    it('should calculate opponent match win percentage correctly', () => {
      const allMatches: Match[] = [
        {
          id: 'm1',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 1,
          round: 1,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm2',
          eventId: 'e1',
          player1Id: 'player3',
          player2Id: 'player4',
          player1Score: 2,
          player2Score: 1,
          round: 1,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm3',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player3',
          player1Score: 1,
          player2Score: 2,
          round: 2,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm4',
          eventId: 'e1',
          player1Id: 'player2',
          player2Id: 'player4',
          player1Score: 0,
          player2Score: 0,
          round: 2,
          draw: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      const percentage = calculateOpponentMatchWinPercentage(playerId, matches, allMatches);
      expect(percentage).toBe(0.665);
    });
  });

  describe('calculateOpponentGameWinPercentage', () => {
    it('should calculate opponent game win percentage correctly', () => {
      const allMatches: Match[] = [
        {
          id: 'm1',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 1,
          round: 1,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm2',
          eventId: 'e1',
          player1Id: 'player3',
          player2Id: 'player4',
          player1Score: 2,
          player2Score: 1,
          round: 1,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm3',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player3',
          player1Score: 1,
          player2Score: 2,
          round: 2,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm4',
          eventId: 'e1',
          player1Id: 'player2',
          player2Id: 'player4',
          player1Score: 0,
          player2Score: 0,
          round: 2,
          draw: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      const percentage = calculateOpponentGameWinPercentage(playerId, matches, allMatches);
      expect(percentage).toBeCloseTo(0.5555, 2);
    });
  });

  describe('calculateEventRanking', () => {
    it('should rank players correctly', () => {
      const players: Player[] = [
        { id: 'player1', name: 'Player 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'player2', name: 'Player 2', createdAt: new Date(), updatedAt: new Date() },
        { id: 'player4', name: 'Player 4', createdAt: new Date(), updatedAt: new Date() },
        { id: 'player3', name: 'Player 3', createdAt: new Date(), updatedAt: new Date() }
      ];

      const allMatches: Match[] = [
        {
          id: 'm1',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player2',
          player1Score: 2,
          player2Score: 1,
          round: 1,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm2',
          eventId: 'e1',
          player1Id: 'player3',
          player2Id: 'player4',
          player1Score: 2,
          player2Score: 1,
          round: 1,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm3',
          eventId: 'e1',
          player1Id: 'player1',
          player2Id: 'player3',
          player1Score: 2,
          player2Score: 0,
          round: 2,
          draw: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'm4',
          eventId: 'e1',
          player1Id: 'player2',
          player2Id: 'player4',
          player1Score: 0,
          player2Score: 0,
          round: 2,
          draw: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const rankedPlayers = calculateEventRanking(players, allMatches);

      expect(rankedPlayers[0].player.id).toBe('player1');
      expect(rankedPlayers[1].player.id).toBe('player3');
      expect(rankedPlayers[2].player.id).toBe('player2');
      expect(rankedPlayers[3].player.id).toBe('player4');
    });
  });
});
