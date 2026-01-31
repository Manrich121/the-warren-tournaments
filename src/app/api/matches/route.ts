import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma';
import { auth } from '@/auth';

const matchQuerySchema = z.object({
  eventId: z.string().optional(),
  leagueId: z.string().optional()
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const validationResult = matchQuerySchema.safeParse({
      eventId: searchParams.get('eventId') ?? undefined,
      leagueId: searchParams.get('leagueId') ?? undefined
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { eventId, leagueId } = validationResult.data;

    const matches = await prisma.match.findMany({
      where: {
        ...(eventId && { eventId }),
        ...(leagueId && { event: { leagueId } })
      }
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventId, player1Id, player2Id, player1Score, player2Score, draw, round } = body;

    if (eventId === undefined || player1Id === undefined || player2Id === undefined) {
      return new NextResponse(JSON.stringify({ error: 'Event ID, Player 1 ID, and Player 2 ID are required' }), {
        status: 400
      });
    }

    const newMatch = await prisma.match.create({
      data: {
        eventId,
        player1Id,
        player2Id,
        player1Score,
        player2Score,
        round,
        draw
      }
    });

    return new NextResponse(JSON.stringify(newMatch), { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create match' }), { status: 500 });
  }
}
