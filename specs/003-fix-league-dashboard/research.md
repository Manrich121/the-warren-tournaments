# Research: Fix League Dashboard and Leaderboard Display

**Date**: 2025-11-02
**Feature**: 003-fix-league-dashboard
**Phase**: 0 (Research & Technical Decisions)

## Overview

This document captures technical research findings and decisions for implementing the league dashboard fix. The primary challenges are: (1) replacing the active league API with a most-recent league approach, (2) implementing complex leaderboard ranking with 4-level tie-breaking, and (3) optimizing TanStack Query configuration for proper caching.

---

## 1. Most Recent League Selection Strategy

### Decision
Implement a new API endpoint `/api/leagues/most-recent` that queries all leagues ordered by `endDate DESC, createdAt DESC` and returns the first result.

### Rationale
- **Separation of concerns**: Keep `/api/leagues/active` for its specific purpose (current active league) and create a new endpoint for "most recent regardless of status"
- **Database efficiency**: Single query with compound ordering handles both the primary sort (end date) and tie-breaker (creation date) in one operation
- **Type safety**: Return type can be `League | null` rather than throwing errors, allowing graceful UI handling

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Modify `/api/leagues/active` to return most recent | Breaking change for other potential consumers; semantic clarity lost |
| Client-side filtering of all leagues | Inefficient for large datasets; unnecessary data transfer; sorting logic duplicated |
| Separate queries for active vs most recent | Extra network round-trip; race conditions; complexity in React Query orchestration |

### Implementation Notes
```typescript
// Prisma query pattern
const mostRecentLeague = await prisma.league.findFirst({
  orderBy: [
    { endDate: 'desc' },
    { createdAt: 'desc' }  // Tie-breaker per FR-011
  ]
});
```

**Performance**: Index on `(endDate DESC, createdAt DESC)` recommended for optimal query performance with hundreds of leagues.

---

## 2. Leaderboard Calculation with Cascading Tie-Breakers

### Decision
Implement a pure TypeScript utility function `calculateLeaderboardRankings()` in `src/lib/leaderboard-calculator.ts` that:
1. Accepts raw match/event data for a league
2. Aggregates player statistics (league points, win rates, opponent win rates)
3. Sorts using JavaScript's stable sort with custom comparator implementing the 4-level tie-breaking

### Rationale
- **Testability**: Pure function with no side effects, easy to unit test all edge cases
- **Performance**: Client-side calculation allows caching of raw data; avoids complex SQL aggregations
- **Flexibility**: Tie-breaking logic centralized; easy to modify or extend
- **Type safety**: Full TypeScript inference for all intermediate calculations

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Database VIEW with SQL ranking | Prisma limitations with complex window functions; harder to test; migration complexity |
| Server-side API endpoint for rankings | Caching challenges; duplicates data transfer; still need calculation logic |
| Real-time calculation on every render | Performance concerns; unnecessary re-computation; violates React best practices |

### Tie-Breaking Algorithm

Per FR-012 and FR-013, the sorting priority is:

```typescript
function compareLeaderboardEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  // 1. League points (descending - higher is better)
  if (a.leaguePoints !== b.leaguePoints) {
    return b.leaguePoints - a.leaguePoints;
  }

  // 2. Match win rate (descending)
  if (a.matchWinRate !== b.matchWinRate) {
    return b.matchWinRate - a.matchWinRate;
  }

  // 3. Opponents' match win rate (descending)
  if (a.opponentsMatchWinRate !== b.opponentsMatchWinRate) {
    return b.opponentsMatchWinRate - a.opponentsMatchWinRate;
  }

  // 4. Game win rate (descending)
  if (a.gameWinRate !== b.gameWinRate) {
    return b.gameWinRate - a.gameWinRate;
  }

  // 5. Opponents' game win rate (descending)
  if (a.opponentsGameWinRate !== b.opponentsGameWinRate) {
    return b.opponentsGameWinRate - a.opponentsGameWinRate;
  }

  // 6. Final tie-breaker: alphabetical by player name
  return a.playerName.localeCompare(b.playerName);
}
```

**Edge Cases Handled**:
- Players with 0 matches: Appear at bottom with 0 stats
- Division by zero: Win rates default to 0 when no matches
- Shared rank positions: Players with identical stats share the same rank number

### Implementation Notes
- **League points**: Assumed to be sum of match points across all events in the league (confirm with existing codebase)
- **Match win rate**: `(matchesWon / totalMatches)` where draws don't count as wins
- **Game win rate**: `(totalGamesWon / totalGamesPlayed)` at the game level within matches
- **Opponent stats**: Calculated by aggregating the stats of all opponents a player has faced

---

## 3. TanStack Query Configuration

### Decision (Per User Input)
Configure the `useActiveLeague` hook with appropriate `staleTime` and handle 404 responses gracefully:

```typescript
export const useActiveLeague = () => {
  return useQuery<League | null, Error>({
    queryKey: keys.activeLeague(),
    queryFn: async () => {
      const res = await fetch('/api/leagues/active');
      if (res.status === 404) {
        return null;  // No active league - graceful handling
      }
      if (!res.ok) {
        throw new Error('Failed to fetch active league');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes - leagues don't change frequently
  });
};
```

### Rationale
- **5-minute staleTime**: Leagues are relatively static (start/end dates don't change often); reduces unnecessary re-fetching
- **Graceful 404 handling**: Returns `null` instead of throwing, allowing UI to render empty state without error boundaries
- **Type safety**: Return type `League | null` matches the graceful handling pattern

### Query Key Strategy

Implement hierarchical query keys for proper cache invalidation:

```typescript
export const keys = {
  all: ['leagues'] as const,
  lists: () => [...keys.all, 'list'] as const,
  list: (filters: string) => [...keys.lists(), { filters }] as const,
  details: () => [...keys.all, 'detail'] as const,
  detail: (id: string) => [...keys.details(), id] as const,
  activeLeague: () => [...keys.all, 'active'] as const,
  mostRecentLeague: () => [...keys.all, 'most-recent'] as const,
  leaderboard: (leagueId: string) => [...keys.detail(leagueId), 'leaderboard'] as const,
};
```

**Benefits**:
- Selective invalidation: Can invalidate all league queries or specific leaderboards
- Type safety: Query keys are strongly typed for refactoring safety
- Convention: Follows TanStack Query best practices for key management

---

## 4. League Selector Component Design

### Decision
Use shadcn/ui `<Select>` component (already installed) with custom formatting for league options:

```typescript
interface LeagueSelectorProps {
  selectedLeagueId: string | null;
  onSelectLeague: (leagueId: string) => void;
}

// Option format: "{League Name} ({Start Date} - {End Date})"
// Example: "Summer League 2024 (Jun 1 - Aug 31)"
```

### Rationale
- **Consistency**: Uses existing design system component
- **Accessibility**: shadcn/ui Select has ARIA attributes and keyboard navigation built-in
- **Date formatting**: Show abbreviated month and day for compactness (e.g., "Jun 1 - Aug 31")
- **Visual clarity**: League name prominent, dates provide context for disambiguation

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Custom dropdown implementation | Reinventing the wheel; accessibility concerns; more code to maintain |
| Combobox with search | Over-engineering for typical league counts (<20); added complexity |
| Radio buttons | Poor UX for >5 options; takes too much vertical space |

---

## 5. Quick Stats Calculation Strategy

### Decision
Create a `useLeagueStats(leagueId: string | null)` hook that derives stats from already-fetched data:

```typescript
const { data: events } = useEvents();  // All events (global)
const { data: matches } = useMatches();  // All matches (global)

const stats = useMemo(() => {
  if (!selectedLeagueId || !events || !matches) return null;

  const leagueEvents = events.filter(e => e.leagueId === selectedLeagueId);
  const leagueMatches = matches.filter(m =>
    leagueEvents.some(e => e.id === m.eventId)
  );
  const uniquePlayers = new Set(leagueMatches.flatMap(m => [m.player1Id, m.player2Id]));

  return {
    eventsCount: leagueEvents.length,
    matchesCount: leagueMatches.length,
    playersCount: uniquePlayers.size,
  };
}, [selectedLeagueId, events, matches]);
```

### Rationale
- **No additional API calls**: Reuses data already loaded for the home page
- **Performance**: `useMemo` prevents recalculation on every render
- **Correctness**: Stats guaranteed to match the league being displayed (no cache inconsistency)

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Dedicated `/api/leagues/[id]/stats` endpoint | Extra network request; potential cache inconsistency; duplicates data |
| Calculate in API and embed in league object | Couples league data with transient stats; cache invalidation complexity |

---

## 6. Date Handling and UTC Consistency

### Decision
All date comparisons use `new Date().toISOString()` and UTC timestamps:

```typescript
export function getLeagueMostRecent(leagues: League[]): League | null {
  const now = new Date();  // Client-side current time

  return leagues.reduce((mostRecent, league) => {
    if (!mostRecent) return league;

    const currentEndDate = new Date(league.endDate);
    const mostRecentEndDate = new Date(mostRecent.endDate);

    if (currentEndDate > mostRecentEndDate) return league;
    if (currentEndDate < mostRecentEndDate) return mostRecent;

    // Tie-breaker: most recently created
    return new Date(league.createdAt) > new Date(mostRecent.createdAt)
      ? league
      : mostRecent;
  }, null as League | null);
}
```

### Rationale
- **Consistency**: Prisma stores dates in UTC; JavaScript Date handles UTC/local conversion transparently
- **Correctness**: Using `new Date()` constructor for parsing ensures proper timezone handling
- **Edge case handling**: Explicit tie-breaking logic when end dates match (per FR-011)

---

## 7. Error Handling and Empty States

### Decision
Implement three-tier error handling:

1. **Network errors**: TanStack Query's built-in error handling with retry logic
2. **404 Not Found**: Return `null` and display "No matches played in this league yet" message
3. **Unexpected errors**: Error boundary with user-friendly message

```typescript
// Component pattern
const { data: league, error, isLoading } = useMostRecentLeague();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage message="Failed to load league data" />;
if (!league) return <EmptyState message="No leagues available" />;
```

### Rationale
- **User experience**: Clear feedback for all states (loading, error, empty)
- **Graceful degradation**: Page remains functional even with missing data
- **Developer experience**: TanStack Query handles retry logic automatically

---

## 8. Testing Strategy

### Decision
Three-layer testing approach:

1. **Unit tests** (`lib/leaderboard-calculator.test.ts`, `lib/league-utils.test.ts`):
   - Test tie-breaking logic with all edge cases
   - Test date comparison and UTC handling
   - Target: 100% coverage for business logic

2. **Component tests** (`components/*.test.tsx`):
   - LeagueSelector: selection, keyboard navigation, accessibility
   - QuickStats: correct stat display for various league sizes
   - Target: 80% coverage, focus on user interactions

3. **Integration tests** (`integration/league-switching.test.tsx`):
   - Full flow: select league → leaderboard updates → stats update
   - Mock API responses for controlled scenarios
   - Target: Critical user journeys covered

### Tools
- Jest + React Testing Library (already configured)
- Mock Service Worker (MSW) for API mocking (may need installation)
- Testing Library User Event for realistic interactions

---

## 9. Performance Optimizations

### Decision
Implement the following optimizations:

1. **Memoization**: Use `useMemo` for expensive calculations (leaderboard sorting, stats aggregation)
2. **Query deduplication**: TanStack Query automatically deduplicates concurrent requests
3. **Stale-while-revalidate**: Configure appropriate `staleTime` values (5 min for leagues, 1 min for leaderboards)
4. **Component code-splitting**: Use dynamic imports for non-critical components if bundle size becomes an issue

### Rationale
- **Perceived performance**: Optimistic UI updates with stale data while revalidating in background
- **Network efficiency**: Reduced API calls through intelligent caching
- **Render performance**: Memoization prevents unnecessary recalculations

---

## 10. Accessibility Considerations

### Decision
Ensure WCAG 2.1 AA compliance:

- **Keyboard navigation**: Select component fully navigable with keyboard (provided by shadcn/ui)
- **Screen reader support**: Proper ARIA labels for league selector ("Select League")
- **Focus management**: Focus moves logically through components
- **Color contrast**: Use existing Tailwind classes that meet contrast requirements
- **Loading states**: Announce loading state changes to screen readers

### Implementation Notes
```tsx
<Select
  aria-label="Select League"
  aria-describedby="league-selector-description"
  // ... other props
>
  <SelectTrigger>
    <SelectValue placeholder="Select a league" />
  </SelectTrigger>
  <SelectContent>
    {leagues.map(league => (
      <SelectItem key={league.id} value={league.id}>
        {formatLeagueOption(league)}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## Summary of Technical Decisions

| Decision Area | Choice | Key Rationale |
|---------------|--------|---------------|
| League selection | New `/api/leagues/most-recent` endpoint | Separation of concerns, database efficiency |
| Leaderboard calculation | Client-side pure function with 4-level tie-breaking | Testability, performance, type safety |
| TanStack Query config | 5-minute staleTime, graceful 404 handling | Reduced fetching, graceful degradation |
| League selector | shadcn/ui Select with date range formatting | Consistency, accessibility, clear context |
| Quick Stats | Derived from existing data with useMemo | No extra API calls, guaranteed consistency |
| Date handling | UTC comparison with tie-breaking | Consistency, correctness across timezones |
| Error handling | Three-tier (network/404/unexpected) | Clear feedback, graceful degradation |
| Testing | Unit + Component + Integration | Comprehensive coverage of business logic and UX |
| Performance | Memoization + query deduplication + stale-while-revalidate | Perceived performance, network efficiency |
| Accessibility | WCAG 2.1 AA with keyboard nav and ARIA | Inclusive, meets constitutional requirements |

---

## Open Questions for Implementation

1. **League points calculation**: Confirm the formula for aggregating match points into league points (assumed: sum of match points across all events)
2. **Game vs Match distinction**: Clarify if "games" refers to individual rounds within a match or if match and game are synonymous
3. **Historical data volume**: Confirm expected league count and match count for performance testing targets
4. **Deployment strategy**: Determine if this fix can be deployed independently or requires coordination with other changes

---

**Next Phase**: Proceed to Phase 1 (Design & Contracts) to generate `data-model.md` and API contracts.
