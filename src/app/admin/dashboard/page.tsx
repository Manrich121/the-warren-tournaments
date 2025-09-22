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
import { Loader2Icon } from 'lucide-react';
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
              <form
                onSubmit={e => {
                  e.preventDefault();
                  addPlayer();
                }}
                className="space-y-4"
              >
                <DialogTrigger asChild>
                  <Button>Add New Player</Button>
                </DialogTrigger>
                <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
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
                </DialogContent>
              </form>
            </Dialog>

            <Card>
              <CardHeader>
                <CardTitle>Players ({players.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map(player => (
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
                      <TableHead>ID</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Player 1</TableHead>
                      <TableHead>Player 2</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map(match => {
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
          <Card>
            <CardHeader>
              <CardTitle>Events ({events.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>League</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map(event => {
                    const league = leagues.find(l => l.id === event.leagueId);
                    return (
                      <TableRow key={event.id}>
                        <TableCell>{event.id}</TableCell>
                        <TableCell>{event.name}</TableCell>
                        <TableCell>{league?.name || `League #${event.leagueId}`}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(event.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Leagues Tab */}
        {activeTab === 'leagues' && (
          <Card>
            <CardHeader>
              <CardTitle>Leagues ({leagues.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leagues.map(league => (
                    <TableRow key={league.id}>
                      <TableCell>{league.id}</TableCell>
                      <TableCell>{league.name}</TableCell>
                      <TableCell>{new Date(league.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(league.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(league.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
