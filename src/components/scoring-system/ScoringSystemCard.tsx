'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScoringSystemWithRelations } from '@/types/scoring-system';
import { FormulaDisplayList } from './FormulaDisplayList';
import { TieBreakerDisplayList } from './TieBreakerDisplayList';

interface ScoringSystemCardProps {
  scoringSystem: ScoringSystemWithRelations | null | undefined;
  isLoading?: boolean;
}

export function ScoringSystemCard({ scoringSystem, isLoading }: ScoringSystemCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scoring System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!scoringSystem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scoring System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">No scoring system configured</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoring System</CardTitle>
        <p className="text-sm text-muted-foreground">{scoringSystem.name}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormulaDisplayList formulas={scoringSystem.formulas} />
        <TieBreakerDisplayList tieBreakers={scoringSystem.tieBreakers} />
      </CardContent>
    </Card>
  );
}
