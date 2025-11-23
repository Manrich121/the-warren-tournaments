'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { TableRowActions } from '@/components/TableRowActions';
import { usePlayers } from '@/hooks/usePlayers';
import { useDeletePlayer } from '@/hooks/useDeletePlayer';
import { Player } from '@prisma/client';
import { AddPlayerDialog } from '@/components/AddPlayerDialog';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlayersPage() {
  const { status } = useSession();
  const router = useRouter();
  const isAdmin = status === 'authenticated';

  const { data: players, isLoading } = usePlayers();
  const deletePlayerMutation = useDeletePlayer();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>(undefined);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);

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
              <>
                <AddPlayerDialog
                  player={selectedPlayer}
                  open={addPlayerOpen}
                  onOpenChange={open => {
                    if (!open) {
                      setAddPlayerOpen(false);
                      setSelectedPlayer(undefined);
                    }
                  }}
                />
                <Button onClick={() => setAddPlayerOpen(true)}>Add New Player</Button>
              </>
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
            onRowClick={player => router.push(`/players/${player.id}`)}
            renderRowActions={
              isAdmin
                ? player => (
                    <div className="flex items-center gap-2">
                      <TableRowActions
                        entityName="player"
                        showEdit={true}
                        onEdit={() => {
                          setSelectedPlayer(player);
                          setAddPlayerOpen(true);
                        }}
                        onDelete={() => handleDelete(player.id)}
                        deleteWarning="This will permanently delete the player and remove them from all matches."
                        isDeleting={deletePlayerMutation.isPending}
                      />
                    </div>
                  )
                : undefined
            }
            searchPlaceholder="Search players..."
            emptyMessage="No players found."
          />
        </div>
      </div>
    </>
  );
}
