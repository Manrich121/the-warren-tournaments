'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2Icon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
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
import { usePlayers } from '@/hooks/usePlayers';
import { useAddPlayer } from '@/hooks/useAddPlayer';
import { Player } from '@/lib/types';
import { genericSort } from '@/lib/utils';

export default function AdminPlayersPage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/admin/login');
    }
  });

  const { data: players, isLoading, error } = usePlayers();
  const addPlayerMutation = useAddPlayer();

  // Form states
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<keyof Player>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleAddPlayer = async () => {
    if (!newPlayerName || !newPlayerEmail) return;

    addPlayerMutation.mutate(
      { fullName: newPlayerName, wizardsEmail: newPlayerEmail },
      {
        onSuccess: () => {
          setNewPlayerName('');
          setNewPlayerEmail('');
          setAddPlayerOpen(false);
        }
      }
    );
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
          <Dialog open={addPlayerOpen} onOpenChange={setAddPlayerOpen}>
            <DialogTrigger asChild>
              <Button>Add New Player</Button>
            </DialogTrigger>
            <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleAddPlayer();
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>Add New Player</DialogTitle>
                </DialogHeader>
                <DialogDescription>Enter the full name and Wizards Account email of the new player.</DialogDescription>
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
                  <Button type="submit" disabled={addPlayerMutation.isPending}>
                    {addPlayerMutation.isPending && <Loader2Icon className="animate-spin" />}
                    Add Player
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle>Players ({players?.length || 0})</CardTitle>
            </CardHeader>
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
