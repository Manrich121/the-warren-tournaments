import { useQuery } from '@tanstack/react-query';
import { Match } from '@prisma/client';
import { keys } from '@/hooks/keys';

interface UseMatchesOptions {
  eventId?: string;
  leagueId?: string;
}

const fetchMatches = async (options?: UseMatchesOptions): Promise<Match[]> => {
  const params = new URLSearchParams();
  if (options?.eventId) params.append('eventId', options.eventId);
  if (options?.leagueId) params.append('leagueId', options.leagueId);

  const queryString = params.toString();
  const url = `/api/matches${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch matches');
  }
  return res.json();
};

export const useMatches = (options: UseMatchesOptions = {}) => {
  return useQuery<Match[], Error>({
    queryKey: keys.matches(options),
    queryFn: () => fetchMatches(options),
    initialData: () => []
  });
};
