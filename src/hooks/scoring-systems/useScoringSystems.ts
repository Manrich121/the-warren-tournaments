import { useQuery } from '@tanstack/react-query';
import { scoringSystemKeys } from './keys';
import type { ScoringSystemWithRelations } from '@/types/scoring-system';

const fetchScoringSystems = async (): Promise<ScoringSystemWithRelations[]> => {
  const res = await fetch('/api/scoring-systems');
  if (!res.ok) {
    throw new Error('Failed to fetch scoring systems');
  }
  const data = await res.json();
  return data.data;
};

export const useScoringSystems = () => {
  return useQuery<ScoringSystemWithRelations[], Error>({
    queryKey: scoringSystemKeys.list(),
    queryFn: fetchScoringSystems
  });
};
