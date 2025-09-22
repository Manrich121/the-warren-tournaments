import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const players = await prisma.player.findMany();
  return NextResponse.json(players);
}
