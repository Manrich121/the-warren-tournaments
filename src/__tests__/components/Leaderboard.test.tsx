import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Leaderboard from '@/components/Leaderboard';
import { LeaderboardEntry } from '@/types/leaderboard';

describe('Leaderboard Component', () => {
  const mockEntries: LeaderboardEntry[] = [
    {
      playerId: '1',
      playerName: 'Alice',
      rank: 1,
      leaguePoints: 12,
      matchesWon: 4,
      matchesPlayed: 5,
      matchWinRate: 0.8,
      gamePoints: 12,
      gamePossiblePoints: 15,
      gameWinRate: 0.8,
      opponentsMatchWinRate: 0.6,
      opponentsGameWinRate: 0.65
    },
    {
      playerId: '2',
      playerName: 'Bob',
      rank: 2,
      leaguePoints: 9,
      matchesWon: 3,
      matchesPlayed: 5,
      matchWinRate: 0.6,
      gamePoints: 9,
      gamePossiblePoints: 15,
      gameWinRate: 0.6,
      opponentsMatchWinRate: 0.5,
      opponentsGameWinRate: 0.55
    },
    {
      playerId: '3',
      playerName: 'Charlie',
      rank: 3,
      leaguePoints: 6,
      matchesWon: 2,
      matchesPlayed: 5,
      matchWinRate: 0.4,
      gamePoints: 6,
      gamePossiblePoints: 15,
      gameWinRate: 0.4,
      opponentsMatchWinRate: 0.45,
      opponentsGameWinRate: 0.5
    }
  ];

  describe('Rendering with data', () => {
    it('should render the leaderboard with default title', () => {
      render(<Leaderboard entries={mockEntries} />);
      
      expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    });

    it('should render the leaderboard with custom title', () => {
      render(<Leaderboard title="Summer League 2024 Leaderboard" entries={mockEntries} />);
      
      expect(screen.getByText('Summer League 2024 Leaderboard')).toBeInTheDocument();
    });

    it('should render all player names', () => {
      render(<Leaderboard entries={mockEntries} />);
      
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should render rank numbers correctly', () => {
      render(<Leaderboard entries={mockEntries} />);
      
      // Check rank column values
      const ranks = screen.getAllByRole('cell').filter(cell => 
        cell.textContent === '1' || cell.textContent === '2' || cell.textContent === '3'
      );
      
      // Should have ranks 1, 2, 3 for our 3 players
      expect(ranks.length).toBeGreaterThanOrEqual(3);
    });

    it('should render league points correctly', () => {
      render(<Leaderboard entries={mockEntries} />);
      
      expect(screen.getByText('12')).toBeInTheDocument(); // Alice's points
      expect(screen.getByText('9')).toBeInTheDocument();  // Bob's points
      expect(screen.getByText('6')).toBeInTheDocument();  // Charlie's points
    });

    it('should render matches in W/L format', () => {
      render(<Leaderboard entries={mockEntries} />);
      
      expect(screen.getByText('4/5')).toBeInTheDocument(); // Alice: 4 wins / 5 played
      expect(screen.getByText('3/5')).toBeInTheDocument(); // Bob: 3 wins / 5 played
      expect(screen.getByText('2/5')).toBeInTheDocument(); // Charlie: 2 wins / 5 played
    });

    it('should render win rate as percentage with one decimal', () => {
      render(<Leaderboard entries={mockEntries} />);
      
      expect(screen.getByText('80.0%')).toBeInTheDocument(); // Alice: 80%
      expect(screen.getByText('60.0%')).toBeInTheDocument(); // Bob: 60%
      expect(screen.getByText('40.0%')).toBeInTheDocument(); // Charlie: 40%
    });

    it('should render table headers', () => {
      render(<Leaderboard entries={mockEntries} />);
      
      expect(screen.getByText('Rank')).toBeInTheDocument();
      expect(screen.getByText('Player')).toBeInTheDocument();
      expect(screen.getByText('League Points')).toBeInTheDocument();
      expect(screen.getByText('Matches')).toBeInTheDocument();
      expect(screen.getByText('Win Rate')).toBeInTheDocument();
    });

    it('should render entries in order', () => {
      render(<Leaderboard entries={mockEntries} />);
      
      const playerCells = screen.getAllByRole('cell').filter(cell => 
        ['Alice', 'Bob', 'Charlie'].includes(cell.textContent || '')
      );
      
      // Players should appear in rank order
      expect(playerCells[0]).toHaveTextContent('Alice');
      expect(playerCells[1]).toHaveTextContent('Bob');
      expect(playerCells[2]).toHaveTextContent('Charlie');
    });
  });

  describe('Empty state', () => {
    it('should render empty state when no entries provided', () => {
      render(<Leaderboard entries={[]} />);
      
      expect(screen.getByText('No matches played in this league yet')).toBeInTheDocument();
    });

    it('should render title in empty state', () => {
      render(<Leaderboard title="Empty League" entries={[]} />);
      
      expect(screen.getByText('Empty League')).toBeInTheDocument();
      expect(screen.getByText('No matches played in this league yet')).toBeInTheDocument();
    });

    it('should not render table in empty state', () => {
      render(<Leaderboard entries={[]} />);
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('should not show loading message in empty state', () => {
      render(<Leaderboard entries={[]} isLoading={false} />);
      
      expect(screen.queryByText('Loading leaderboard...')).not.toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should render loading message when isLoading is true', () => {
      render(<Leaderboard entries={[]} isLoading={true} />);
      
      expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
    });

    it('should render title in loading state', () => {
      render(<Leaderboard title="League Loading" entries={[]} isLoading={true} />);
      
      expect(screen.getByText('League Loading')).toBeInTheDocument();
    });

    it('should not render table in loading state', () => {
      render(<Leaderboard entries={[]} isLoading={true} />);
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('should not show empty state message when loading', () => {
      render(<Leaderboard entries={[]} isLoading={true} />);
      
      expect(screen.queryByText('No matches played in this league yet')).not.toBeInTheDocument();
    });

    it('should prioritize loading state over data', () => {
      render(<Leaderboard entries={mockEntries} isLoading={true} />);
      
      // Should show loading, not the data
      expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle single player leaderboard', () => {
      const singleEntry: LeaderboardEntry[] = [mockEntries[0]];
      
      render(<Leaderboard entries={singleEntry} />);
      
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('should handle players with 0 matches', () => {
      const zeroMatchEntry: LeaderboardEntry[] = [{
        playerId: '4',
        playerName: 'David',
        rank: 1,
        leaguePoints: 0,
        matchesWon: 0,
        matchesPlayed: 0,
        matchWinRate: 0,
        gamePoints: 0,
        gamePossiblePoints: 0,
        gameWinRate: 0,
        opponentsMatchWinRate: 0,
        opponentsGameWinRate: 0
      }];
      
      render(<Leaderboard entries={zeroMatchEntry} />);
      
      expect(screen.getByText('David')).toBeInTheDocument();
      expect(screen.getByText('0/0')).toBeInTheDocument();
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should handle 100% win rate correctly', () => {
      const perfectEntry: LeaderboardEntry[] = [{
        playerId: '5',
        playerName: 'Eve',
        rank: 1,
        leaguePoints: 15,
        matchesWon: 5,
        matchesPlayed: 5,
        matchWinRate: 1.0,
        gamePoints: 15,
        gamePossiblePoints: 15,
        gameWinRate: 1.0,
        opponentsMatchWinRate: 0.5,
        opponentsGameWinRate: 0.5
      }];
      
      render(<Leaderboard entries={perfectEntry} />);
      
      expect(screen.getByText('100.0%')).toBeInTheDocument();
    });

    it('should handle shared ranks', () => {
      const sharedRankEntries: LeaderboardEntry[] = [
        { ...mockEntries[0], rank: 1 },
        { ...mockEntries[1], playerId: '2b', playerName: 'Bob Jr', rank: 1 }, // Same rank
        { ...mockEntries[2], rank: 3 }
      ];
      
      render(<Leaderboard entries={sharedRankEntries} />);
      
      // Both should show rank 1
      const cells = screen.getAllByRole('cell');
      const rankOneCells = cells.filter(cell => cell.textContent === '1');
      
      // Should have two rank 1 cells (one for Alice, one for Bob Jr)
      expect(rankOneCells.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle very long player names', () => {
      const longNameEntry: LeaderboardEntry[] = [{
        ...mockEntries[0],
        playerName: 'ThisIsAVeryLongPlayerNameThatShouldStillRenderCorrectly'
      }];
      
      render(<Leaderboard entries={longNameEntry} />);
      
      expect(screen.getByText('ThisIsAVeryLongPlayerNameThatShouldStillRenderCorrectly')).toBeInTheDocument();
    });

    it('should handle large numbers of entries', () => {
      const manyEntries: LeaderboardEntry[] = Array.from({ length: 50 }, (_, i) => ({
        playerId: `player-${i}`,
        playerName: `Player ${i + 1}`,
        rank: i + 1,
        leaguePoints: 50 - i,
        matchesWon: 10 - (i % 10),
        matchesPlayed: 10,
        matchWinRate: (10 - (i % 10)) / 10,
        gamePoints: 30 - i,
        gamePossiblePoints: 30,
        gameWinRate: (30 - i) / 30,
        opponentsMatchWinRate: 0.5,
        opponentsGameWinRate: 0.5
      }));
      
      render(<Leaderboard entries={manyEntries} />);
      
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 50')).toBeInTheDocument();
    });
  });

  describe('Responsive design', () => {
    it('should have overflow-x-auto wrapper for table', () => {
      const { container } = render(<Leaderboard entries={mockEntries} />);
      
      const overflowWrapper = container.querySelector('.overflow-x-auto');
      expect(overflowWrapper).toBeInTheDocument();
    });
  });
});
