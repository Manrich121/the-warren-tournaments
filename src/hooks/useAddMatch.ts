import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Match } from '@prisma/client';
import { keys } from '@/hooks/keys';

export type AddMatchParams = Omit<Match, 'id' | 'createdAt' | 'updatedAt' | 'player1' | 'player2'>;

const addMatch = async (newMatch: AddMatchParams): Promise<Match> => {
  const res = await fetch('/api/matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newMatch)
  });
  if (!res.ok) {
    throw new Error('Failed to add match');
  }
  return res.json();
};

export const useAddMatch = () => {
  const queryClient = useQueryClient();
  return useMutation<Match, Error, AddMatchParams>({
    mutationFn: addMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.matches() });
    }
  });
};
