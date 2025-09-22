import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { Leaderboard } from '@/components/Leaderboard';

// Mock next/link
jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>;
});

// Mock fetch globally
global.fetch = jest.fn();

describe('Leaderboard Component', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    (fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    // Mock fetch to never resolve
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<Leaderboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('renders leaderboard with players and prize pool', async () => {
    // Mock successful API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            fullName: 'John Doe',
            wizardsEmail: 'john@example.com'
          },
          {
            id: 2,
            fullName: 'Jane Smith',
            wizardsEmail: 'jane@example.com'
          }
        ]
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          amount: 500.0
        })
      });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('The Warren Tournaments')).toBeInTheDocument();
      expect(screen.getByText('Magic: The Gathering League Tracker')).toBeInTheDocument();
      expect(screen.getByText('R500.00')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('League Leaderboard')).toBeInTheDocument();
    });
  });

  it('renders empty state when no players exist', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ amount: 0 })
      });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('No players registered yet.')).toBeInTheDocument();
    });
  });

  it('creates proper links to player pages', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            fullName: 'John Doe',
            wizardsEmail: 'john@example.com'
          }
        ]
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ amount: 100 })
      });

    render(<Leaderboard />);

    await waitFor(() => {
      const playerLink = screen.getByRole('link', { name: 'John Doe' });
      expect(playerLink).toHaveAttribute('href', '/players/1');
    });
  });
});
