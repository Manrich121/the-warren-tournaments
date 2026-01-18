"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FormulaCard } from "./formula-card";
import type { PointMetricType } from "@prisma/client";

interface Formula {
  multiplier: number;
  pointMetric: PointMetricType;
  order: number;
}

interface FormulaListProps {
  formulas: Formula[];
  onChange: (formulas: Formula[]) => void;
  maxFormulas?: number;
}

export function FormulaList({
  formulas,
  onChange,
  maxFormulas = 10,
}: FormulaListProps) {
  const handleAdd = () => {
    if (formulas.length >= maxFormulas) return;

    const newFormula: Formula = {
      multiplier: 1,
      pointMetric: "EVENT_ATTENDANCE",
      order: formulas.length + 1,
    };

    onChange([...formulas, newFormula]);
  };

  const handleRemove = (index: number) => {
    const updated = formulas.filter((_, i) => i !== index);
    // Reorder remaining formulas
    const reordered = updated.map((formula, i) => ({
      ...formula,
      order: i + 1,
    }));
    onChange(reordered);
  };

  const handleMultiplierChange = (index: number, value: number) => {
    const updated = [...formulas];
    updated[index] = { ...updated[index]!, multiplier: value };
    onChange(updated);
  };

  const handlePointMetricChange = (
    index: number,
    value: PointMetricType
  ) => {
    const updated = [...formulas];
    updated[index] = { ...updated[index]!, pointMetric: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Formulas</h3>
          <p className="text-xs text-muted-foreground">
            Define how points are calculated ({formulas.length}/{maxFormulas})
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={formulas.length >= maxFormulas}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Formula
        </Button>
      </div>

      {formulas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No formulas yet. Click "Add Formula" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {formulas.map((formula, index) => (
            <FormulaCard
              key={index}
              index={index}
              multiplier={formula.multiplier}
              pointMetric={formula.pointMetric}
              onMultiplierChange={(value) =>
                handleMultiplierChange(index, value)
              }
              onPointMetricChange={(value) =>
                handlePointMetricChange(index, value)
              }
              onRemove={() => handleRemove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
