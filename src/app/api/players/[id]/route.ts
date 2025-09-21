
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const player = await prisma.player.findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
  if (player) {
    return NextResponse.json(player);
  } else {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }
}
