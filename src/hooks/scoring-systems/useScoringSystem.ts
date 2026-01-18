import { useQuery } from '@tanstack/react-query';
import { scoringSystemKeys } from './keys';
import type { ScoringSystemWithRelations } from '@/types/scoring-system';

const fetchScoringSystem = async (id: string): Promise<ScoringSystemWithRelations> => {
  const res = await fetch(`/api/scoring-systems/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch scoring system');
  }
  const data = await res.json();
  return data.data;
};

export const useScoringSystem = (id: string) => {
  return useQuery<ScoringSystemWithRelations, Error>({
    queryKey: scoringSystemKeys.detail(id),
    queryFn: () => fetchScoringSystem(id),
    enabled: !!id
  });
};
