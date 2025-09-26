import { useQuery } from '@tanstack/react-query';
import { League } from '@prisma/client';
import { keys } from '@/hooks/keys';

const fetchLeagues = async (): Promise<League[]> => {
  const res = await fetch('/api/leagues');
  if (!res.ok) {
    throw new Error('Failed to fetch leagues');
  }
  return res.json();
};

export const useLeagues = () => {
  return useQuery<League[], Error>({
    queryKey: keys.leagues(),
    queryFn: fetchLeagues
  });
};
