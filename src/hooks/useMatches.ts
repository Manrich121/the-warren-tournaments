import { useQuery } from '@tanstack/react-query';
import { Match } from '@prisma/client';
import { keys } from '@/hooks/keys';

const fetchMatches = async (): Promise<Match[]> => {
  const res = await fetch('/api/matches');
  if (!res.ok) {
    throw new Error('Failed to fetch matches');
  }
  return res.json();
};

export const useMatches = () => {
  return useQuery<Match[], Error>({
    queryKey: keys.matches(),
    queryFn: fetchMatches
  });
};
