
import { EventRankedPlayer, PlayerStats } from '@/types/PlayerStats';
import { Match, Player } from '@prisma/client';

export const calculateEventAttendance = (playerId: string, allMatches: Match[])=> {
  const attendedEvents = new Set<string>();
  for (const match of allMatches) {
    if (match.player1Id === playerId || match.player2Id === playerId) {
      attendedEvents.add(match.eventId);
    }
  }
  return attendedEvents.size;
}

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

  return Math.max(0.33, (matchPoints / (numRounds * 3)));
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
  return Math.max(0.33, gamePoints / (totalGames * 3));
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

export const calculateMatchesWonCount = (playerId: string, matches: Match[]): number => {
  return matches.filter((m) => {
    if (m.draw) return false;
    if (m.player1Id === playerId && m.player1Score > m.player2Score) return true;
    if (m.player2Id === playerId && m.player2Score > m.player1Score) return true;
    return false;
  }).length;
}

export const calculateGamesWonCount = (playerId: string, matches: Match[]): number => {
  return matches.reduce((sum, m) => {
    if(m.draw) return sum;
    if (m.player1Id === playerId) {
      return sum + m.player1Score;
    } else if (m.player2Id === playerId) {
      return sum + m.player2Score;
    }
    return sum;
  }, 0);
}

export const calculateEventRanking = (players: Player[], allMatches: Match[]): EventRankedPlayer[] => {
  const playerStats: PlayerStats[] = players.map(player => {
    const playerMatches = allMatches.filter(m => m.player1Id === player.id || m.player2Id === player.id);

    return  {
      playerId: player.id,
      playerName: player.name,
      matchesWon: calculateMatchesWonCount(player.id, playerMatches),
      matchPoints: calculateMatchPoints(player.id, playerMatches),
      matchWinPercentage: calculateMatchWinPercentage(player.id, playerMatches),
      gamesWon: calculateGamesWonCount(player.id, playerMatches),
      gamePoints: calculateGamePoints(player.id, playerMatches),
      gameWinPercentage: calculateGameWinPercentage(player.id,  playerMatches),
      oppMatchWinPercentage: calculateOpponentMatchWinPercentage(player.id, playerMatches, allMatches),
      oppGameWinPercentage: calculateOpponentGameWinPercentage(player.id, playerMatches, allMatches),
    };
  });

  /**
   * The following tiebreakers are used to determine how a player ranks in an event
   * 1. Match points
   * 2. Opponents’ match-win percentage
   * 3. Game-win percentage
   * 4. Opponents’ game-win percentage
   */
  playerStats.sort((a, b) => {
    if (b.matchPoints !== a.matchPoints) {
      return b.matchPoints - a.matchPoints;
    }
    if (b.oppMatchWinPercentage !== a.oppMatchWinPercentage) {
      return b.oppMatchWinPercentage - a.oppMatchWinPercentage;
    }
    if (b.gameWinPercentage !== a.gameWinPercentage) {
      return b.gameWinPercentage - a.gameWinPercentage;
    }
    return b.oppGameWinPercentage - a.oppGameWinPercentage;
  });

  let rank = 1;
  const rankedPlayers: EventRankedPlayer[] = [];
  for (let i = 0; i < playerStats.length; i++) {
    if (i > 0 && (
      playerStats[i].matchPoints < playerStats[i-1].matchPoints ||
      playerStats[i].oppMatchWinPercentage < playerStats[i-1].oppMatchWinPercentage ||
      playerStats[i].gameWinPercentage < playerStats[i-1].gameWinPercentage ||
      playerStats[i].oppGameWinPercentage < playerStats[i-1].oppGameWinPercentage
    )) {
      rank = i + 1;
    }
    rankedPlayers.push({ ...playerStats[i], rank });
  }

  return rankedPlayers;
};

