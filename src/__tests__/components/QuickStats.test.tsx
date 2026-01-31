import { render, screen } from '@testing-library/react';
import { QuickStats } from '@/components/QuickStats';
import { mockLeagueStats } from '../__fixtures__/mockData';
import { LeagueStats } from '@/types/LeagueStats';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>;
});

describe('QuickStats', () => {
  describe('Loading State', () => {
    it('should render loading skeletons when isLoading is true', () => {
      const { container } = render(<QuickStats stats={null} isLoading={true} />);

      // Should render 4 skeleton cards
      const skeletonCards = container.querySelectorAll('.grid > *');
      expect(skeletonCards.length).toBe(4);
    });

    it('should not render actual stats when loading', () => {
      render(<QuickStats stats={mockLeagueStats} isLoading={true} />);

      // Stats should not be visible during loading
      expect(screen.queryByText('5')).not.toBeInTheDocument();
      expect(screen.queryByText('12')).not.toBeInTheDocument();
    });
  });

  describe('Null Stats', () => {
    it('should render nothing when stats is null and not loading', () => {
      const { container } = render(<QuickStats stats={null} isLoading={false} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Stats Display', () => {
    it('should render all four stat cards with correct titles', () => {
      render(<QuickStats stats={mockLeagueStats} isLoading={false} />);

      expect(screen.getByText('Leagues')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Players')).toBeInTheDocument();
      expect(screen.getByText('Matches')).toBeInTheDocument();
    });

    it('should display correct global league count', () => {
      render(<QuickStats stats={mockLeagueStats} isLoading={false} />);

      // Total Leagues should show global count
      const totalLeaguesCard = screen.getByText('Leagues').closest('a');
      expect(totalLeaguesCard).toHaveTextContent('5');
    });

    it('should display correct league-specific counts', () => {
      render(<QuickStats stats={mockLeagueStats} isLoading={false} />);

      // Events count (league-specific)
      const eventsCard = screen.getByText('Events').closest('a');
      expect(eventsCard).toHaveTextContent('12');

      // Players count (league-specific)
      const playersCard = screen.getByText('Players').closest('a');
      expect(playersCard).toHaveTextContent('45');

      // Matches count (league-specific)
      const matchesCard = screen.getByText('Matches').closest('a');
      expect(matchesCard).toHaveTextContent('120');
    });

    it('should render correct links for navigation', () => {
      render(<QuickStats stats={mockLeagueStats} isLoading={false} />);

      const leaguesLink = screen.getByText('Leagues').closest('a');
      expect(leaguesLink).toHaveAttribute('href', '/leagues');

      const eventsLink = screen.getByText('Events').closest('a');
      expect(eventsLink).toHaveAttribute('href', '/events');

      const playersLink = screen.getByText('Players').closest('a');
      expect(playersLink).toHaveAttribute('href', '/players');

      const matchesLink = screen.getByText('Matches').closest('a');
      expect(matchesLink).toHaveAttribute('href', '/matches');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values correctly', () => {
      const zeroStats: LeagueStats = {
        totalLeagues: 0,
        activeLeagues: 0,
        eventsCount: 0,
        playersCount: 0,
        matchesCount: 0
      };

      render(<QuickStats stats={zeroStats} isLoading={false} />);

      // Should render all zeros without errors
      const cards = screen.getAllByText('0');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should handle large numbers correctly', () => {
      const largeStats: LeagueStats = {
        totalLeagues: 9999,
        activeLeagues: 50,
        eventsCount: 5000,
        playersCount: 10000,
        matchesCount: 50000
      };

      render(<QuickStats stats={largeStats} isLoading={false} />);

      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('5000')).toBeInTheDocument();
      expect(screen.getByText('10000')).toBeInTheDocument();
      expect(screen.getByText('50000')).toBeInTheDocument();
    });

    it('should display correct subtitle when no active leagues', () => {
      const noActiveStats: LeagueStats = {
        ...mockLeagueStats,
        activeLeagues: 0
      };

      render(<QuickStats stats={noActiveStats} isLoading={false} />);
    });
  });

  describe('Accessibility', () => {
    it('should have proper link semantics for screen readers', () => {
      render(<QuickStats stats={mockLeagueStats} isLoading={false} />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBe(4);

      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should maintain proper document structure with headings', () => {
      render(<QuickStats stats={mockLeagueStats} isLoading={false} />);

      // Card titles should be rendered properly
      const titles = [
        screen.getByText('Leagues'),
        screen.getByText('Events'),
        screen.getByText('Players'),
        screen.getByText('Matches')
      ];

      titles.forEach(title => {
        expect(title).toBeInTheDocument();
      });
    });
  });
});
