import { useQuery } from '@tanstack/react-query';
import { Player } from '@prisma/client';
import { keys } from '@/hooks/keys';

const fetchPlayer = async (id: string): Promise<Player> => {
  const res = await fetch(`/api/players/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch player');
  }
  return res.json();
};

export const usePlayer = (id: string) => {
  return useQuery<Player, Error>({
    queryKey: keys.player(id),
    queryFn: () => fetchPlayer(id),
    enabled: !!id
  });
};
