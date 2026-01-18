'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { ScoringSystemDialog } from './ScoringSystemDialog';
import { useScoringSystems, useScoringSystem, useDeleteScoringSystem } from '@/hooks/scoring-systems';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { TIE_BREAKER_SHORT_LABELS } from '@/lib/constants/scoring-labels';
import { Skeleton } from '@/components/ui/skeleton';
import { GenericSkeletonLoader } from '@/components/ShimmeringLoader';

export function ScoringSystemTable() {
  const { data: systems, isLoading: isLoadingSystems } = useScoringSystems();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSystemId, setEditingSystemId] = useState<string | null>(null);
  const [deletingSystemId, setDeletingSystemId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: editingSystem, isLoading: isLoadingSystem } = useScoringSystem(editingSystemId || '');
  const deleteMutation = useDeleteScoringSystem();

  // Open dialog once the editing system data is loaded
  useEffect(() => {
    if (editingSystemId && editingSystem && !isLoadingSystem) {
      setDialogOpen(true);
    }
  }, [editingSystemId, editingSystem, isLoadingSystem]);

  const handleEdit = (systemId: string) => {
    setEditingSystemId(systemId);
    // Dialog will open automatically once data is loaded (see useEffect above)
  };

  const handleCreate = () => {
    setEditingSystemId(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingSystemId) return;

    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(deletingSystemId);
      setDeletingSystemId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete scoring system';
      setDeleteError(errorMessage);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingSystemId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Scoring Systems</h2>
          <p className="text-muted-foreground">Configure how players earn points in leagues</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Scoring System
        </Button>
      </div>

      {/* Table */}
      {isLoadingSystems ? (
        <div className="rounded-lg border border-dashed p-4">
          <GenericSkeletonLoader />
        </div>
      ) : !systems || systems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium mb-2">No scoring systems yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first scoring system to get started</p>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Scoring System
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Formulas</TableHead>
                <TableHead>Tie-Breakers</TableHead>
                <TableHead>Leagues</TableHead>
                <TableHead className="w-[120px]">Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systems.map(system => (
                <TableRow key={system.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {system.name}
                      {system.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{system.formulas.length}</TableCell>
                  <TableCell>
                    {system.tieBreakers.length > 0 ? (
                      <span
                        className="text-xs text-muted-foreground"
                        title={system.tieBreakers.map(tb => TIE_BREAKER_SHORT_LABELS[tb.type]).join(', ')}
                      >
                        {system.tieBreakers.map(tb => TIE_BREAKER_SHORT_LABELS[tb.type]).join(', ')}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None</span>
                    )}
                  </TableCell>
                  <TableCell>{system._count.leagues}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(system.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(system.id)}
                        title="Edit scoring system"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingSystemId(system.id)}
                        disabled={system.isDefault}
                        title={system.isDefault ? 'Cannot delete default system' : 'Delete scoring system'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <ScoringSystemDialog open={dialogOpen} onOpenChange={handleDialogClose} system={editingSystem} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingSystemId}
        onOpenChange={open => {
          if (!open) {
            setDeletingSystemId(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scoring System</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scoring system? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{deleteError}</div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
