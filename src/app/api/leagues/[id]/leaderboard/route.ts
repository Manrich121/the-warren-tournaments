import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { calculateEventRanking, calculateLeagueRanking } from '@/lib/playerStats';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            matches: true,
          },
        },
      },
    });

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    const playerIds = new Set<string>();
    league.events.forEach(event => {
      event.matches.forEach(match => {
        playerIds.add(match.player1Id);
        playerIds.add(match.player2Id);
      });
    });

    const players = await prisma.player.findMany({
      where: {
        id: { in: Array.from(playerIds) },
      },
    });

    const eventRankings = league.events.map(event => {
      return calculateEventRanking(players, event.matches);
    });

    const leagueRanking = calculateLeagueRanking(players, eventRankings);

    return NextResponse.json(leagueRanking);
  } catch (error) {
    console.error('Error fetching league leaderboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
