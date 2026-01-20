'use client';

import { useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
  SortingState
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardEntry } from '@/types/leaderboard';
import { filterRowsByGlobalSearch } from '@/lib/table-utils';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUpIcon, ChevronDownIcon, ChevronsUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LeaderboardProps {
  title?: string;
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

/**
 * Leaderboard component displaying ranked players with league points and win rates.
 *
 * Features:
 * - Displays all fields from LeaderboardEntry
 * - Configurable column visibility
 * - Sorting, filtering, and search capabilities
 * - Empty state when no matches played
 * - Loading skeleton support
 */
export const Leaderboard = ({ title = 'Leaderboard', entries, isLoading = false }: LeaderboardProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide some columns by default to avoid overwhelming display
    gamesWon: false,
    gamePoints: false,
    gameWinPercentage: false,
    opponentsMatchWinPercentage: false,
    opponentsGameWinPercentage: false
  });

  // Define columns for all LeaderboardEntry fields
  const columns = useMemo<ColumnDef<LeaderboardEntry>[]>(
    () => [
      {
        accessorKey: 'rank',
        header: 'Rank',
        cell: ({ row }) => <div className="font-medium">{row.getValue('rank')}</div>,
        enableHiding: false // Always show rank
      },
      {
        accessorKey: 'playerName',
        header: 'Player',
        enableHiding: false // Always show player name
      },
      {
        accessorKey: 'leaguePoints',
        header: 'League Points',
        cell: ({ row }) => row.getValue('leaguePoints')
      },
      {
        accessorKey: 'eventAttendance',
        header: 'Events',
        cell: ({ row }) => row.getValue('eventAttendance')
      },
      {
        accessorKey: 'matchPoints',
        header: 'Match Points',
        cell: ({ row }) => row.getValue('matchPoints')
      },
      {
        accessorKey: 'matchesPlayed',
        header: 'Matches Played',
        cell: ({ row }) => row.getValue('matchesPlayed')
      },
      {
        accessorKey: 'matchesWon',
        header: 'Matches Won',
        cell: ({ row }) => row.getValue('matchesWon')
      },
      {
        accessorKey: 'matchWinPercentage',
        header: 'Match Win %',
        cell: ({ row }) => {
          const value = row.getValue('matchWinPercentage') as number;
          return (value * 100).toFixed(1) + ' %';
        }
      },
      {
        accessorKey: 'gamesWon',
        header: 'Games Won',
        cell: ({ row }) => row.getValue('gamesWon')
      },
      {
        accessorKey: 'gamePoints',
        header: 'Game Points',
        cell: ({ row }) => row.getValue('gamePoints')
      },
      {
        accessorKey: 'gameWinPercentage',
        header: 'Game Win %',
        cell: ({ row }) => {
          const value = row.getValue('gameWinPercentage') as number;
          return (value * 100).toFixed(1) + ' %';
        }
      },
      {
        accessorKey: 'opponentsMatchWinPercentage',
        header: 'Opp. Match Win %',
        cell: ({ row }) => {
          const value = row.getValue('opponentsMatchWinPercentage') as number;
          return (value * 100).toFixed(1) + ' %';
        }
      },
      {
        accessorKey: 'opponentsGameWinPercentage',
        header: 'Opp. Game Win %',
        cell: ({ row }) => {
          const value = row.getValue('opponentsGameWinPercentage') as number;
          return (value * 100).toFixed(1) + ' %';
        }
      }
    ],
    []
  );

  const table = useReactTable({
    data: entries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    filterFns: {
      fuzzy: filterRowsByGlobalSearch
    },
    initialState: {
      pagination: {
        pageSize: 9999 // Show all rows
      }
    },
    state: {
      sorting,
      columnVisibility
    }
  });

  // Handle empty state
  if (!isLoading && entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">No matches played in this league yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className={'flex items-center justify-between'}>
          <CardTitle>{title}</CardTitle>
          {/* Column visibility controls */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => {
                  const headerValue = typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id;
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(value)}
                    >
                      {headerValue}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table */}
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      const canSort = header.column.getCanSort();
                      const headerClassName = (header.column.columnDef.meta as any)?.headerClassName;
                      return (
                        <TableHead key={header.id} className={headerClassName}>
                          {header.isPlaceholder ? null : (
                            <div
                              className={
                                canSort
                                  ? 'flex items-center space-x-1 cursor-pointer hover:text-foreground select-none'
                                  : ''
                              }
                              onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {canSort && (
                                <span className="ml-2">
                                  {header.column.getIsSorted() === 'asc' ? (
                                    <ChevronUpIcon className="h-4 w-4" />
                                  ) : header.column.getIsSorted() === 'desc' ? (
                                    <ChevronDownIcon className="h-4 w-4" />
                                  ) : (
                                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {isLoading ? 'Loading leaderboard...' : 'No matches played in this league yet'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
