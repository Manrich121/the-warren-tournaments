
import { EventRankedPlayer, PlayerStats } from '@/types/PlayerStats';
import { Match, Player } from '@prisma/client';
import { BYE_PLAYER_ID } from '@/lib/constants/player';

/**
 * Calculates the number of unique events a player has attended.
 *
 * @param playerId - The ID of the player
 * @param allMatches - Array of all matches to check
 * @returns The number of unique events the player participated in
 */
export const calculateEventAttendance = (playerId: string, allMatches: Match[]) => {
  const attendedEvents = new Set<string>();
  for (const match of allMatches) {
    if (match.player1Id === playerId || match.player2Id === playerId) {
      attendedEvents.add(match.eventId);
    }
  }
  return attendedEvents.size;
}

/**
 * Calculates the total match points earned by a player.
 * Win = 3 points, Draw = 1 point, Loss = 0 points.
 *
 * @param playerId - The ID of the player to calculate points for
 * @param matches - Array of matches involving the player
 * @returns Total match points earned
 */
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

/**
 * Calculates the total game points earned by a player.
 * Each game won = 3 points, Draw match = 1 point total.
 *
 * @param playerId - The ID of the player to calculate points for
 * @param matches - Array of matches involving the player
 * @returns Total game points earned
 */
export const calculateGamePoints = (playerId: string, matches: Match[]): number => {
  let points = 0;
  for (const match of matches) {
    if (match.draw && (match.player1Id === playerId || match.player2Id === playerId)) {
      points += 1;
    } else if (match.player1Id === playerId) {
      points += 3 * match.player1Score;
    } else if (match.player2Id === playerId) {
      points += 3 * match.player2Score;
    }
  }

  return points;
};

/**
 * Calculates the match win percentage for a player.
 * Minimum value is 0.33 (33%) per tournament rules.
 *
 * @param playerId - The ID of the player to calculate percentage for
 * @param matches - Array of matches involving the player
 * @returns Match win percentage (0.33 minimum)
 */
export const calculateMatchWinPercentage = (playerId: string, matches: Match[]): number => {
  let numRounds = 0;

  for (const match of matches) {
    if (playerId === match.player1Id || playerId === match.player2Id) {
      numRounds += 1;
    }
  }

  if (numRounds === 0) {
    return 0;
  }

  const matchPoints = calculateMatchPoints(playerId, matches);

  return Math.max(0.33, matchPoints / (numRounds * 3));
};


/**
 * Calculates the game win percentage for a player.
 * Minimum value is 0.33 (33%) per tournament rules.
 *
 * @param playerId - The ID of the player to calculate percentage for
 * @param matches - Array of matches involving the player
 * @returns Game win percentage (0.33 minimum)
 */
export const calculateGameWinPercentage = (playerId: string, matches: Match[]): number => {
  let totalGames = 0;

  for (const match of matches) {
    if (playerId === match.player1Id || playerId === match.player2Id) {
      totalGames += match.player1Score + match.player2Score;
    }
  }

  if (totalGames === 0) {
    return 0;
  }

  const gamePoints = calculateGamePoints(playerId, matches);
  return Math.max(0.33, gamePoints / (totalGames * 3));
};

/**
 * Calculates the average match win percentage of a player's opponents.
 * BYE players are excluded from the calculation.
 *
 * @param playerId - The ID of the player
 * @param playerMatches - Array of matches involving the player
 * @param allMatches - Array of all matches for opponent calculations
 * @returns Average opponent match win percentage
 */
export const calculateOpponentMatchWinPercentage = (playerId: string, playerMatches: Match[], allMatches: Match[]): number => {
  const opponents = new Set<string>();
  for (const match of playerMatches) {
    if (match.player1Id === playerId) {
      opponents.add(match.player2Id);
    } else {
      opponents.add(match.player1Id);
    }
  }

  // Remove BYE player from opponents set
  opponents.delete(BYE_PLAYER_ID);

  if (opponents.size === 0) {
    return 0;
  }

  let totalOpponentWinPercentage = 0;
  for (const opponentId of opponents) {
    const opponentMatches = allMatches.filter(m => m.player1Id === opponentId || m.player2Id === opponentId);
    totalOpponentWinPercentage += calculateMatchWinPercentage(opponentId, opponentMatches);
  }

  return totalOpponentWinPercentage / opponents.size;
};

/**
 * Calculates the average game win percentage of a player's opponents.
 * BYE players are excluded from the calculation.
 *
 * @param playerId - The ID of the player
 * @param playerMatches - Array of matches involving the player
 * @param allMatches - Array of all matches for opponent calculations
 * @returns Average opponent game win percentage
 */
export const calculateOpponentGameWinPercentage = (playerId: string, playerMatches: Match[], allMatches: Match[]): number => {
  const opponents = new Set<string>();
  for (const match of playerMatches) {
    if (match.player1Id === playerId) {
      opponents.add(match.player2Id);
    } else {
      opponents.add(match.player1Id);
    }
  }

  // Remove BYE player from opponents set
  opponents.delete(BYE_PLAYER_ID);

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

/**
 * Calculates the total number of matches won by a player.
 * Draws are not counted as wins.
 *
 * @param playerId - The ID of the player
 * @param matches - Array of matches involving the player
 * @returns Number of matches won
 */
export const calculateMatchesWonCount = (playerId: string, matches: Match[]): number => {
  return matches.filter((m) => {
    if (m.draw) return false;
    if (m.player1Id === playerId && m.player1Score > m.player2Score) return true;
    if (m.player2Id === playerId && m.player2Score > m.player1Score) return true;
    return false;
  }).length;
}

/**
 * Calculates the total number of individual games won by a player.
 * Games from draw matches are not counted.
 *
 * @param playerId - The ID of the player
 * @param matches - Array of matches involving the player
 * @returns Number of individual games won
 */
export const calculateGamesWonCount = (playerId: string, matches: Match[]): number => {
  return matches.reduce((sum, m) => {
    if (m.draw) return sum;
    if (m.player1Id === playerId) {
      return sum + m.player1Score;
    } else if (m.player2Id === playerId) {
      return sum + m.player2Score;
    }
    return sum;
  }, 0);
}

/**
 * Calculates event rankings for players based on their performance in matches.
 * BYE players are excluded from rankings.
 *
 * Tie-breaking order:
 * 1. Match points (higher is better)
 * 2. Opponents' match-win percentage (higher is better)
 * 3. Game-win percentage (higher is better)
 * 4. Opponents' game-win percentage (higher is better)
 *
 * @param players - Array of players who participated in the event
 * @param matches - Array of matches from the event
 * @returns Array of ranked players with their statistics and rank positions
 */
export const calculateEventRanking = (players: Player[], matches: Match[]): EventRankedPlayer[] => {
  const playerStats: PlayerStats[] = players.map(player => {
    if (player.id === BYE_PLAYER_ID) {
      return null;
    }
    const playerMatches = matches.filter(m => m.player1Id === player.id || m.player2Id === player.id);

    return {
      playerId: player.id,
      playerName: player.name,
      matchesWon: calculateMatchesWonCount(player.id, playerMatches),
      matchPoints: calculateMatchPoints(player.id, playerMatches),
      matchWinPercentage: calculateMatchWinPercentage(player.id, playerMatches),
      gamesWon: calculateGamesWonCount(player.id, playerMatches),
      gamePoints: calculateGamePoints(player.id, playerMatches),
      gameWinPercentage: calculateGameWinPercentage(player.id, playerMatches),
      oppMatchWinPercentage: calculateOpponentMatchWinPercentage(player.id, playerMatches, matches),
      oppGameWinPercentage: calculateOpponentGameWinPercentage(player.id, playerMatches, matches),
    };
  }).filter(s => s !== null) as PlayerStats[];

  /**
   * The following tiebreakers are used to determine how a player ranks in an event
   * 1. Match points
   * 2. Opponents' match-win percentage
   * 3. Game-win percentage
   * 4. Opponents' game-win percentage
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
      playerStats[i].matchPoints < playerStats[i - 1].matchPoints ||
      playerStats[i].oppMatchWinPercentage < playerStats[i - 1].oppMatchWinPercentage ||
      playerStats[i].gameWinPercentage < playerStats[i - 1].gameWinPercentage ||
      playerStats[i].oppGameWinPercentage < playerStats[i - 1].oppGameWinPercentage
    )) {
      rank = i + 1;
    }
    rankedPlayers.push({ ...playerStats[i], rank });
  }

  return rankedPlayers;
};

