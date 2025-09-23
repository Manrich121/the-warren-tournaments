'use client';

import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2Icon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

interface Match {
  id: number;
  eventId: number;
  player1Id: number;
  player2Id: number;
  player1Score: number;
  player2Score: number;
  draw: boolean;
  createdAt: string;
}

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

export default function AdminMatchesPage() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const router = useRouter();

  const [newMatchPlayer1, setNewMatchPlayer1] = useState('');
  const [newMatchPlayer2, setNewMatchPlayer2] = useState('');
  const [newMatchEvent, setNewMatchEvent] = useState('');
  const [newMatchP1Score, setNewMatchP1Score] = useState('');
  const [newMatchP2Score, setNewMatchP2Score] = useState('');
  const [newMatchDraw, setNewMatchDraw] = useState(false);

  const [matchSortField, setMatchSortField] = useState<keyof Match>('id');
  const [matchSortDirection, setMatchSortDirection] = useState<'asc' | 'desc'>('asc');

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
      const [matchesRes, playersRes, eventsRes] = await Promise.all([
        fetch('/api/matches'),
        fetch('/api/players'),
        fetch('/api/events'),
      ]);
      if (matchesRes.ok) setMatches(await matchesRes.json());
      if (playersRes.ok) setPlayers(await playersRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const addMatch = async () => {
    if (!newMatchPlayer1 || !newMatchPlayer2 || !newMatchEvent) return;

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: parseInt(newMatchEvent),
          player1Id: parseInt(newMatchPlayer1),
          player2Id: parseInt(newMatchPlayer2),
          player1Score: parseInt(newMatchP1Score) || 0,
          player2Score: parseInt(newMatchP2Score) || 0,
          draw: newMatchDraw
        })
      });

      if (response.ok) {
        setNewMatchPlayer1('');
        setNewMatchPlayer2('');
        setNewMatchEvent('');
        setNewMatchP1Score('');
        setNewMatchP2Score('');
        setNewMatchDraw(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add match:', error);
    }
  };

  const genericSort = <T,>(array: T[], field: keyof T, direction: 'asc' | 'desc') => {
    return [...array].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      let comparison = 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        const dateA = new Date(aValue as string);
        const dateB = new Date(bValue as string);
        comparison = dateA.getTime() - dateB.getTime();
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  const handleMatchSort = (field: keyof Match) => {
    if (field === matchSortField) {
      setMatchSortDirection(matchSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setMatchSortField(field);
      setMatchSortDirection('asc');
    }
  };

  const sortedMatches = genericSort(matches, matchSortField, matchSortDirection);

  const SortableHeader = <T,>({ 
    field, 
    currentSortField, 
    currentSortDirection, 
    onSort, 
    children 
  }: { 
    field: keyof T;
    currentSortField: keyof T;
    currentSortDirection: 'asc' | 'desc';
    onSort: (field: keyof T) => void;
    children: React.ReactNode;
  }) => {
    const isActive = currentSortField === field;
    const isAsc = currentSortDirection === 'asc';
    
    return (
      <TableHead>
        <button
          onClick={() => onSort(field)}
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Player 1</Label>
                  <Select value={newMatchPlayer1} onValueChange={setNewMatchPlayer1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Player 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map(player => (
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
                      {players.map(player => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          {player.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Event</Label>
                  <Select value={newMatchEvent} onValueChange={setNewMatchEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(event => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              <Button onClick={addMatch}>Add Match</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matches ({matches.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader 
                      field="id" 
                      currentSortField={matchSortField} 
                      currentSortDirection={matchSortDirection} 
                      onSort={handleMatchSort}
                    >
                      ID
                    </SortableHeader>
                    <SortableHeader 
                      field="eventId" 
                      currentSortField={matchSortField} 
                      currentSortDirection={matchSortDirection} 
                      onSort={handleMatchSort}
                    >
                      Event
                    </SortableHeader>
                    <SortableHeader 
                      field="player1Id" 
                      currentSortField={matchSortField} 
                      currentSortDirection={matchSortDirection} 
                      onSort={handleMatchSort}
                    >
                      Player 1
                    </SortableHeader>
                    <SortableHeader 
                      field="player2Id" 
                      currentSortField={matchSortField} 
                      currentSortDirection={matchSortDirection} 
                      onSort={handleMatchSort}
                    >
                      Player 2
                    </SortableHeader>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <SortableHeader 
                      field="createdAt" 
                      currentSortField={matchSortField} 
                      currentSortDirection={matchSortDirection} 
                      onSort={handleMatchSort}
                    >
                      Date
                    </SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMatches.map(match => {
                    const player1 = players.find(p => p.id === match.player1Id);
                    const player2 = players.find(p => p.id === match.player2Id);
                    const event = events.find(e => e.id === match.eventId);

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
