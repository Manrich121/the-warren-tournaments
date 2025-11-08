import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LeaderboardEntry } from '@/types/leaderboard';

interface LeaderboardProps {
  title?: string;
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

/**
 * Leaderboard component displaying ranked players with league points and win rates.
 * 
 * Features:
 * - Displays rank, player name, league points, and match win rate
 * - Empty state when no matches played
 * - Loading skeleton support
 * - Responsive table layout
 */
const Leaderboard = ({ title = 'Leaderboard', entries, isLoading = false }: LeaderboardProps) => {
  // Handle empty state
  if (!isLoading && entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No matches played in this league yet
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Loading leaderboard...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">League Points</TableHead>
                <TableHead className="text-right">Matches</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.playerId}>
                  <TableCell className="font-medium">{entry.rank}</TableCell>
                  <TableCell>{entry.playerName}</TableCell>
                  <TableCell className="text-right font-semibold">{entry.leaguePoints}</TableCell>
                  <TableCell className="text-right">
                    {entry.matchesWon}/{entry.matchesPlayed}
                  </TableCell>
                  <TableCell className="text-right">
                    {(entry.matchWinRate * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
