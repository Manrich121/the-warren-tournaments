import { useQuery } from '@tanstack/react-query';
import { League } from '@prisma/client';
import { keys } from '@/hooks/keys';

/**
 * Fetches the currently active league (league where current date is between start and end dates).
 * Returns null if no active league exists (404 response).
 */
const fetchActiveLeague = async (): Promise<League | null> => {
  const res = await fetch('/api/leagues/active');
  
  // Handle 404 gracefully - no active league exists
  if (res.status === 404) {
    return null;
  }
  
  if (!res.ok) {
    throw new Error('Failed to fetch active league');
  }
  
  return res.json();
};

/**
 * Hook to fetch the currently active league.
 * 
 * @returns Query result with active league or null
 * 
 * Configuration:
 * - staleTime: 5 minutes (leagues don't change frequently)
 * - Gracefully handles 404 by returning null instead of throwing
 */
export const useActiveLeague = () => {
  return useQuery<League | null, Error>({
    queryKey: keys.activeLeague(),
    queryFn: fetchActiveLeague,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
