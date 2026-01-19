import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { calculateLeagueLeaderboard } from '@/lib/leaderboard-calculator';
import { z } from 'zod';

/**
 * GET /api/leagues/[id]/leaderboard
 *
 * Returns the ranked leaderboard for a specific league with full tie-breaking.
 * Uses the new calculateLeagueLeaderboard function with 5-level tie-breaking:
 * 1. League points
 * 2. Match win rate
 * 3. Opponents' match win rate
 * 4. Game win rate
 * 5. Opponents' game win rate
 * 6. Alphabetical by player name
 *
 * Response: LeaderboardEntry[] | { error, message }
 */

const leagueIdSchema = z.string().cuid();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Validate league ID format
    const validationResult = leagueIdSchema.safeParse(id);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Bad Request', message: 'Invalid league ID format' }, { status: 400 });
    }

    // Fetch league with events, matches, and scoring system
    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            matches: true
          }
        },
        scoringSystem: {
          include: {
            formulas: {
              orderBy: { order: 'asc' }
            },
            tieBreakers: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!league) {
      return NextResponse.json({ error: 'Not Found', message: 'League not found' }, { status: 404 });
    }

    // Collect all player IDs from matches
    const playerIds = new Set<string>();
    league.events.forEach(event => {
      event.matches.forEach(match => {
        playerIds.add(match.player1Id);
        playerIds.add(match.player2Id);
      });
    });

    // Fetch all players who participated in this league
    const players = await prisma.player.findMany({
      where: {
        id: { in: Array.from(playerIds) }
      }
    });

    // Flatten events and matches for the calculator
    const allEvents = league.events;
    const allMatches = league.events.flatMap(event => event.matches);

    // Get scoring system (use default if league doesn't have one)
    let scoringSystem = league.scoringSystem;
    if (!scoringSystem) {
      scoringSystem = await prisma.scoringSystem.findFirst({
        where: { isDefault: true },
        include: {
          formulas: {
            orderBy: { order: 'asc' }
          },
          tieBreakers: {
            orderBy: { order: 'asc' }
          }
        }
      });
    }

    // Calculate leaderboard with scoring system formulas
    const leaderboard = calculateLeagueLeaderboard(id, allEvents, allMatches, players, scoringSystem);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching league leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch league leaderboard' },
      { status: 500 }
    );
  }
}
