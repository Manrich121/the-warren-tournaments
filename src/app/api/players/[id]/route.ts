import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { BYE_PLAYER_ID } from '@/lib/constants/player';
import { z } from 'zod';

const updatePlayerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long')
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === BYE_PLAYER_ID) {
    return NextResponse.json(
      {
        error: 'BYE player cannot be accessed directly'
      },
      { status: 401 }
    );
  }
  const player = await prisma.player.findUnique({
    where: {
      id
    }
  });
  if (player) {
    return NextResponse.json(player);
  } else {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (id === BYE_PLAYER_ID) {
      return NextResponse.json({ error: 'BYE player cannot be modified' }, { status: 403 });
    }

    const data = await request.json();
    const validatedData = updatePlayerSchema.parse(data);

    const updatedPlayer = await prisma.player.update({
      where: {
        id
      },
      data: {
        name: validatedData.name
      }
    });

    return NextResponse.json(updatedPlayer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (id === BYE_PLAYER_ID) {
      return NextResponse.json({ error: 'BYE player cannot be deleted' }, { status: 403 });
    }

    await prisma.player.delete({
      where: {
        id
      }
    });

    return NextResponse.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}
