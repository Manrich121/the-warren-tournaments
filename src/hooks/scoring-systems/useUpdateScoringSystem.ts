import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scoringSystemKeys } from './keys';
import type { UpdateScoringSystemInput } from '@/lib/validations/scoring-system';

const updateScoringSystem = async (data: UpdateScoringSystemInput) => {
  const res = await fetch(`/api/scoring-systems/${data.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update scoring system');
  }

  return res.json();
};

export const useUpdateScoringSystem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScoringSystem,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scoringSystemKeys.all() });
      queryClient.invalidateQueries({
        queryKey: scoringSystemKeys.detail(variables.id)
      });
    }
  });
};
