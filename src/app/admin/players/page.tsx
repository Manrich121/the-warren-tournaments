'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';
import { Player } from '@/lib/types';
import { genericSort } from '@/lib/utils';
import { AddPlayerDialog } from '@/components/AddPlayerDialog';

export default function AdminPlayersPage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/admin/login');
    }
  });

  const { data: players, isLoading, error } = usePlayers();

  // Sorting states
  const [sortField, setSortField] = useState<keyof Player>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Player) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPlayers = players ? genericSort(players, sortField, sortDirection) : [];

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

  if (isLoading || status === 'loading') {
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
            <h1 className="text-3xl font-bold">Players ({players?.length || 0})</h1>
            <AddPlayerDialog />
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="id">ID</SortableHeader>
                    <SortableHeader field="fullName">Name</SortableHeader>
                    <SortableHeader field="wizardsEmail">Email</SortableHeader>
                    <SortableHeader field="createdAt">Created</SortableHeader>
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
      </div>
    </>
  );
}
