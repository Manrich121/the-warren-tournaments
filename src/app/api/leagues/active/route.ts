import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET() {
  try {
    const now = new Date();
    const activeLeague = await prisma.league.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!activeLeague) {
      return NextResponse.json({ error: 'No active league found' }, { status: 404 });
    }

    return NextResponse.json(activeLeague);
  } catch (error) {
    console.error('Error fetching active league:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
