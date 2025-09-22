import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const prizePool = await prisma.prizePool.findMany();
  return NextResponse.json(prizePool);
}
