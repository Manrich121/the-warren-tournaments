import { useQuery } from '@tanstack/react-query';
import { LeaderboardEntry } from '@/types/leaderboard';
import { keys } from '@/hooks/keys';

/**
 * Fetches the ranked leaderboard for a specific league.
 * Returns an array of leaderboard entries with full tie-breaking applied.
 */
const fetchLeagueLeaderboard = async (leagueId: string): Promise<LeaderboardEntry[]> => {
  const res = await fetch(`/api/leagues/${leagueId}/leaderboard`);
  if (!res.ok) {
    throw new Error('Failed to fetch league leaderboard');
  }
  return res.json();
};

/**
 * Hook to fetch the leaderboard for a specific league.
 * 
 * @param leagueId - The ID of the league to fetch leaderboard for
 * @returns Query result with array of ranked leaderboard entries
 * 
 * Configuration:
 * - staleTime: 1 minute (leaderboards update as matches are played)
 * - Only enabled when leagueId is provided
 */
export const useLeagueLeaderboard = (leagueId: string | undefined) => {
  return useQuery<LeaderboardEntry[], Error>({
    queryKey: keys.leagueLeaderboard(leagueId || ''),
    queryFn: () => fetchLeagueLeaderboard(leagueId!),
    enabled: !!leagueId,
    staleTime: 60 * 1000, // 1 minute
  });
};
