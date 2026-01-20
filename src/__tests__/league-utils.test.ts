import { getMostRecentLeague, getLeagueStatus, formatLeagueOption, League } from '@/lib/league-utils';
import { formatDateRange } from '@/lib/utils/format';

describe('League Utilities', () => {
  describe('getMostRecentLeague', () => {
    it('should return null for empty array', () => {
      const result = getMostRecentLeague([]);
      expect(result).toBeNull();
    });

    it('should return the only league when array has one element', () => {
      const league: League = {
        id: '1',
        name: 'Summer League',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        createdAt: new Date('2024-05-01'),
        updatedAt: new Date('2024-05-01')
      };

      const result = getMostRecentLeague([league]);
      expect(result).toEqual(league);
    });

    it('should return league with latest end date', () => {
      const leagues: League[] = [
        {
          id: '1',
          name: 'Spring League',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-05-31'),
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01')
        },
        {
          id: '2',
          name: 'Summer League',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          createdAt: new Date('2024-05-01'),
          updatedAt: new Date('2024-05-01')
        },
        {
          id: '3',
          name: 'Winter League',
          startDate: new Date('2023-12-01'),
          endDate: new Date('2024-02-29'),
          createdAt: new Date('2023-11-01'),
          updatedAt: new Date('2023-11-01')
        }
      ];

      const result = getMostRecentLeague(leagues);
      expect(result?.id).toBe('2');
      expect(result?.name).toBe('Summer League');
    });

    it('should use createdAt as tie-breaker when end dates are equal', () => {
      const leagues: League[] = [
        {
          id: '1',
          name: 'League A',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          createdAt: new Date('2024-05-01'),
          updatedAt: new Date('2024-05-01')
        },
        {
          id: '2',
          name: 'League B',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          createdAt: new Date('2024-05-15'), // More recent creation
          updatedAt: new Date('2024-05-15')
        }
      ];

      const result = getMostRecentLeague(leagues);
      expect(result?.id).toBe('2');
      expect(result?.name).toBe('League B');
    });

    it('should handle date strings correctly', () => {
      const leagues: League[] = [
        {
          id: '1',
          name: 'League A',
          startDate: '2024-06-01T00:00:00Z',
          endDate: '2024-08-31T00:00:00Z',
          createdAt: '2024-05-01T00:00:00Z',
          updatedAt: '2024-05-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'League B',
          startDate: '2024-09-01T00:00:00Z',
          endDate: '2024-11-30T00:00:00Z',
          createdAt: '2024-08-01T00:00:00Z',
          updatedAt: '2024-08-01T00:00:00Z'
        }
      ];

      const result = getMostRecentLeague(leagues);
      expect(result?.id).toBe('2');
    });

    it('should return first league when all criteria are identical', () => {
      const leagues: League[] = [
        {
          id: '1',
          name: 'League A',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          createdAt: new Date('2024-05-01'),
          updatedAt: new Date('2024-05-01')
        },
        {
          id: '2',
          name: 'League B',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          createdAt: new Date('2024-05-01'),
          updatedAt: new Date('2024-05-01')
        }
      ];

      const result = getMostRecentLeague(leagues);
      expect(result?.id).toBe('1'); // Returns first when tied
    });
  });

  describe('getLeagueStatus', () => {
    it('should return "Upcoming" for league that has not started', () => {
      const league = {
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-08-31')
      };
      const now = new Date('2025-05-15');

      const status = getLeagueStatus(league, now);
      expect(status).toBe('Upcoming');
    });

    it('should return "Active" for league that is currently ongoing', () => {
      const league = {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31')
      };
      const now = new Date('2024-07-15');

      const status = getLeagueStatus(league, now);
      expect(status).toBe('Active');
    });

    it('should return "Active" on start date', () => {
      const league = {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31')
      };
      const now = new Date('2024-06-01');

      const status = getLeagueStatus(league, now);
      expect(status).toBe('Active');
    });

    it('should return "Active" on end date', () => {
      const league = {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31')
      };
      const now = new Date('2024-08-31');

      const status = getLeagueStatus(league, now);
      expect(status).toBe('Active');
    });

    it('should return "Past" for league that has ended', () => {
      const league = {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31')
      };
      const now = new Date('2024-09-01');

      const status = getLeagueStatus(league, now);
      expect(status).toBe('Past');
    });

    it('should use current date when now parameter is not provided', () => {
      // Create a league that ended recently
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const league = {
        startDate: new Date('2024-01-01'),
        endDate: yesterday
      };

      const status = getLeagueStatus(league);
      expect(status).toBe('Past');
    });

    it('should handle date strings correctly', () => {
      const league = {
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-08-31T00:00:00Z'
      };
      const now = new Date('2024-07-15');

      const status = getLeagueStatus(league, now);
      expect(status).toBe('Active');
    });

    it('should handle time components correctly by normalizing to date only', () => {
      const league = {
        startDate: new Date('2024-06-01T14:30:00Z'),
        endDate: new Date('2024-08-31T23:59:59Z')
      };
      const now = new Date('2024-06-01T08:00:00Z');

      const status = getLeagueStatus(league, now);
      expect(status).toBe('Active'); // Should be active since dates match
    });
  });

  describe('formatDateRange', () => {
    it('should format date range within same year', () => {
      const start = new Date('2024-06-01');
      const end = new Date('2024-08-31');

      const formatted = formatDateRange(start, end);
      expect(formatted).toBe('1 Jun 2024 - 31 Aug 2024');
    });

    it('should format date range spanning different years', () => {
      const start = new Date('2024-12-01');
      const end = new Date('2025-02-28');

      const formatted = formatDateRange(start, end);
      expect(formatted).toBe('1 Dec 2024 - 28 Feb 2025');
    });

    it('should handle same start and end date', () => {
      const date = new Date('2024-07-15');

      const formatted = formatDateRange(date, date);
      expect(formatted).toBe('15 Jul 2024 - 15 Jul 2024');
    });

    it('should handle date strings', () => {
      const start = '2024-06-01T00:00:00Z';
      const end = '2024-08-31T00:00:00Z';

      const formatted = formatDateRange(start, end);
      expect(formatted).toBe('1 Jun 2024 - 31 Aug 2024');
    });

    it('should format single-digit days correctly', () => {
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-09');

      const formatted = formatDateRange(start, end);
      expect(formatted).toBe('1 Jun 2024 - 9 Jun 2024');
    });

    it('should format double-digit days correctly', () => {
      const start = new Date('2024-06-15');
      const end = new Date('2024-06-25');

      const formatted = formatDateRange(start, end);
      expect(formatted).toBe('15 Jun 2024 - 25 Jun 2024');
    });
  });

  describe('formatLeagueOption', () => {
    it('should format league option with name and date range', () => {
      const league = {
        name: 'Summer League 2024',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31')
      };

      const formatted = formatLeagueOption(league);
      expect(formatted).toBe('Summer League 2024 (1 Jun 2024 - 31 Aug 2024)');
    });

    it('should format league option with cross-year range', () => {
      const league = {
        name: 'Winter League',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-02-28')
      };

      const formatted = formatLeagueOption(league);
      expect(formatted).toBe('Winter League (1 Dec 2024 - 28 Feb 2025)');
    });

    it('should handle league with empty name', () => {
      const league = {
        name: '',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31')
      };

      const formatted = formatLeagueOption(league);
      expect(formatted).toBe(' (1 Jun 2024 - 31 Aug 2024)');
    });

    it('should handle date strings', () => {
      const league = {
        name: 'Spring League',
        startDate: '2024-03-01T00:00:00Z',
        endDate: '2024-05-31T00:00:00Z'
      };

      const formatted = formatLeagueOption(league);
      expect(formatted).toBe('Spring League (1 Mar 2024 - 31 May 2024)');
    });
  });
});
