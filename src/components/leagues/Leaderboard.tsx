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
import { ChevronDown, ChevronUpIcon, ChevronDownIcon, ChevronsUpDown, ArrowUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScoringSystemFormData } from '@/types/scoring-system';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FormulaDisplayList } from '@/components/scoring-system/FormulaDisplayList';
import { TieBreakerDisplayList } from '@/components/scoring-system/TieBreakerDisplayList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';

interface LeaderboardProps {
  title?: string;
  entries: LeaderboardEntry[];
  scoringSystem?: ScoringSystemFormData;
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
export const Leaderboard = ({ title = 'Leaderboard', entries, scoringSystem, isLoading = false }: LeaderboardProps) => {
  const [pointFormulaOpen, setPointFormulaOpen] = useState(false);
  const [tiebreakersOpen, setTiebreakersOpen] = useState(false);
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

  // Get sortable columns for the mobile sort dropdown
  const sortableColumns = useMemo(() => {
    return table
      .getAllColumns()
      .filter(column => column.getCanSort() && column.getIsVisible())
      .map(column => ({
        id: column.id,
        label: typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id
      }));
  }, [table, columnVisibility]);

  const currentSortColumn = sorting[0]?.id || '';
  const currentSortDirection = sorting[0]?.desc ? 'desc' : 'asc';

  const handleMobileSortChange = (columnId: string) => {
    if (columnId) {
      setSorting([{ id: columnId, desc: currentSortDirection === 'desc' }]);
    } else {
      setSorting([]);
    }
  };

  const toggleSortDirection = () => {
    if (currentSortColumn) {
      setSorting([{ id: currentSortColumn, desc: currentSortDirection === 'asc' }]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <CardTitle>{title}</CardTitle>
            {scoringSystem && (
              <div className="flex gap-2">
                <Tooltip open={pointFormulaOpen} onOpenChange={setPointFormulaOpen}>
                  <TooltipTrigger asChild>
                    <Button variant={'outline'} size="sm" onClick={() => setPointFormulaOpen(true)}>
                      Point Formulas
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <FormulaDisplayList formulas={scoringSystem.formulas} />
                  </TooltipContent>
                </Tooltip>
                <Tooltip open={tiebreakersOpen} onOpenChange={setTiebreakersOpen}>
                  <TooltipTrigger asChild>
                    <Button variant={'outline'} size="sm" onClick={() => setTiebreakersOpen(true)}>
                      Tie-Breakers
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <TieBreakerDisplayList tieBreakers={scoringSystem.tieBreakers} />
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
          {/* Column visibility controls - desktop only */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                Columns <ChevronDown className="ml-1 h-4 w-4" />
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
          <div className="overflow-x-auto">
            <div className="overflow-hidden rounded-md border min-w-[600px]">
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
                                {/* Hide sort icons on mobile - use mobile sort controls instead */}
                                {canSort && (
                                  <span className="ml-2 hidden sm:inline">
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
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
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
          {/* Mobile sorting controls */}
          <div className="flex items-center gap-2 sm:hidden mt-3">
            <Select value={currentSortColumn} onValueChange={handleMobileSortChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortableColumns.map(col => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Toggle
              size={'sm'}
              pressed={false}
              onPressedChange={toggleSortDirection}
              aria-label="Toggle sort direction"
              disabled={!currentSortColumn}
            >
              <span className="text-xs">{currentSortDirection === 'asc' ? 'Asc' : 'Desc'}</span>
            </Toggle>
            {/* Columns dropdown on mobile - inline with sort controls */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => {
                    const headerValue =
                      typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id;
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
        </div>
      </CardContent>
    </Card>
  );
};
