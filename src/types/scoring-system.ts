// src/types/scoring-system.ts

import { Prisma } from '@prisma/client';

// Enum re-exports for type safety
export { PointMetricType, TieBreakerType } from '@prisma/client';

// Full scoring system with relations
export type ScoringSystemWithRelations = Prisma.ScoringSystemGetPayload<{
  include: {
    formulas: true;
    tieBreakers: true;
    _count: {
      select: { leagues: true };
    };
  };
}>;

// Simplified type for table display
export type ScoringSystemSummary = {
  id: string;
  name: string;
  isDefault: boolean;
  formulaCount: number;
  tieBreakerCount: number;
  leagueCount: number;
  createdAt: Date;
  updatedAt: Date;
};

// Formula type
export type ScoreFormula = {
  id: string;
  multiplier: number;
  pointMetric: import('@prisma/client').PointMetricType;
  order: number;
};

// Tie-breaker type
export type TieBreaker = {
  id: string;
  type: import('@prisma/client').TieBreakerType;
  order: number;
};

// Form data types (without IDs for creation)
export type ScoringSystemFormData = {
  name: string;
  formulas: Array<{
    multiplier: number;
    pointMetric: import('@prisma/client').PointMetricType;
    order: number;
  }>;
  tieBreakers: Array<{
    type: import('@prisma/client').TieBreakerType;
    order: number;
  }>;
};

// Player with calculated points
export type PlayerWithPoints = {
  playerId: string;
  playerName: string;
  leaguePoints: number;
  matchPoints: number;
  gameWinPercentage: number;
  oppMatchWinPercentage: number;
  oppGameWinPercentage: number;
  eventAttendance: number;
  matchWins: number;
  rank: number;
};
