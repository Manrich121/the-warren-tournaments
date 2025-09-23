import { useMutation, useQueryClient } from '@tanstack/react-query';
import { League } from '@/lib/types';
import { keys } from '@/hooks/keys';

const addLeague = async (newLeague: Omit<League, 'id' | 'createdAt'>): Promise<League> => {
  const res = await fetch('/api/leagues', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newLeague)
  });
  if (!res.ok) {
    throw new Error('Failed to add league');
  }
  return res.json();
};

export const useAddLeague = () => {
  const queryClient = useQueryClient();
  return useMutation<League, Error, Omit<League, 'id' | 'createdAt'>>({
    mutationFn: addLeague,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.leagues() });
    }
  });
};
