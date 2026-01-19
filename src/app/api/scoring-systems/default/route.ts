import { NextResponse } from "next/server"
import { prisma } from "@/prisma"

export async function GET() {
  try {
    const defaultSystem = await prisma.scoringSystem.findFirst({
      where: { isDefault: true },
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
    })

    if (!defaultSystem) {
      return NextResponse.json(
        { error: "Default scoring system not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        id: defaultSystem.id,
        name: defaultSystem.name,
        isDefault: defaultSystem.isDefault,
        formulas: defaultSystem.formulas,
        tieBreakers: defaultSystem.tieBreakers,
        leagueCount: defaultSystem._count.leagues,
        createdAt: defaultSystem.createdAt.toISOString(),
        updatedAt: defaultSystem.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error fetching default scoring system:", error)
    return NextResponse.json(
      { error: "Failed to fetch default scoring system" },
      { status: 500 }
    )
  }
}
