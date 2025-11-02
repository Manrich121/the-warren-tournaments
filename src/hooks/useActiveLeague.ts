import { useQuery } from '@tanstack/react-query';
import { League } from '@prisma/client';
import { keys } from '@/hooks/keys';

const fetchActiveLeague = async (): Promise<League> => {
  const res = await fetch('/api/leagues/active');
  if (!res.ok) {
    throw new Error('Failed to fetch active league');
  }
  return res.json();
};

export const useActiveLeague = () => {
  return useQuery<League, Error>({
    queryKey: keys.activeLeague(),
    queryFn: fetchActiveLeague
  });
};
