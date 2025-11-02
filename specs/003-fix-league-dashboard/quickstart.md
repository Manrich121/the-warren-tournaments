# Quickstart: Fix League Dashboard and Leaderboard Display

**Date**: 2025-11-02
**Feature**: 003-fix-league-dashboard
**For**: Developers implementing this feature

## Overview

This quickstart guide helps you implement the league dashboard fix efficiently. It covers local development setup, key implementation patterns, testing strategies, and common pitfalls to avoid.

**Estimated Implementation Time**: 8-12 hours (1.5-2 days)

---

## Prerequisites

Before starting, ensure you have:

- [x] Node.js 18+ and pnpm 10+ installed
- [x] PostgreSQL running locally or accessible remote instance
- [x] Repository cloned and dependencies installed (`pnpm install`)
- [x] Database schema up to date (`pnpm db:push` or `pnpm db:migrate`)
- [x] Familiarity with Next.js App Router, TanStack Query, and Prisma

---

## Quick Setup (5 minutes)

1. **Checkout the feature branch**:
   ```bash
   git checkout 003-fix-league-dashboard
   ```

2. **Install dependencies** (if not already done):
   ```bash
   pnpm install
   ```

3. **Verify database connection**:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

4. **Run development server**:
   ```bash
   pnpm dev
   ```
   Navigate to `http://localhost:3000` to see the current (broken) dashboard.

5. **Run tests** (should initially fail for new tests):
   ```bash
   pnpm test
   ```

---

## Implementation Roadmap

### Phase 1: API Layer (2-3 hours)

**Order of implementation**:

1. **Create `/api/leagues/route.ts`** (15 min)
   - Implement `GET /api/leagues` endpoint
   - Return all leagues ordered by `endDate DESC, createdAt DESC`
   - Add error handling

2. **Create `/api/leagues/most-recent/route.ts`** (15 min)
   - Implement `GET /api/leagues/most-recent` endpoint
   - Return first league from ordered query (or `null`)
   - Add error handling

3. **Modify `/api/leagues/active/route.ts`** (10 min)
   - Change 404 response to include `{ error, message }` structure
   - Ensure consistent error format per constitution

4. **Create `/api/leagues/[id]/leaderboard/route.ts`** (1.5-2 hours)
   - Validate `leagueId` parameter with Zod
   - Fetch league events and matches
   - Call leaderboard calculation utility (implement next)
   - Return ranked leaderboard or empty array
   - Add comprehensive error handling

**Testing checkpoint**: Use Postman/curl to verify all endpoints return expected responses.

---

### Phase 2: Business Logic (3-4 hours)

**Order of implementation**:

1. **Create `src/lib/league-utils.ts`** (30 min)
   ```typescript
   export function getMostRecentLeague(leagues: League[]): League | null {
     // Implement sorting by endDate DESC, createdAt DESC
     // Return first or null
   }

   export function getLeagueStatus(league: League, now: Date = new Date()): LeagueStatus {
     // Return "Active" | "Upcoming" | "Past"
   }

   export function formatDateRange(start: Date, end: Date): string {
     // Return "Jun 1 - Aug 31" format
   }
   ```

2. **Create `src/lib/leaderboard-calculator.ts`** (2-3 hours) - **Most Complex**
   ```typescript
   export function calculateLeaderboardRankings(
     leagueId: string,
     events: Event[],
     matches: Match[],
     players: Player[]
   ): LeaderboardEntry[] {
     // 1. Filter events and matches for this league
     // 2. Group matches by player
     // 3. Calculate stats for each player (league points, win rates)
     // 4. Calculate opponent stats for each player
     // 5. Sort using cascading comparator (5-level tie-breaking)
     // 6. Assign rank positions (handle shared ranks)
     // 7. Return sorted leaderboard
   }
   ```

   **Sub-steps**:
   - Aggregate player match data
   - Calculate individual stats (match win rate, game win rate)
   - Calculate opponent-based stats (iterate over opponents, average their rates)
   - Implement sorting comparator following FR-012 and FR-013
   - Handle edge cases (0 matches, identical stats, alphabetical tie-breaker)

3. **Write unit tests for `league-utils.ts`** (30 min)
   - Test tie-breaking with identical end dates
   - Test status calculation for active/upcoming/past
   - Test date formatting

4. **Write unit tests for `leaderboard-calculator.ts`** (1 hour)
   - Test basic ranking with different league points
   - Test tie-breaking at each level (match win rate, opponent rates, etc.)
   - Test shared ranks
   - Test alphabetical tie-breaking
   - Test edge cases (0 matches, all identical stats)
   - **Target**: 100% code coverage for business logic

**Testing checkpoint**: All unit tests passing with >80% coverage.

---

### Phase 3: Data Fetching Hooks (1-2 hours)

**Order of implementation**:

1. **Modify `src/hooks/keys.ts`** (5 min)
   - Add query keys for new endpoints:
     ```typescript
     mostRecentLeague: () => [...keys.all, 'most-recent'] as const,
     leaderboard: (leagueId: string) => [...keys.detail(leagueId), 'leaderboard'] as const,
     ```

2. **Create `src/hooks/useLeagues.ts`** (10 min)
   ```typescript
   export const useLeagues = () => {
     return useQuery<League[], Error>({
       queryKey: keys.lists(),
       queryFn: async () => {
         const res = await fetch('/api/leagues');
         if (!res.ok) throw new Error('Failed to fetch leagues');
         return res.json();
       },
       staleTime: 60 * 1000, // 1 minute
     });
   };
   ```

3. **Create `src/hooks/useMostRecentLeague.ts`** (10 min)
   ```typescript
   export const useMostRecentLeague = () => {
     return useQuery<League | null, Error>({
       queryKey: keys.mostRecentLeague(),
       queryFn: async () => {
         const res = await fetch('/api/leagues/most-recent');
         if (!res.ok) throw new Error('Failed to fetch most recent league');
         return res.json();  // May be null
       },
       staleTime: 30 * 1000, // 30 seconds
     });
   };
   ```

4. **Modify `src/hooks/useActiveLeague.ts`** (15 min)
   - Update to handle 404 gracefully (return `null` instead of throwing)
   - Adjust `staleTime` to 5 minutes
   ```typescript
   queryFn: async () => {
     const res = await fetch('/api/leagues/active');
     if (res.status === 404) return null;
     if (!res.ok) throw new Error('Failed to fetch active league');
     return res.json();
   },
   staleTime: 5 * 60 * 1000, // 5 minutes
   ```

5. **Modify `src/hooks/useLeagueLeaderboard.ts`** (if exists) or create (15 min)
   - Update to fetch from new `/api/leagues/[id]/leaderboard` endpoint
   - Adjust `staleTime` to 1 minute

**Testing checkpoint**: Verify hooks fetch data correctly in browser DevTools.

---

### Phase 4: UI Components (2-3 hours)

**Order of implementation**:

1. **Create `src/components/LeagueSelector.tsx`** (45 min)
   ```typescript
   interface LeagueSelectorProps {
     leagues: League[];
     selectedLeagueId: string | null;
     onSelectLeague: (leagueId: string) => void;
   }
   ```
   - Use shadcn/ui `<Select>` component
   - Format options: "{League Name} ({Date Range})"
   - Add "Most Recent" option at top
   - Handle empty leagues array gracefully
   - Ensure keyboard accessibility

2. **Create `src/components/QuickStats.tsx`** (30 min)
   - Extract Quick Stats cards from `src/app/page.tsx`
   - Accept `LeagueStats` prop
   - Display: Total Leagues (global), Events/Players/Matches (league-specific)
   - Add loading skeleton

3. **Modify `src/components/Leaderboard.tsx`** (if exists) or create (45 min)
   - Accept `LeaderboardEntry[]` prop
   - Display rank, player name, league points, win rates
   - Handle empty leaderboard (show "No matches played in this league yet")
   - Add loading skeleton
   - Ensure responsive table/card layout

4. **Modify `src/app/page.tsx`** (1 hour) - **Integration Point**
   - Add `useState` for `selectedLeagueId`
   - Fetch most recent league on mount, set as default selection
   - Render `<LeagueSelector>` above leaderboard
   - Render `<QuickStats>` with calculated league stats
   - Render `<Leaderboard>` with fetched leaderboard data
   - Handle loading states for all queries
   - Handle error states with user-friendly messages

**Testing checkpoint**: Visual verification in browser, manual testing of league selection.

---

### Phase 5: Testing (1-2 hours)

**Order of implementation**:

1. **Component tests** (45 min)
   - `LeagueSelector.test.tsx`: Test selection, keyboard nav, empty state
   - `QuickStats.test.tsx`: Test stat display, loading, error states
   - (Optional) `Leaderboard.test.tsx`: Test rendering, empty state

2. **Integration test** (45 min)
   - `integration/league-switching.test.tsx`:
     - Mock `/api/leagues`, `/api/leagues/most-recent`, `/api/leagues/[id]/leaderboard`
     - Render page component
     - Verify initial leaderboard displays most recent league
     - Select different league from dropdown
     - Verify leaderboard and stats update
     - Verify loading states and error handling

**Testing checkpoint**: All tests passing, coverage >80%.

---

## Key Code Snippets

### Leaderboard Calculation Comparator

```typescript
function compareLeaderboardEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  // 1. League points (higher is better)
  if (a.leaguePoints !== b.leaguePoints) {
    return b.leaguePoints - a.leaguePoints;
  }

  // 2. Match win rate (higher is better)
  if (a.matchWinRate !== b.matchWinRate) {
    return b.matchWinRate - a.matchWinRate;
  }

  // 3. Opponents' match win rate (higher is better)
  if (a.opponentsMatchWinRate !== b.opponentsMatchWinRate) {
    return b.opponentsMatchWinRate - a.opponentsMatchWinRate;
  }

  // 4. Game win rate (higher is better)
  if (a.gameWinRate !== b.gameWinRate) {
    return b.gameWinRate - a.gameWinRate;
  }

  // 5. Opponents' game win rate (higher is better)
  if (a.opponentsGameWinRate !== b.opponentsGameWinRate) {
    return b.opponentsGameWinRate - a.opponentsGameWinRate;
  }

  // 6. Alphabetical by player name
  return a.playerName.localeCompare(b.playerName);
}
```

### Shared Rank Assignment

```typescript
function assignRanks(sortedEntries: Omit<LeaderboardEntry, 'rank'>[]): LeaderboardEntry[] {
  let currentRank = 1;
  let previousEntry: LeaderboardEntry | null = null;

  return sortedEntries.map((entry, index) => {
    if (previousEntry && compareLeaderboardEntries(entry, previousEntry) !== 0) {
      currentRank = index + 1;  // Advance rank position
    }
    previousEntry = { ...entry, rank: currentRank };
    return previousEntry;
  });
}
```

### Page Integration Pattern

```typescript
export default function HomePage() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

  const { data: mostRecentLeague } = useMostRecentLeague();
  const { data: leagues } = useLeagues();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeagueLeaderboard(
    selectedLeagueId || mostRecentLeague?.id || ''
  );

  // Set default selection to most recent league
  useEffect(() => {
    if (mostRecentLeague && !selectedLeagueId) {
      setSelectedLeagueId(mostRecentLeague.id);
    }
  }, [mostRecentLeague, selectedLeagueId]);

  // Calculate stats for selected league
  const leagueStats = useMemo(() => {
    if (!selectedLeagueId) return null;
    return calculateLeagueStats(selectedLeagueId, events, matches, prizePools);
  }, [selectedLeagueId, events, matches, prizePools]);

  return (
    <>
      <LeagueSelector
        leagues={leagues || []}
        selectedLeagueId={selectedLeagueId}
        onSelectLeague={setSelectedLeagueId}
      />
      <QuickStats stats={leagueStats} />
      <Leaderboard entries={leaderboard || []} isLoading={leaderboardLoading} />
    </>
  );
}
```

---

## Common Pitfalls and Solutions

### Pitfall 1: Incorrect Date Comparison

**Problem**: Comparing date strings instead of Date objects leads to incorrect sorting.

**Solution**: Always convert to Date objects before comparison:
```typescript
const date1 = new Date(league1.endDate);
const date2 = new Date(league2.endDate);
if (date1 > date2) { ... }
```

### Pitfall 2: Division by Zero in Win Rate Calculation

**Problem**: Calculating `matchesWon / matchesPlayed` when `matchesPlayed = 0` results in `NaN`.

**Solution**: Default to 0 for players with no matches:
```typescript
const matchWinRate = matchesPlayed > 0 ? matchesWon / matchesPlayed : 0;
```

### Pitfall 3: Incorrect Opponent Stats Calculation

**Problem**: Including the player's own stats when calculating opponents' aggregate rates.

**Solution**: Filter out the current player before averaging:
```typescript
const opponentIds = matches.map(m => m.opponentId);
const opponentStats = opponentIds.map(id => playerStatsMap.get(id));
const opponentsMatchWinRate = average(opponentStats.map(s => s.matchWinRate));
```

### Pitfall 4: Rank Gaps for Shared Ranks

**Problem**: Assigning ranks sequentially (1, 2, 3, 4) even when players tie, instead of (1, 2, 2, 4).

**Solution**: Use index + 1 for rank advancement only when entries differ:
```typescript
if (previousEntry && !areEntriesEqual(entry, previousEntry)) {
  currentRank = index + 1;
}
```

### Pitfall 5: TanStack Query Stale Data

**Problem**: Leaderboard shows stale data after switching leagues due to aggressive caching.

**Solution**: Use appropriate `staleTime` and rely on query key changes:
```typescript
queryKey: keys.leaderboard(selectedLeagueId),  // Key changes when league changes
staleTime: 60 * 1000,  // 1 minute
```

---

## Testing Strategy

### Unit Tests (Required)

**Files**:
- `__tests__/lib/league-utils.test.ts`
- `__tests__/lib/leaderboard-calculator.test.ts`

**Coverage Targets**:
- 100% for `league-utils.ts`
- 100% for `leaderboard-calculator.ts`

**Test Cases**:
- Basic sorting and ranking
- All 5 levels of tie-breaking
- Shared rank scenarios
- Edge cases (0 matches, identical stats, empty arrays)

### Component Tests (Required)

**Files**:
- `__tests__/components/LeagueSelector.test.tsx`
- `__tests__/components/QuickStats.test.tsx`

**Coverage Targets**:
- 80% for components

**Test Cases**:
- Rendering with data
- User interactions (selection, keyboard nav)
- Loading and error states
- Empty states

### Integration Tests (Required)

**Files**:
- `__tests__/integration/league-switching.test.tsx`

**Test Cases**:
- Full flow: load page → see most recent league → select different league → verify update
- Error handling scenarios
- Empty state when no leagues exist

---

## Performance Checklist

- [ ] Leaderboard calculation completes in <200ms for 100 players
- [ ] Page loads with leaderboard visible in <2s
- [ ] League switching updates leaderboard in <1s
- [ ] API endpoints respond in <200ms (verified with browser DevTools)
- [ ] `useMemo` used for expensive calculations (leaderboard sort, stats aggregation)
- [ ] TanStack Query configured with appropriate `staleTime` values

---

## Accessibility Checklist

- [ ] League selector navigable with keyboard (Tab, Enter, Arrow keys)
- [ ] League selector has ARIA label: "Select League"
- [ ] Loading states announced to screen readers (aria-live regions)
- [ ] Error messages announced to screen readers
- [ ] Leaderboard table uses semantic HTML (`<table>`, `<th>`, `<td>`)
- [ ] Color contrast meets WCAG 2.1 AA standards (use existing Tailwind classes)

---

## Deployment Checklist

- [ ] All unit tests passing (`pnpm test`)
- [ ] All integration tests passing
- [ ] ESLint passing (`pnpm lint`)
- [ ] Prettier formatting applied (`pnpm format`)
- [ ] TypeScript compilation successful (`pnpm build`)
- [ ] Manual testing completed (league selection, leaderboard display, stats accuracy)
- [ ] No console errors in browser
- [ ] Responsive design verified on desktop, tablet, mobile
- [ ] Performance targets met (check with browser DevTools)

---

## Debugging Tips

### Issue: Leaderboard not updating when league selected

**Check**:
1. Verify `selectedLeagueId` state is updating (React DevTools)
2. Check TanStack Query DevTools to see if query key changed
3. Verify API endpoint returns data for selected league ID
4. Check browser console for errors

### Issue: Incorrect ranking order

**Check**:
1. Log sorted entries before rank assignment
2. Verify comparator function returns correct values (-1, 0, 1)
3. Check tie-breaking order matches FR-012/FR-013
4. Test with minimal dataset (2-3 players) to isolate issue

### Issue: Opponent stats showing NaN

**Check**:
1. Verify opponent IDs are being collected correctly
2. Check that opponent stats exist in stats map
3. Ensure average calculation handles empty arrays
4. Log intermediate values in calculation pipeline

---

## Next Steps After Implementation

1. **Run `/speckit.tasks`** to generate actionable task breakdown
2. **Create pull request** following Git Safety Protocol (see constitution)
3. **Request code review** from team member
4. **Address review feedback**
5. **Merge to main** after approval and passing CI/CD checks

---

**Estimated Total Time**: 8-12 hours spread across 1.5-2 days, depending on familiarity with codebase and testing thoroughness.

Good luck! 🚀
