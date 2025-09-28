'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2Icon, ChevronUpIcon, ChevronDownIcon, TrashIcon, PencilIcon, XIcon } from 'lucide-react';
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
import { useEvents } from '@/hooks/useEvents';
import { useLeagues } from '@/hooks/useLeagues';
import { useDeleteEvent } from '@/hooks/useDeleteEvent';
import { useUpdateEvent } from '@/hooks/useUpdateEvent';
import { useURLFilters } from '@/hooks/useURLFilters';
import { FilterDropdown, FilterOption } from '@/components/FilterDropdown';
import { Event } from '@prisma/client';
import { AddEventDialog } from '@/components/AddEventDialog';
import { genericSort } from '@/lib/utils';
import Link from 'next/link';

function AdminEventsContent() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/admin/login');
    }
  });

  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: leagues, isLoading: leaguesLoading, error: leaguesError } = useLeagues();
  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();

  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [deleteEventOpen, setDeleteEventOpen] = useState(false);

  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [editEventName, setEditEventName] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventLeagueId, setEditEventLeagueId] = useState('');
  const [editEventOpen, setEditEventOpen] = useState(false);

  const [sortField, setSortField] = useState<keyof Event>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtering
  const { filters, setFilter, clearFilters, hasActiveFilters } = useURLFilters();

  const isLoading = eventsLoading || leaguesLoading || status === 'loading';
  const error = eventsError || leaguesError;

  const handleDeleteEvent = () => {
    if (!deleteEventId) return;
    deleteEventMutation.mutate(deleteEventId, {
      onSuccess: () => {
        setDeleteEventId(null);
        setDeleteEventOpen(false);
      }
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditEventId(event.id);
    setEditEventName(event.name);
    setEditEventDate(new Date(event.date).toISOString().split('T')[0]);
    setEditEventLeagueId(event.leagueId);
    setEditEventOpen(true);
  };

  const handleUpdateEvent = () => {
    if (!editEventId) return;
    updateEventMutation.mutate(
      {
        id: editEventId,
        name: editEventName,
        date: new Date(editEventDate),
        leagueId: editEventLeagueId
      },
      {
        onSuccess: () => {
          setEditEventOpen(false);
        }
      }
    );
  };

  const handleSort = (field: keyof Event) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter options for leagues
  const leagueOptions: FilterOption[] = useMemo(() => {
    if (!leagues) return [];
    return leagues.map(league => ({
      value: league.id,
      label: league.name
    }));
  }, [leagues]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events.filter(event => {
      // League filter
      if (filters.league && event.leagueId !== filters.league) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  const sortedEvents = filteredEvents ? genericSort(filteredEvents, sortField, sortDirection) : [];

  const SortableHeader = ({ field, children }: { field: keyof Event; children: React.ReactNode }) => {
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
            <h1 className="text-3xl font-bold">Events</h1>
            <AddEventDialog leagues={leagues} />
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
                    <SortableHeader field="name">Name</SortableHeader>
                    <SortableHeader field="leagueId">League</SortableHeader>
                    <SortableHeader field="date">Date</SortableHeader>
                    <SortableHeader field="createdAt">Created</SortableHeader>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEvents.map(event => {
                    const league = leagues?.find(l => l.id === event.leagueId);
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Link href={`/admin/events/${event.id}`} className="text-primary hover:underline font-medium">
                            {event.name}
                          </Link>
                        </TableCell>
                        <TableCell>{league?.name || `League #${event.leagueId}`}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(event.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="p-2"
                                    onClick={() => handleEditEvent(event)}
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit event</p>
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
                                      setDeleteEventId(event.id);
                                      setDeleteEventOpen(true);
                                    }}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete event</p>
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

          <Dialog open={editEventOpen} onOpenChange={setEditEventOpen}>
            <DialogContent>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleUpdateEvent();
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>Edit Event</DialogTitle>
                </DialogHeader>
                <DialogDescription>Update the name, date, and league for the event.</DialogDescription>
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
                        {leagues?.map(league => (
                          <SelectItem key={league.id} value={league.id}>
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
                  <Button type="submit" disabled={updateEventMutation.isPending}>
                    {updateEventMutation.isPending && <Loader2Icon className="animate-spin" />}
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
                <Button variant="destructive" onClick={handleDeleteEvent} disabled={deleteEventMutation.isPending}>
                  {deleteEventMutation.isPending && <Loader2Icon className="animate-spin" />}
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

export default function AdminEventsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <div className="text-center">Loading...</div>
        </div>
      }
    >
      <AdminEventsContent />
    </Suspense>
  );
}
