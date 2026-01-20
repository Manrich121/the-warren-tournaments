'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { TIE_BREAKER_OPTIONS } from '@/lib/constants/scoring-labels';
import type { TieBreakerType } from '@prisma/client';

interface TieBreakerCardProps {
  type: TieBreakerType;
  onTypeChange: (value: TieBreakerType) => void;
  onRemove: () => void;
  index: number;
  order: number;
}

export function TieBreakerCard({ type, onTypeChange, onRemove, index, order }: TieBreakerCardProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-3">
      <div className="flex flex-1 items-center gap-2">
        {/* Order number display */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium">{order}.</div>

        {/* Tie-breaker type dropdown */}
        <div className="flex-1">
          <Label htmlFor={`tiebreaker-${index}`} className="sr-only">
            Tie-Breaker Type
          </Label>
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger id={`tiebreaker-${index}`}>
              <SelectValue placeholder="Select tie-breaker" />
            </SelectTrigger>
            <SelectContent>
              {TIE_BREAKER_OPTIONS.map(option => (
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
        aria-label={`Remove tie-breaker ${order}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
