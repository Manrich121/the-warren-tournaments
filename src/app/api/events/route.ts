
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const events = await prisma.event.findMany({
    include: {
      participants: true,
      matches: true,
    },
  });
  return NextResponse.json(events);
}
