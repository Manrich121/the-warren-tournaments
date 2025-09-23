'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronUpIcon, ChevronDownIcon, TrashIcon, PencilIcon, Loader2Icon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlayers } from '@/hooks/usePlayers';
import { useDeletePlayer } from '@/hooks/useDeletePlayer';
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
  const deletePlayerMutation = useDeletePlayer();

  const [deletePlayerId, setDeletePlayerId] = useState<number | null>(null);
  const [deletePlayerOpen, setDeletePlayerOpen] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<keyof Player>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleDeletePlayer = () => {
    if (!deletePlayerId) return;
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
            <h1 className="text-3xl font-bold">Players</h1>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPlayers.map(player => (
                    <TableRow key={player.id}>
                      <TableCell>{player.id}</TableCell>
                      <TableCell>{player.fullName}</TableCell>
                      <TableCell>{player.wizardsEmail}</TableCell>
                      <TableCell>{new Date(player.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

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
        </div>
      </div>
    </>
  );
}
