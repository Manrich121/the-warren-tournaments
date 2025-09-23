import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: {
      id: parseInt(id, 10)
    }
  });
  if (match) {
    return NextResponse.json(match);
  } else {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const updatedMatch = await prisma.match.update({
      where: {
        id: parseInt(id, 10)
      },
      data: {
        round: data.round,
        player1Score: data.player1Score,
        player2Score: data.player2Score,
        draw: data.draw,
        eventId: data.eventId,
        player1Id: data.player1Id,
        player2Id: data.player2Id
      }
    });
    
    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.match.delete({
      where: {
        id: parseInt(id, 10)
      }
    });
    
    return NextResponse.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 });
  }
}
