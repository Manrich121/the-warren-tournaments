import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { z } from 'zod';
import { auth } from '@/auth';

const leagueSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startDate: z.string().datetime('Start date must be a valid date'),
  endDate: z.string().datetime('End date must be a valid date')
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();
    const validatedData = leagueSchema.parse(json);

    const league = await prisma.league.create({
      data: validatedData
    });

    return NextResponse.json(league, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leagues = await prisma.league.findMany({
      orderBy: [{ endDate: 'desc' }, { createdAt: 'desc' }]
    });
    return NextResponse.json(leagues);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
