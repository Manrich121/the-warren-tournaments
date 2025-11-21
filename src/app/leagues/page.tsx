'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { TableRowActions } from '@/components/TableRowActions';
import { useLeagues } from '@/hooks/useLeagues';
import { useDeleteLeague } from '@/hooks/useDeleteLeague';
import { League } from '@prisma/client';
import { AddLeagueDialog } from '@/components/AddLeagueDialog';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';

export default function LeaguesPage() {
  const router = useRouter();
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: leagues, isLoading } = useLeagues();
  const deleteLeagueMutation = useDeleteLeague();

  const handleDelete = (leagueId: string) => {
    deleteLeagueMutation.mutate(leagueId);
  };

  // Define columns for DataTable
  const columns: ColumnDef<League>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      enableGlobalFilter: true,
      cell: ({ getValue }) => <span className="text-primary font-medium">{getValue() as string}</span>
    },
    {
      id: 'startDate',
      accessorKey: 'startDate',
      header: 'Start Date',
      enableSorting: true,
      enableGlobalFilter: false,
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return new Date(date).toLocaleDateString();
      }
    },
    {
      id: 'endDate',
      accessorKey: 'endDate',
      header: 'End Date',
      enableSorting: true,
      enableGlobalFilter: false,
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return new Date(date).toLocaleDateString();
      }
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
  ];

  return (
    <>
      <Header />
      <div className="container mx-auto space-y-6">
        <Nav />
        <div className="py-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Leagues</h1>
            {isAdmin && (
              <AddLeagueDialog>
                <Button>Add New League</Button>
              </AddLeagueDialog>
            )}
          </div>

          <DataTable
            data={leagues || []}
            columns={columns}
            storageKey="table-state-leagues"
            enableGlobalFilter={true}
            enableSorting={true}
            enablePagination={false}
            isLoading={isLoading || status === 'loading'}
            onRowClick={league => router.push(`/leagues/${league.id}`)}
            renderRowActions={
              isAdmin
                ? league => (
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
                      <TableRowActions
                        entityName="league"
                        showEdit={false}
                        onDelete={() => handleDelete(league.id)}
                        deleteWarning="This will permanently delete the league and all associated events and matches."
                        isDeleting={deleteLeagueMutation.isPending}
                      />
                    </div>
                  )
                : undefined
            }
            searchPlaceholder="Search leagues..."
            emptyMessage="No leagues found. Create one to get started."
          />
        </div>
      </div>
    </>
  );
}
