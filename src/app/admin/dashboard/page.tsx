'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Target, Plus, ArrowRight } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { useLeagues } from '@/hooks/useLeagues';
import { usePrizePools } from '@/hooks/usePrizePools';
import { useMatches } from '@/hooks/useMatches';
import type { League, Player } from '@prisma/client';
import { AddLeagueDialog } from '@/components/AddLeagueDialog';
import { AddEventDialog } from '@/components/AddEventDialog';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/admin/login');
    }
  });

  const { data: playersData, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: leaguesData, isLoading: leaguesLoading, error: leaguesError } = useLeagues();
  const { data: prizePoolsData, isLoading: prizePoolsLoading, error: prizePoolsError } = usePrizePools();
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useMatches();

  const events = eventsData || [];
  const leagues = leaguesData || [];
  const players = playersData || [];
  const prizePools = prizePoolsData || [];

  const matches = useMemo(() => {
    if (!matchesData || !playersData) return [];
    return matchesData.map(match => ({
      ...match,
      player1: playersData.find(p => p.id === match.player1Id),
      player2: playersData.find(p => p.id === match.player2Id)
    }));
  }, [matchesData, playersData]);

  const isLoading =
    playersLoading || eventsLoading || leaguesLoading || prizePoolsLoading || matchesLoading || status === 'loading';
  const error = playersError || eventsError || leaguesError || prizePoolsError || matchesError;

  const getLeagueStatus = (league: League) => {
    const now = new Date();
    const startDate = new Date(league.startDate);
    const endDate = new Date(league.endDate);
    if (startDate > now) return 'Upcoming';
    if (startDate <= now && endDate >= now) return 'Active';
    return 'Past';
  };

  const currentLeague = useMemo(() => {
    return (
      leagues.find(league => getLeagueStatus(league) === 'Active') ||
      leagues.find(league => getLeagueStatus(league) === 'Upcoming') ||
      leagues[0]
    );
  }, [leagues]);

  const stats = useMemo(() => {
    const currentLeagueEvents = currentLeague ? events.filter(e => e.leagueId === currentLeague.id) : [];
    const currentLeagueMatches = currentLeague
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
      totalLeagues: leagues.length,
      totalEvents: events.length,
      totalPlayers: players.length,
      totalMatches: matches.length,
      currentLeagueEvents: currentLeagueEvents.length,
      currentLeaguePlayers: currentLeaguePlayers.length,
      currentLeagueMatches: currentLeagueMatches.length
    };
  }, [leagues, events, players, matches, currentLeague]);

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

  if (leagues.length === 0) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <div className="text-center py-12">
          <Trophy className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Welcome to Tournament Management</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get started by creating your first league. Once you have a league, you can add events and start managing
            tournaments.
          </p>
          <div className="flex gap-4 justify-center">
            <AddLeagueDialog>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First League
              </Button>
            </AddLeagueDialog>
            <Link href="/admin/players">
              <Button variant="outline" size="lg">
                <Users className="mr-2 h-4 w-4" />
                Manage Players
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Current League: {currentLeague?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first event to start organizing tournaments in this league.
              </p>
              <AddEventDialog leagues={leagues} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <AddLeagueDialog>
            <Button variant="outline">New League</Button>
          </AddLeagueDialog>
          <AddEventDialog />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/leagues">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeagues}</div>
              <p className="text-xs text-muted-foreground">
                {leagues.filter(l => getLeagueStatus(l) === 'Active').length} active
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/events">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
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

        <Link href="/admin/players">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
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

        <Link href="/admin/matches">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
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
      {currentLeague && (
        <div>
          <Link href={`/admin/leagues/${currentLeague.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Current League: {currentLeague.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getLeagueStatus(currentLeague) === 'Active' ? 'default' : 'secondary'}>
                      {getLeagueStatus(currentLeague)}
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
                      R{prizePools.find(p => p.leagueId === currentLeague.id)?.amount || 0}
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Events</CardTitle>
            <Link href="/admin/events">
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
                <Link key={event.id} href="/admin/events">
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
  );
}
