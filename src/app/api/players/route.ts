import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const players = await prisma.player.findMany();
  return NextResponse.json(players);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fullName, wizardsEmail } = body;

    if (!fullName || !wizardsEmail) {
      return new NextResponse(JSON.stringify({ error: 'Full name and Wizards email are required' }), { status: 400 });
    }

    const newPlayer = await prisma.player.create({
      data: {
        fullName,
        wizardsEmail
      }
    });

    return new NextResponse(JSON.stringify(newPlayer), { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create player' }), { status: 500 });
  }
}
