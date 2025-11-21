'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { TableRowActions } from '@/components/TableRowActions';
import { useEvents } from '@/hooks/useEvents';
import { useLeagues } from '@/hooks/useLeagues';
import { useDeleteEvent } from '@/hooks/useDeleteEvent';
import { Event } from '@prisma/client';
import { AddEventDialog } from '@/components/AddEventDialog';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function EventsPage() {
  const router = useRouter();
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: leagues, isLoading: leaguesLoading } = useLeagues();
  const deleteEventMutation = useDeleteEvent();

  // League filter state (separate from DataTable global search)
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('all');

  const isLoading = eventsLoading || leaguesLoading || status === 'loading';

  const handleDelete = (eventId: string) => {
    deleteEventMutation.mutate(eventId);
  };

  // Pre-filter events by league before passing to DataTable
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (selectedLeagueId === 'all') return events;
    return events.filter(event => event.leagueId === selectedLeagueId);
  }, [events, selectedLeagueId]);

  // Define columns for DataTable
  const columns: ColumnDef<Event>[] = useMemo(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      enableGlobalFilter: true,
      cell: ({ getValue }) => (
        <span className="text-primary font-medium">{getValue() as string}</span>
      ),
    },
    {
      id: 'league',
      accessorKey: 'leagueId',
      header: 'League',
      enableSorting: true,
      enableGlobalFilter: true,
      cell: ({ getValue }) => {
        const leagueId = getValue() as string;
        const league = leagues?.find(l => l.id === leagueId);
        return league?.name || 'Unknown';
      },
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: 'Date',
      enableSorting: true,
      enableGlobalFilter: false,
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Created',
      enableSorting: true,
      enableGlobalFilter: false,
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return new Date(date).toLocaleDateString();
      },
    },
  ], [leagues]);

  return (
    <>
      <Header />
      <div className="container mx-auto space-y-6">
        <Nav />
        <div className="py-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Events</h1>
            {isAdmin && <AddEventDialog leagues={leagues} />}
          </div>

          {/* League Filter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 max-w-xs">
              <Label htmlFor="league-filter">Filter by League:</Label>
              <Select value={selectedLeagueId} onValueChange={setSelectedLeagueId}>
                <SelectTrigger id="league-filter" className="w-[200px]">
                  <SelectValue placeholder="All leagues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All leagues</SelectItem>
                  {leagues?.map(league => (
                    <SelectItem key={league.id} value={league.id}>
                      {league.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedLeagueId !== 'all' && (
              <Button variant="ghost" onClick={() => setSelectedLeagueId('all')}>
                Clear filter
              </Button>
            )}
          </div>

          <DataTable
            data={filteredEvents}
            columns={columns}
            storageKey="table-state-events"
            enableGlobalFilter={true}
            enableSorting={true}
            enablePagination={true}
            initialPageSize={25}
            isLoading={isLoading}
            onRowClick={(event) => router.push(`/events/${event.id}`)}
            renderRowActions={
              isAdmin
                ? (event) => {
                    const league = leagues?.find(l => l.id === event.leagueId);
                    return (
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AddEventDialog event={event} leagues={leagues}>
                                <Button variant="outline" size="sm" className="p-2">
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                              </AddEventDialog>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit event</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TableRowActions
                          entityName="event"
                          showEdit={false}
                          onDelete={() => handleDelete(event.id)}
                          deleteWarning="This will permanently delete the event and all associated matches."
                          isDeleting={deleteEventMutation.isPending}
                        />
                      </div>
                    );
                  }
                : undefined
            }
            searchPlaceholder="Search events..."
            emptyMessage="No events found. Create one to get started."
          />
        </div>
      </div>
    </>
  );
}
