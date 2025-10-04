'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronUpIcon, ChevronDownIcon, TrashIcon, PencilIcon, Loader2Icon, XIcon, SearchIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlayers } from '@/hooks/usePlayers';
import { useDeletePlayer } from '@/hooks/useDeletePlayer';
import { useURLFilters } from '@/hooks/useURLFilters';
import { Player } from '@prisma/client';
import { genericSort } from '@/lib/utils';
import { AddPlayerDialog } from '@/components/AddPlayerDialog';
import { useEvents } from '@/hooks/useEvents';
import { useLeagues } from '@/hooks/useLeagues';
import { useMatches } from '@/hooks/useMatches';
import { FilterDropdown, FilterOption } from '@/components/FilterDropdown';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import { GenericSkeletonLoader } from '@/components/ShimmeringLoader';

function PlayersContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: leagues, isLoading: leaguesLoading, error: leaguesError } = useLeagues();
  const { data: matches, isLoading: matchesLoading, error: matchesError } = useMatches();
  const deletePlayerMutation = useDeletePlayer();

  const [deletePlayerId, setDeletePlayerId] = useState<string | null>(null);
  const [deletePlayerOpen, setDeletePlayerOpen] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<keyof Player>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtering
  const { filters, setFilter, clearFilters, hasActiveFilters } = useURLFilters();
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const isLoading = playersLoading || eventsLoading || leaguesLoading || matchesLoading || status === 'loading';
  const error = playersError || eventsError || leaguesError || matchesError;

  const handleDeletePlayer = () => {
    if (!deletePlayerId || !isAdmin) return;
    deletePlayerMutation.mutate(deletePlayerId, {
      onSuccess: () => {
        setDeletePlayerId(null);
        setDeletePlayerOpen(false);
      }
    });
  };

  const handleSort = (field: keyof Player) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle search query changes with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setFilter('search', value.trim());
    } else {
      setFilter('search', null);
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

  // Apply filters
  const filteredPlayers = useMemo(() => {
    if (!players || !matches || !events) return [];

    let filtered = [...players];

    // League filter
    if (filters.league) {
      const eventIdsInLeague = new Set(events.filter(e => e.leagueId === filters.league).map(e => e.id));
      const playerIdsInLeague = new Set<string>();
      matches
        .filter(m => eventIdsInLeague.has(m.eventId))
        .forEach(m => {
          playerIdsInLeague.add(m.player1Id);
          playerIdsInLeague.add(m.player2Id);
        });
      filtered = filtered.filter(p => playerIdsInLeague.has(p.id));
    }

    // Event filter
    if (filters.event) {
      const playerIdsInEvent = new Set<string>();
      matches
        .filter(m => m.eventId === filters.event)
        .forEach(m => {
          playerIdsInEvent.add(m.player1Id);
          playerIdsInEvent.add(m.player2Id);
        });
      filtered = filtered.filter(p => playerIdsInEvent.has(p.id));
    }

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(player => {
        const nameMatch = player.fullName.toLowerCase().includes(query);
        const emailMatch = player.wizardsEmail.toLowerCase().includes(query);
        return nameMatch || emailMatch;
      });
    }

    return filtered;
  }, [players, matches, events, filters]);

  const sortedPlayers = filteredPlayers ? genericSort(filteredPlayers, sortField, sortDirection) : [];

  const SortableHeader = ({ field, children }: { field: keyof Player; children: React.ReactNode }) => {
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
      <>
        <Header />
        <div className="container mx-auto space-y-6">
          <Nav />
          <div className="py-8 space-y-6">
            <h1 className="text-3xl font-bold">Players</h1>
            <GenericSkeletonLoader />
          </div>
        </div>
      </>
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
      <Header />
      <div className="container mx-auto space-y-6">
        <Nav />
        <div className="py-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Players</h1>
            {isAdmin && <AddPlayerDialog />}
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
                  <div className="relative w-[300px]">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={e => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>

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

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        clearFilters();
                        setSearchQuery('');
                      }}
                      className="ml-auto"
                    >
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
                    <SortableHeader field="fullName">Name</SortableHeader>
                    <SortableHeader field="wizardsEmail">Email</SortableHeader>
                    <SortableHeader field="createdAt">Created</SortableHeader>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPlayers.map(player => (
                    <TableRow
                      key={player.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/players/${player.id}`)}
                    >
                      <TableCell>{player.fullName}</TableCell>
                      <TableCell>{player.wizardsEmail}</TableCell>
                      <TableCell>{new Date(player.createdAt).toLocaleDateString()}</TableCell>
                      {isAdmin && (
                        <TableCell onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AddPlayerDialog player={player}>
                                    <Button variant="outline" size="sm" className="p-2">
                                      <PencilIcon className="h-4 w-4" />
                                    </Button>
                                  </AddPlayerDialog>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit player</p>
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
                                      setDeletePlayerId(player.id);
                                      setDeletePlayerOpen(true);
                                    }}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete player</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Delete Dialog - Only shown for admins */}
          {isAdmin && (
            <Dialog open={deletePlayerOpen} onOpenChange={setDeletePlayerOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this player?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the player and remove them from all
                    associated matches.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeletePlayerOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeletePlayer} disabled={deletePlayerMutation.isPending}>
                    {deletePlayerMutation.isPending && <Loader2Icon className="animate-spin" />}
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </>
  );
}

export default function PlayersPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <div className="text-center">Loading...</div>
        </div>
      }
    >
      <PlayersContent />
    </Suspense>
  );
}
