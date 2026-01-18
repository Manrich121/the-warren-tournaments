import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scoringSystemKeys } from './keys';

const deleteScoringSystem = async (id: string) => {
  const res = await fetch(`/api/scoring-systems/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete scoring system');
  }

  return res.json();
};

export const useDeleteScoringSystem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScoringSystem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scoringSystemKeys.all() });
    }
  });
};
