import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../prisma';
import { calculateEventRanking } from '../../../../../../lib/playerStats';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
        matches: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const rankedPlayers = calculateEventRanking(event.participants, event.matches);

    return NextResponse.json(rankedPlayers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
