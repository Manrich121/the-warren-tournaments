"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { FormulaList } from "./formula-list";
import { useAddScoringSystem } from "@/hooks/scoring-systems";
import type { PointMetricType } from "@prisma/client";

interface ScoringSystemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Formula {
  multiplier: number;
  pointMetric: PointMetricType;
  order: number;
}

export function ScoringSystemDialog({
  open,
  onOpenChange,
}: ScoringSystemDialogProps) {
  const addMutation = useAddScoringSystem();

  const [name, setName] = useState("");
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName("");
      setFormulas([]);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (formulas.length === 0) {
      setError("At least one formula is required");
      return;
    }

    // Check for duplicate metrics
    const metrics = formulas.map((f) => f.pointMetric);
    if (new Set(metrics).size !== metrics.length) {
      setError("Duplicate point metrics are not allowed");
      return;
    }

    try {
      await addMutation.mutateAsync({
        name: name.trim(),
        formulas,
        tieBreakers: [], // Will add in Phase 4
      });

      onOpenChange(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create scoring system";
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Create New Scoring System</DialogTitle>
            <DialogDescription>
              Define how players earn league points by configuring formulas.
            </DialogDescription>
          </DialogHeader>

          {/* Error display */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="system-name">
              Scoring System Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="system-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Scoring, Competitive Format"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/100 characters
            </p>
          </div>

          {/* Formulas */}
          <FormulaList formulas={formulas} onChange={setFormulas} />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Create Scoring System
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
