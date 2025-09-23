'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2Icon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { useAddMatch } from '@/hooks/useAddMatch';
import { Match, Player, Event } from '@/lib/types';
import { genericSort } from '@/lib/utils';

export default function AdminMatchesPage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/admin/login');
    }
  });

  const { data: matches, isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const addMatchMutation = useAddMatch();

  const [newMatchPlayer1, setNewMatchPlayer1] = useState('');
  const [newMatchPlayer2, setNewMatchPlayer2] = useState('');
  const [newMatchEvent, setNewMatchEvent] = useState('');
  const [newMatchP1Score, setNewMatchP1Score] = useState('');
  const [newMatchP2Score, setNewMatchP2Score] = useState('');
  const [newMatchDraw, setNewMatchDraw] = useState(false);
  const [round, setRound] = useState('');

  const [sortField, setSortField] = useState<keyof Match>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isLoading = matchesLoading || playersLoading || eventsLoading || status === 'loading';
  const error = matchesError || playersError || eventsError;

  const handleAddMatch = () => {
    if (!newMatchPlayer1 || !newMatchPlayer2 || !newMatchEvent || !round) return;

    addMatchMutation.mutate(
      {
        eventId: parseInt(newMatchEvent),
        player1Id: parseInt(newMatchPlayer1),
        player2Id: parseInt(newMatchPlayer2),
        player1Score: parseInt(newMatchP1Score) || 0,
        player2Score: parseInt(newMatchP2Score) || 0,
        draw: newMatchDraw,
        round: parseInt(round)
      },
      {
        onSuccess: () => {
          setNewMatchPlayer1('');
          setNewMatchPlayer2('');
          setNewMatchEvent('');
          setNewMatchP1Score('');
          setNewMatchP2Score('');
          setNewMatchDraw(false);
          setRound('');
        }
      }
    );
  };

  const handleSort = (field: keyof Match) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedMatches = matches ? genericSort(matches, sortField, sortDirection) : [];

  const SortableHeader = ({ field, children }: { field: keyof Match; children: React.ReactNode }) => {
    const isActive = sortField === field;
    const isAsc = sortDirection === 'asc';

    return (
      <TableHead>
        <button
          onClick={() => handleSort(field)}
          className="flex items-center space-x-1 hover:text-foreground font-medium"
        >
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
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 space-y-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Match</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Event</Label>
                  <Select value={newMatchEvent} onValueChange={setNewMatchEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events?.map(event => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Round</Label>
                  <Input type="number" value={round} onChange={e => setRound(e.target.value)} placeholder="1" min="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Player 1</Label>
                  <Select value={newMatchPlayer1} onValueChange={setNewMatchPlayer1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Player 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {players?.map(player => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          {player.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Player 2</Label>
                  <Select value={newMatchPlayer2} onValueChange={setNewMatchPlayer2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Player 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {players?.map(player => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          {player.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Player 1 Score</Label>
                  <Input
                    type="number"
                    value={newMatchP1Score}
                    onChange={e => setNewMatchP1Score(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Player 2 Score</Label>
                  <Input
                    type="number"
                    value={newMatchP2Score}
                    onChange={e => setNewMatchP2Score(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="draw"
                  checked={newMatchDraw}
                  onChange={e => setNewMatchDraw(e.target.checked)}
                />
                <Label htmlFor="draw">Draw</Label>
              </div>
              <Button onClick={handleAddMatch} disabled={addMatchMutation.isPending}>
                {addMatchMutation.isPending && <Loader2Icon className="animate-spin" />}
                Add Match
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matches ({matches?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="id">ID</SortableHeader>
                    <SortableHeader field="eventId">Event</SortableHeader>
                    <SortableHeader field="player1Id">Player 1</SortableHeader>
                    <SortableHeader field="player2Id">Player 2</SortableHeader>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <SortableHeader field="createdAt">Date</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMatches.map(match => {
                    const player1 = players?.find(p => p.id === match.player1Id);
                    const player2 = players?.find(p => p.id === match.player2Id);
                    const event = events?.find(e => e.id === match.eventId);

                    return (
                      <TableRow key={match.id}>
                        <TableCell>{match.id}</TableCell>
                        <TableCell>{event?.name || `Event #${match.eventId}`}</TableCell>
                        <TableCell>{player1?.fullName || `Player #${match.player1Id}`}</TableCell>
                        <TableCell>{player2?.fullName || `Player #${match.player2Id}`}</TableCell>
                        <TableCell>
                          {match.player1Score} - {match.player2Score}
                        </TableCell>
                        <TableCell>
                          {match.draw
                            ? 'Draw'
                            : match.player1Score > match.player2Score
                              ? 'Player 1 Win'
                              : 'Player 2 Win'}
                        </TableCell>
                        <TableCell>{new Date(match.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
