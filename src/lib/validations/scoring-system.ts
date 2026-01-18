// src/lib/validations/scoring-system.ts

import { z } from "zod";
import { PointMetricType, TieBreakerType } from "@prisma/client";

// Schema for individual formula
export const formulaSchema = z.object({
  multiplier: z.number().int("Multiplier must be an integer"),
  pointMetric: z.nativeEnum(PointMetricType),
  order: z.number().int().positive(),
});

// Schema for individual tie-breaker
export const tieBreakerSchema = z.object({
  type: z.nativeEnum(TieBreakerType),
  order: z.number().int().positive(),
});

// Main scoring system creation schema
export const createScoringSystemSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  formulas: z
    .array(formulaSchema)
    .min(1, "At least one formula is required") // FR-018
    .max(10, "Maximum 10 formulas allowed") // Edge case clarification
    .refine(
      (formulas) => {
        // Check for duplicate point metrics
        const metrics = formulas.map((f) => f.pointMetric);
        return new Set(metrics).size === metrics.length;
      },
      { message: "Duplicate point metrics are not allowed" }
    ),
  tieBreakers: z
    .array(tieBreakerSchema)
    .max(7, "Maximum 7 tie-breakers allowed") // Edge case clarification
    .optional()
    .default([]),
});

// Update schema (same as create but with id)
export const updateScoringSystemSchema = createScoringSystemSchema.extend({
  id: z.string().cuid(),
});

// Schema for validating scoring system name uniqueness (API-side)
export const scoringSystemNameSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  excludeId: z.string().cuid().optional(),
});

// Type inference
export type CreateScoringSystemInput = z.infer<
  typeof createScoringSystemSchema
>;
export type UpdateScoringSystemInput = z.infer<
  typeof updateScoringSystemSchema
>;
