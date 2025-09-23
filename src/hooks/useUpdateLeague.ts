import { useMutation, useQueryClient } from '@tanstack/react-query';
import { League } from '@prisma/client';
import { keys } from '@/hooks/keys';

const updateLeague = async (updatedLeague: Partial<League> & { id: string }): Promise<League> => {
  const res = await fetch(`/api/leagues/${updatedLeague.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedLeague)
  });
  if (!res.ok) {
    throw new Error('Failed to update league');
  }
  return res.json();
};

export const useUpdateLeague = () => {
  const queryClient = useQueryClient();
  return useMutation<League, Error, Partial<League> & { id: string }>({
    mutationFn: updateLeague,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.league(variables.id) });
    }
  });
};
