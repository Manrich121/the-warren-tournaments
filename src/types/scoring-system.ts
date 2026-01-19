// src/types/scoring-system.ts

import { Prisma, PointMetricType, TieBreakerType } from '@prisma/client';

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

// Formula type
export type ScoreFormula = {
  multiplier: number;
  pointMetric: PointMetricType;
  order: number;
};

// Tie-breaker type
export type TieBreaker = {
  type: TieBreakerType;
  order: number;
};

// Form data types (without IDs for creation)
export type ScoringSystemFormData = {
  name: string;
  formulas: Array<{
    multiplier: number;
    pointMetric: PointMetricType;
    order: number;
  }>;
  tieBreakers: Array<{
    type: TieBreakerType;
    order: number;
  }>;
};

/**
 * Player performance data for point calculation
 */
export type PlayerPerformanceData = {
  matchWins: number;
  gameWins: number;
  firstPlaceFinishes: number;
  secondPlaceFinishes: number;
  thirdPlaceFinishes: number;
  eventAttendance: number;
};
