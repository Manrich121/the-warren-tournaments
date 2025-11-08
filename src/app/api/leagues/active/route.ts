import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

/**
 * GET /api/leagues/active
 *
 * Returns the currently active league (league where current date is between startDate and endDate).
 * Returns 404 with error object if no active league exists.
 *
 * Response: League | { error, message }
 *
 * Note: Clients should handle 404 gracefully by returning null or showing empty state.
 * Recommended staleTime: 5 minutes (leagues don't change frequently)
 */
export async function GET() {
  try {
    const now = new Date();
    const activeLeague = await prisma.league.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!activeLeague) {
      return NextResponse.json(
        { error: 'Not Found', message: 'No active league found' },
        { status: 404 }
      );
    }

    return NextResponse.json(activeLeague);
  } catch (error) {
    console.error('Error fetching active league:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch active league' },
      { status: 500 }
    );
  }
}
