'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Target, ArrowRight } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { usePrizePools } from '@/hooks/usePrizePools';
import { useMatches } from '@/hooks/useMatches';
import type { League, Player } from '@prisma/client';
import { AddLeagueDialog } from '@/components/AddLeagueDialog';
import { AddEventDialog } from '@/components/AddEventDialog';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import Leaderboard from '@/components/Leaderboard';
import { useActiveLeague } from '@/hooks/useActiveLeague';
import { useLeagueLeaderboard } from '@/hooks/useLeagueLeaderboard';

export default function DashboardPage() {
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: prizePools, isLoading: prizePoolsLoading, error: prizePoolsError } = usePrizePools();
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: activeLeague, isLoading: activeLeagueLoading, error: activeLeagueError } = useActiveLeague();
  const { data: leaderboard, isLoading: leaderboardLoading, error: leaderboardError } = useLeagueLeaderboard(
    activeLeague?.id || ''
  );

  const matches = useMemo(() => {
    if (!matchesData || !players) {
      return [];
    }
    return matchesData.map(match => ({
      ...match,
      player1: players.find(p => p.id === match.player1Id),
      player2: players.find(p => p.id === match.player2Id)
    }));
  }, [matchesData, players]);

  const isLoading =
    playersLoading ||
    eventsLoading ||
    prizePoolsLoading ||
    matchesLoading ||
    activeLeagueLoading ||
    leaderboardLoading ||
    status === 'loading';
  const error = playersError || eventsError || prizePoolsError || matchesError || activeLeagueError || leaderboardError;

  const getLeagueStatus = (league: League) => {
    const now = new Date();
    const startDate = new Date(league.startDate);
    const endDate = new Date(league.endDate);
    if (startDate > now) return 'Upcoming';
    if (startDate <= now && endDate >= now) return 'Active';
    return 'Past';
  };

  const stats = useMemo(() => {
    const currentLeagueEvents = activeLeague ? events.filter(e => e.leagueId === activeLeague.id) : [];
    const currentLeagueMatches = activeLeague
      ? matches.filter(m => currentLeagueEvents.some(e => e.id === m.eventId))
      : [];
    const currentLeaguePlayers = currentLeagueMatches.reduce((acc, match) => {
      if (match.player1 && !acc.find(p => p?.id === match.player1?.id)) {
        acc.push(match.player1);
      }
      if (match.player2 && !acc.find(p => p?.id === match.player2?.id)) {
        acc.push(match.player2);
      }
      return acc;
    }, [] as Player[]);

    return {
      totalLeagues: activeLeague ? 1 : 0,
      totalEvents: events.length,
      totalPlayers: players?.length,
      totalMatches: matches.length,
      currentLeagueEvents: currentLeagueEvents.length,
      currentLeaguePlayers: currentLeaguePlayers.length,
      currentLeagueMatches: currentLeagueMatches.length
    };
  }, [events, players, matches, activeLeague]);

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
        <div className="text-center text-red-500">Failed to load dashboard data.</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto space-y-6">
        <Nav />
        <div className="py-8 space-y-6">
          {isAdmin && (
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Admin</h1>
              <div className="flex gap-2">
                <AddLeagueDialog>
                  <Button variant="outline">New League</Button>
                </AddLeagueDialog>
                <AddEventDialog />
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/leagues">
              <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-accent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLeagues}</div>
                  <p className="text-xs text-muted-foreground">{activeLeague ? 1 : 0} active</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/events">
              <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-accent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEvents}</div>
                  <p className="text-xs text-muted-foreground">Across all leagues</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/players">
              <Card className="cursor-pointer hover:shadow-md transition-shadow  hover:bg-accent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPlayers}</div>
                  <p className="text-xs text-muted-foreground">Registered players</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/matches">
              <Card className="cursor-pointer hover:shadow-md transition-shadow  hover:bg-accent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMatches}</div>
                  <p className="text-xs text-muted-foreground">All time matches</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Current League Summary */}
          {activeLeague && (
            <div>
              <Link href={`/leagues/${activeLeague.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow  hover:bg-accent">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Current League: {activeLeague.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={getLeagueStatus(activeLeague) === 'Active' ? 'default' : 'secondary'}>
                          {getLeagueStatus(activeLeague)}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.currentLeagueEvents}</div>
                        <div className="text-sm text-muted-foreground">Events</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.currentLeaguePlayers}</div>
                        <div className="text-sm text-muted-foreground">Players</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.currentLeagueMatches}</div>
                        <div className="text-sm text-muted-foreground">Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          R{prizePools?.find(p => p.leagueId === activeLeague.id)?.amount || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Prize Pool</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}

          {/* Recent Events */}
          <div className="grid grid-cols-2 gap-4">
            {leaderboard && <Leaderboard title="Active League Leaderboard" players={leaderboard} />}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Events</CardTitle>
                  <Link href="/events">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.slice(0, 3).map(event => {
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

                    return (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <div>
                            <h4 className="font-semibold">{event.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {eventPlayers.length} players • {eventMatches.length} matches
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
