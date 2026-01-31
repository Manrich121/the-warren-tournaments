'use client';

import { useSession } from 'next-auth/react';
import { useMemo, use, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Users, Calendar, Target, ArrowLeft } from 'lucide-react';
import { useLeagues } from '@/hooks/useLeagues';
import { useEvents } from '@/hooks/useEvents';
import { usePlayers } from '@/hooks/usePlayers';
import { useMatches } from '@/hooks/useMatches';
import { useDeleteMatch } from '@/hooks/useDeleteMatch';
import type { Event, Match } from '@prisma/client';
import { AddMatchDialog } from '@/components/matches/AddMatchDialog';
import { TableRowActions } from '@/components/TableRowActions';
import { genericSort } from '@/lib/utils';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import EventLeaderboard from '@/components/events/EventLeaderboard';
import { useEventLeaderboard } from '@/hooks/useEventLeaderboard';
import { formatDate } from '@/lib/utils/format';

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

type MatchWithPlayers = Match & { player1Name: string; player2Name: string; result: string };

export default function EventPage({ params }: EventPageProps) {
  const { id: eventId } = use(params);
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: leaguesData, isLoading: leaguesLoading, error: leaguesError } = useLeagues();
  const { data: playersData, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: eventMatches, isLoading: matchesLoading, error: matchesError } = useMatches({ eventId });
  const { data: leaderboard, isLoading: leaderboardLoading, error: leaderboardError } = useEventLeaderboard(eventId);
  const deleteMatchMutation = useDeleteMatch();

  const leagues = useMemo(() => leaguesData || [], [leaguesData]);
  const players = useMemo(() => playersData || [], [playersData]);

  const [addMatchOpen, setAddMatchOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>(undefined);

  // Sorting state
  const [matchesSortField, setMatchesSortField] = useState<keyof MatchWithPlayers>('round');
  const [matchesSortDirection, setMatchesSortDirection] = useState<'asc' | 'desc'>('asc');

  const event = useMemo(() => {
    return events.find(e => e.id === eventId);
  }, [events, eventId]);

  const league = useMemo(() => {
    if (!event) return undefined;
    return leagues.find(l => l.id === event.leagueId);
  }, [leagues, event]);

  const eventMatchesWithPlayers = useMemo(() => {
    return eventMatches.map(match => {
      const player1 = players.find(p => p.id === match.player1Id);
      const player2 = players.find(p => p.id === match.player2Id);
      let result = 'Draw';
      if (!match.draw) {
        result =
          match.player1Score > match.player2Score
            ? `${player1?.name.split(' ')[0] || 'Player 1'} wins`
            : `${player2?.name.split(' ')[0] || 'Player 2'} wins`;
      }
      return {
        ...match,
        player1Name: player1?.name || 'N/A',
        player2Name: player2?.name || 'N/A',
        result
      };
    });
  }, [eventMatches, players]);

  const sortedEventMatches = useMemo(() => {
    return genericSort(eventMatchesWithPlayers, matchesSortField, matchesSortDirection);
  }, [eventMatchesWithPlayers, matchesSortField, matchesSortDirection]);

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    if (eventDate > now) return 'Upcoming';
    if (eventDate.toDateString() === now.toDateString()) return 'Today';
    return 'Completed';
  };

  const isLoading =
    eventsLoading || leaguesLoading || playersLoading || matchesLoading || leaderboardLoading || status === 'loading';
  const error = eventsError || leaguesError || playersError || matchesError || leaderboardError;

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-center text-red-500">Failed to load event data.</div>;
  }

  if (!event) {
    return (
      <>
        <Header />
        <div className="container mx-auto space-y-6">
          {isAdmin && <Nav />}
          <div className="py-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">Event not found</h2>
            <p className="text-muted-foreground mb-4">
              The event you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/events">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto space-y-6">
        <div className="py-8 space-y-6">
          <div>
            <Link href={'/events'}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold">Event | {event.name}</h1>
                  <Badge variant={getEventStatus(event) === 'Completed' ? 'secondary' : 'default'}>
                    {getEventStatus(event)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  League: {league?.name || 'Unknown League'} • {formatDate(event.date)}
                </p>
              </div>
            </div>
            {isAdmin && (
              <>
                <AddMatchDialog
                  match={selectedMatch}
                  players={players}
                  events={[event]}
                  open={addMatchOpen}
                  onOpenChange={open => {
                    if (!open) {
                      setAddMatchOpen(false);
                      setSelectedMatch(undefined);
                    }
                  }}
                />
                <Button onClick={() => setAddMatchOpen(true)}>Add match</Button>
              </>
            )}
          </div>

          {/* Event Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leaderboard?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventMatches.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rounds</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {eventMatches.length > 0 ? Math.max(...eventMatches.map(m => m.round)) : 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Event Date</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">{formatDate(event.date)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Players Leaderboard */}
            {leaderboard && <EventLeaderboard title="Event Leaderboard" players={leaderboard} />}

            {/* Matches */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Matches</CardTitle>
                <Link href={`/matches?event=${eventId}`}>
                  <Button variant="outline" size="sm">
                    View Matches
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {sortedEventMatches.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Round</TableHead>
                        <TableHead>Player 1</TableHead>
                        <TableHead>Player 2</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Result</TableHead>
                        {isAdmin && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedEventMatches.map(match => (
                        <TableRow key={match.id}>
                          <TableCell>{match.round}</TableCell>
                          <TableCell>
                            <Link href={`/players/${match.player1Id}`} className="text-primary hover:underline">
                              {match.player1Name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link href={`/players/${match.player2Id}`} className="text-primary hover:underline">
                              {match.player2Name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {match.player1Score} - {match.player2Score}
                          </TableCell>
                          <TableCell>{match.result}</TableCell>
                          {isAdmin && (
                            <TableCell>
                              <TableRowActions
                                entityName="match"
                                showEdit={true}
                                onEdit={() => {
                                  setSelectedMatch(match);
                                  setAddMatchOpen(true);
                                }}
                                onDelete={() => deleteMatchMutation.mutate(match.id)}
                                deleteWarning="This will permanently delete the match."
                                isDeleting={deleteMatchMutation.isPending}
                              />
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No matches have been played in this event yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
