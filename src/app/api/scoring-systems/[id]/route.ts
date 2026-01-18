import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { createScoringSystemSchema } from "@/lib/validations/scoring-system";
import { z } from "zod";

// GET /api/scoring-systems/[id] - Fetch single scoring system with all relations
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const system = await prisma.scoringSystem.findUnique({
      where: { id },
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

    if (!system) {
      return NextResponse.json(
        { error: "Scoring system not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: system });
  } catch (error) {
    console.error("Error fetching scoring system:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/scoring-systems/[id] - Update scoring system
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const json = await request.json();
    const validatedData = createScoringSystemSchema.parse(json);

    // Check if system exists
    const existing = await prisma.scoringSystem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Scoring system not found" },
        { status: 404 }
      );
    }

    // Check for name uniqueness (excluding current system) (T043)
    const nameConflict = await prisma.scoringSystem.findFirst({
      where: {
        name: validatedData.name,
        id: { not: id },
      },
    });

    if (nameConflict) {
      return NextResponse.json(
        { error: "A scoring system with this name already exists" },
        { status: 409 }
      );
    }

    // Update scoring system - delete old formulas/tie-breakers and create new ones
    const updatedSystem = await prisma.scoringSystem.update({
      where: { id },
      data: {
        name: validatedData.name,
        formulas: {
          deleteMany: {},
          create: validatedData.formulas,
        },
        tieBreakers: {
          deleteMany: {},
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

    return NextResponse.json({
      data: updatedSystem,
      message: "Scoring system updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating scoring system:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/scoring-systems/[id] - Delete scoring system
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    // Check if system exists
    const system = await prisma.scoringSystem.findUnique({
      where: { id },
      include: {
        _count: {
          select: { leagues: true },
        },
      },
    });

    if (!system) {
      return NextResponse.json(
        { error: "Scoring system not found" },
        { status: 404 }
      );
    }

    // Prevent deletion of default system
    if (system.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete the default scoring system" },
        { status: 400 }
      );
    }

    // Prevent deletion if associated with leagues
    if (system._count.leagues > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete scoring system. It is currently used by ${system._count.leagues} league(s)`,
        },
        { status: 400 }
      );
    }

    // Delete the scoring system (formulas and tie-breakers will cascade)
    await prisma.scoringSystem.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Scoring system deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting scoring system:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
