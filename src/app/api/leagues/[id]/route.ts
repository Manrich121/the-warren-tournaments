
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const league = await prisma.league.findUnique({
    where: {
      id: parseInt(id, 10),
    },
    include: {
      events: true,
    },
  });
  if (league) {
    return NextResponse.json(league);
  } else {
    return NextResponse.json({ error: 'League not found' }, { status: 404 });
  }
}
