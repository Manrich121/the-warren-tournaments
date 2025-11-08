'use client';

import { League } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatLeagueOption } from '@/lib/league-utils';

interface LeagueSelectorProps {
  /** Array of all available leagues */
  leagues: League[];
  /** Currently selected league ID */
  selectedLeagueId: string | null;
  /** Callback when a new league is selected */
  onSelectLeague: (leagueId: string) => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * LeagueSelector Component
 *
 * Provides a dropdown selector for switching between different league leaderboards.
 * Displays leagues with formatted date ranges for easy identification.
 *
 * Features:
 * - Keyboard accessible (Tab, Enter, Arrow keys)
 * - ARIA labeled for screen readers
 * - Empty state handling
 * - Formatted league options: "{League Name} ({Date Range})"
 *
 * @example
 * ```tsx
 * <LeagueSelector
 *   leagues={allLeagues}
 *   selectedLeagueId={currentLeagueId}
 *   onSelectLeague={handleLeagueChange}
 * />
 * ```
 */
export function LeagueSelector({
  leagues,
  selectedLeagueId,
  onSelectLeague,
  className = '',
}: LeagueSelectorProps) {
  // Handle empty leagues array
  if (!leagues || leagues.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <label className="text-sm font-medium text-muted-foreground">
          Select League:
        </label>
        <Select disabled>
          <SelectTrigger className="w-[300px]" aria-label="Select League">
            <SelectValue placeholder="No leagues available" />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="league-selector" className="text-sm font-medium">
        Select League:
      </label>
      <Select
        value={selectedLeagueId || undefined}
        onValueChange={onSelectLeague}
      >
        <SelectTrigger
          id="league-selector"
          className="w-[300px]"
          aria-label="Select League"
          aria-describedby="league-selector-description"
        >
          <SelectValue placeholder="Select a league" />
        </SelectTrigger>
        <SelectContent>
          {leagues.map((league) => (
            <SelectItem key={league.id} value={league.id}>
              {formatLeagueOption(league)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span id="league-selector-description" className="sr-only">
        Choose a league to view its leaderboard and statistics
      </span>
    </div>
  );
}
