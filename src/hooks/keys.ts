export const keys = {
  leagues: () => ['leagues'] as const,
  league: (id: number | undefined) => [...keys.leagues(), `league-${id}`] as const,
  events: () => ['events'] as const,
  event: (id: number | undefined) => [...keys.events(), `event-${id}`] as const,
  matches: () => ['matches'] as const,
  match: (id: number | undefined) => [...keys.matches(), `match-${id}`] as const,
  players: () => ['players'] as const,
  player: (id: number | undefined) => [...keys.players(), `player-${id}`] as const,
  prizePool: () => ['prizePool'] as const
};
