import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await prisma.player.findUnique({
    where: {
      id: parseInt(id, 10)
    }
  });
  if (player) {
    return NextResponse.json(player);
  } else {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const updatedPlayer = await prisma.player.update({
      where: {
        id: parseInt(id, 10)
      },
      data: {
        fullName: data.fullName,
        wizardsEmail: data.wizardsEmail
      }
    });
    
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.player.delete({
      where: {
        id: parseInt(id, 10)
      }
    });
    
    return NextResponse.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}
