import { useMutation, useQueryClient } from '@tanstack/react-query';
import { keys } from '@/hooks/keys';

interface UpdatePrizePoolData {
  leagueId: string;
  amount: number;
}

const updatePrizePool = async (data: UpdatePrizePoolData) => {
  const res = await fetch('/api/prize-pool', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error('Failed to update prize pool');
  }

  return res.json();
};

export const useUpdatePrizePool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePrizePool,
    onSuccess: data => {
      // Invalidate all prize pool queries
      queryClient.invalidateQueries({ queryKey: keys.prizePool() });
      // Invalidate specific league prize pool query
      queryClient.invalidateQueries({ queryKey: [...keys.prizePool(), data.leagueId] });
    }
  });
};
