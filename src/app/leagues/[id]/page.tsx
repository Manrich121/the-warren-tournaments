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
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';

interface LeaguePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LeaguePage({ params }: LeaguePageProps) {
  const { id: leagueId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = status === 'authenticated';

  const { data: leaguesData, isLoading: leaguesLoading, error: leaguesError } = useLeagues();
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: playersData, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: prizePoolsData, isLoading: prizePoolsLoading, error: prizePoolsError } = usePrizePools();

  const leagues = useMemo(() => leaguesData || [], [leaguesData]);
  const allEvents = useMemo(() => eventsData || [], [eventsData]);
  const leagueEvents = useMemo(() => allEvents.filter(e => e.leagueId === leagueId), [allEvents, leagueId]);
  const prizePools = useMemo(
    () => (prizePoolsData || []).filter(p => p.leagueId === leagueId),
    [prizePoolsData, leagueId]
  );
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
      <>
        <Header />
        <div className="container mx-auto space-y-6">
          {isAdmin && <Nav />}
          <div className="py-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">League not found</h2>
            <p className="text-muted-foreground mb-4">The league you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/leagues">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leagues
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const leaguePrizePool = prizePools.length > 0 ? prizePools[0] : undefined;

  return (
    <>
      <Header />
      <div className="container mx-auto space-y-6">
        <div className="py-8 space-y-6">
          <div>
            <Link href="/leagues">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leagues
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">League | {league.name}</h1>
                  <Badge variant={getLeagueStatus(league) === 'Active' ? 'default' : 'secondary'}>
                    {getLeagueStatus(league)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {formatDate(league.startDate)} - {formatDate(league.endDate)}
                </p>
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <AddLeagueDialog league={league}>
                  <Button variant="outline">
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit League
                  </Button>
                </AddLeagueDialog>
                <AddEventDialog leagues={[league]}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </AddEventDialog>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leagueEvents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {leagueEvents.filter(e => getEventStatus(e) === 'Completed').length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leaguePlayers.length}</div>
                <p className="text-xs text-muted-foreground">Active participants</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Matches</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leagueMatches.length}</div>
                <p className="text-xs text-muted-foreground">Total played</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prize Pool</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R{leaguePrizePool?.amount || 0}</div>
                {isAdmin && (
                  <PrizePoolDialog leagueId={league.id} currentPrizePool={leaguePrizePool}>
                    <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                      {leaguePrizePool ? 'Edit' : 'Set Prize Pool'}
                    </Button>
                  </PrizePoolDialog>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Events</CardTitle>
                {isAdmin && (
                  <AddEventDialog leagues={[league]}>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Event
                    </Button>
                  </AddEventDialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {leagueEvents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Players</TableHead>
                      <TableHead>Matches</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leagueEvents.map(event => {
                      const eventMatches = leagueMatches.filter(m => m.eventId === event.id);
                      const eventPlayerIds = new Set<string>();
                      eventMatches.forEach(m => {
                        eventPlayerIds.add(m.player1Id);
                        eventPlayerIds.add(m.player2Id);
                      });
                      const eventPlayers = eventPlayerIds.size;

                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Link href={`/events/${event.id}`} className="font-medium text-primary hover:underline">
                              {event.name}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(event.date)}</TableCell>
                          <TableCell>
                            <Badge variant={getEventStatus(event) === 'Completed' ? 'secondary' : 'default'}>
                              {getEventStatus(event)}
                            </Badge>
                          </TableCell>
                          <TableCell>{eventPlayers}</TableCell>
                          <TableCell>{eventMatches.length}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                  <p className="mb-4">Get started by creating your first event for this league.</p>
                  {isAdmin && (
                    <AddEventDialog leagues={[league]}>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Event
                      </Button>
                    </AddEventDialog>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>League Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {leaguePlayers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Matches</TableHead>
                      <TableHead>Wins</TableHead>
                      <TableHead>Losses</TableHead>
                      <TableHead>Draws</TableHead>
                      <TableHead>Win Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaguePlayers.map((player, index) => {
                      const winRate = player.matchesPlayed > 0 ? (player.wins / player.matchesPlayed) * 100 : 0;
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">#{index + 1}</TableCell>
                          <TableCell>
                            <Link href={`/players/${player.id}`} className="text-primary hover:underline">
                              {player.name}
                            </Link>
                          </TableCell>
                          <TableCell>{player.matchesPlayed}</TableCell>
                          <TableCell>{player.wins}</TableCell>
                          <TableCell>{player.losses}</TableCell>
                          <TableCell>{player.draws}</TableCell>
                          <TableCell>{winRate.toFixed(1)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No players have participated in this league yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
