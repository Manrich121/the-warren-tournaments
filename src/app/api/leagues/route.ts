
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const leagues = await prisma.league.findMany({
    include: {
      events: true,
    },
  });
  return NextResponse.json(leagues);
}
