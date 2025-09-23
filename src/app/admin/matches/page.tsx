'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { usePlayers } from '@/hooks/usePlayers';
import { useEvents } from '@/hooks/useEvents';
import { Match } from '@/lib/types';
import { genericSort } from '@/lib/utils';
import { AddMatchDialog } from '@/components/AddMatchDialog';

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

  const [sortField, setSortField] = useState<keyof Match>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isLoading = matchesLoading || playersLoading || eventsLoading || status === 'loading';
  const error = matchesError || playersError || eventsError;

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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Matches ({matches?.length || 0})</h1>
            <AddMatchDialog players={players} events={events} />
          </div>

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
