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

interface League {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export default function AdminLeaguesPage() {
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<League[]>([]);
  const router = useRouter();

  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueStartDate, setNewLeagueStartDate] = useState('');
  const [newLeagueEndDate, setNewLeagueEndDate] = useState('');
  const [addLeagueOpen, setAddLeagueOpen] = useState(false);
  const [addLeagueLoading, setAddLeagueLoading] = useState(false);

  const [deleteLeagueId, setDeleteLeagueId] = useState<number | null>(null);
  const [deleteLeagueOpen, setDeleteLeagueOpen] = useState(false);
  const [deleteLeagueLoading, setDeleteLeagueLoading] = useState(false);

  const [editLeagueId, setEditLeagueId] = useState<number | null>(null);
  const [editLeagueName, setEditLeagueName] = useState('');
  const [editLeagueStartDate, setEditLeagueStartDate] = useState('');
  const [editLeagueEndDate, setEditLeagueEndDate] = useState('');
  const [editLeagueOpen, setEditLeagueOpen] = useState(false);
  const [editLeagueLoading, setEditLeagueLoading] = useState(false);

  const [leagueSortField, setLeagueSortField] = useState<keyof League>('id');
  const [leagueSortDirection, setLeagueSortDirection] = useState<'asc' | 'desc'>('asc');

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
      const leaguesRes = await fetch('/api/leagues');
      if (leaguesRes.ok) setLeagues(await leaguesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const addLeague = async () => {
    if (!newLeagueName || !newLeagueStartDate || !newLeagueEndDate) return;

    setAddLeagueLoading(true);
    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeagueName,
          startDate: new Date(newLeagueStartDate).toISOString(),
          endDate: new Date(newLeagueEndDate).toISOString(),
        }),
      });

      if (response.ok) {
        setNewLeagueName('');
        setNewLeagueStartDate('');
        setNewLeagueEndDate('');
        setAddLeagueOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add league:', error);
    } finally {
      setAddLeagueLoading(false);
    }
  };

  const deleteLeague = async () => {
    if (!deleteLeagueId) return;

    setDeleteLeagueLoading(true);
    try {
      const response = await fetch(`/api/leagues/${deleteLeagueId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteLeagueId(null);
        setDeleteLeagueOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to delete league:', error);
    } finally {
      setDeleteLeagueLoading(false);
    }
  };

  const handleEditLeague = (league: League) => {
    setEditLeagueId(league.id);
    setEditLeagueName(league.name);
    setEditLeagueStartDate(new Date(league.startDate).toISOString().split('T')[0]);
    setEditLeagueEndDate(new Date(league.endDate).toISOString().split('T')[0]);
    setEditLeagueOpen(true);
  };

  const updateLeague = async () => {
    if (!editLeagueId) return;

    setEditLeagueLoading(true);
    try {
      const response = await fetch(`/api/leagues/${editLeagueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editLeagueName,
          startDate: new Date(editLeagueStartDate).toISOString(),
          endDate: new Date(editLeagueEndDate).toISOString(),
        }),
      });

      if (response.ok) {
        setEditLeagueOpen(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to update league:', error);
    } finally {
      setEditLeagueLoading(false);
    }
  };

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
        const dateA = new Date(aValue as string);
        const dateB = new Date(bValue as string);
        comparison = dateA.getTime() - dateB.getTime();
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  const handleLeagueSort = (field: keyof League) => {
    if (field === leagueSortField) {
      setLeagueSortDirection(leagueSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setLeagueSortField(field);
      setLeagueSortDirection('asc');
    }
  };

  const sortedLeagues = genericSort(leagues, leagueSortField, leagueSortDirection);

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
          <Dialog open={addLeagueOpen} onOpenChange={setAddLeagueOpen}>
            <DialogTrigger asChild>
              <Button>Add New League</Button>
            </DialogTrigger>
            <DialogContent onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  addLeague();
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>Add New League</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Enter the name, start date, and end date for the new league.
                </DialogDescription>
                <div className="space-y-2">
                  <Label htmlFor="leagueName">Name</Label>
                  <Input
                    id="leagueName"
                    value={newLeagueName}
                    onChange={e => setNewLeagueName(e.target.value)}
                    placeholder="League Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leagueStartDate">Start Date</Label>
                    <Input
                      id="leagueStartDate"
                      type="date"
                      value={newLeagueStartDate}
                      onChange={e => setNewLeagueStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leagueEndDate">End Date</Label>
                    <Input
                      id="leagueEndDate"
                      type="date"
                      value={newLeagueEndDate}
                      onChange={e => setNewLeagueEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant={'outline'} type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={addLeagueLoading}>
                    {addLeagueLoading && <Loader2Icon className="animate-spin" />}
                    Add League
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle>Leagues ({leagues.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader 
                      field="id" 
                      currentSortField={leagueSortField} 
                      currentSortDirection={leagueSortDirection} 
                      onSort={handleLeagueSort}
                    >
                      ID
                    </SortableHeader>
                    <SortableHeader 
                      field="name" 
                      currentSortField={leagueSortField} 
                      currentSortDirection={leagueSortDirection} 
                      onSort={handleLeagueSort}
                    >
                      Name
                    </SortableHeader>
                    <SortableHeader 
                      field="startDate" 
                      currentSortField={leagueSortField} 
                      currentSortDirection={leagueSortDirection} 
                      onSort={handleLeagueSort}
                    >
                      Start Date
                    </SortableHeader>
                    <SortableHeader 
                      field="endDate" 
                      currentSortField={leagueSortField} 
                      currentSortDirection={leagueSortDirection} 
                      onSort={handleLeagueSort}
                    >
                      End Date
                    </SortableHeader>
                    <SortableHeader 
                      field="createdAt" 
                      currentSortField={leagueSortField} 
                      currentSortDirection={leagueSortDirection} 
                      onSort={handleLeagueSort}
                    >
                      Created
                    </SortableHeader>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLeagues.map(league => (
                    <TableRow key={league.id}>
                      <TableCell>{league.id}</TableCell>
                      <TableCell>{league.name}</TableCell>
                      <TableCell>{new Date(league.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(league.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(league.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditLeague(league)}>
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeleteLeagueId(league.id);
                            setDeleteLeagueOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={editLeagueOpen} onOpenChange={setEditLeagueOpen}>
            <DialogContent>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  updateLeague();
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>Edit League</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Update the name, start date, and end date for the league.
                </DialogDescription>
                <div className="space-y-2">
                  <Label htmlFor="editLeagueName">Name</Label>
                  <Input
                    id="editLeagueName"
                    value={editLeagueName}
                    onChange={e => setEditLeagueName(e.target.value)}
                    placeholder="League Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editLeagueStartDate">Start Date</Label>
                    <Input
                      id="editLeagueStartDate"
                      type="date"
                      value={editLeagueStartDate}
                      onChange={e => setEditLeagueStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLeagueEndDate">End Date</Label>
                    <Input
                      id="editLeagueEndDate"
                      type="date"
                      value={editLeagueEndDate}
                      onChange={e => setEditLeagueEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant={'outline'} type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={editLeagueLoading}>
                    {editLeagueLoading && <Loader2Icon className="animate-spin" />}
                    Update League
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteLeagueOpen} onOpenChange={setDeleteLeagueOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this league?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the league and all associated events and matches.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteLeagueOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={deleteLeague} disabled={deleteLeagueLoading}>
                  {deleteLeagueLoading && <Loader2Icon className="animate-spin" />}
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
