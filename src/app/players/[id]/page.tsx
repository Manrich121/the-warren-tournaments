'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/hooks/usePlayer';
import { useMatches } from '@/hooks/useMatches';
import { calculatePlayerStats } from '@/lib/playerStats';
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
    if (!playerId || !playerMatches) return { wins: 0, losses: 0, draws: 0, totalMatches: 0, winRate: 0 };
    return calculatePlayerStats(playerId, playerMatches);
  }, [playerId, playerMatches]);

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
            <h1 className="text-3xl font-bold">{player.fullName}</h1>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Leaderboard</Button>
          </Link>
        </div>
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Wins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Losses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Draws</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.draws}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.winRate.toFixed(1)}%</div>
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
                      // The opponent player data is not available in the match object from the API.
                      // I need to fetch all players and find the opponent.
                      // This is inefficient. The API should populate the opponent.
                      // For now, I will just display the opponent ID.
                      const opponentName =
                        (players || []).find(p => p.id === opponentId)?.fullName || 'Unknown Opponent';
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

                      return (
                        <TableRow key={match.id}>
                          <TableCell>{new Date(match.createdAt).toLocaleDateString()}</TableCell>

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
                          <TableCell className="text-right">
                            {playerScore} - {opponentScore}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${resultClass}`}>{result}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
