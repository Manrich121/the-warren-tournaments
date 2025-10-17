import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { calculateEventRanking } from '@/lib/playerStats';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        matches: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const playerIds = new Set<string>();
    event.matches.forEach(match => {
      playerIds.add(match.player1Id);
      playerIds.add(match.player2Id);
    });

    const players = await prisma.player.findMany({
      where: {
        id: { in: Array.from(playerIds) },
      },
    });

    const rankedPlayers = calculateEventRanking(players, event.matches);

    return NextResponse.json(rankedPlayers);
  } catch (error) {
    console.error('Error fetching event leaderboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}