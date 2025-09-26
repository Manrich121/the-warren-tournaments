import { useQuery } from '@tanstack/react-query';
import { PrizePool } from '@prisma/client';
import { keys } from '@/hooks/keys';

const fetchPrizePool = async (leagueId?: string): Promise<PrizePool[]> => {
  const url = leagueId ? `/api/prize-pool?leagueId=${leagueId}` : '/api/prize-pool';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch prize pools');
  }
  return res.json();
};

export interface UsePrizePoolParams {
  leagueId?: string;
}

export const usePrizePools = ({ leagueId }: UsePrizePoolParams = {}) => {
  return useQuery<PrizePool[], Error>({
    queryKey: leagueId ? [...keys.prizePool(), leagueId] : keys.prizePool(),
    queryFn: () => fetchPrizePool(leagueId)
  });
};
