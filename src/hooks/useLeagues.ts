import { useQuery } from '@tanstack/react-query';
import { League, ScoringSystem } from '@prisma/client';
import { keys } from '@/hooks/keys';

// Extended League type with scoringSystem relation
export type LeagueWithScoringSystem = League & {
  scoringSystem?: {
    id: string;
    name: string;
    isDefault: boolean;
  } | null;
};

const fetchLeagues = async (): Promise<LeagueWithScoringSystem[]> => {
  const res = await fetch('/api/leagues');
  if (!res.ok) {
    throw new Error('Failed to fetch leagues');
  }
  return res.json();
};

export const useLeagues = () => {
  return useQuery<LeagueWithScoringSystem[], Error>({
    queryKey: keys.leagues(),
    queryFn: fetchLeagues,
    initialData: () => []
  });
};
