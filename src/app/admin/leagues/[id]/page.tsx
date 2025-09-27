'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMemo, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Users, Calendar, Target, ArrowLeft, ArrowRight, Plus, MapPin, PencilIcon } from 'lucide-react';
import { useLeagues } from '@/hooks/useLeagues';
import { useEvents } from '@/hooks/useEvents';
import { usePlayers } from '@/hooks/usePlayers';
import { useMatches } from '@/hooks/useMatches';
import { usePrizePools } from '@/hooks/usePrizePools';
import type { League, Event, Player } from '@prisma/client';
import { AddEventDialog } from '@/components/AddEventDialog';
import { AddLeagueDialog } from '@/components/AddLeagueDialog';
import { PrizePoolDialog } from '@/components/PrizePoolDialog';

interface LeaguePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LeaguePage({ params }: LeaguePageProps) {
  const { id: leagueId } = use(params);
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/admin/login');
    }
  });

  const { data: leaguesData, isLoading: leaguesLoading, error: leaguesError } = useLeagues();
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useEvents({ leagueId });
  const { data: playersData, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: prizePoolsData, isLoading: prizePoolsLoading, error: prizePoolsError } = usePrizePools({ leagueId });

  const leagues = useMemo(() => leaguesData || [], [leaguesData]);
  const leagueEvents = useMemo(() => eventsData || [], [eventsData]);
  const prizePools = useMemo(() => prizePoolsData || [], [prizePoolsData]);
  const players = useMemo(() => playersData || [], [playersData]);
  const allMatches = useMemo(() => matchesData || [], [matchesData]);

  const matches = useMemo(() => {
    return allMatches.map(match => ({
      ...match,
      player1: players.find(p => p.id === match.player1Id),
      player2: players.find(p => p.id === match.player2Id)
    }));
  }, [allMatches, players]);

  const league = useMemo(() => {
    return leagues.find(l => l.id === leagueId);
  }, [leagues, leagueId]);

  const leagueMatches = useMemo(() => {
    return matches.filter(m => leagueEvents.some(e => e.id === m.eventId));
  }, [matches, leagueEvents]);

  const leaguePlayers = useMemo(() => {
    const playerMap = new Map<
      string,
      Player & { wins: number; losses: number; draws: number; matchesPlayed: number }
    >();

    leagueMatches.forEach(match => {
      if (match.player1) {
        const existing = playerMap.get(match.player1.id) || {
          ...match.player1,
          wins: 0,
          losses: 0,
          draws: 0,
          matchesPlayed: 0
        };

        existing.matchesPlayed++;

        if (match.draw) {
          existing.draws++;
        } else if (match.player1Score > match.player2Score) {
          existing.wins++;
        } else {
          existing.losses++;
        }

        playerMap.set(match.player1.id, existing);
      }

      if (match.player2) {
        const existing = playerMap.get(match.player2.id) || {
          ...match.player2,
          wins: 0,
          losses: 0,
          draws: 0,
          matchesPlayed: 0
        };

        existing.matchesPlayed++;

        if (match.draw) {
          existing.draws++;
        } else if (match.player2Score > match.player1Score) {
          existing.wins++;
        } else {
          existing.losses++;
        }

        playerMap.set(match.player2.id, existing);
      }
    });

    return Array.from(playerMap.values()).sort((a, b) => {
      const aWinRate = a.matchesPlayed > 0 ? a.wins / a.matchesPlayed : 0;
      const bWinRate = b.matchesPlayed > 0 ? b.wins / b.matchesPlayed : 0;
      return bWinRate - aWinRate; // Sort by win rate descending
    });
  }, [leagueMatches]);

  const getLeagueStatus = (league: League) => {
    const now = new Date();
    const startDate = new Date(league.startDate);
    const endDate = new Date(league.endDate);
    if (startDate > now) return 'Upcoming';
    if (startDate <= now && endDate >= now) return 'Active';
    return 'Past';
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    if (eventDate > now) return 'Upcoming';
    if (eventDate.toDateString() === now.toDateString()) return 'Today';
    return 'Completed';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isLoading =
    leaguesLoading || eventsLoading || playersLoading || matchesLoading || prizePoolsLoading || status === 'loading';

  const error = leaguesError || eventsError || playersError || matchesError || prizePoolsError;

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
        <div className="text-center text-red-500">Failed to load league data.</div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">League not found</h2>
          <p className="text-muted-foreground mb-4">The league you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/admin/leagues">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leagues
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const leaguePrizePool = prizePools.length > 0 ? prizePools[0] : undefined;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{league.name}</h1>
            <p className="text-muted-foreground">
              {formatDate(league.startDate)} - {formatDate(league.endDate)}
            </p>
          </div>
          <Badge variant={getLeagueStatus(league) === 'Active' ? 'default' : 'secondary'}>
            {getLeagueStatus(league)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <AddLeagueDialog league={league}>
            <Button variant="outline" size="sm">
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </AddLeagueDialog>
        </div>
      </div>

      {/* League Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leagueEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              {leagueEvents.filter(e => getEventStatus(e) === 'Upcoming').length} upcoming
            </p>
          </CardContent>
        </Card>

        <Link href={'/admin/players?league=' + leagueId}>
          <Card className={'cursor-pointer hover:shadow-md transition-shadow hover:bg-accent'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaguePlayers.length}</div>
              <p className="text-xs text-muted-foreground">Active players</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={'/admin/matches?league=' + leagueId}>
          <Card className={'cursor-pointer hover:shadow-md transition-shadow hover:bg-accent'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matches</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leagueMatches.length}</div>
              <p className="text-xs text-muted-foreground">Total matches</p>
            </CardContent>
          </Card>
        </Link>

        <PrizePoolDialog leagueId={leagueId} currentPrizePool={leaguePrizePool}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prize Pool</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{leaguePrizePool?.amount || 0}</div>
              <p className="text-xs text-muted-foreground">Click to update</p>
            </CardContent>
          </Card>
        </PrizePoolDialog>
      </div>

      {/* Events Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Events</CardTitle>
            <AddEventDialog selectedLeagueId={leagueId} leagues={leagues} />
          </div>
        </CardHeader>
        <CardContent>
          {leagueEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first event for this league.</p>
              <AddEventDialog selectedLeagueId={leagueId} leagues={leagues} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagueEvents.map(event => {
                const eventMatches = matches.filter(m => m.eventId === event.id);
                const eventPlayers = eventMatches.reduce((acc, match) => {
                  if (match.player1 && !acc.find(p => p?.id === match.player1?.id)) {
                    acc.push(match.player1);
                  }
                  if (match.player2 && !acc.find(p => p?.id === match.player2?.id)) {
                    acc.push(match.player2);
                  }
                  return acc;
                }, [] as Player[]);

                const eventStatus = getEventStatus(event);

                return (
                  <Link key={event.id} href={`/admin/events/${event.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-accent">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                          <Badge
                            variant={
                              eventStatus === 'Today' ? 'default' : eventStatus === 'Upcoming' ? 'secondary' : 'outline'
                            }
                          >
                            {getEventStatus(event)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {eventPlayers.length} players
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              {eventMatches.length} matches
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle>League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          {leaguePlayers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Players Yet</h3>
              <p className="text-muted-foreground">Players will appear here once matches are recorded.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Matches</TableHead>
                  <TableHead className="text-center">Wins</TableHead>
                  <TableHead className="text-center">Losses</TableHead>
                  <TableHead className="text-center">Draws</TableHead>
                  <TableHead className="text-center">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaguePlayers.map((player, index) => {
                  const winRate =
                    player.matchesPlayed > 0 ? ((player.wins / player.matchesPlayed) * 100).toFixed(1) : '0.0';

                  return (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{player.fullName}</div>
                          <div className="text-sm text-muted-foreground">{player.wizardsEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{player.matchesPlayed}</TableCell>
                      <TableCell className="text-center">{player.wins}</TableCell>
                      <TableCell className="text-center">{player.losses}</TableCell>
                      <TableCell className="text-center">{player.draws}</TableCell>
                      <TableCell className="text-center font-medium">{winRate}%</TableCell>
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
