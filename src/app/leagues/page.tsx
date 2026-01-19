'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { TableRowActions } from '@/components/TableRowActions';
import { useLeagues, LeagueWithScoringSystem } from '@/hooks/useLeagues';
import { useDeleteLeague } from '@/hooks/useDeleteLeague';
import { AddLeagueDialog } from '@/components/leagues/AddLeagueDialog';
import { ScoringSystemTable } from '@/components/scoring-system/ScoringSystemTable';
import { Header } from '@/components/Header';
import { Nav } from '@/components/Nav';
import { useState } from 'react';

export default function LeaguesPage() {
  const router = useRouter();
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const { data: leagues, isLoading } = useLeagues();
  const deleteLeagueMutation = useDeleteLeague();

  const [selectedLeague, setSelectedLeague] = useState<LeagueWithScoringSystem | undefined>(undefined);
  const [addLeagueOpen, setAddLeagueOpen] = useState(false);

  const handleDelete = (leagueId: string) => {
    deleteLeagueMutation.mutate(leagueId);
  };

  // Define columns for DataTable
  const columns: ColumnDef<LeagueWithScoringSystem>[] = [
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
          {isAdmin && <h1 className="text-3xl font-bold">League Management</h1>}

          <Tabs defaultValue="leagues" className="space-y-6">
            {isAdmin && (
              <TabsList>
                <TabsTrigger value="leagues">Leagues</TabsTrigger>
                <TabsTrigger value="scoring-systems">Scoring Systems</TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="leagues" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Leagues</h2>
                  {isAdmin && <p className="text-muted-foreground">Manage tournament leagues</p>}
                </div>
                {isAdmin && (
                  <>
                    <AddLeagueDialog
                      league={selectedLeague}
                      open={addLeagueOpen}
                      onOpenChange={open => {
                        if (!open) {
                          setAddLeagueOpen(false);
                          setSelectedLeague(undefined);
                        }
                      }}
                    />
                    <Button onClick={() => setAddLeagueOpen(true)}>Add New League</Button>
                  </>
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
                          <TableRowActions
                            entityName="league"
                            showEdit={true}
                            onEdit={() => {
                              setSelectedLeague(league);
                              setAddLeagueOpen(true);
                            }}
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
            </TabsContent>

            {isAdmin && (
              <TabsContent value="scoring-systems" className="space-y-6 focus-visible:ring-0">
                <ScoringSystemTable />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
}
