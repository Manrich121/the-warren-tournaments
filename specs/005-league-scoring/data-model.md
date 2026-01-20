# Data Model: Configure League Scoring System

**Date**: 2026-01-18  
**Feature**: Configure League Scoring System  
**Branch**: `005-league-scoring`

## Overview

This document defines the database schema, TypeScript types, and validation schemas for the Configure League Scoring System feature.

## Prisma Schema Changes

### New Enums

```prisma
// Point metrics that can be used in scoring formulas
enum PointMetricType {
  EVENT_ATTENDANCE
  MATCH_WINS
  GAME_WINS
  FIRST_PLACE    // 1st place in event
  SECOND_PLACE   // 2nd place in event
  THIRD_PLACE    // 3rd place in event
}

// Tie-breaker metrics for ranking players with equal points
enum TieBreakerType {
  LEAGUE_POINTS
  MATCH_POINTS
  OPP_MATCH_WIN_PCT       // Opponent Match Win Percentage
  GAME_WIN_PCT
  OPP_GAME_WIN_PCT       // Opponent Game Win Percentage
  EVENT_ATTENDANCE_TIE   // Event Attendance (when used as tie-breaker)
  MATCH_WINS_TIE         // Match Wins (when used as tie-breaker)
}
```

### New Models

```prisma
// Scoring System - defines how points are calculated and players ranked
model ScoringSystem {
  id          String   @id @default(cuid())
  name        String   @unique  // Unique name (FR-001, FR-017)
  isDefault   Boolean  @default(false)  // Flag for default system (FR-012a)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  formulas    ScoreFormula[]
  tieBreakers TieBreaker[]
  leagues     League[]
  
  @@index([isDefault])
}

// Score Formula - individual point calculation rule (N x PointMetric)
model ScoreFormula {
  id               String          @id @default(cuid())
  scoringSystemId  String
  multiplier       Int             // Can be zero or negative (Edge Case clarified)
  pointMetric      PointMetricType
  order            Int             // Order in the formula list (for display)
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  
  // Relations
  scoringSystem    ScoringSystem   @relation(fields: [scoringSystemId], references: [id], onDelete: Cascade)
  
  @@index([scoringSystemId])
  @@index([scoringSystemId, order])
}

// Tie-Breaker - defines ranking criteria when players have equal points
model TieBreaker {
  id               String         @id @default(cuid())
  scoringSystemId  String
  type             TieBreakerType
  order            Int            // Priority order (1 = highest priority)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  
  // Relations
  scoringSystem    ScoringSystem  @relation(fields: [scoringSystemId], references: [id], onDelete: Cascade)
  
  @@unique([scoringSystemId, order])  // Ensure no duplicate order values
  @@index([scoringSystemId])
}
```

### Modified Models

```prisma
// League - Add scoring system relationship
model League {
  id               String         @id @default(cuid())
  name             String
  startDate        DateTime
  endDate          DateTime
  scoringSystemId  String?        // Optional, falls back to default if null (FR-012a)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  
  // Relations
  events           Event[]
  prizePool        PrizePool[]
  scoringSystem    ScoringSystem? @relation(fields: [scoringSystemId], references: [id], onDelete: SetNull)
  
  @@index([scoringSystemId])
}
```

## Entity Relationships

```
ScoringSystem
├── has many ScoreFormula (1:N, cascade delete)
├── has many TieBreaker (1:N, cascade delete)
└── used by many League (1:N, set null on delete)

ScoreFormula
└── belongs to ScoringSystem (N:1)

TieBreaker
└── belongs to ScoringSystem (N:1)

League
└── belongs to ScoringSystem (N:1, optional)
```

## TypeScript Types

### Core Domain Types

```typescript
// src/types/scoring-system.ts

import { Prisma } from "@prisma/client"

// Enum re-exports for type safety
export { PointMetricType, TieBreakerType } from "@prisma/client"

// Full scoring system with relations
export type ScoringSystemWithRelations = Prisma.ScoringSystemGetPayload<{
  include: {
    formulas: true
    tieBreakers: true
    _count: {
      select: { leagues: true }
    }
  }
}>

// Simplified type for table display
export type ScoringSystemSummary = {
  id: string
  name: string
  isDefault: boolean
  formulaCount: number
  tieBreakerCount: number
  leagueCount: number
  createdAt: Date
  updatedAt: Date
}

// Formula type
export type ScoreFormula = {
  id: string
  multiplier: number
  pointMetric: PointMetricType
  order: number
}

// Tie-breaker type
export type TieBreaker = {
  id: string
  type: TieBreakerType
  order: number
}

// Form data types (without IDs for creation)
export type ScoringSystemFormData = {
  name: string
  formulas: Array<{
    multiplier: number
    pointMetric: PointMetricType
    order: number
  }>
  tieBreakers: Array<{
    type: TieBreakerType
    order: number
  }>
}

// Player with calculated points
export type PlayerWithPoints = {
  playerId: string
  playerName: string
  leaguePoints: number
  matchPoints: number
  gameWinPercentage: number
  oppMatchWinPercentage: number
  oppGameWinPercentage: number
  eventAttendance: number
  matchWins: number
  rank: number
}
```

### Display Label Maps

```typescript
// src/lib/constants/scoring-labels.ts

export const POINT_METRIC_LABELS: Record<PointMetricType, string> = {
  EVENT_ATTENDANCE: "Event Attendance",
  MATCH_WINS: "Match Wins",
  GAME_WINS: "Game Wins",
  FIRST_PLACE: "1st in Event",
  SECOND_PLACE: "2nd in Event",
  THIRD_PLACE: "3rd in Event",
}

export const TIE_BREAKER_LABELS: Record<TieBreakerType, string> = {
  LEAGUE_POINTS: "League Points",
  MATCH_POINTS: "Match Points",
  OPP_MATCH_WIN_PCT: "Opp Match Win %",
  GAME_WIN_PCT: "Game Win %",
  OPP_GAME_WIN_PCT: "Opp Game Win %",
  EVENT_ATTENDANCE_TIE: "Event Attendance",
  MATCH_WINS_TIE: "Match Wins",
}

export const POINT_METRIC_OPTIONS = Object.entries(POINT_METRIC_LABELS).map(
  ([value, label]) => ({ value: value as PointMetricType, label })
)

export const TIE_BREAKER_OPTIONS = Object.entries(TIE_BREAKER_LABELS).map(
  ([value, label]) => ({ value: value as TieBreakerType, label })
)
```

## Validation Schemas

### Zod Schemas

```typescript
// src/lib/validations/scoring-system.ts

import { z } from "zod"
import { PointMetricType, TieBreakerType } from "@prisma/client"

// Schema for individual formula
export const formulaSchema = z.object({
  multiplier: z.number().int("Multiplier must be an integer"),
  pointMetric: z.nativeEnum(PointMetricType, {
    errorMap: () => ({ message: "Invalid point metric" }),
  }),
  order: z.number().int().positive(),
})

// Schema for individual tie-breaker
export const tieBreakerSchema = z.object({
  type: z.nativeEnum(TieBreakerType, {
    errorMap: () => ({ message: "Invalid tie-breaker type" }),
  }),
  order: z.number().int().positive(),
})

// Main scoring system creation schema
export const createScoringSystemSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  formulas: z
    .array(formulaSchema)
    .min(1, "At least one formula is required")  // FR-018
    .max(10, "Maximum 10 formulas allowed")      // Edge case clarification
    .refine(
      (formulas) => {
        // Check for duplicate point metrics (not allowed per clarification)
        const metrics = formulas.map((f) => f.pointMetric)
        return new Set(metrics).size === metrics.length
      },
      { message: "Duplicate point metrics are not allowed" }
    ),
  tieBreakers: z
    .array(tieBreakerSchema)
    .max(7, "Maximum 7 tie-breakers allowed")    // Edge case clarification
    .optional()
    .default([]),
})

// Update schema (same as create but with id)
export const updateScoringSystemSchema = createScoringSystemSchema.extend({
  id: z.string().cuid(),
})

// Schema for validating scoring system name uniqueness (API-side)
export const scoringSystemNameSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  excludeId: z.string().cuid().optional(),
})

// Type inference
export type CreateScoringSystemInput = z.infer<typeof createScoringSystemSchema>
export type UpdateScoringSystemInput = z.infer<typeof updateScoringSystemSchema>
```

## Database Constraints & Indexes

### Constraints

1. **ScoringSystem.name**: UNIQUE constraint (enforces FR-017)
2. **TieBreaker**: UNIQUE constraint on (scoringSystemId, order) to prevent duplicate order values
3. **ScoreFormula**: No duplicate prevention at DB level (duplicates allowed per clarification)

### Indexes

1. **ScoringSystem.isDefault**: Index for fast default system lookup
2. **ScoreFormula.scoringSystemId**: Foreign key index
3. **ScoreFormula.(scoringSystemId, order)**: Composite index for ordered retrieval
4. **TieBreaker.scoringSystemId**: Foreign key index
5. **League.scoringSystemId**: Foreign key index

### Cascade Behaviors

- **ScoreFormula & TieBreaker**: CASCADE on ScoringSystem deletion (delete children)
- **League.scoringSystem**: SET NULL on ScoringSystem deletion (preserve league, revert to default)

## Data Validation Rules

### Business Rules

1. **Unique Names** (FR-017): Scoring system names must be unique across all systems
2. **Minimum Formulas** (FR-018): At least 1 formula required before save
3. **Maximum Limits**: Max 10 formulas, max 7 tie-breakers (Edge case clarification)
4. **Default System** (FR-012a-c): Exactly one system marked as isDefault=true
5. **No Duplicate Metrics**: Cannot have duplicate point metrics in formulas (Clarification Answer 1)
6. **Order Sequence**: Formula/tie-breaker orders must be sequential starting from 1
7. **Delete Protection** (FR-020): Cannot delete scoring system associated with leagues

### Validation Layers

1. **Client-Side**: Zod schema validation in forms (immediate feedback)
2. **API Layer**: Zod schema validation + business rule checks
3. **Database Layer**: Constraints and foreign keys

## Default System Specification

### Default Scoring System (FR-012b, FR-012c)

```typescript
// Default system configuration per clarification
const DEFAULT_SYSTEM = {
  name: "Standard Scoring",
  isDefault: true,
  formulas: [
    { multiplier: 1, pointMetric: "EVENT_ATTENDANCE", order: 1 },
    { multiplier: 3, pointMetric: "FIRST_PLACE", order: 2 },
    { multiplier: 2, pointMetric: "SECOND_PLACE", order: 3 },
    { multiplier: 1, pointMetric: "THIRD_PLACE", order: 4 },
  ],
  tieBreakers: [
    { type: "LEAGUE_POINTS", order: 1 },
    { type: "MATCH_POINTS", order: 2 },
    { type: "OPP_MATCH_WIN_PCT", order: 3 },
    { type: "GAME_WIN_PCT", order: 4 },
    { type: "OPP_GAME_WIN_PCT", order: 5 },
  ],
}
```

## Migration Strategy

### Migration Steps

1. **Create enums**: PointMetricType, TieBreakerType
2. **Create tables**: ScoringSystem, ScoreFormula, TieBreaker
3. **Modify League**: Add scoringSystemId column (nullable)
4. **Add indexes**: As specified above
5. **Seed default system**: Run seed script to create default scoring system

### Migration Script

```prisma
// prisma/migrations/XXX_add_scoring_system/migration.sql

-- Create enums
CREATE TYPE "PointMetricType" AS ENUM ('EVENT_ATTENDANCE', 'MATCH_WINS', 'GAME_WINS', 'FIRST_PLACE', 'SECOND_PLACE', 'THIRD_PLACE');
CREATE TYPE "TieBreakerType" AS ENUM ('LEAGUE_POINTS', 'MATCH_POINTS', 'OPP_MATCH_WIN_PCT', 'GAME_WIN_PCT', 'OPP_GAME_WIN_PCT', 'EVENT_ATTENDANCE_TIE', 'MATCH_WINS_TIE');

-- Create ScoringSystem table
CREATE TABLE "ScoringSystem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create ScoreFormula table
CREATE TABLE "ScoreFormula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scoringSystemId" TEXT NOT NULL,
    "multiplier" INTEGER NOT NULL,
    "pointMetric" "PointMetricType" NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScoreFormula_scoringSystemId_fkey" FOREIGN KEY ("scoringSystemId") REFERENCES "ScoringSystem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create TieBreaker table
CREATE TABLE "TieBreaker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scoringSystemId" TEXT NOT NULL,
    "type" "TieBreakerType" NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TieBreaker_scoringSystemId_fkey" FOREIGN KEY ("scoringSystemId") REFERENCES "ScoringSystem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("scoringSystemId", "order")
);

-- Add scoringSystemId to League
ALTER TABLE "League" ADD COLUMN "scoringSystemId" TEXT;
ALTER TABLE "League" ADD CONSTRAINT "League_scoringSystemId_fkey" FOREIGN KEY ("scoringSystemId") REFERENCES "ScoringSystem" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX "ScoringSystem_isDefault_idx" ON "ScoringSystem"("isDefault");
CREATE INDEX "ScoreFormula_scoringSystemId_idx" ON "ScoreFormula"("scoringSystemId");
CREATE INDEX "ScoreFormula_scoringSystemId_order_idx" ON "ScoreFormula"("scoringSystemId", "order");
CREATE INDEX "TieBreaker_scoringSystemId_idx" ON "TieBreaker"("scoringSystemId");
CREATE INDEX "League_scoringSystemId_idx" ON "League"("scoringSystemId");
```

## Seed Data

```typescript
// prisma/seed.ts (addition)

import { PrismaClient, PointMetricType, TieBreakerType } from "@prisma/client"

const prisma = new PrismaClient()

async function seedScoringSystem() {
  // Create default scoring system
  const defaultSystem = await prisma.scoringSystem.upsert({
    where: { name: "Standard Scoring" },
    update: {},
    create: {
      name: "Standard Scoring",
      isDefault: true,
      formulas: {
        create: [
          { multiplier: 1, pointMetric: PointMetricType.EVENT_ATTENDANCE, order: 1 },
          { multiplier: 3, pointMetric: PointMetricType.FIRST_PLACE, order: 2 },
          { multiplier: 2, pointMetric: PointMetricType.SECOND_PLACE, order: 3 },
          { multiplier: 1, pointMetric: PointMetricType.THIRD_PLACE, order: 4 },
        ],
      },
      tieBreakers: {
        create: [
          { type: TieBreakerType.LEAGUE_POINTS, order: 1 },
          { type: TieBreakerType.MATCH_POINTS, order: 2 },
          { type: TieBreakerType.OPP_MATCH_WIN_PCT, order: 3 },
          { type: TieBreakerType.GAME_WIN_PCT, order: 4 },
          { type: TieBreakerType.OPP_GAME_WIN_PCT, order: 5 },
        ],
      },
    },
  })

  console.log("Default scoring system created:", defaultSystem.id)
}

// Add to main seed function
```

## Query Patterns

### Efficient Query Examples

```typescript
// Fetch scoring system with all relations
const scoringSystem = await prisma.scoringSystem.findUnique({
  where: { id },
  include: {
    formulas: {
      orderBy: { order: 'asc' }
    },
    tieBreakers: {
      orderBy: { order: 'asc' }
    },
    _count: {
      select: { leagues: true }
    }
  }
})

// Fetch all systems for table display
const systems = await prisma.scoringSystem.findMany({
  select: {
    id: true,
    name: true,
    isDefault: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: {
        formulas: true,
        tieBreakers: true,
        leagues: true
      }
    }
  },
  orderBy: [
    { isDefault: 'desc' },  // Default first
    { name: 'asc' }
  ]
})

// Check if system can be deleted
const system = await prisma.scoringSystem.findUnique({
  where: { id },
  include: {
    leagues: {
      select: {
        id: true,
        name: true
      }
    }
  }
})
const canDelete = system.leagues.length === 0
```

## Next Steps

Data model design complete. Proceed to:
1. Create API contracts (Phase 1)
2. Create quickstart guide (Phase 1)
3. Update agent context
