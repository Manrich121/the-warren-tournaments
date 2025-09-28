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
import { League, Player } from '@prisma/client';
import { useEvents } from '@/hooks/useEvents';

export interface LeaderboardProps {
  league: League;
}

export function Leaderboard({ league }: LeaderboardProps) {
  const { data: playersData, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: eventData, isLoading: eventsLoading, error: eventsError } = useEvents();

  const isLoading = playersLoading || matchesLoading || eventsLoading;
  const error = playersError || matchesError || eventsError;

  const playersWithStats = useMemo(() => {
    if (!playersData || !matchesData || !eventData) {
      return [];
    }

    // Filter matches to only include those relevant to the league
    const leagueEventIds = (league ? eventData.filter(event => event.leagueId === league.id) : eventData).map(
      event => event.id
    );
    const filteredMatches = matchesData.filter(match => leagueEventIds.includes(match.eventId));

    return playersData.map(player => {
      const stats = calculatePlayerStats(player.id, filteredMatches);
      return { ...player, ...stats };
    });
  }, [league, playersData, matchesData, eventData]);

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
  );
}
