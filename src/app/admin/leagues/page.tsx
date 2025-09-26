'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2Icon, ChevronUpIcon, ChevronDownIcon, TrashIcon, PencilIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLeagues } from '@/hooks/useLeagues';
import { useDeleteLeague } from '@/hooks/useDeleteLeague';
import { League } from '@prisma/client';
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

  const [deleteLeagueId, setDeleteLeagueId] = useState<string | null>(null);
  const [deleteLeagueOpen, setDeleteLeagueOpen] = useState(false);

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
            <h1 className="text-3xl font-bold">Leagues</h1>
            <AddLeagueDialog>
              <Button>Add New League</Button>
            </AddLeagueDialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
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
                      <TableCell>
                        <Link href={`/admin/leagues/${league.id}`} className="text-primary hover:underline font-medium">
                          {league.name}
                        </Link>
                      </TableCell>
                      <TableCell>{new Date(league.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(league.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(league.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AddLeagueDialog league={league}>
                                  <Button variant="outline" size="sm" className="p-2">
                                    <PencilIcon className="h-4 w-4" />
                                  </Button>
                                </AddLeagueDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit league</p>
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
                                    setDeleteLeagueId(league.id);
                                    setDeleteLeagueOpen(true);
                                  }}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete league</p>
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
