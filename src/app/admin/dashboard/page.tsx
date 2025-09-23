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
import { Header } from '@/components/Header';
import { Loader2Icon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';

interface Player {
  id: number;
  fullName: string;
  wizardsEmail: string;
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
  draw: boolean;
  createdAt: string;
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

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const router = useRouter();

  // Form states
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [addPlayerLoading, setAddPlayerLoading] = useState(false);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [newMatchPlayer1, setNewMatchPlayer1] = useState('');
  const [newMatchPlayer2, setNewMatchPlayer2] = useState('');
  const [newMatchEvent, setNewMatchEvent] = useState('');
  const [newMatchP1Score, setNewMatchP1Score] = useState('');
  const [newMatchP2Score, setNewMatchP2Score] = useState('');
  const [newMatchDraw, setNewMatchDraw] = useState(false);

  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueStartDate, setNewLeagueStartDate] = useState('');
  const [newLeagueEndDate, setNewLeagueEndDate] = useState('');
  const [addLeagueOpen, setAddLeagueOpen] = useState(false);
  const [addLeagueLoading, setAddLeagueLoading] = useState(false);

  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLeagueId, setNewEventLeagueId] = useState('');
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addEventLoading, setAddEventLoading] = useState(false);

  const [deleteLeagueId, setDeleteLeagueId] = useState<number | null>(null);
  const [deleteLeagueOpen, setDeleteLeagueOpen] = useState(false);
  const [deleteLeagueLoading, setDeleteLeagueLoading] = useState(false);

  const [editLeagueId, setEditLeagueId] = useState<number | null>(null);
  const [editLeagueName, setEditLeagueName] = useState('');
  const [editLeagueStartDate, setEditLeagueStartDate] = useState('');
  const [editLeagueEndDate, setEditLeagueEndDate] = useState('');
  const [editLeagueOpen, setEditLeagueOpen] = useState(false);
  const [editLeagueLoading, setEditLeagueLoading] = useState(false);

  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [deleteEventOpen, setDeleteEventOpen] = useState(false);
  const [deleteEventLoading, setDeleteEventLoading] = useState(false);

  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [editEventName, setEditEventName] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventLeagueId, setEditEventLeagueId] = useState('');
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [editEventLoading, setEditEventLoading] = useState(false);

  // Sorting states for all tables
  const [playerSortField, setPlayerSortField] = useState<keyof Player>('id');
  const [playerSortDirection, setPlayerSortDirection] = useState<'asc' | 'desc'>('asc');
  const [matchSortField, setMatchSortField] = useState<keyof Match>('id');
  const [matchSortDirection, setMatchSortDirection] = useState<'asc' | 'desc'>('asc');
  const [eventSortField, setEventSortField] = useState<keyof Event>('id');
  const [eventSortDirection, setEventSortDirection] = useState<'asc' | 'desc'>('asc');
  const [leagueSortField, setLeagueSortField] = useState<keyof League>('id');
  const [leagueSortDirection, setLeagueSortDirection] = useState<'asc' | 'desc'>('asc');

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
      const [playersRes, matchesRes, eventsRes, leaguesRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/matches'),
        fetch('/api/events'),
        fetch('/api/leagues')
      ]);

      if (playersRes.ok) setPlayers(await playersRes.json());
      if (matchesRes.ok) setMatches(await matchesRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (leaguesRes.ok) setLeagues(await leaguesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const addPlayer = async () => {
    if (!newPlayerName || !newPlayerEmail) return;

    setAddPlayerLoading(true);
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newPlayerName,
          wizardsEmail: newPlayerEmail
        })
      });

      if (response.ok) {
        setNewPlayerName('');
        setNewPlayerEmail('');
        setAddPlayerOpen(false);
        setAddPlayerLoading(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add player:', error);
    } finally {
      setAddPlayerOpen(false);
      setAddPlayerLoading(false);
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

  const addLeague = async () => {
    if (!newLeagueName || !newLeagueStartDate || !newLeagueEndDate) return;

    setAddLeagueLoading(true);
    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeagueName,
          startDate: new Date(newLeagueStartDate).toISOString(),
          endDate: new Date(newLeagueEndDate).toISOString(),
        }),
      });

      if (response.ok) {
        setNewLeagueName('');
        setNewLeagueStartDate('');
        setNewLeagueEndDate('');
        setAddLeagueOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add league:', error);
    } finally {
      setAddLeagueLoading(false);
    }
  };

  const addEvent = async () => {
    if (!newEventName || !newEventDate || !newEventLeagueId) return;

    setAddEventLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEventName,
          date: new Date(newEventDate).toISOString(),
          leagueId: parseInt(newEventLeagueId),
        }),
      });

      if (response.ok) {
        setNewEventName('');
        setNewEventDate('');
        setNewEventLeagueId('');
        setAddEventOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add event:', error);
    } finally {
      setAddEventLoading(false);
    }
  };

  const deleteLeague = async () => {
    if (!deleteLeagueId) return;

    setDeleteLeagueLoading(true);
    try {
      const response = await fetch(`/api/leagues/${deleteLeagueId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteLeagueId(null);
        setDeleteLeagueOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to delete league:', error);
    } finally {
      setDeleteLeagueLoading(false);
    }
  };

  const handleEditLeague = (league: League) => {
    setEditLeagueId(league.id);
    setEditLeagueName(league.name);
    setEditLeagueStartDate(new Date(league.startDate).toISOString().split('T')[0]);
    setEditLeagueEndDate(new Date(league.endDate).toISOString().split('T')[0]);
    setEditLeagueOpen(true);
  };

  const updateLeague = async () => {
    if (!editLeagueId) return;

    setEditLeagueLoading(true);
    try {
      const response = await fetch(`/api/leagues/${editLeagueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editLeagueName,
          startDate: new Date(editLeagueStartDate).toISOString(),
          endDate: new Date(editLeagueEndDate).toISOString(),
        }),
      });

      if (response.ok) {
        setEditLeagueOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to update league:', error);
    } finally {
      setEditLeagueLoading(false);
    }
  };

  const deleteEvent = async () => {
    if (!deleteEventId) return;

    setDeleteEventLoading(true);
    try {
      const response = await fetch(`/api/events/${deleteEventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteEventId(null);
        setDeleteEventOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setDeleteEventLoading(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditEventId(event.id);
    setEditEventName(event.name);
    setEditEventDate(new Date(event.date).toISOString().split('T')[0]);
    setEditEventLeagueId(event.leagueId.toString());
    setEditEventOpen(true);
  };

  const updateEvent = async () => {
    if (!editEventId) return;

    setEditEventLoading(true);
    try {
      const response = await fetch(`/api/events/${editEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editEventName,
          date: new Date(editEventDate).toISOString(),
          leagueId: parseInt(editEventLeagueId),
        }),
      });

      if (response.ok) {
        setEditEventOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setEditEventLoading(false);
    }
  };
  // Generic sorting function
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
        // Handle date strings
        const dateA = new Date(aValue as string);
        const dateB = new Date(bValue as string);
        comparison = dateA.getTime() - dateB.getTime();
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  // Sorting handlers for each table
  const handlePlayerSort = (field: keyof Player) => {
    if (field === playerSortField) {
      setPlayerSortDirection(playerSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setPlayerSortField(field);
      setPlayerSortDirection('asc');
    }
  };

  const handleMatchSort = (field: keyof Match) => {
    if (field === matchSortField) {
      setMatchSortDirection(matchSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setMatchSortField(field);
      setMatchSortDirection('asc');
    }
  };

  const handleEventSort = (field: keyof Event) => {
    if (field === eventSortField) {
      setEventSortDirection(eventSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setEventSortField(field);
      setEventSortDirection('asc');
    }
  };

  const handleLeagueSort = (field: keyof League) => {
    if (field === leagueSortField) {
      setLeagueSortDirection(leagueSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setLeagueSortField(field);
      setLeagueSortDirection('asc');
    }
  };

  // Sorted data for each table
  const sortedPlayers = genericSort(players, playerSortField, playerSortDirection);
  const sortedMatches = genericSort(matches, matchSortField, matchSortDirection);
  const sortedEvents = genericSort(events, eventSortField, eventSortDirection);
  const sortedLeagues = genericSort(leagues, leagueSortField, leagueSortDirection);

  // Generic sortable header component
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
      <Header title="Admin Dashboard" />
      <div className="container mx-auto py-8 space-y-6">
        {/* Header removed from here, now above */}
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8">
            {[
              { key: 'players', label: 'Players' },
              { key: 'matches', label: 'Matches' },
              { key: 'events', label: 'Events' },
              { key: 'leagues', label: 'Leagues' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-6">
            <Dialog open={addPlayerOpen} onOpenChange={setAddPlayerOpen}>
              <DialogTrigger asChild>
                <Button>Add New Player</Button>
              </DialogTrigger>
              <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    addPlayer();
                  }}
                  className="space-y-4"
                >
                  <DialogHeader>
                    <DialogTitle>Add New Player</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Enter the full name and Wizards Account email of the new player.
                  </DialogDescription>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="playerName">Full Name</Label>
                      <Input
                        id="playerName"
                        value={newPlayerName}
                        onChange={e => setNewPlayerName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="playerEmail">Email</Label>
                      <Input
                        id="playerEmail"
                        type="email"
                        value={newPlayerEmail}
                        onChange={e => setNewPlayerEmail(e.target.value)}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant={'outline'} type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={addPlayerLoading}>
                      {addPlayerLoading && <Loader2Icon className="animate-spin" />}
                      Add Player
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Card>
              <CardHeader>
                <CardTitle>Players ({players.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader 
                        field="id" 
                        currentSortField={playerSortField} 
                        currentSortDirection={playerSortDirection} 
                        onSort={handlePlayerSort}
                      >
                        ID
                      </SortableHeader>
                      <SortableHeader 
                        field="fullName" 
                        currentSortField={playerSortField} 
                        currentSortDirection={playerSortDirection} 
                        onSort={handlePlayerSort}
                      >
                        Name
                      </SortableHeader>
                      <SortableHeader 
                        field="wizardsEmail" 
                        currentSortField={playerSortField} 
                        currentSortDirection={playerSortDirection} 
                        onSort={handlePlayerSort}
                      >
                        Email
                      </SortableHeader>
                      <SortableHeader 
                        field="createdAt" 
                        currentSortField={playerSortField} 
                        currentSortDirection={playerSortDirection} 
                        onSort={handlePlayerSort}
                      >
                        Created
                      </SortableHeader>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPlayers.map(player => (
                      <TableRow key={player.id}>
                        <TableCell>{player.id}</TableCell>
                        <TableCell>{player.fullName}</TableCell>
                        <TableCell>{player.wizardsEmail}</TableCell>
                        <TableCell>{new Date(player.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
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
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
              <DialogTrigger asChild>
                <Button>Add New Event</Button>
              </DialogTrigger>
              <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    addEvent();
                  }}
                  className="space-y-4"
                >
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Enter the name, date, and select the league for the new event.
                  </DialogDescription>
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Name</Label>
                    <Input
                      id="eventName"
                      value={newEventName}
                      onChange={e => setNewEventName(e.target.value)}
                      placeholder="Event Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Date</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={newEventDate}
                        onChange={e => setNewEventDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventLeague">League</Label>
                      <Select value={newEventLeagueId} onValueChange={setNewEventLeagueId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select League" />
                        </SelectTrigger>
                        <SelectContent>
                          {leagues.map(league => (
                            <SelectItem key={league.id} value={league.id.toString()}>
                              {league.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant={'outline'} type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={addEventLoading}>
                      {addEventLoading && <Loader2Icon className="animate-spin" />}
                      Add Event
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Card>
              <CardHeader>
                <CardTitle>Events ({events.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader 
                        field="id" 
                        currentSortField={eventSortField} 
                        currentSortDirection={eventSortDirection} 
                        onSort={handleEventSort}
                      >
                        ID
                      </SortableHeader>
                      <SortableHeader 
                        field="name" 
                        currentSortField={eventSortField} 
                        currentSortDirection={eventSortDirection} 
                        onSort={handleEventSort}
                      >
                        Name
                      </SortableHeader>
                      <SortableHeader 
                        field="leagueId" 
                        currentSortField={eventSortField} 
                        currentSortDirection={eventSortDirection} 
                        onSort={handleEventSort}
                      >
                        League
                      </SortableHeader>
                      <SortableHeader 
                        field="date" 
                        currentSortField={eventSortField} 
                        currentSortDirection={eventSortDirection} 
                        onSort={handleEventSort}
                      >
                        Date
                      </SortableHeader>
                      <SortableHeader 
                        field="createdAt" 
                        currentSortField={eventSortField} 
                        currentSortDirection={eventSortDirection} 
                        onSort={handleEventSort}
                      >
                        Created
                      </SortableHeader>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEvents.map(event => {
                      const league = leagues.find(l => l.id === event.leagueId);
                      return (
                        <TableRow key={event.id}>
                          <TableCell>{event.id}</TableCell>
                          <TableCell>{event.name}</TableCell>
                          <TableCell>{league?.name || `League #${event.leagueId}`}</TableCell>
                          <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(event.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditEvent(event)}>
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setDeleteEventId(event.id);
                                setDeleteEventOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Dialog open={editEventOpen} onOpenChange={setEditEventOpen}>
              <DialogContent>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    updateEvent();
                  }}
                  className="space-y-4"
                >
                  <DialogHeader>
                    <DialogTitle>Edit Event</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Update the name, date, and league for the event.
                  </DialogDescription>
                  <div className="space-y-2">
                    <Label htmlFor="editEventName">Name</Label>
                    <Input
                      id="editEventName"
                      value={editEventName}
                      onChange={e => setEditEventName(e.target.value)}
                      placeholder="Event Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editEventDate">Date</Label>
                      <Input
                        id="editEventDate"
                        type="date"
                        value={editEventDate}
                        onChange={e => setEditEventDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEventLeague">League</Label>
                      <Select value={editEventLeagueId} onValueChange={setEditEventLeagueId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select League" />
                        </SelectTrigger>
                        <SelectContent>
                          {leagues.map(league => (
                            <SelectItem key={league.id} value={league.id.toString()}>
                              {league.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant={'outline'} type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={editEventLoading}>
                      {editEventLoading && <Loader2Icon className="animate-spin" />}
                      Update Event
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={deleteEventOpen} onOpenChange={setDeleteEventOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this event?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the event and all associated matches.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteEventOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={deleteEvent} disabled={deleteEventLoading}>
                    {deleteEventLoading && <Loader2Icon className="animate-spin" />}
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Leagues Tab */}
        {activeTab === 'leagues' && (
          <div className="space-y-6">
            <Dialog open={addLeagueOpen} onOpenChange={setAddLeagueOpen}>
              <DialogTrigger asChild>
                <Button>Add New League</Button>
              </DialogTrigger>
              <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    addLeague();
                  }}
                  className="space-y-4"
                >
                  <DialogHeader>
                    <DialogTitle>Add New League</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Enter the name, start date, and end date for the new league.
                  </DialogDescription>
                  <div className="space-y-2">
                    <Label htmlFor="leagueName">Name</Label>
                    <Input
                      id="leagueName"
                      value={newLeagueName}
                      onChange={e => setNewLeagueName(e.target.value)}
                      placeholder="League Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="leagueStartDate">Start Date</Label>
                      <Input
                        id="leagueStartDate"
                        type="date"
                        value={newLeagueStartDate}
                        onChange={e => setNewLeagueStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leagueEndDate">End Date</Label>
                      <Input
                        id="leagueEndDate"
                        type="date"
                        value={newLeagueEndDate}
                        onChange={e => setNewLeagueEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant={'outline'} type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={addLeagueLoading}>
                      {addLeagueLoading && <Loader2Icon className="animate-spin" />}
                      Add League
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Card>
              <CardHeader>
                <CardTitle>Leagues ({leagues.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader 
                        field="id" 
                        currentSortField={leagueSortField} 
                        currentSortDirection={leagueSortDirection} 
                        onSort={handleLeagueSort}
                      >
                        ID
                      </SortableHeader>
                      <SortableHeader 
                        field="name" 
                        currentSortField={leagueSortField} 
                        currentSortDirection={leagueSortDirection} 
                        onSort={handleLeagueSort}
                      >
                        Name
                      </SortableHeader>
                      <SortableHeader 
                        field="startDate" 
                        currentSortField={leagueSortField} 
                        currentSortDirection={leagueSortDirection} 
                        onSort={handleLeagueSort}
                      >
                        Start Date
                      </SortableHeader>
                      <SortableHeader 
                        field="endDate" 
                        currentSortField={leagueSortField} 
                        currentSortDirection={leagueSortDirection} 
                        onSort={handleLeagueSort}
                      >
                        End Date
                      </SortableHeader>
                      <SortableHeader 
                        field="createdAt" 
                        currentSortField={leagueSortField} 
                        currentSortDirection={leagueSortDirection} 
                        onSort={handleLeagueSort}
                      >
                        Created
                      </SortableHeader>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLeagues.map(league => (
                      <TableRow key={league.id}>
                        <TableCell>{league.id}</TableCell>
                        <TableCell>{league.name}</TableCell>
                        <TableCell>{new Date(league.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(league.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(league.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditLeague(league)}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteLeagueId(league.id);
                              setDeleteLeagueOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Dialog open={editLeagueOpen} onOpenChange={setEditLeagueOpen}>
              <DialogContent>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    updateLeague();
                  }}
                  className="space-y-4"
                >
                  <DialogHeader>
                    <DialogTitle>Edit League</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Update the name, start date, and end date for the league.
                  </DialogDescription>
                  <div className="space-y-2">
                    <Label htmlFor="editLeagueName">Name</Label>
                    <Input
                      id="editLeagueName"
                      value={editLeagueName}
                      onChange={e => setEditLeagueName(e.target.value)}
                      placeholder="League Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editLeagueStartDate">Start Date</Label>
                      <Input
                        id="editLeagueStartDate"
                        type="date"
                        value={editLeagueStartDate}
                        onChange={e => setEditLeagueStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editLeagueEndDate">End Date</Label>
                      <Input
                        id="editLeagueEndDate"
                        type="date"
                        value={editLeagueEndDate}
                        onChange={e => setEditLeagueEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant={'outline'} type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={editLeagueLoading}>
                      {editLeagueLoading && <Loader2Icon className="animate-spin" />}
                      Update League
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={deleteLeagueOpen} onOpenChange={setDeleteLeagueOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this league?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the league and all associated events and matches.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteLeagueOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={deleteLeague} disabled={deleteLeagueLoading}>
                    {deleteLeagueLoading && <Loader2Icon className="animate-spin" />}
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </>
  );
}
