import { useQuery } from '@tanstack/react-query';
import { Player } from '@prisma/client';
import { keys } from '@/hooks/keys';

const fetchPlayers = async (): Promise<Player[]> => {
  const res = await fetch('/api/players');
  if (!res.ok) {
    throw new Error('Failed to fetch players');
  }
  return res.json();
};

export const usePlayers = () => {
  return useQuery<Player[], Error>({
    queryKey: keys.players(),
    queryFn: fetchPlayers,
    initialData: () => []
  });
};
