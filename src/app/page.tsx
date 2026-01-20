'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowRight } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { usePrizePools } from '@/hooks/usePrizePools';
import { useMatches } from '@/hooks/useMatches';
import type { League, Player } from '@prisma/client';
import { AddLeagueDialog } from '@/components/leagues/AddLeagueDialog';
import { AddEventDialog } from '@/components/events/AddEventDialog';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import { Leaderboard } from '@/components/leagues/Leaderboard';
import { useActiveLeague } from '@/hooks/useActiveLeague';
import { useMostRecentLeague } from '@/hooks/useMostRecentLeague';
import { useLeagueLeaderboard } from '@/hooks/useLeagueLeaderboard';
import { useLeagues } from '@/hooks/useLeagues';
import { QuickStats } from '@/components/QuickStats';
import { LeagueSelector } from '@/components/leagues/LeagueSelector';
import { genericSort } from '@/lib/utils';
import { formatLeagueOption } from '@/lib/league-utils';
import { LeagueStats } from '@/types/LeagueStats';

export default function DashboardPage() {
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: prizePools, error: prizePoolsError } = usePrizePools();
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: activeLeague } = useActiveLeague();
  const { data: mostRecentLeague, isLoading: mostRecentLeagueLoading } = useMostRecentLeague();
  const { data: allLeagues } = useLeagues();

  // State for user-selected league (US3 - League switching)
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

  const [addLeagueOpen, setAddLeagueOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);

  // Default to most recent league on initial load
  useEffect(() => {
    if (mostRecentLeague && !selectedLeagueId) {
      setSelectedLeagueId(mostRecentLeague.id);
    }
  }, [mostRecentLeague, selectedLeagueId]);

  // Determine which league to display (selected or most recent)
  const displayLeague = useMemo(() => {
    if (!selectedLeagueId || !allLeagues) return mostRecentLeague;
    return allLeagues.find(l => l.id === selectedLeagueId) || mostRecentLeague;
  }, [selectedLeagueId, allLeagues, mostRecentLeague]);

  const {
    data: leaderboard,
    isLoading: leaderboardLoading,
    error: leaderboardError
  } = useLeagueLeaderboard(displayLeague?.id);

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

  const isLoading = mostRecentLeagueLoading || status === 'loading';
  const isStatsLoading = playersLoading || eventsLoading || matchesLoading;
  const error = playersError || eventsError || prizePoolsError || matchesError || leaderboardError;

  const getLeagueStatus = (league: League) => {
    const now = new Date();
    const startDate = new Date(league.startDate);
    const endDate = new Date(league.endDate);
    if (startDate > now) return 'Upcoming';
    if (startDate <= now && endDate >= now) return 'Active';
    return 'Past';
  };

  // Calculate league stats for QuickStats component (FR-002, FR-003)
  const leagueStats = useMemo((): LeagueStats | null => {
    if (!displayLeague || !events || !matches || !allLeagues) {
      return null;
    }

    // Filter events and matches for the displayed (most recent) league
    const leagueEvents = events.filter(e => e.leagueId === displayLeague.id);
    const leagueMatches = matches.filter(m => leagueEvents.some(e => e.id === m.eventId));

    // Get unique players who participated in the league
    const uniquePlayerIds = new Set<string>();
    leagueMatches.forEach(match => {
      uniquePlayerIds.add(match.player1Id);
      uniquePlayerIds.add(match.player2Id);
    });

    // Count active leagues (for "Total Leagues" card subtitle)
    const activeLeaguesCount = allLeagues.filter(league => {
      const now = new Date();
      const startDate = new Date(league.startDate);
      const endDate = new Date(league.endDate);
      return startDate <= now && endDate >= now;
    }).length;

    return {
      totalLeagues: allLeagues.length, // Global count (all leagues)
      activeLeagues: activeLeaguesCount,
      eventsCount: leagueEvents.length, // League-specific
      playersCount: uniquePlayerIds.size, // League-specific
      matchesCount: leagueMatches.length // League-specific
    };
  }, [displayLeague, events, matches, allLeagues]);

  // Keep legacy stats for "Current League Summary" card
  const currentLeagueStats = useMemo(() => {
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
      currentLeagueEvents: currentLeagueEvents.length,
      currentLeaguePlayers: currentLeaguePlayers.length,
      currentLeagueMatches: currentLeagueMatches.length
    };
  }, [events, matches, activeLeague]);

  const sortedEvents = useMemo(() => genericSort(events, 'date', 'desc'), [events]);

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
                <AddLeagueDialog
                  open={addLeagueOpen}
                  onOpenChange={open => {
                    if (!open) {
                      setAddLeagueOpen(false);
                    }
                  }}
                />
                <Button variant="outline" onClick={() => setAddLeagueOpen(true)}>
                  New League
                </Button>
                <AddEventDialog
                  open={addEventOpen}
                  onOpenChange={open => {
                    if (!open) {
                      setAddEventOpen(false);
                    }
                  }}
                />
                <Button variant="default" onClick={() => setAddEventOpen(true)}>
                  New Event
                </Button>
              </div>
            </div>
          )}

          {/* League Selector (US3 - FR-007) */}
          {allLeagues && allLeagues.length > 0 && (
            <LeagueSelector
              leagues={allLeagues}
              selectedLeagueId={selectedLeagueId}
              onSelectLeague={setSelectedLeagueId}
              className="mb-4"
            />
          )}

          {/* Quick Stats Grid - League-Specific Stats (FR-002, FR-003) */}
          <QuickStats stats={leagueStats} isLoading={isStatsLoading} />

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
                        <div className="text-2xl font-bold">{currentLeagueStats.currentLeagueEvents}</div>
                        <div className="text-sm text-muted-foreground">Events</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{currentLeagueStats.currentLeaguePlayers}</div>
                        <div className="text-sm text-muted-foreground">Players</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{currentLeagueStats.currentLeagueMatches}</div>
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

          {/* Leaderboard and Recent Events */}
          {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">*/}
          {/* Most Recent League Leaderboard */}
          <div>
            {displayLeague ? (
              <Leaderboard
                title={formatLeagueOption(displayLeague)}
                entries={leaderboard || []}
                isLoading={leaderboardLoading}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>League Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">No leagues available</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Events */}
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
                {sortedEvents.map(event => {
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
      {/*</div>*/}
    </>
  );
}
