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
import { useAddScoringSystem } from '@/hooks/scoring-systems';
import { PointMetricType, TieBreakerType } from '@prisma/client';

interface ScoringSystemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ScoringSystemDialog({ open, onOpenChange }: ScoringSystemDialogProps) {
  const addMutation = useAddScoringSystem();

  const [name, setName] = useState('');
  const [formulas, setFormulas] = useState<Formula[]>([DEFAULT_INIT_FORMULA]);
  const [tieBreakers, setTieBreakers] = useState<TieBreaker[]>([DEFAULT_INIT_TIEBREAKER]);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('');
      setFormulas([DEFAULT_INIT_FORMULA]);
      setTieBreakers([DEFAULT_INIT_TIEBREAKER]);
      setError(null);
    }
  }, [open]);

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
      await addMutation.mutateAsync({
        name: name.trim(),
        formulas,
        tieBreakers
      });

      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create scoring system';
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
            <DialogTitle>Create League Scoring System</DialogTitle>
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
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Scoring System
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
