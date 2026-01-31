import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EventRankedPlayer } from '@/types/PlayerStats';

interface EventLeaderboardProps {
  title: string;
  players: EventRankedPlayer[];
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
      </CardContent>
    </Card>
  );
};

export default EventLeaderboard;
