export interface PlayerStats {
  playerId: string;
  playerName: string;
  matchesWon: number;
  matchPoints: number;
  gamesWon: number;
  gamePoints: number;
  matchWinPercentage: number;
  gameWinPercentage: number;
  oppMatchWinPercentage: number;
  oppGameWinPercentage: number;
}

export interface LeaguePlayerStats extends PlayerStats {
  leaguePoints: number;
  eventAttendance: number;
}

export interface EventRankedPlayer extends PlayerStats {
  rank: number;
}

export interface LeagueRankedPlayer extends EventRankedPlayer, LeaguePlayerStats {}
