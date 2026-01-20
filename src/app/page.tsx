'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { usePrizePools } from '@/hooks/usePrizePools';
import { useMatches } from '@/hooks/useMatches';
import type { Player } from '@prisma/client';
import { AddLeagueDialog } from '@/components/leagues/AddLeagueDialog';
import { AddEventDialog } from '@/components/events/AddEventDialog';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import { Leaderboard } from '@/components/leagues/Leaderboard';
import { useMostRecentLeague } from '@/hooks/useMostRecentLeague';
import { useLeagueLeaderboard } from '@/hooks/useLeagueLeaderboard';
import { useLeagues } from '@/hooks/useLeagues';
import { QuickStats } from '@/components/QuickStats';
import { LeagueSelector } from '@/components/leagues/LeagueSelector';
import { genericSort } from '@/lib/utils';
import { formatLeagueOption } from '@/lib/league-utils';
import { LeagueStats } from '@/types/LeagueStats';
import { useScoringSystem } from '@/hooks/scoring-systems/useScoringSystem';
import { useScoringSystems } from '@/hooks/scoring-systems/useScoringSystems';

export default function DashboardPage() {
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: mostRecentLeague, isLoading: mostRecentLeagueLoading } = useMostRecentLeague();
  const { data: allLeagues } = useLeagues();
  const { data: allScoringSystems } = useScoringSystems();

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

  // Fetch the scoring system for the display league, or get default scoring system
  const scoringSystemId = displayLeague?.scoringSystemId;
  const { data: fetchedScoringSystem, isLoading: scoringSystemLoading } = useScoringSystem(scoringSystemId || '');

  // Use the fetched scoring system, or fallback to default from all scoring systems
  const displayScoringSystem = useMemo(() => {
    if (scoringSystemId && fetchedScoringSystem) {
      return fetchedScoringSystem;
    }
    // Find default scoring system
    return allScoringSystems?.find(s => s.isDefault);
  }, [scoringSystemId, fetchedScoringSystem, allScoringSystems]);

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
  const error = playersError || eventsError || matchesError || leaderboardError;

  // Calculate league stats for QuickStats component (FR-002, FR-003)
  const leagueStats = useMemo((): LeagueStats | null => {
    if (!displayLeague || !events || !matches || !allLeagues) {
      return null;
    }

    // Get unique players
    const uniquePlayerIds = new Set<string>();
    matches.forEach(match => {
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
      eventsCount: events.length,
      playersCount: uniquePlayerIds.size,
      matchesCount: matches.length
    };
  }, [displayLeague, events, matches, allLeagues]);

  const sortedEvents = useMemo(() => genericSort(events, 'date', 'desc').slice(0, 3), [events]);

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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">The Warren Tournaments</h1>
            {isAdmin && (
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
            )}
          </div>

          {/* Quick Stats Grid - League-Specific Stats (FR-002, FR-003) */}
          <QuickStats stats={leagueStats} isLoading={isStatsLoading} />

          {/* Leaderboard and Recent Events */}
          {/* Most Recent League Leaderboard */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>League Leaderboard</CardTitle>
                {allLeagues && allLeagues.length > 0 && (
                  <LeagueSelector
                    leagues={allLeagues}
                    selectedLeagueId={selectedLeagueId}
                    onSelectLeague={setSelectedLeagueId}
                    className="mb-4"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {displayLeague ? (
                <Leaderboard
                  title={formatLeagueOption(displayLeague)}
                  entries={leaderboard || []}
                  isLoading={leaderboardLoading || scoringSystemLoading}
                  scoringSystem={displayScoringSystem}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">No leagues available</div>
              )}
            </CardContent>
          </Card>

          {/* Recent Events and Scoring System */}
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
    </>
  );
}
