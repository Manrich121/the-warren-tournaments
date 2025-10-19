
import { Match, Player } from '@prisma/client';

export const calculateMatchPoints = (playerId: string, matches: Match[]): number => {
  let points = 0;
  for (const match of matches) {
    if (match.player1Score === match.player2Score || match.draw) {
      points += 1;
    } else if (match.player1Id === playerId && match.player1Score > match.player2Score) {
      points += 3;
    } else if (match.player2Id === playerId && match.player2Score > match.player1Score) {
      points += 3;
    }
  }
  return points;
};

export const calculateGamePoints = (playerId: string, matches: Match[]): number => {
  let points = 0;
  for (const match of matches) {
      if(match.draw && (match.player1Id === playerId || match.player2Id === playerId)) {
        points += 1;
      }else if (match.player1Id === playerId) {
        points += 3*match.player1Score;
      } else if (match.player2Id === playerId) {
        points += 3*match.player2Score;
      }
    }

  return points;
};

export const calculateMatchWinPercentage = (playerId: string, matches: Match[]): number => {
  let numRounds = 0;

  for (const match of matches) {
    if(playerId === match.player1Id || playerId === match.player2Id){
      numRounds += 1
    }
  }

  if (numRounds === 0) {
    return 0;
  }

  const matchPoints = calculateMatchPoints(playerId, matches);

  return Math.max(0.33, (matchPoints / (numRounds * 3))) * 100;
};


export const calculateGameWinPercentage = (playerId: string,  matches: Match[]): number => {
  let totalGames = 0;

  for (const match of matches) {
    if(playerId === match.player1Id || playerId === match.player2Id){
      totalGames += match.player1Score + match.player2Score;
    }
  }

  if (totalGames === 0) {
    return 0;
  }

  const gamePoints = calculateGamePoints(playerId, matches);
  return Math.max(0.33, gamePoints / (totalGames * 3)) * 100;
};

export const calculateOpponentMatchWinPercentage = (playerId: string, playerMatches: Match[], allMatches: Match[]): number => {
  const opponents = new Set<string>();
  for (const match of playerMatches) {
    if (match.player1Id === playerId) {
      opponents.add(match.player2Id);
    } else {
      opponents.add(match.player1Id);
    }
  }

  if (opponents.size === 0) {
    return 0;
  }

  let totalOpponentWinPercentage = 0;
  for (const opponentId of Array.from(opponents)) {
    const opponentMatches = allMatches.filter(m => m.player1Id === opponentId || m.player2Id === opponentId);
    const opponentMatchPoints = calculateMatchPoints(opponentId, opponentMatches);
    totalOpponentWinPercentage += calculateMatchWinPercentage(opponentId, opponentMatches);
  }

  return totalOpponentWinPercentage / opponents.size;
};

export const calculateOpponentGameWinPercentage = (playerId: string, playerMatches: Match[], allMatches: Match[]): number => {
  const opponents = new Set<string>();
  for (const match of playerMatches) {
    if (match.player1Id === playerId) {
      opponents.add(match.player2Id);
    } else {
      opponents.add(match.player1Id);
    }
  }

  if (opponents.size === 0) {
    return 0;
  }

  let totalOpponentWinPercentage = 0;
  for (const opponentId of opponents) {
    const opponentMatches = allMatches.filter(m => m.player1Id === opponentId || m.player2Id === opponentId);
    totalOpponentWinPercentage += calculateGameWinPercentage(opponentId, opponentMatches);
  }

  return totalOpponentWinPercentage / opponents.size;
};

export interface PlayerStats {
  player: Player;
  matchPoints: number;
  gamePoints: number;
  matchWinPercentage: number;
  gameWinPercentage: number;
  opponentsMatchWinPercentage: number;
  opponentsGameWinPercentage: number;
}

export interface RankedPlayer extends PlayerStats {
  rank: number;
}

export const calculateEventRanking = (players: Player[], allMatches: Match[]): RankedPlayer[] => {
  const playerStats: PlayerStats[] = players.map(player => {
    const playerMatches = allMatches.filter(m => m.player1Id === player.id || m.player2Id === player.id);
    return {
      player,
      matchPoints: calculateMatchPoints(player.id, playerMatches),
      gamePoints: calculateGamePoints(player.id, playerMatches),
      matchWinPercentage: calculateMatchWinPercentage(player.id, playerMatches),
      gameWinPercentage: calculateGameWinPercentage(player.id,  playerMatches),
      opponentsMatchWinPercentage: calculateOpponentMatchWinPercentage(player.id, playerMatches, allMatches),
      opponentsGameWinPercentage: calculateOpponentGameWinPercentage(player.id, playerMatches, allMatches),
    };
  });

  playerStats.sort((a, b) => {
    if (b.matchPoints !== a.matchPoints) {
      return b.matchPoints - a.matchPoints;
    }
    if (b.opponentsMatchWinPercentage !== a.opponentsMatchWinPercentage) {
      return b.opponentsMatchWinPercentage - a.opponentsMatchWinPercentage;
    }
    if (b.gameWinPercentage !== a.gameWinPercentage) {
      return b.gameWinPercentage - a.gameWinPercentage;
    }
    return b.opponentsGameWinPercentage - a.opponentsGameWinPercentage;
  });

  let rank = 1;
  const rankedPlayers: RankedPlayer[] = [];
  for (let i = 0; i < playerStats.length; i++) {
    if (i > 0 && (
      playerStats[i].matchPoints < playerStats[i-1].matchPoints ||
      playerStats[i].opponentsMatchWinPercentage < playerStats[i-1].opponentsMatchWinPercentage ||
      playerStats[i].gameWinPercentage < playerStats[i-1].gameWinPercentage ||
      playerStats[i].opponentsGameWinPercentage < playerStats[i-1].opponentsGameWinPercentage
    )) {
      rank = i + 1;
    }
    rankedPlayers.push({ ...playerStats[i], rank });
  }

  return rankedPlayers;
};

export interface LeagueRankedPlayer {
  player: Player;
  totalEventPoints: number;
  rank: number;
}

export const getEventPoints = (rank: number): number => {
  if (rank === 1) return 1+3;
  if (rank === 2) return 1+2;
  if (rank === 3) return 1+1;
  return 1;
};

export const calculateLeagueRanking = (players: Player[], eventRankings: RankedPlayer[][]): LeagueRankedPlayer[] => {
  const leaguePlayerPoints: { [playerId: string]: number } = {};

  for (const player of players) {
    leaguePlayerPoints[player.id] = 0;
  }

  for (const eventRanking of eventRankings) {
    for (const rankedPlayer of eventRanking) {
      if (leaguePlayerPoints[rankedPlayer.player.id] !== undefined) {
        leaguePlayerPoints[rankedPlayer.player.id] += getEventPoints(rankedPlayer.rank);
      }
    }
  }

  const rankedPlayers = players.map(player => ({
    player,
    totalEventPoints: leaguePlayerPoints[player.id],
  }));

  rankedPlayers.sort((a, b) => b.totalEventPoints - a.totalEventPoints);

  let rank = 1;
  const leagueRankedPlayers: LeagueRankedPlayer[] = [];
  for (let i = 0; i < rankedPlayers.length; i++) {
    if (i > 0 && rankedPlayers[i].totalEventPoints < rankedPlayers[i-1].totalEventPoints) {
      rank = i + 1;
    }
    leagueRankedPlayers.push({ ...rankedPlayers[i], rank });
  }

  return leagueRankedPlayers;
};
