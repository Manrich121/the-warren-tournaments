'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMemo, use, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Users, Calendar, Target, ArrowLeft, PencilIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { useLeagues } from '@/hooks/useLeagues';
import { useEvents } from '@/hooks/useEvents';
import { usePlayers } from '@/hooks/usePlayers';
import { useMatches } from '@/hooks/useMatches';
import type { League, Event, Player, Match } from '@prisma/client';
import { AddEventDialog } from '@/components/AddEventDialog';
import { genericSort } from '@/lib/utils';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

type PlayerWithStats = Player & { wins: number; losses: number; draws: number; matchesPlayed: number; winRate: number };
type MatchWithPlayers = Match & { player1Name: string; player2Name: string; result: string };

export default function EventPage({ params }: EventPageProps) {
  const { id: eventId } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: leaguesData, isLoading: leaguesLoading, error: leaguesError } = useLeagues();
  const { data: playersData, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useMatches();

  const events = useMemo(() => eventsData || [], [eventsData]);
  const leagues = useMemo(() => leaguesData || [], [leaguesData]);
  const players = useMemo(() => playersData || [], [playersData]);
  const eventMatches = useMemo(() => (matchesData || []).filter(m => m.eventId === eventId), [matchesData, eventId]);

  // Sorting state
  const [playersSortField, setPlayersSortField] = useState<keyof PlayerWithStats>('winRate');
  const [playersSortDirection, setPlayersSortDirection] = useState<'asc' | 'desc'>('desc');
  const [matchesSortField, setMatchesSortField] = useState<keyof MatchWithPlayers>('round');
  const [matchesSortDirection, setMatchesSortDirection] = useState<'asc' | 'desc'>('asc');

  const event = useMemo(() => {
    return events.find(e => e.id === eventId);
  }, [events, eventId]);

  const league = useMemo(() => {
    if (!event) return undefined;
    return leagues.find(l => l.id === event.leagueId);
  }, [leagues, event]);

  const eventPlayersWithStats = useMemo(() => {
    const playerMap = new Map<
      string,
      Player & { wins: number; losses: number; draws: number; matchesPlayed: number }
    >();

    eventMatches.forEach(match => {
      const player1 = players.find(p => p.id === match.player1Id);
      const player2 = players.find(p => p.id === match.player2Id);

      if (player1) {
        const existing = playerMap.get(player1.id) || { ...player1, wins: 0, losses: 0, draws: 0, matchesPlayed: 0 };
        existing.matchesPlayed++;
        if (match.draw) existing.draws++;
        else if (match.player1Score > match.player2Score) existing.wins++;
        else existing.losses++;
        playerMap.set(player1.id, existing);
      }

      if (player2) {
        const existing = playerMap.get(player2.id) || { ...player2, wins: 0, losses: 0, draws: 0, matchesPlayed: 0 };
        existing.matchesPlayed++;
        if (match.draw) existing.draws++;
        else if (match.player2Score > match.player1Score) existing.wins++;
        else existing.losses++;
        playerMap.set(player2.id, existing);
      }
    });

    return Array.from(playerMap.values()).map(p => ({
      ...p,
      winRate: p.matchesPlayed > 0 ? (p.wins / p.matchesPlayed) * 100 : 0
    }));
  }, [eventMatches, players]);

  const sortedEventPlayers = useMemo(() => {
    return genericSort(eventPlayersWithStats, playersSortField, playersSortDirection);
  }, [eventPlayersWithStats, playersSortField, playersSortDirection]);

  const eventMatchesWithPlayers = useMemo(() => {
    return eventMatches.map(match => {
      const player1 = players.find(p => p.id === match.player1Id);
      const player2 = players.find(p => p.id === match.player2Id);
      let result = 'Draw';
      if (!match.draw) {
        result =
          match.player1Score > match.player2Score
            ? `${player1?.fullName || 'Player 1'} wins`
            : `${player2?.fullName || 'Player 2'} wins`;
      }
      return {
        ...match,
        player1Name: player1?.fullName || 'N/A',
        player2Name: player2?.fullName || 'N/A',
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isLoading = eventsLoading || leaguesLoading || playersLoading || matchesLoading || status === 'loading';
  const error = eventsError || leaguesError || playersError || matchesError;

  const SortableHeader = <T,>({
    field,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    children,
    className
  }: {
    field: keyof T;
    sortField: keyof T;
    sortDirection: 'asc' | 'desc';
    setSortField: (field: keyof T) => void;
    setSortDirection: (direction: 'asc' | 'desc') => void;
    children: React.ReactNode;
    className?: string;
  }) => {
    const isActive = sortField === field;
    const isAsc = sortDirection === 'asc';

    const handleSort = () => {
      if (field === sortField) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    };

    return (
      <TableHead className={className}>
        <button onClick={handleSort} className="flex items-center space-x-1 hover:text-foreground font-medium">
          <span>{children}</span>
          {isActive ? (
            isAsc ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </button>
      </TableHead>
    );
  };

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
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
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
            {isAdmin && <AddEventDialog event={event} leagues={leagues} />}
          </div>

          {/* Event Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventPlayersWithStats.length}</div>
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

          {/* Players Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Players Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {eventPlayersWithStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <SortableHeader
                        field="fullName"
                        sortField={playersSortField}
                        sortDirection={playersSortDirection}
                        setSortField={setPlayersSortField}
                        setSortDirection={setPlayersSortDirection}
                      >
                        Player
                      </SortableHeader>
                      <SortableHeader
                        field="matchesPlayed"
                        sortField={playersSortField}
                        sortDirection={playersSortDirection}
                        setSortField={setPlayersSortField}
                        setSortDirection={setPlayersSortDirection}
                      >
                        Matches
                      </SortableHeader>
                      <SortableHeader
                        field="wins"
                        sortField={playersSortField}
                        sortDirection={playersSortDirection}
                        setSortField={setPlayersSortField}
                        setSortDirection={setPlayersSortDirection}
                      >
                        Wins
                      </SortableHeader>
                      <SortableHeader
                        field="losses"
                        sortField={playersSortField}
                        sortDirection={playersSortDirection}
                        setSortField={setPlayersSortField}
                        setSortDirection={setPlayersSortDirection}
                      >
                        Losses
                      </SortableHeader>
                      <SortableHeader
                        field="draws"
                        sortField={playersSortField}
                        sortDirection={playersSortDirection}
                        setSortField={setPlayersSortField}
                        setSortDirection={setPlayersSortDirection}
                      >
                        Draws
                      </SortableHeader>
                      <SortableHeader
                        field="winRate"
                        sortField={playersSortField}
                        sortDirection={playersSortDirection}
                        setSortField={setPlayersSortField}
                        setSortDirection={setPlayersSortDirection}
                      >
                        Win Rate
                      </SortableHeader>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEventPlayers.map((player, index) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">#{index + 1}</TableCell>
                        <TableCell>
                          <Link href={`/players/${player.id}`} className="text-primary hover:underline">
                            {player.fullName}
                          </Link>
                        </TableCell>
                        <TableCell>{player.matchesPlayed}</TableCell>
                        <TableCell>{player.wins}</TableCell>
                        <TableCell>{player.losses}</TableCell>
                        <TableCell>{player.draws}</TableCell>
                        <TableCell>{player.winRate.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No players have participated in this event yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Matches */}
          <Card>
            <CardHeader>
              <CardTitle>Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedEventMatches.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader
                        field="round"
                        sortField={matchesSortField}
                        sortDirection={matchesSortDirection}
                        setSortField={setMatchesSortField}
                        setSortDirection={setMatchesSortDirection}
                      >
                        Round
                      </SortableHeader>
                      <TableHead>Player 1</TableHead>
                      <TableHead>Player 2</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Result</TableHead>
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
    </>
  );
}
