'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Users, BanknoteIcon } from 'lucide-react';

interface Player {
  id: number;
  fullName: string;
  wizardsEmail: string;
  wins?: number;
  losses?: number;
  winRate?: number;
  totalMatches?: number;
}

interface PrizePool {
  amount: number;
}

export function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [prizePool, setPrizePool] = useState<PrizePool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch players
        const playersRes = await fetch('/api/players');
        if (!playersRes.ok) throw new Error('Failed to fetch players');
        const playersData = await playersRes.json();

        // Fetch prize pool
        const prizePoolRes = await fetch('/api/prize-pool');
        if (!prizePoolRes.ok) throw new Error('Failed to fetch prize pool');
        const prizePoolData = await prizePoolRes.json();

        // Calculate stats for each player (this would ideally be done on the backend)
        const playersWithStats = playersData.map((player: Player) => ({
          ...player,
          wins: 0, // Placeholder - would calculate from matches
          losses: 0, // Placeholder - would calculate from matches
          totalMatches: 0, // Placeholder - would calculate from matches
          winRate: 0 // Placeholder - would calculate from matches
        }));

        setPlayers(playersWithStats);
        setPrizePool(prizePoolData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">The Warren Tournaments</h1>
        <p className="text-muted-foreground">Magic: The Gathering League Tracker</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Prize Pool */}
        {prizePool && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Prize Pool</CardTitle>
              <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">R{prizePool.amount?.toFixed(2)}</span>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leagues</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{1}</div>
          </CardContent>
        </Card>
      </div>
      {/* Leaderboard */}
      <Card>
        <CardHeader className={'text-xl'}>
          <CardTitle>League Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No players registered yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Wins</TableHead>
                  <TableHead className="text-right">Losses</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                  <TableHead className="text-right">Total Matches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players
                  .sort((a, b) => (b.winRate || 0) - (a.winRate || 0))
                  .map((player, index) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell>
                        <Link
                          href={`/players/${player.id}`}
                          className="text-primary hover:underline font-medium"
                          legacyBehavior>
                          {player.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{player.wins}</TableCell>
                      <TableCell className="text-right">{player.losses}</TableCell>
                      <TableCell className="text-right">
                        {player.totalMatches === 0 ? '0%' : `${(player.winRate || 0).toFixed(1)}%`}
                      </TableCell>
                      <TableCell className="text-right">{player.totalMatches}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
