
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: {
      id: parseInt(id, 10),
    },
    include: {
      participants: true,
      matches: true,
    },
  });
  if (event) {
    return NextResponse.json(event);
  } else {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
}
