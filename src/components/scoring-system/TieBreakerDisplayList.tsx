'use client';

import { TIE_BREAKER_LABELS } from '@/lib/constants/scoring-labels';
import type { TieBreaker } from '@/types/scoring-system';

interface TieBreakerDisplayListProps {
  tieBreakers: TieBreaker[];
}

export function TieBreakerDisplayList({ tieBreakers }: TieBreakerDisplayListProps) {
  // Sort tie-breakers by order
  const sortedTieBreakers = [...tieBreakers].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Tie-Breakers</h3>
        <p className="text-xs text-muted-foreground">Ranking order for tied players</p>
      </div>
      {sortedTieBreakers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">No tie-breakers configured</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTieBreakers.map(tieBreaker => (
            <div key={tieBreaker.order} className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2">
                <span className="flex shrink-0 items-center justify-center text-sm font-medium">
                  {tieBreaker.order}.
                </span>
                <span className="text-sm">{TIE_BREAKER_LABELS[tieBreaker.type]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
