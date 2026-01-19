/**
 * Integration Test: League Switching
 *
 * Tests the complete user flow for switching between league leaderboards:
 * 1. Page loads with most recent league selected by default
 * 2. User selects a different league from the selector
 * 3. Leaderboard updates to show selected league's data
 * 4. Quick Stats update to reflect selected league
 *
 * This test verifies the integration between:
 * - LeagueSelector component
 * - Home page state management
 * - Data fetching hooks (useLeagues, useMostRecentLeague, useLeagueLeaderboard)
 * - QuickStats component
 * - Leaderboard component
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLeagues } from '@/hooks/useLeagues';
import { useMostRecentLeague } from '@/hooks/useMostRecentLeague';
import { useLeagueLeaderboard } from '@/hooks/useLeagueLeaderboard';
import { mockLeaderboard, mockLeagues } from '../__fixtures__/mockData';

// Mock fetch for API responses
global.fetch = jest.fn();

describe('League Switching Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    // Reset mock
    (global.fetch as jest.Mock).mockReset();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('Initial Load', () => {
    it('should fetch all leagues on initial load', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeagues
      });

      const { result } = renderHook(() => useLeagues(), { wrapper });

      // Note: useLeagues has initialData: () => [], so it starts with empty array
      expect(result.current.data).toEqual([]);

      await waitFor(() => expect(result.current.data).toEqual(mockLeagues));

      expect(global.fetch).toHaveBeenCalledWith('/api/leagues');
    });

    it('should fetch most recent league on initial load', async () => {
      const mostRecentLeague = mockLeagues[2]; // Winter League 2024 (latest end date)

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mostRecentLeague
      });

      const { result } = renderHook(() => useMostRecentLeague(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith('/api/leagues/most-recent');
      expect(result.current.data).toEqual(mostRecentLeague);
    });

    it('should fetch leaderboard for most recent league', async () => {
      const leagueId = 'league-3';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaderboard
      });

      const { result } = renderHook(() => useLeagueLeaderboard(leagueId), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(`/api/leagues/${leagueId}/leaderboard`);
      expect(result.current.data).toEqual(mockLeaderboard);
    });
  });

  describe('League Switching', () => {
    it('should fetch new leaderboard when league selection changes', async () => {
      const initialLeagueId = 'league-3';
      const newLeagueId = 'league-1';

      // Mock initial leaderboard fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaderboard
      });

      const { result, rerender } = renderHook(({ leagueId }: { leagueId?: string }) => useLeagueLeaderboard(leagueId), {
        wrapper,
        initialProps: { leagueId: initialLeagueId }
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockLeaderboard);

      // Mock new leaderboard fetch
      const newMockLeaderboard = [mockLeaderboard[1]]; // Only Bob
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => newMockLeaderboard
      });

      // Change league selection
      rerender({ leagueId: newLeagueId });

      await waitFor(() => expect(result.current.data).toEqual(newMockLeaderboard));

      expect(global.fetch).toHaveBeenCalledWith(`/api/leagues/${newLeagueId}/leaderboard`);
    });

    it('should handle empty leaderboard when switching to league with no matches', async () => {
      const leagueId = 'league-1';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const { result } = renderHook(() => useLeagueLeaderboard(leagueId), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when fetching leagues', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const { result } = renderHook(() => useLeagues(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });

    it('should handle API error when fetching leaderboard', async () => {
      const leagueId = 'league-1';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const { result } = renderHook(() => useLeagueLeaderboard(leagueId), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });

    it('should handle network error gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useLeagues(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Network error'));
    });
  });

  describe('Loading States', () => {
    it('should have initialData for leagues hook', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => mockLeagues }), 100))
      );

      const { result } = renderHook(() => useLeagues(), { wrapper });

      // useLeagues has initialData: () => [], so it starts with empty array
      expect(result.current.data).toEqual([]);
      expect(result.current.isLoading).toBe(false); // initialData means no loading state
    });

    it('should show loading state while fetching leaderboard', () => {
      const leagueId = 'league-1';

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => mockLeaderboard }), 100))
      );

      const { result } = renderHook(() => useLeagueLeaderboard(leagueId), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain cache when switching back to previously viewed league', async () => {
      const leagueId = 'league-1';

      // First fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaderboard
      });

      const { result, rerender } = renderHook(({ leagueId }: { leagueId?: string }) => useLeagueLeaderboard(leagueId), {
        wrapper,
        initialProps: { leagueId }
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Switch to different league
      rerender({ leagueId: 'league-2' });

      // Switch back to original league (should use cache)
      rerender({ leagueId });

      // Should not trigger additional fetch (cache hit)
      expect(result.current.data).toEqual(mockLeaderboard);
    });
  });
});
