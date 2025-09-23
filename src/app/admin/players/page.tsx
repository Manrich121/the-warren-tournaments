'use client';

import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
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

interface Player {
  id: number;
  fullName: string;
  wizardsEmail: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPlayersPage() {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const router = useRouter();

  // Form states
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [addPlayerLoading, setAddPlayerLoading] = useState(false);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);

  // Sorting states for all tables
  const [playerSortField, setPlayerSortField] = useState<keyof Player>('id');
  const [playerSortDirection, setPlayerSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      await fetchData();
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      const playersRes = await fetch('/api/players');
      if (playersRes.ok) setPlayers(await playersRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const addPlayer = async () => {
    if (!newPlayerName || !newPlayerEmail) return;

    setAddPlayerLoading(true);
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newPlayerName,
          wizardsEmail: newPlayerEmail
        })
      });

      if (response.ok) {
        setNewPlayerName('');
        setNewPlayerEmail('');
        setAddPlayerOpen(false);
        setAddPlayerLoading(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add player:', error);
    } finally {
      setAddPlayerOpen(false);
      setAddPlayerLoading(false);
    }
  };

  // Generic sorting function
  const genericSort = <T,>(array: T[], field: keyof T, direction: 'asc' | 'desc') => {
    return [...array].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      let comparison = 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        // Handle date strings
        const dateA = new Date(aValue as string);
        const dateB = new Date(bValue as string);
        comparison = dateA.getTime() - dateB.getTime();
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  // Sorting handlers for each table
  const handlePlayerSort = (field: keyof Player) => {
    if (field === playerSortField) {
      setPlayerSortDirection(playerSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setPlayerSortField(field);
      setPlayerSortDirection('asc');
    }
  };

  // Sorted data for each table
  const sortedPlayers = genericSort(players, playerSortField, playerSortDirection);

  // Generic sortable header component
  const SortableHeader = <T,>({ 
    field, 
    currentSortField, 
    currentSortDirection, 
    onSort, 
    children 
  }: { 
    field: keyof T;
    currentSortField: keyof T;
    currentSortDirection: 'asc' | 'desc';
    onSort: (field: keyof T) => void;
    children: React.ReactNode;
  }) => {
    const isActive = currentSortField === field;
    const isAsc = currentSortDirection === 'asc';
    
    return (
      <TableHead>
        <button
          onClick={() => onSort(field)}
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
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
                  addPlayer();
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>Add New Player</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Enter the full name and Wizards Account email of the new player.
                </DialogDescription>
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
                  <Button type="submit" disabled={addPlayerLoading}>
                    {addPlayerLoading && <Loader2Icon className="animate-spin" />}
                    Add Player
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle>Players ({players.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader 
                      field="id" 
                      currentSortField={playerSortField} 
                      currentSortDirection={playerSortDirection} 
                      onSort={handlePlayerSort}
                    >
                      ID
                    </SortableHeader>
                    <SortableHeader 
                      field="fullName" 
                      currentSortField={playerSortField} 
                      currentSortDirection={playerSortDirection} 
                      onSort={handlePlayerSort}
                    >
                      Name
                    </SortableHeader>
                    <SortableHeader 
                      field="wizardsEmail" 
                      currentSortField={playerSortField} 
                      currentSortDirection={playerSortDirection} 
                      onSort={handlePlayerSort}
                    >
                      Email
                    </SortableHeader>
                    <SortableHeader 
                      field="createdAt" 
                      currentSortField={playerSortField} 
                      currentSortDirection={playerSortDirection} 
                      onSort={handlePlayerSort}
                    >
                      Created
                    </SortableHeader>
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
