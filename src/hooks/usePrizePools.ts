import { useQuery } from '@tanstack/react-query';
import { PrizePool } from '@/lib/types';
import { keys } from '@/hooks/keys';

const fetchPrizePool = async (): Promise<PrizePool[]> => {
  const res = await fetch('/api/prize-pool');
  if (!res.ok) {
    throw new Error('Failed to fetch prize pools');
  }
  return res.json();
};

export const usePrizePools = () => {
  return useQuery<PrizePool[], Error>({
    queryKey: keys.prizePool(),
    queryFn: fetchPrizePool
  });
};
