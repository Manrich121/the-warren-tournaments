'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/hooks/usePlayer';
import { useMatches } from '@/hooks/useMatches';
import {
  calculateMatchPoints,
  calculateGamePoints,
  calculateMatchWinPercentage,
  calculateGameWinPercentage,
  calculateOpponentMatchWinPercentage
} from '@/lib/PlayerStats';
import { Match } from '@prisma/client';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { Header } from '@/components/Header';

export default function PlayerStatsPage() {
  const params = useParams();
  const playerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: player, isLoading: playerLoading, error: playerError } = usePlayer(playerId!);
  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents();

  const isLoading = playerLoading || matchesLoading || playersLoading || eventsLoading;
  const error = playerError || matchesError || playersError || eventsError;

  const playerMatches = useMemo(() => {
    if (!matchesData || !playerId) return [];
    return matchesData.filter((match: Match) => match.player1Id === playerId || match.player2Id === playerId);
  }, [matchesData, playerId]);

  const stats = useMemo(() => {
    if (!playerId || !playerMatches || !matchesData) {
      return {
        wins: 0,
        losses: 0,
        draws: 0,
        totalMatches: 0,
        winRate: 0,
        matchPoints: 0,
        gamePoints: 0,
        matchWinPercentage: 0,
        gameWinPercentage: 0,
        opponentMatchWinPercentage: 0
      };
    }

    // Calculate basic match results
    let wins = 0;
    let losses = 0;
    let draws = 0;

    for (const match of playerMatches) {
      if (match.draw) {
        draws++;
      } else if (match.player1Id === playerId) {
        if (match.player1Score > match.player2Score) {
          wins++;
        } else {
          losses++;
        }
      } else if (match.player2Id === playerId) {
        if (match.player2Score > match.player1Score) {
          wins++;
        } else {
          losses++;
        }
      }
    }

    const totalMatches = wins + losses + draws;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    // Calculate tournament-style stats using existing functions
    const matchPoints = calculateMatchPoints(playerId, playerMatches);
    const gamePoints = calculateGamePoints(playerId, playerMatches);
    const matchWinPercentage = calculateMatchWinPercentage(playerId, playerMatches);
    const gameWinPercentage = calculateGameWinPercentage(playerId, playerMatches);
    const opponentMatchWinPercentage = calculateOpponentMatchWinPercentage(playerId, playerMatches, matchesData);

    return {
      wins,
      losses,
      draws,
      totalMatches,
      winRate,
      matchPoints,
      gamePoints,
      matchWinPercentage,
      gameWinPercentage,
      opponentMatchWinPercentage
    };
  }, [playerId, playerMatches, matchesData]);

  if (!playerId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Invalid player ID</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <div className="text-red-500">Error: {error.message}</div>
          <Link href="/">
            <Button variant="outline">Back to Leaderboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground">Player not found</div>
          <Link href="/">
            <Button variant="outline">Back to Leaderboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{player.name}</h1>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Leaderboard</Button>
          </Link>
        </div>
        {/* Basic Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Matches</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.totalMatches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Wins</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.wins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Losses</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.losses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Draws</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.draws}</div>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-primary">{stats.winRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Tournament Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Match Pts</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.matchPoints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Game Pts</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{stats.gamePoints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Match Win %</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{(stats.matchWinPercentage * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Opp. Win %</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{(stats.opponentMatchWinPercentage * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
        {/* Match History */}
        <Card>
          <CardHeader>
            <CardTitle>Match History</CardTitle>
          </CardHeader>
          <CardContent>
            {playerMatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No matches played yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Opponent</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playerMatches
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map(match => {
                          const isPlayer1 = match.player1Id === playerId;
                          const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
                          const opponentName = (players || []).find(p => p.id === opponentId)?.name || 'Unknown';
                          const eventName =
                            (events || []).find(e => e.id === match.eventId)?.name || `Event #${match.eventId}`;

                          const playerScore = isPlayer1 ? match.player1Score : match.player2Score;
                          const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;

                          let result = 'Draw';
                          let resultClass = 'text-yellow-600';

                          if (!match.draw) {
                            if (playerScore > opponentScore) {
                              result = 'Win';
                              resultClass = 'text-green-600';
                            } else {
                              result = 'Loss';
                              resultClass = 'text-red-600';
                            }
                          }

                          // Use short date format for mobile
                          const date = new Date(match.createdAt);
                          const shortDate = `${date.getMonth() + 1}/${date.getDate()}`;

                          return (
                            <TableRow key={match.id}>
                              <TableCell className="whitespace-nowrap">
                                <span className="sm:hidden">{shortDate}</span>
                                <span className="hidden sm:inline">{date.toLocaleDateString()}</span>
                              </TableCell>
                              <TableCell>
                                <Link href={`/events/${match.eventId}`} className="text-primary hover:underline">
                                  {eventName}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Link href={`/players/${opponentId}`} className="text-primary hover:underline">
                                  {opponentName}
                                </Link>
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                {playerScore} - {opponentScore}
                              </TableCell>
                              <TableCell className={`text-right font-medium ${resultClass}`}>{result}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
