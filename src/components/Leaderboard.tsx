import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LeagueRankedPlayer, RankedPlayer } from '@/lib/playerStats';

interface LeaderboardProps {
  title: string;
  players: (RankedPlayer | LeagueRankedPlayer)[];
}

const Leaderboard = ({ title, players }: LeaderboardProps) => {
  const isLeagueLeaderboard = 'totalEventPoints' in players[0];

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
              {isLeagueLeaderboard ? (
                <TableHead>Total Points</TableHead>
              ) : (
                <>
                  <TableHead>Match Points</TableHead>
                  <TableHead>Match Win %</TableHead>
                  <TableHead>Opponent Match Win %</TableHead>
                  <TableHead>Game Win %</TableHead>
                  <TableHead>Opponent Game Win %</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map(player => (
              <TableRow key={player.player.id}>
                <TableCell>{player.player.name}</TableCell>
                {isLeagueLeaderboard ? (
                  <TableCell>{(player as LeagueRankedPlayer).totalEventPoints}</TableCell>
                ) : (
                  <>
                    <TableCell>{(player as RankedPlayer).matchPoints}</TableCell>
                    <TableCell>{(player as RankedPlayer).matchWinPercentage.toFixed(2)}%</TableCell>
                    <TableCell>{(player as RankedPlayer).opponentsMatchWinPercentage.toFixed(2)}%</TableCell>
                    <TableCell>{(player as RankedPlayer).gameWinPercentage.toFixed(2)}%</TableCell>
                    <TableCell>{(player as RankedPlayer).opponentsGameWinPercentage.toFixed(2)}%</TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
