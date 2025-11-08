import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RankedPlayer } from '@/lib/playerStats';

interface EventLeaderboardProps {
  title: string;
  players: RankedPlayer[];
}

/**
 * EventLeaderboard component for displaying event-level rankings.
 * This is separate from the league Leaderboard component which uses different data structures.
 */
const EventLeaderboard = ({ title, players }: EventLeaderboardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Match Points</TableHead>
              <TableHead>Match Win %</TableHead>
              <TableHead>Opponent Match Win %</TableHead>
              <TableHead>Game Win %</TableHead>
              <TableHead>Opponent Game Win %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map(player => (
              <TableRow key={player.player.id}>
                <TableCell>{player.player.name}</TableCell>
                <TableCell>{player.matchPoints}</TableCell>
                <TableCell>{player.matchWinPercentage.toFixed(2)}%</TableCell>
                <TableCell>{player.opponentsMatchWinPercentage.toFixed(2)}%</TableCell>
                <TableCell>{player.gameWinPercentage.toFixed(2)}%</TableCell>
                <TableCell>{player.opponentsGameWinPercentage.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EventLeaderboard;
