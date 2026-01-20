import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scoringSystemKeys } from './keys';
import type { CreateScoringSystemInput } from '@/lib/validations/scoring-system';

const addScoringSystem = async (data: CreateScoringSystemInput) => {
  const res = await fetch('/api/scoring-systems', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create scoring system');
  }

  return res.json();
};

export const useAddScoringSystem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addScoringSystem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scoringSystemKeys.all() });
    }
  });
};
