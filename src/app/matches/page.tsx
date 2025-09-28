'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronUpIcon, ChevronDownIcon, TrashIcon, Loader2Icon, PencilIcon, XIcon } from 'lucide-react';
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
import { useMatches } from '@/hooks/useMatches';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { useLeagues } from '@/hooks/useLeagues';
import { useDeleteMatch } from '@/hooks/useDeleteMatch';
import { useURLFilters } from '@/hooks/useURLFilters';
import { FilterDropdown, FilterOption } from '@/components/FilterDropdown';
import { Match } from '@prisma/client';
import { genericSort } from '@/lib/utils';
import { AddMatchDialog } from '@/components/AddMatchDialog';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import { GenericSkeletonLoader } from '@/components/ShimmeringLoader';

function MatchesContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: matches, isLoading: matchesLoading, error: matchesError } = useMatches();
  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: leagues, isLoading: leaguesLoading, error: leaguesError } = useLeagues();
  const deleteMatchMutation = useDeleteMatch();

  const [deleteMatchId, setDeleteMatchId] = useState<string | null>(null);
  const [deleteMatchOpen, setDeleteMatchOpen] = useState(false);

  const [sortField, setSortField] = useState<keyof Match>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtering
  const { filters, setFilter, clearFilters, hasActiveFilters } = useURLFilters();

  const isLoading = matchesLoading || playersLoading || eventsLoading || leaguesLoading || status === 'loading';
  const error = matchesError || playersError || eventsError || leaguesError;

  const handleDeleteMatch = () => {
    if (!deleteMatchId || !isAdmin) return;
    deleteMatchMutation.mutate(deleteMatchId, {
      onSuccess: () => {
        setDeleteMatchId(null);
        setDeleteMatchOpen(false);
      }
    });
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

  const getPlayerName = (playerId: string) => {
    const player = players?.find(p => p.id === playerId);
    return player?.fullName.split(' ')[0] || 'Unknown Player';
  };

  const getEventName = (eventId: string) => {
    const event = events?.find(e => e.id === eventId);
    return event?.name || 'Unknown Event';
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto space-y-6">
          <Nav />
          <div className="py-8 space-y-6">
            <h1 className="text-3xl font-bold">Matches</h1>
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
            <h1 className="text-3xl font-bold">Matches</h1>
            {isAdmin && <AddMatchDialog players={players} events={events} />}
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
                    <TableHead>Player 1</TableHead>
                    <TableHead>Player 2</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <SortableHeader field="createdAt">Date</SortableHeader>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMatches.map(match => {
                    const player1Name = getPlayerName(match.player1Id);
                    const player2Name = getPlayerName(match.player2Id);
                    const eventName = getEventName(match.eventId);

                    let result = 'Draw';

                    if (!match.draw) {
                      if (match.player1Score > match.player2Score) {
                        result = `${player1Name} wins`;
                      } else {
                        result = `${player2Name} wins`;
                      }
                    }

                    return (
                      <TableRow key={match.id}>
                        <TableCell>{eventName}</TableCell>
                        <TableCell>{match.round}</TableCell>
                        <TableCell>{player1Name}</TableCell>
                        <TableCell>{player2Name}</TableCell>
                        <TableCell>
                          {match.player1Score} - {match.player2Score}
                        </TableCell>
                        <TableCell>{result}</TableCell>
                        <TableCell>{new Date(match.createdAt).toLocaleDateString()}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Delete Dialog - Only shown for admins */}
          {isAdmin && (
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
          )}
        </div>
      </div>
    </>
  );
}

export default function MatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <div className="text-center">Loading...</div>
        </div>
      }
    >
      <MatchesContent />
    </Suspense>
  );
}
