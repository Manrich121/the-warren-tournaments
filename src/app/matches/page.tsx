'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { TableRowActions } from '@/components/TableRowActions';
import { useMatches } from '@/hooks/useMatches';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { useDeleteMatch } from '@/hooks/useDeleteMatch';
import { Match } from '@prisma/client';
import { AddMatchDialog } from '@/components/matches/AddMatchDialog';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function MatchesPage() {
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: matches, isLoading: matchesLoading } = useMatches();
  const { data: players, isLoading: playersLoading } = usePlayers();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const deleteMatchMutation = useDeleteMatch();

  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>(undefined);
  const [addMatchOpen, setAddMatchOpen] = useState(false);

  // Event filter state
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  const isLoading = matchesLoading || playersLoading || eventsLoading || status === 'loading';

  const handleDelete = (matchId: string) => {
    deleteMatchMutation.mutate(matchId);
  };

  // Pre-filter matches by event
  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    if (selectedEventId === 'all') return matches;
    return matches.filter(match => match.eventId === selectedEventId);
  }, [matches, selectedEventId]);

  // Define columns for DataTable
  const columns: ColumnDef<Match>[] = useMemo(
    () => [
      {
        id: 'player1',
        accessorFn: originalRow => {
          const player = players?.find(p => p.id === originalRow.player1Id);
          return player?.name || 'Unknown';
        },
        header: 'Player 1',
        enableSorting: true,
        enableGlobalFilter: true,
        cell: info => info.getValue()
      },
      {
        id: 'player2',
        accessorFn: originalRow => {
          const player = players?.find(p => p.id === originalRow.player2Id);
          return player?.name || 'Unknown';
        },
        header: 'Player 2',
        enableSorting: true,
        enableGlobalFilter: true,
        cell: info => info.getValue()
      },
      {
        id: 'scores',
        accessorKey: 'player1Score',
        header: 'Score',
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => {
          const match = row.original;
          return (
            <span className="font-mono">
              {match.player1Score} - {match.player2Score}
              {match.draw && <span className="ml-2 text-muted-foreground">(Draw)</span>}
            </span>
          );
        }
      },
      {
        id: 'round',
        accessorKey: 'round',
        header: 'Round',
        enableSorting: true,
        enableGlobalFilter: false,
        cell: ({ getValue }) => `Round ${getValue()}`
      },
      {
        id: 'event',
        accessorFn: originalRow => {
          const event = events?.find(e => e.id === originalRow.eventId);
          return event?.name || 'Unknown';
        },
        header: 'Event',
        enableSorting: true,
        enableGlobalFilter: false,
        cell: info => info.getValue()
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
        }
      }
    ],
    [players, events]
  );

  return (
    <>
      <Header />
      <div className="container mx-auto space-y-6">
        <Nav />
        <div className="py-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Matches</h1>
            {isAdmin && (
              <>
                <AddMatchDialog
                  match={selectedMatch}
                  events={events}
                  players={players}
                  open={addMatchOpen}
                  onOpenChange={open => {
                    if (!open) {
                      setAddMatchOpen(false);
                      setSelectedMatch(undefined);
                    }
                  }}
                />
                <Button onClick={() => setAddMatchOpen(true)}>Add New Match</Button>
              </>
            )}
          </div>

          {/* Event Filter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 max-w-xs">
              <Label htmlFor="event-filter">Filter by Event:</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger id="event-filter" className="w-[200px]">
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  {events?.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedEventId !== 'all' && (
              <Button variant="ghost" onClick={() => setSelectedEventId('all')}>
                Clear filter
              </Button>
            )}
          </div>

          <DataTable
            data={filteredMatches}
            columns={columns}
            storageKey="table-state-matches"
            enableGlobalFilter={true}
            enableSorting={true}
            enablePagination={true}
            initialPageSize={25}
            isLoading={isLoading}
            renderRowActions={
              isAdmin
                ? match => {
                    return (
                      <div className="flex items-center gap-2">
                        <TableRowActions
                          entityName="match"
                          showEdit={true}
                          onEdit={() => {
                            setSelectedMatch(match);
                            setAddMatchOpen(true);
                          }}
                          onDelete={() => handleDelete(match.id)}
                          deleteWarning="This will permanently delete the match."
                          isDeleting={deleteMatchMutation.isPending}
                        />
                      </div>
                    );
                  }
                : undefined
            }
            searchPlaceholder="Search matches..."
            emptyMessage="No matches found."
          />
        </div>
      </div>
    </>
  );
}
