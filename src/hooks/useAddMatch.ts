import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Match } from '@/lib/types';
import { keys } from '@/hooks/keys';

const addMatch = async (newMatch: Omit<Match, 'id' | 'createdAt' | 'player1' | 'player2'>): Promise<Match> => {
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
  return useMutation<Match, Error, Omit<Match, 'id' | 'createdAt' | 'player1' | 'player2'>>({
    mutationFn: addMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.matches() });
    }
  });
};
