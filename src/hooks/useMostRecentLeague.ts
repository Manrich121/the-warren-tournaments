import { useQuery } from '@tanstack/react-query';
import { League } from '@prisma/client';
import { keys } from '@/hooks/keys';

/**
 * Fetches the most recent league based on end date (with createdAt as tie-breaker).
 * Returns null if no leagues exist.
 */
const fetchMostRecentLeague = async (): Promise<League | null> => {
  const res = await fetch('/api/leagues/most-recent');
  if (!res.ok) {
    throw new Error('Failed to fetch most recent league');
  }
  return res.json();
};

/**
 * Hook to fetch the most recent league.
 * 
 * @returns Query result with most recent league or null
 * 
 * Configuration:
 * - staleTime: 30 seconds (leagues don't change frequently)
 * - Handles null gracefully (no leagues exist)
 */
export const useMostRecentLeague = () => {
  return useQuery<League | null, Error>({
    queryKey: keys.mostRecentLeague(),
    queryFn: fetchMostRecentLeague,
    staleTime: 30 * 1000, // 30 seconds
  });
};
