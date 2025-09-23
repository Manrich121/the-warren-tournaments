'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Users, BanknoteIcon } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';
import { usePrizePools } from '@/hooks/usePrizePools';
import { useMatches } from '@/hooks/useMatches';
import { calculatePlayerStats } from '@/lib/playerStats';
import { Player } from '@/lib/types';

export function Leaderboard() {
  const { data: playersData, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: prizePoolsData, isLoading: prizePoolsLoading, error: prizePoolsError } = usePrizePools();
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useMatches();

  const isLoading = playersLoading || prizePoolsLoading || matchesLoading;
  const error = playersError || prizePoolsError || matchesError;

  const playersWithStats = useMemo(() => {
    if (!playersData || !matchesData) return [];
    return playersData.map(player => {
      const stats = calculatePlayerStats(player.id, matchesData);
      return { ...player, ...stats };
    });
  }, [playersData, matchesData]);

  const totalPrizePool = useMemo(() => {
    if (!prizePoolsData) return 0;
    return prizePoolsData.reduce((total, pool) => total + pool.amount, 0);
  }, [prizePoolsData]);

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
        <div className="text-center text-red-500">Error: {error.message}</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Prize Pool</CardTitle>
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">R{totalPrizePool.toFixed(2)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playersData?.length || 0}</div>
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
          {playersWithStats.length === 0 ? (
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
                {playersWithStats
                  .sort((a, b) => (b.winRate || 0) - (a.winRate || 0))
                  .map((player, index) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell>
                        <Link href={`/players/${player.id}`} className="text-primary hover:underline font-medium">
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