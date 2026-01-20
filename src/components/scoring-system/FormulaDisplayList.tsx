'use client';

import { POINT_METRIC_LABELS } from '@/lib/constants/scoring-labels';
import type { ScoreFormula } from '@/types/scoring-system';

interface FormulaDisplayListProps {
  formulas: ScoreFormula[];
}

export function FormulaDisplayList({ formulas }: FormulaDisplayListProps) {
  // Sort formulas by order
  const sortedFormulas = [...formulas].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Point Formulas</h3>
        <p className="text-xs text-muted-foreground">How league points are calculated</p>
      </div>
      {sortedFormulas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">No formulas configured</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedFormulas.map(formula => (
            <div key={formula.order} className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {formula.multiplier} {formula.multiplier === 1 || formula.multiplier === -1 ? 'pt' : 'pts'}
                  </span>
                  <span className="text-muted-foreground">×</span>
                  <span className="text-sm">{POINT_METRIC_LABELS[formula.pointMetric]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
