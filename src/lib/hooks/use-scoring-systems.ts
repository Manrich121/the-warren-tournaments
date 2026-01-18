// src/lib/hooks/use-scoring-systems.ts

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ScoringSystemSummary,
  ScoringSystemWithRelations,
} from "@/types/scoring-system";
import type {
  CreateScoringSystemInput,
  UpdateScoringSystemInput,
} from "@/lib/validations/scoring-system";

// Query keys
const SCORING_SYSTEMS_KEY = ["scoring-systems"] as const;
const scoringSystemKey = (id: string) => ["scoring-systems", id] as const;

/**
 * Hook to fetch all scoring systems
 */
export function useScoringSystems() {
  return useQuery<ScoringSystemSummary[]>({
    queryKey: SCORING_SYSTEMS_KEY,
    queryFn: async () => {
      const response = await fetch("/api/scoring-systems");
      if (!response.ok) {
        throw new Error("Failed to fetch scoring systems");
      }
      const data = await response.json();
      return data.data;
    },
  });
}

/**
 * Hook to fetch a single scoring system by ID
 */
export function useScoringSystem(id: string) {
  return useQuery<ScoringSystemWithRelations>({
    queryKey: scoringSystemKey(id),
    queryFn: async () => {
      const response = await fetch(`/api/scoring-systems/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch scoring system");
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new scoring system
 */
export function useCreateScoringSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateScoringSystemInput) => {
      const response = await fetch("/api/scoring-systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create scoring system");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch scoring systems list
      queryClient.invalidateQueries({ queryKey: SCORING_SYSTEMS_KEY });
    },
  });
}

/**
 * Hook to update an existing scoring system
 */
export function useUpdateScoringSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateScoringSystemInput) => {
      const response = await fetch(`/api/scoring-systems/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update scoring system");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific system
      queryClient.invalidateQueries({ queryKey: SCORING_SYSTEMS_KEY });
      queryClient.invalidateQueries({ queryKey: scoringSystemKey(variables.id) });
    },
  });
}

/**
 * Hook to delete a scoring system
 */
export function useDeleteScoringSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/scoring-systems/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete scoring system");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate scoring systems list
      queryClient.invalidateQueries({ queryKey: SCORING_SYSTEMS_KEY });
    },
  });
}
