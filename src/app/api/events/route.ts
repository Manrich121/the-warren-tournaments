import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { z } from 'zod';
import { auth } from '@/auth';

const eventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().datetime('Date must be a valid date'),
  leagueId: z.string()
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();
    const validatedData = eventSchema.parse(json);

    const event = await prisma.event.create({
      data: validatedData
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const events = await prisma.event.findMany();
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
