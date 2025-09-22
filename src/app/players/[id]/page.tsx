'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Player {
  id: number;
  fullName: string;
  wizardsEmail: string;
  createdAt: string;
  updatedAt: string;
}

interface Match {
  id: number;
  eventId: number;
  player1Id: number;
  player2Id: number;
  player1Score: number;
  player2Score: number;
  draw: boolean;
  createdAt: string;
  event?: {
    id: number;
    name: string;
    date: string;
  };
  player1?: Player;
  player2?: Player;
}

export default function PlayerStatsPage() {
  const params = useParams();
  const playerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;

    const fetchPlayerData = async () => {
      try {
        // Fetch player details
        const playerRes = await fetch(`/api/players/${playerId}`);
        if (!playerRes.ok) {
          if (playerRes.status === 404) {
            throw new Error('Player not found');
          }
          throw new Error('Failed to fetch player');
        }
        const playerData = await playerRes.json();

        // Fetch all matches to filter for this player
        const matchesRes = await fetch('/api/matches');
        if (!matchesRes.ok) throw new Error('Failed to fetch matches');
        const allMatches = await matchesRes.json();

        // Filter matches for this player
        const playerMatches = allMatches.filter(
          (match: Match) => match.player1Id === parseInt(playerId) || match.player2Id === parseInt(playerId)
        );

        setPlayer(playerData);
        setMatches(playerMatches);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  if (!playerId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Invalid player ID</div>
      </div>
    );
  }

  // Calculate player statistics
  const calculateStats = () => {
    let wins = 0;
    let losses = 0;
    let draws = 0;

    matches.forEach(match => {
      if (match.draw) {
        draws++;
        return;
      }

      const isPlayer1 = match.player1Id === parseInt(playerId);
      if (isPlayer1) {
        if (match.player1Score > match.player2Score) {
          wins++;
        } else {
          losses++;
        }
      } else {
        if (match.player2Score > match.player1Score) {
          wins++;
        } else {
          losses++;
        }
      }
    });

    const totalMatches = matches.length;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    return { wins, losses, draws, totalMatches, winRate };
  };

  if (loading) {
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
          <div className="text-red-500">Error: {error}</div>
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

  const stats = calculateStats();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{player.fullName}</h1>
          <p className="text-muted-foreground">{player.wizardsEmail}</p>
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
          {matches.length === 0 ? (
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
                {matches
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(match => {
                    const isPlayer1 = match.player1Id === parseInt(playerId);
                    const opponent = isPlayer1 ? match.player2 : match.player1;
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
                        <TableCell>{match.event?.name || `Event #${match.eventId}`}</TableCell>
                        <TableCell>
                          {opponent ? (
                            <Link href={`/players/${opponent.id}`} className="text-primary hover:underline">
                              {opponent.fullName}
                            </Link>
                          ) : (
                            `Player #${isPlayer1 ? match.player2Id : match.player1Id}`
                          )}
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
  );
}
