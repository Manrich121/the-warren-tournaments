import { useMutation, useQueryClient } from '@tanstack/react-query';
import { keys } from '@/hooks/keys';

const deleteLeague = async (id: number): Promise<void> => {
  const res = await fetch(`/api/leagues/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Failed to delete league');
  }
};

export const useDeleteLeague = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteLeague,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.leagues() });
    }
  });
};
