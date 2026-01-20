import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

/**
 * GET /api/leagues/most-recent
 *
 * Returns the most recent league based on end date (and creation date as tie-breaker).
 * Returns null if no leagues exist.
 *
 * Response: League | null
 */
export async function GET() {
  try {
    const mostRecentLeague = await prisma.league.findFirst({
      orderBy: [{ endDate: 'desc' }, { createdAt: 'desc' }]
    });

    return NextResponse.json(mostRecentLeague);
  } catch (error) {
    console.error('Error fetching most recent league:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch most recent league' },
      { status: 500 }
    );
  }
}
