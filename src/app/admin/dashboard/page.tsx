'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { useLeagues } from '@/hooks/useLeagues';
import { usePrizePools } from '@/hooks/usePrizePools';
import { useMatches } from '@/hooks/useMatches';
import { League, Player } from '@prisma/client';

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
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <Accordion type="multiple" className="w-full space-y-4">
        {leagues
          .filter(league => getLeagueStatus(league) !== 'Past')
          .map(league => {
            const leaguePrizePool = prizePools.find(p => p.leagueId === league.id);
            const leagueEvents = events.filter(e => e.leagueId === league.id);
            const status = getLeagueStatus(league);

            return (
              <AccordionItem value={`league-${league.id}`} key={league.id} className="border rounded-lg">
                <AccordionTrigger className="p-6">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-semibold">{league.name}</h2>
                      <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold">Prize Pool: R{leaguePrizePool?.amount || 0}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/admin/leagues?edit=${league.id}`);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                  <h3 className="text-lg font-semibold mb-4">Events</h3>
                  <div className="space-y-4">
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

                      return (
                        <Card key={event.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>{event.name}</CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/admin/events?edit=${event.id}`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-semibold">Players ({eventPlayers.length})</h4>
                              <ul className="list-disc list-inside">
                                {eventPlayers.map(player => player && <li key={player.id}>{player.fullName}</li>)}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold">Matches</h4>
                              <div className="space-y-2">
                                {eventMatches.map(match => (
                                  <div
                                    key={match.id}
                                    className="flex items-center justify-between p-2 border rounded-md"
                                  >
                                    <div>
                                      <span>
                                        {match.player1?.fullName || 'TBA'} vs {match.player2?.fullName || 'TBA'}
                                      </span>
                                      <span className="text-sm text-muted-foreground"> (Round {match.round})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span>
                                        {match.player1Score} - {match.player2Score}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => router.push(`/admin/matches?edit=${match.id}`)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
      </Accordion>
    </div>
  );
}
