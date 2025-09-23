export const keys = {
  leagues: () => ['leagues'] as const,
  league: (id: string | undefined) => [...keys.leagues(), id] as const,
  events: () => ['events'] as const,
  event: (id: string | undefined) => [...keys.events(), id] as const,
  matches: () => ['matches'] as const,
  match: (id: string | undefined) => [...keys.matches(), id] as const,
  players: () => ['players'] as const,
  player: (id: string | undefined) => [...keys.players(), id] as const,
  prizePool: () => ['prizePool'] as const
};
