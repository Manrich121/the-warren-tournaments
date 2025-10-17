import { useQuery } from '@tanstack/react-query';
import { LeagueRankedPlayer } from '@/lib/playerStats';
import { keys } from '@/hooks/keys';

const fetchLeagueLeaderboard = async (leagueId: string): Promise<LeagueRankedPlayer[]> => {
  const res = await fetch(`/api/leagues/${leagueId}/leaderboard`);
  if (!res.ok) {
    throw new Error('Failed to fetch league leaderboard');
  }
  return res.json();
};

export const useLeagueLeaderboard = (leagueId: string) => {
  return useQuery<LeagueRankedPlayer[], Error>({
    queryKey: keys.leagueLeaderboard(leagueId),
    queryFn: () => fetchLeagueLeaderboard(leagueId),
    enabled: !!leagueId,
  });
};
