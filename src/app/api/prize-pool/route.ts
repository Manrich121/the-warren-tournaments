import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('leagueId');

  const prizePool = await prisma.prizePool.findMany({
    where: leagueId ? { leagueId } : undefined
  });

  return NextResponse.json(prizePool);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { leagueId, amount } = await request.json();

    if (!leagueId || amount === undefined) {
      return NextResponse.json({ error: 'leagueId and amount are required' }, { status: 400 });
    }

    // Check if prize pool already exists for this league
    const existingPrizePool = await prisma.prizePool.findFirst({
      where: { leagueId }
    });

    let prizePool;
    if (existingPrizePool) {
      // Update existing prize pool
      prizePool = await prisma.prizePool.update({
        where: { id: existingPrizePool.id },
        data: { amount }
      });
    } else {
      // Create new prize pool
      prizePool = await prisma.prizePool.create({
        data: { leagueId, amount }
      });
    }

    return NextResponse.json(prizePool);
  } catch (error) {
    console.error('Prize pool operation error:', error);
    return NextResponse.json({ error: 'Failed to create/update prize pool' }, { status: 500 });
  }
}
