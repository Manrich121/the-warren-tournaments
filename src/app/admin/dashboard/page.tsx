'use client';

import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Player {
  id: number;
  fullName: string;
  wizardsEmail: string;
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: number;
  leagueId: number;
  name: string;
  date: string;
  createdAt: string;
}

interface League {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface PrizePool {
  id: number;
  leagueId: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface Match {
  id: number;
  eventId: number;
  player1Id: number;
  player2Id: number;
  player1Score: number;
  player2Score: number;
  round: number;
  player1: Player;
  player2: Player;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [prizePools, setPrizePools] = useState<PrizePool[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      await fetchData();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      const [playersRes, eventsRes, leaguesRes, prizePoolsRes, matchesRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/events'),
        fetch('/api/leagues'),
        fetch('/api/prize-pool'),
        fetch('/api/matches')
      ]);

      const playersData = playersRes.ok ? await playersRes.json() : [];
      setPlayers(playersData);

      if (eventsRes.ok) {
        setEvents(await eventsRes.json());
      }
      if (leaguesRes.ok) {
        setLeagues(await leaguesRes.json());
      }
      if (prizePoolsRes.ok) {
        setPrizePools(await prizePoolsRes.json());
      }
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        const populatedMatches = matchesData.map((match: any) => ({
          ...match,
          player1: playersData.find((p: Player) => p.id === match.player1Id),
          player2: playersData.find((p: Player) => p.id === match.player2Id)
        }));
        setMatches(populatedMatches);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const getLeagueStatus = (league: League) => {
    const now = new Date();
    const startDate = new Date(league.startDate);
    const endDate = new Date(league.endDate);
    if (startDate > now) return 'Upcoming';
    if (startDate <= now && endDate >= now) return 'Active';
    return 'Past';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
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
                        onClick={() => router.push(`/admin/leagues?edit=${league.id}`)}
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
                        if (match.player1 && !acc.find(p => p?.id === match.player1.id)) {
                          acc.push(match.player1);
                        }
                        if (match.player2 && !acc.find(p => p?.id === match.player2.id)) {
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
                                {eventPlayers.map(player => (
                                  <li key={player.id}>{player.fullName}</li>
                                ))}
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
