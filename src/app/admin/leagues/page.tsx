'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
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
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { useLeagues } from '@/hooks/useLeagues';
import { useDeleteLeague } from '@/hooks/useDeleteLeague';
import { useUpdateLeague } from '@/hooks/useUpdateLeague';
import { League } from '@/lib/types';
import { genericSort } from '@/lib/utils';
import { AddLeagueDialog } from '@/components/AddLeagueDialog';

export default function AdminLeaguesPage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/admin/login');
    }
  });

  const { data: leagues, isLoading, error } = useLeagues();
  const deleteLeagueMutation = useDeleteLeague();
  const updateLeagueMutation = useUpdateLeague();

  const [deleteLeagueId, setDeleteLeagueId] = useState<number | null>(null);
  const [deleteLeagueOpen, setDeleteLeagueOpen] = useState(false);

  const [editLeagueId, setEditLeagueId] = useState<number | null>(null);
  const [editLeagueName, setEditLeagueName] = useState('');
  const [editLeagueStartDate, setEditLeagueStartDate] = useState('');
  const [editLeagueEndDate, setEditLeagueEndDate] = useState('');
  const [editLeagueOpen, setEditLeagueOpen] = useState(false);

  const [sortField, setSortField] = useState<keyof League>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleDeleteLeague = () => {
    if (!deleteLeagueId) return;
    deleteLeagueMutation.mutate(deleteLeagueId, {
      onSuccess: () => {
        setDeleteLeagueId(null);
        setDeleteLeagueOpen(false);
      }
    });
  };

  const handleEditLeague = (league: League) => {
    setEditLeagueId(league.id);
    setEditLeagueName(league.name);
    setEditLeagueStartDate(new Date(league.startDate).toISOString().split('T')[0]);
    setEditLeagueEndDate(new Date(league.endDate).toISOString().split('T')[0]);
    setEditLeagueOpen(true);
  };

  const handleUpdateLeague = () => {
    if (!editLeagueId) return;
    updateLeagueMutation.mutate(
      {
        id: editLeagueId,
        name: editLeagueName,
        startDate: new Date(editLeagueStartDate).toISOString(),
        endDate: new Date(editLeagueEndDate).toISOString()
      },
      {
        onSuccess: () => {
          setEditLeagueOpen(false);
        }
      }
    );
  };

  const handleSort = (field: keyof League) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLeagues = leagues ? genericSort(leagues, sortField, sortDirection) : [];

  const SortableHeader = ({ field, children }: { field: keyof League; children: React.ReactNode }) => {
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
            <h1 className="text-3xl font-bold">Leagues ({leagues?.length || 0})</h1>
            <AddLeagueDialog />
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="id">ID</SortableHeader>
                    <SortableHeader field="name">Name</SortableHeader>
                    <SortableHeader field="startDate">Start Date</SortableHeader>
                    <SortableHeader field="endDate">End Date</SortableHeader>
                    <SortableHeader field="createdAt">Created</SortableHeader>
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
                  handleUpdateLeague();
                }}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>Edit League</DialogTitle>
                </DialogHeader>
                <DialogDescription>Update the name, start date, and end date for the league.</DialogDescription>
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
                  <Button type="submit" disabled={updateLeagueMutation.isPending}>
                    {updateLeagueMutation.isPending && <Loader2Icon className="animate-spin" />}
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
                  This action cannot be undone. This will permanently delete the league and all associated events and
                  matches.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteLeagueOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteLeague} disabled={deleteLeagueMutation.isPending}>
                  {deleteLeagueMutation.isPending && <Loader2Icon className="animate-spin" />}
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
