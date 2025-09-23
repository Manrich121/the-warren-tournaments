import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const matches = await prisma.match.findMany();
  return NextResponse.json(matches);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, player1Id, player2Id, player1Score, player2Score, draw } = body;

    if (eventId === undefined || player1Id === undefined || player2Id === undefined) {
      return new NextResponse(JSON.stringify({ error: 'Event ID, Player 1 ID, and Player 2 ID are required' }), { status: 400 });
    }

    const newMatch = await prisma.match.create({
      data: {
        eventId,
        player1Id,
        player2Id,
        player1Score,
        player2Score,
        draw,
      },
    });

    return new NextResponse(JSON.stringify(newMatch), { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create match' }), { status: 500 });
  }
}
