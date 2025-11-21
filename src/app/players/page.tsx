'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { TableRowActions } from '@/components/TableRowActions';
import { usePlayers } from '@/hooks/usePlayers';
import { useDeletePlayer } from '@/hooks/useDeletePlayer';
import { Player } from '@prisma/client';
import { AddPlayerDialog } from '@/components/AddPlayerDialog';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import { useMemo } from 'react';

export default function PlayersPage() {
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: players, isLoading } = usePlayers();
  const deletePlayerMutation = useDeletePlayer();

  const handleDelete = (playerId: string) => {
    deletePlayerMutation.mutate(playerId);
  };

  // Define columns for DataTable
  const columns: ColumnDef<Player>[] = useMemo(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        enableSorting: true,
        enableGlobalFilter: true,
        cell: ({ getValue }) => <span className="text-primary font-medium">{getValue() as string}</span>
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
    []
  );

  return (
    <>
      <Header />
      <div className="container mx-auto space-y-6">
        <Nav />
        <div className="py-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Players</h1>
            {isAdmin && (
              <AddPlayerDialog>
                <Button>Add New Player</Button>
              </AddPlayerDialog>
            )}
          </div>

          <DataTable
            data={players || []}
            columns={columns}
            storageKey="table-state-players"
            enableGlobalFilter={true}
            enableSorting={true}
            enablePagination={true}
            initialPageSize={25}
            isLoading={isLoading || status === 'loading'}
            renderRowActions={
              isAdmin
                ? player => (
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
                      <TableRowActions
                        entityName="player"
                        showEdit={false}
                        onDelete={() => handleDelete(player.id)}
                        deleteWarning="This will permanently delete the player and remove them from all matches."
                        isDeleting={deletePlayerMutation.isPending}
                      />
                    </div>
                  )
                : undefined
            }
            searchPlaceholder="Search players..."
            emptyMessage="No players found. Create one to get started."
          />
        </div>
      </div>
    </>
  );
}
