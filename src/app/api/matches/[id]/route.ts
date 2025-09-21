
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const match = await prisma.match.findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
  if (match) {
    return NextResponse.json(match);
  } else {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }
}
