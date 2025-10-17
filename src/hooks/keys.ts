export const keys = {
  leagues: () => ['leagues'] as const,
  activeLeague: () => [...keys.leagues(), 'active'] as const,
  league: (id: string | undefined) => [...keys.leagues(), id] as const,
  leagueLeaderboard: (id: string) => [...keys.league(id), 'leaderboard'] as const,
  events: () => ['events'] as const,
  event: (id: string | undefined) => [...keys.events(), id] as const,
  eventLeaderboard: (id: string) => [...keys.event(id), 'leaderboard'] as const,
  matches: () => ['matches'] as const,
  match: (id: string | undefined) => [...keys.matches(), id] as const,
  players: () => ['players'] as const,
  player: (id: string | undefined) => [...keys.players(), id] as const,
  prizePool: () => ['prizePool'] as const
};
