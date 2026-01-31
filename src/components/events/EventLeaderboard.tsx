'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { ArrowUpDown, ChevronUpIcon, ChevronDownIcon, ChevronsUpDown } from 'lucide-react';
import { EventRankedPlayer } from '@/types/PlayerStats';

interface EventLeaderboardProps {
  title: string;
  players: EventRankedPlayer[];
}

type SortableColumn = keyof Pick<
  EventRankedPlayer,
  'playerName' | 'matchPoints' | 'matchWinPercentage' | 'oppMatchWinPercentage' | 'gameWinPercentage' | 'oppGameWinPercentage'
>;

const sortableColumns: { id: SortableColumn; label: string }[] = [
  { id: 'playerName', label: 'Player' },
  { id: 'matchPoints', label: 'Match Points' },
  { id: 'matchWinPercentage', label: 'Match Win %' },
  { id: 'oppMatchWinPercentage', label: 'Opp Match Win %' },
  { id: 'gameWinPercentage', label: 'Game Win %' },
  { id: 'oppGameWinPercentage', label: 'Opp Game Win %' }
];

/**
 * EventLeaderboard component for displaying event-level rankings.
 * This is separate from the league Leaderboard component which uses different data structures.
 */
const EventLeaderboard = ({ title, players }: EventLeaderboardProps) => {
  const [sortColumn, setSortColumn] = useState<SortableColumn | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedPlayers = useMemo(() => {
    if (!sortColumn) return players;

    return [...players].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [players, sortColumn, sortDirection]);

  const handleColumnSort = (columnId: SortableColumn) => {
    if (sortColumn === columnId) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (columnId: SortableColumn) => {
    if (sortColumn !== columnId) {
      return <ChevronsUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {/* Mobile sorting controls */}
        <div className="flex items-center gap-2 sm:hidden mt-3">
          <Select value={sortColumn} onValueChange={(val) => setSortColumn(val as SortableColumn)}>
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
            pressed={sortDirection === 'desc'}
            onPressedChange={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            aria-label="Toggle sort direction"
            disabled={!sortColumn}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="ml-1 text-xs">{sortDirection === 'asc' ? 'Asc' : 'Desc'}</span>
          </Toggle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {sortableColumns.map(col => (
                    <TableHead key={col.id}>
                      <div
                        className="flex items-center space-x-1 cursor-pointer hover:text-foreground select-none"
                        onClick={() => handleColumnSort(col.id)}
                      >
                        <span>{col.label}</span>
                        <span className="hidden sm:inline">{getSortIcon(col.id)}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map(player => (
                  <TableRow key={player.playerId}>
                    <TableCell>{player.playerName}</TableCell>
                    <TableCell>{player.matchPoints}</TableCell>
                    <TableCell>{(player.matchWinPercentage * 100).toFixed(1)}%</TableCell>
                    <TableCell>{(player.oppMatchWinPercentage * 100).toFixed(1)}%</TableCell>
                    <TableCell>{(player.gameWinPercentage * 100).toFixed(1)}%</TableCell>
                    <TableCell>{(player.oppGameWinPercentage * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventLeaderboard;
