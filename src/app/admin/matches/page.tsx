'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronUpIcon, ChevronDownIcon, TrashIcon, Loader2Icon, PencilIcon, XIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMatches } from '@/hooks/useMatches';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { useLeagues } from '@/hooks/useLeagues';
import { useDeleteMatch } from '@/hooks/useDeleteMatch';
import { useUpdateMatch } from '@/hooks/useUpdateMatch';
import { useURLFilters } from '@/hooks/useURLFilters';
import { FilterDropdown, FilterOption } from '@/components/FilterDropdown';
import { Match } from '@prisma/client';
import { genericSort } from '@/lib/utils';
import { AddMatchDialog } from '@/components/AddMatchDialog';

function AdminMatchesContent() {
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
  const { data: leagues, isLoading: leaguesLoading, error: leaguesError } = useLeagues();
  const deleteMatchMutation = useDeleteMatch();
  const updateMatchMutation = useUpdateMatch();

  const [deleteMatchId, setDeleteMatchId] = useState<string | null>(null);
  const [deleteMatchOpen, setDeleteMatchOpen] = useState(false);

  const [editMatchId, setEditMatchId] = useState<string | null>(null);
  const [editMatchRound, setEditMatchRound] = useState('');
  const [editMatchPlayer1Score, setEditMatchPlayer1Score] = useState('');
  const [editMatchPlayer2Score, setEditMatchPlayer2Score] = useState('');
  const [editMatchDraw, setEditMatchDraw] = useState(false);
  const [editMatchEventId, setEditMatchEventId] = useState('');
  const [editMatchPlayer1Id, setEditMatchPlayer1Id] = useState('');
  const [editMatchPlayer2Id, setEditMatchPlayer2Id] = useState('');
  const [editMatchOpen, setEditMatchOpen] = useState(false);

  const [sortField, setSortField] = useState<keyof Match>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtering
  const { filters, setFilter, clearFilters, hasActiveFilters } = useURLFilters();

  const isLoading = matchesLoading || playersLoading || eventsLoading || leaguesLoading || status === 'loading';
  const error = matchesError || playersError || eventsError || leaguesError;

  const handleDeleteMatch = () => {
    if (!deleteMatchId) return;
    deleteMatchMutation.mutate(deleteMatchId, {
      onSuccess: () => {
        setDeleteMatchId(null);
        setDeleteMatchOpen(false);
      }
    });
  };

  const handleEditMatch = (match: Match) => {
    setEditMatchId(match.id);
    setEditMatchRound(match.round.toString());
    setEditMatchPlayer1Score(match.player1Score.toString());
    setEditMatchPlayer2Score(match.player2Score.toString());
    setEditMatchDraw(match.draw);
    setEditMatchEventId(match.eventId.toString());
    setEditMatchPlayer1Id(match.player1Id.toString());
    setEditMatchPlayer2Id(match.player2Id.toString());
    setEditMatchOpen(true);
  };

  const handleUpdateMatch = () => {
    if (!editMatchId) return;
    updateMatchMutation.mutate(
      {
        id: editMatchId,
        round: parseInt(editMatchRound),
        player1Score: parseInt(editMatchPlayer1Score),
        player2Score: parseInt(editMatchPlayer2Score),
        draw: editMatchDraw,
        eventId: editMatchEventId,
        player1Id: editMatchPlayer1Id,
        player2Id: editMatchPlayer2Id
      },
      {
        onSuccess: () => {
          setEditMatchOpen(false);
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

  // Filter options
  const eventOptions: FilterOption[] = useMemo(() => {
    if (!events) return [];
    return events.map(event => ({
      value: event.id,
      label: event.name
    }));
  }, [events]);

  const leagueOptions: FilterOption[] = useMemo(() => {
    if (!leagues) return [];
    return leagues.map(league => ({
      value: league.id,
      label: league.name
    }));
  }, [leagues]);

  const playerOptions: FilterOption[] = useMemo(() => {
    if (!players) return [];
    return players.map(player => ({
      value: player.id,
      label: player.fullName
    }));
  }, [players]);

  // Apply filters
  const filteredMatches = useMemo(() => {
    if (!matches) return [];

    return matches.filter(match => {
      // Event filter
      if (filters.event && match.eventId !== filters.event) {
        return false;
      }

      // League filter (via event)
      if (filters.league && events) {
        const event = events.find(e => e.id === match.eventId);
        if (!event || event.leagueId !== filters.league) {
          return false;
        }
      }

      // Player1 filter
      if (filters.player1 && match.player1Id !== filters.player1) {
        return false;
      }

      // Player2 filter
      if (filters.player2 && match.player2Id !== filters.player2) {
        return false;
      }

      // Any player filter (matches either player1 or player2)
      if (filters.player && match.player1Id !== filters.player && match.player2Id !== filters.player) {
        return false;
      }

      // Round filter
      if (filters.round && match.round.toString() !== filters.round) {
        return false;
      }

      return true;
    });
  }, [matches, filters, events]);

  const sortedMatches = filteredMatches ? genericSort(filteredMatches, sortField, sortDirection) : [];

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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Matches</h1>
            <AddMatchDialog players={players} events={events} />
          </div>

          {/* Filters */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="filters" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Active</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-4 items-center p-4 pt-1">
                  <FilterDropdown
                    placeholder="Leagues"
                    value={filters.league}
                    options={leagueOptions}
                    onValueChange={value => setFilter('league', value)}
                    disabled={isLoading}
                  />

                  <FilterDropdown
                    placeholder="Events"
                    value={filters.event}
                    options={eventOptions}
                    onValueChange={value => setFilter('event', value)}
                    disabled={isLoading}
                  />

                  <FilterDropdown
                    placeholder="Any Player"
                    value={filters.player}
                    options={playerOptions}
                    onValueChange={value => setFilter('player', value)}
                    disabled={isLoading}
                  />

                  <FilterDropdown
                    placeholder="Player 1"
                    value={filters.player1}
                    options={playerOptions}
                    onValueChange={value => setFilter('player1', value)}
                    disabled={isLoading}
                  />

                  <FilterDropdown
                    placeholder="Player 2"
                    value={filters.player2}
                    options={playerOptions}
                    onValueChange={value => setFilter('player2', value)}
                    disabled={isLoading}
                  />

                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters} className="ml-auto">
                      <XIcon className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="eventId">Event</SortableHeader>
                    <SortableHeader field="round">Round</SortableHeader>
                    <SortableHeader field="player1Id">Player 1</SortableHeader>
                    <SortableHeader field="player2Id">Player 2</SortableHeader>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <SortableHeader field="createdAt">Date</SortableHeader>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMatches.map(match => {
                    const player1 = players?.find(p => p.id === match.player1Id);
                    const player2 = players?.find(p => p.id === match.player2Id);
                    const event = events?.find(e => e.id === match.eventId);

                    return (
                      <TableRow key={match.id}>
                        <TableCell>{event?.name || `Event #${match.eventId}`}</TableCell>
                        <TableCell>{match.round}</TableCell>
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="p-2"
                                    onClick={() => handleEditMatch(match)}
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit match</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="p-2"
                                    onClick={() => {
                                      setDeleteMatchId(match.id);
                                      setDeleteMatchOpen(true);
                                    }}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete match</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={editMatchOpen} onOpenChange={setEditMatchOpen}>
            <DialogContent className="max-w-2xl">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleUpdateMatch();
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>Edit Match</DialogTitle>
                </DialogHeader>
                <DialogDescription>Update the match details.</DialogDescription>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editMatchEvent">Event</Label>
                    <Select value={editMatchEventId} onValueChange={setEditMatchEventId}>
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
                    <Label htmlFor="editMatchRound">Round</Label>
                    <Input
                      id="editMatchRound"
                      type="number"
                      value={editMatchRound}
                      onChange={e => setEditMatchRound(e.target.value)}
                      placeholder="Round"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editMatchPlayer1">Player 1</Label>
                    <Select value={editMatchPlayer1Id} onValueChange={setEditMatchPlayer1Id}>
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
                    <Label htmlFor="editMatchPlayer2">Player 2</Label>
                    <Select value={editMatchPlayer2Id} onValueChange={setEditMatchPlayer2Id}>
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editMatchPlayer1Score">Player 1 Score</Label>
                    <Input
                      id="editMatchPlayer1Score"
                      type="number"
                      value={editMatchPlayer1Score}
                      onChange={e => setEditMatchPlayer1Score(e.target.value)}
                      placeholder="Player 1 Score"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editMatchPlayer2Score">Player 2 Score</Label>
                    <Input
                      id="editMatchPlayer2Score"
                      type="number"
                      value={editMatchPlayer2Score}
                      onChange={e => setEditMatchPlayer2Score(e.target.value)}
                      placeholder="Player 2 Score"
                    />
                  </div>
                  <div className="space-y-2 flex items-center pt-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editMatchDraw"
                        checked={editMatchDraw}
                        onCheckedChange={state => setEditMatchDraw(state === true)}
                      />
                      <Label htmlFor="editMatchDraw">Draw</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={updateMatchMutation.isPending}>
                    {updateMatchMutation.isPending && <Loader2Icon className="animate-spin" />}
                    Update Match
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteMatchOpen} onOpenChange={setDeleteMatchOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this match?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the match.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteMatchOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteMatch} disabled={deleteMatchMutation.isPending}>
                  {deleteMatchMutation.isPending && <Loader2Icon className="animate-spin" />}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}

export default function AdminMatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <div className="text-center">Loading...</div>
        </div>
      }
    >
      <AdminMatchesContent />
    </Suspense>
  );
}
