import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { createScoringSystemSchema } from "@/lib/validations/scoring-system";
import { z } from "zod";

// GET /api/scoring-systems - List all scoring systems with full details
export async function GET() {
  try {
    const systems = await prisma.scoringSystem.findMany({
      include: {
        formulas: {
          orderBy: { order: "asc" },
        },
        tieBreakers: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { leagues: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ data: systems });
  } catch (error) {
    console.error("Error fetching scoring systems:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/scoring-systems - Create new scoring system
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const validatedData = createScoringSystemSchema.parse(json);

    // Check for name uniqueness (FR-017)
    const existing = await prisma.scoringSystem.findUnique({
      where: { name: validatedData.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A scoring system with this name already exists" },
        { status: 409 }
      );
    }

    // Create scoring system with formulas and tie-breakers
    const scoringSystem = await prisma.scoringSystem.create({
      data: {
        name: validatedData.name,
        formulas: {
          create: validatedData.formulas,
        },
        tieBreakers: {
          create: validatedData.tieBreakers || [],
        },
      },
      include: {
        formulas: {
          orderBy: { order: "asc" },
        },
        tieBreakers: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { leagues: true },
        },
      },
    });

    return NextResponse.json(
      {
        data: scoringSystem,
        message: "Scoring system created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating scoring system:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
