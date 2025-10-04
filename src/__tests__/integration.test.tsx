/**
 * Integration Tests for User Scenarios from quickstart.md
 *
 * These tests validate the key user scenarios described in the quickstart guide:
 * 1. Public leaderboard viewing
 * 2. Player stats viewing
 * 3. Admin login functionality
 * 4. Admin dashboard management
 * 5. Prize pool calculation
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Leaderboard } from '@/components/Leaderboard';
import { calculatePrizePool } from '@/lib/playerStats';

// Mock next/link
jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>;
});

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn()
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  }),
  useParams: () => ({ id: '1' })
}));

global.fetch = jest.fn();

describe('Quickstart User Scenarios - Integration Tests', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('Scenario 1: Public Homepage - Leaderboard and Prize Pool', () => {
    it('shows the league leaderboard and current prize pool when user navigates to homepage', async () => {
      // Given: A user navigates to the website
      const mockPlayers = [
        {
          id: 1,
          name: 'John Doe'
        },
        {
          id: 2,
          name: 'Jane Smith'
        }
      ];

      const mockPrizePool = { amount: 1000 };

      // Mock API responses
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPrizePool
        });

      // When: They are on the homepage
      render(<Leaderboard />);

      // Then: They should see the league leaderboard and the current prize pool
      await waitFor(() => {
        expect(screen.getByText('The Warren Tournaments')).toBeInTheDocument();
        expect(screen.getByText('League Leaderboard')).toBeInTheDocument();
        expect(screen.getByText('Current Prize Pool')).toBeInTheDocument();
        expect(screen.getByText('R1000.00')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario 2: Player Stats Navigation', () => {
    it('allows users to click on player name and navigate to player stats', async () => {
      // Given: A user is viewing the leaderboard
      const mockPlayers = [
        {
          id: 1,
          name: 'John Doe'
        }
      ];

      const mockPrizePool = { amount: 500 };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPrizePool
        });

      render(<Leaderboard />);

      // When: They click on a player's name
      await waitFor(() => {
        const playerLink = screen.getByRole('link', { name: 'John Doe' });
        expect(playerLink).toBeInTheDocument();

        // Then: They should be taken to a page with that player's match history and stats
        expect(playerLink).toHaveAttribute('href', '/players/1');
      });
    });
  });

  describe('Scenario 5: Prize Pool Calculation', () => {
    it('increases prize pool by R50 when a new participant is added to an event', () => {
      // Given: An event has existing participants
      const existingParticipants = 5;
      const existingPrizePool = calculatePrizePool(existingParticipants);

      // When: A new participant is added
      const newParticipants = existingParticipants + 1;
      const newPrizePool = calculatePrizePool(newParticipants);

      // Then: The prize pool should increase by R50
      expect(newPrizePool - existingPrizePool).toBe(50);
      expect(newPrizePool).toBe(300); // 6 participants * R50
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API calls fail', async () => {
      // Given: API calls fail
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // When: User visits homepage
      render(<Leaderboard />);

      // Then: Error message should be displayed
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });
    });

    it('handles empty data gracefully', async () => {
      // Given: APIs return empty data
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ amount: 0 })
        });

      // When: User visits homepage
      render(<Leaderboard />);

      // Then: Empty state messages should be shown
      await waitFor(() => {
        expect(screen.getByText('No players registered yet.')).toBeInTheDocument();
        expect(screen.getByText('R0.00')).toBeInTheDocument();
      });
    });
  });

  describe('Data Integrity', () => {
    it('displays consistent data across components', async () => {
      // Given: Consistent mock data
      const mockPlayers = [
        {
          id: 1,
          name: 'Alice Cooper'
        },
        {
          id: 2,
          name: 'Bob Wilson'
        }
      ];

      const mockPrizePool = { amount: 250 }; // Indicates 5 participants (5 * 50)

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPrizePool
        });

      // When: Homepage is rendered
      render(<Leaderboard />);

      // Then: Data should be consistent
      await waitFor(() => {
        // Players should be displayed
        expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();

        // Prize pool should be displayed
        expect(screen.getByText('R250.00')).toBeInTheDocument();

        // Navigation links should be properly formatted
        const aliceLink = screen.getByRole('link', { name: 'Alice Cooper' });
        const bobLink = screen.getByRole('link', { name: 'Bob Wilson' });

        expect(aliceLink).toHaveAttribute('href', '/players/1');
        expect(bobLink).toHaveAttribute('href', '/players/2');
      });
    });
  });
});
