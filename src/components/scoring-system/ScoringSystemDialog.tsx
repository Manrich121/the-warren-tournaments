'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { FormulaList } from './FormulaList';
import { TieBreakerList } from './TieBreakerList';
import { useAddScoringSystem, useUpdateScoringSystem } from '@/hooks/scoring-systems';
import type { ScoringSystemWithRelations } from '@/types/scoring-system';
import { PointMetricType, TieBreakerType } from '@prisma/client';

interface ScoringSystemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  system?: ScoringSystemWithRelations; // If provided, dialog is in edit mode
}

interface Formula {
  multiplier: number;
  pointMetric: PointMetricType;
  order: number;
}

interface TieBreaker {
  type: TieBreakerType;
  order: number;
}

const DEFAULT_INIT_FORMULA: Formula = {
  pointMetric: PointMetricType.EVENT_ATTENDANCE,
  order: 1,
  multiplier: 1
};

const DEFAULT_INIT_TIEBREAKER: TieBreaker = {
  type: TieBreakerType.LEAGUE_POINTS,
  order: 1
};

export function ScoringSystemDialog({ open, onOpenChange, system }: ScoringSystemDialogProps) {
  const addMutation = useAddScoringSystem();
  const updateMutation = useUpdateScoringSystem();
  const isEditMode = !!system;

  const [name, setName] = useState('');
  const [formulas, setFormulas] = useState<Formula[]>([DEFAULT_INIT_FORMULA]);
  const [tieBreakers, setTieBreakers] = useState<TieBreaker[]>([DEFAULT_INIT_TIEBREAKER]);
  const [error, setError] = useState<string | null>(null);

  // Populate form when system changes or dialog opens
  useEffect(() => {
    if (isEditMode) {
      // Edit mode: populate with existing data
      setName(system.name);
      setFormulas(
        system.formulas.map(f => ({
          multiplier: f.multiplier,
          pointMetric: f.pointMetric,
          order: f.order,
        }))
      );
      setTieBreakers(
        system.tieBreakers.map(tb => ({
          type: tb.type,
          order: tb.order,
        }))
      );
    } else {
      // Create mode: reset to defaults
      setName('');
      setFormulas([DEFAULT_INIT_FORMULA]);
      setTieBreakers([DEFAULT_INIT_TIEBREAKER]);
    }
    setError(null);
  }, [system, isEditMode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (formulas.length === 0) {
      setError('At least one formula is required');
      return;
    }

    // Check for duplicate metrics
    const metrics = formulas.map(f => f.pointMetric);
    if (new Set(metrics).size !== metrics.length) {
      setError('Duplicate point metrics are not allowed');
      return;
    }

    try {
      if (isEditMode && system) {
        await updateMutation.mutateAsync({
          id: system.id,
          name: name.trim(),
          formulas,
          tieBreakers,
        });
      } else {
        await addMutation.mutateAsync({
          name: name.trim(),
          formulas,
          tieBreakers,
        });
      }

      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} scoring system`;
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl max-w-4xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit' : 'Create'} League Scoring System</DialogTitle>
            <DialogDescription>Define how players earn league points with formulas and tie-breakers.</DialogDescription>
          </DialogHeader>

          {/* Error display */}
          {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          {/* Name input */}
          <Field className={'max-w-md'}>
            <FieldLabel htmlFor="system-name">
              Scoring System Name <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="system-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Event Record with Match Wins"
              maxLength={100}
            />
          </Field>

          {/* Two-column layout for Formulas and Tie-Breakers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column: Formulas */}
            <div>
              <FormulaList formulas={formulas} onChange={setFormulas} />
            </div>

            {/* Right column: Tie-Breakers */}
            <div>
              <TieBreakerList tieBreakers={tieBreakers} onChange={setTieBreakers} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
              {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEditMode ? 'Update' : 'Create'} Scoring System
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
