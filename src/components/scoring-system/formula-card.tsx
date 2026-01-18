"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { POINT_METRIC_OPTIONS } from "@/lib/constants/scoring-labels";
import type { PointMetricType } from "@prisma/client";

interface FormulaCardProps {
  multiplier: number;
  pointMetric: PointMetricType;
  onMultiplierChange: (value: number) => void;
  onPointMetricChange: (value: PointMetricType) => void;
  onRemove: () => void;
  index: number;
}

export function FormulaCard({
  multiplier,
  pointMetric,
  onMultiplierChange,
  onPointMetricChange,
  onRemove,
  index,
}: FormulaCardProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-3">
      <div className="flex flex-1 items-center gap-2">
        {/* Multiplier input */}
        <div className="w-24">
          <Label htmlFor={`multiplier-${index}`} className="sr-only">
            Multiplier
          </Label>
          <Input
            id={`multiplier-${index}`}
            type="number"
            value={multiplier}
            onChange={(e) => onMultiplierChange(parseInt(e.target.value) || 0)}
            placeholder="Points"
            className="text-center"
          />
        </div>

        {/* Multiplication symbol */}
        <span className="text-muted-foreground">×</span>

        {/* Point metric dropdown */}
        <div className="flex-1">
          <Label htmlFor={`metric-${index}`} className="sr-only">
            Point Metric
          </Label>
          <Select value={pointMetric} onValueChange={onPointMetricChange}>
            <SelectTrigger id={`metric-${index}`}>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {POINT_METRIC_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Remove button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="shrink-0"
        aria-label={`Remove formula ${index + 1}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
