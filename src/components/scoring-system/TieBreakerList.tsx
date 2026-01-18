"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TieBreakerCard } from "./TieBreakerCard";
import type { TieBreakerType } from "@prisma/client";

interface TieBreaker {
  type: TieBreakerType;
  order: number;
}

interface TieBreakerListProps {
  tieBreakers: TieBreaker[];
  onChange: (tieBreakers: TieBreaker[]) => void;
  maxTieBreakers?: number;
}

export function TieBreakerList({
  tieBreakers,
  onChange,
  maxTieBreakers = 7,
}: TieBreakerListProps) {
  const handleAdd = () => {
    if (tieBreakers.length >= maxTieBreakers) return;

    // Get already used types to avoid duplicates
    const usedTypes = new Set(tieBreakers.map(tb => tb.type));
    
    // Default tie-breaker types in standard order
    const defaultTypes: TieBreakerType[] = [
      "LEAGUE_POINTS",
      "MATCH_POINTS",
      "OPP_MATCH_WIN_PCT",
      "GAME_WIN_PCT",
      "OPP_GAME_WIN_PCT",
      "EVENT_ATTENDANCE_TIE",
      "MATCH_WINS_TIE",
    ];
    
    // Find first unused type
    const nextType = defaultTypes.find(t => !usedTypes.has(t)) || "LEAGUE_POINTS";

    const newTieBreaker: TieBreaker = {
      type: nextType,
      order: tieBreakers.length + 1,
    };

    onChange([...tieBreakers, newTieBreaker]);
  };

  const handleRemove = (index: number) => {
    const updated = tieBreakers.filter((_, i) => i !== index);
    // Automatically renumber remaining tie-breakers
    const renumbered = updated.map((tieBreaker, i) => ({
      ...tieBreaker,
      order: i + 1,
    }));
    onChange(renumbered);
  };

  const handleTypeChange = (index: number, value: TieBreakerType) => {
    const updated = [...tieBreakers];
    updated[index] = { ...updated[index]!, type: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Tie-Breakers</h3>
          <p className="text-xs text-muted-foreground">
            Define ranking order for tied players ({tieBreakers.length}/
            {maxTieBreakers})
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={tieBreakers.length >= maxTieBreakers}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Tie-Breaker
        </Button>
      </div>

      {tieBreakers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No tie-breakers configured. Tie-breakers are optional for ranking
            players with equal points.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tieBreakers.map((tieBreaker, index) => (
            <TieBreakerCard
              key={index}
              index={index}
              order={tieBreaker.order}
              type={tieBreaker.type}
              onTypeChange={(value) => handleTypeChange(index, value)}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
