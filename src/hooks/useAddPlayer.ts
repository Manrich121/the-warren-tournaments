import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Player } from '@prisma/client';
import { keys } from '@/hooks/keys';

const addPlayer = async (newPlayer: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player> => {
  const res = await fetch('/api/players', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newPlayer)
  });
  if (!res.ok) {
    throw new Error('Failed to add player');
  }
  return res.json();
};

export const useAddPlayer = () => {
  const queryClient = useQueryClient();
  return useMutation<Player, Error, Omit<Player, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: addPlayer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.players() });
    }
  });
};
