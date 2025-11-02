# Data Model: Fix League Dashboard and Leaderboard Display

**Date**: 2025-11-02
**Feature**: 003-fix-league-dashboard
**Phase**: 1 (Design & Contracts)

## Overview

This document defines the data structures, types, and relationships for the league dashboard fix. The feature primarily works with existing Prisma entities (League, Event, Match, Player) but introduces new TypeScript interfaces for leaderboard calculations and UI state management.

**Note**: No database schema changes are required. All new entities are TypeScript-only interfaces for client-side data transformation.

---

## Existing Prisma Entities (Reference)

These entities already exist in the database and are used by this feature:

### League
```prisma
model League {
  id        String      @id @default(cuid())
  name      String
  startDate DateTime
  endDate   DateTime
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  events    Event[]
  prizePool PrizePool[]
}
```

**Usage in Feature**:
- `endDate`: Primary sort key for determining most recent league
- `createdAt`: Tie-breaker when multiple leagues have same end date (FR-011)
- `startDate` & `endDate`: Determine if league is currently active (FR-008)
- `name`: Displayed in league selector with date range

### Event
```prisma
model Event {
  id           String   @id @default(cuid())
  leagueId     String
  name         String
  date         DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  league       League   @relation(fields: [leagueId], references: [id])
  matches      Match[]
  participants Player[] @relation("EventParticipants")
}
```

**Usage in Feature**:
- `leagueId`: Foreign key for filtering events by selected league
- Relationship to `matches`: Used for calculating league-specific match counts and player stats

### Match
```prisma
model Match {
  id           String   @id @default(cuid())
  eventId      String
  player1Id    String
  player2Id    String
  player1Score Int
  player2Score Int
  round        Int
  draw         Boolean
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  event        Event    @relation(fields: [eventId], references: [id])
  player1      Player   @relation("Player1", fields: [player1Id], references: [id])
  player2      Player   @relation("Player2", fields: [player2Id], references: [id])
}
```

**Usage in Feature**:
- `player1Score` & `player2Score`: Raw scores used for calculating game win rates
- `draw`: Indicates tied match (neither player gets a win)
- `eventId`: Links match to event (and transitively to league)
- Relationships to `player1` & `player2`: Used for player identification and opponent calculations

### Player
```prisma
model Player {
  id               String   @id @default(cuid())
  name             String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  matchesAsPlayer1 Match[]  @relation("Player1")
  matchesAsPlayer2 Match[]  @relation("Player2")
  events           Event[]  @relation("EventParticipants")
}
```

**Usage in Feature**:
- `name`: Displayed in leaderboard, used for alphabetical tie-breaking
- `id`: Primary key for aggregating player statistics
- Relationships: Used for collecting all matches a player participated in

---

## New TypeScript Interfaces

### LeaderboardEntry

Represents a single player's aggregated statistics and ranking within a specific league.

```typescript
interface LeaderboardEntry {
  /** Player unique identifier */
  playerId: string;

  /** Player display name (from Player entity) */
  playerName: string;

  /** Calculated rank position (1-indexed, shared ranks allowed) */
  rank: number;

  /** Total league points earned across all events in the league */
  leaguePoints: number;

  /** Number of matches won (draws excluded) */
  matchesWon: number;

  /** Total number of matches played (including draws) */
  matchesPlayed: number;

  /** Match win rate: matchesWon / matchesPlayed (0 if no matches) */
  matchWinRate: number;

  /** Total game points scored across all matches */
  gamePoints: number;

  /** Total game points possible (sum of both players' scores in all matches) */
  gamePossiblePoints: number;

  /** Game win rate: gamePoints / gamePossiblePoints (0 if no games) */
  gameWinRate: number;

  /** Average match win rate of all opponents faced */
  opponentsMatchWinRate: number;

  /** Average game win rate of all opponents faced */
  opponentsGameWinRate: number;
}
```

**Validation Rules**:
- `rank` ≥ 1
- `matchesWon` ≤ `matchesPlayed`
- `0 ≤ matchWinRate ≤ 1`
- `0 ≤ gameWinRate ≤ 1`
- `0 ≤ opponentsMatchWinRate ≤ 1`
- `0 ≤ opponentsGameWinRate ≤ 1`
- `gamePoints` ≤ `gamePossiblePoints`

**Sorting Order** (per FR-012, FR-013):
1. `leaguePoints` DESC
2. `matchWinRate` DESC
3. `opponentsMatchWinRate` DESC
4. `gameWinRate` DESC
5. `opponentsGameWinRate` DESC
6. `playerName` ASC (alphabetical tie-breaker)

**Edge Cases**:
- Players with 0 matches: All rates are 0, ranked last alphabetically
- Shared ranks: Multiple players with identical stats share the same rank number (e.g., two players tied at rank 3, next player is rank 5)

---

### LeagueWithDates

Extended league interface with formatted date strings for UI display.

```typescript
interface LeagueWithDates extends League {
  /** Formatted date range for display: "Jun 1 - Aug 31" */
  dateRangeDisplay: string;

  /** Calculated status: "Active" | "Upcoming" | "Past" */
  status: LeagueStatus;
}

type LeagueStatus = "Active" | "Upcoming" | "Past";
```

**Status Calculation**:
```typescript
function getLeagueStatus(league: League, now: Date = new Date()): LeagueStatus {
  const startDate = new Date(league.startDate);
  const endDate = new Date(league.endDate);

  if (startDate > now) return "Upcoming";
  if (startDate <= now && endDate >= now) return "Active";
  return "Past";
}
```

**Date Range Formatting**:
```typescript
function formatDateRange(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const end = endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  return `${start} - ${end}`;
}
// Example: "Jun 1 - Aug 31"
```

---

### LeagueStats

Aggregated statistics for a specific league, used by Quick Stats cards.

```typescript
interface LeagueStats {
  /** League identifier */
  leagueId: string;

  /** Number of events in this league */
  eventsCount: number;

  /** Number of matches across all events in this league */
  matchesCount: number;

  /** Number of unique players who participated in any match */
  playersCount: number;

  /** Prize pool amount for this league (from PrizePool entity) */
  prizePoolAmount: number;
}
```

**Calculation Method**:
```typescript
function calculateLeagueStats(
  leagueId: string,
  allEvents: Event[],
  allMatches: Match[],
  allPrizePools: PrizePool[]
): LeagueStats {
  const leagueEvents = allEvents.filter(e => e.leagueId === leagueId);
  const leagueMatches = allMatches.filter(m =>
    leagueEvents.some(e => e.id === m.eventId)
  );
  const uniquePlayerIds = new Set(
    leagueMatches.flatMap(m => [m.player1Id, m.player2Id])
  );
  const prizePool = allPrizePools.find(pp => pp.leagueId === leagueId);

  return {
    leagueId,
    eventsCount: leagueEvents.length,
    matchesCount: leagueMatches.length,
    playersCount: uniquePlayerIds.size,
    prizePoolAmount: prizePool?.amount ?? 0,
  };
}
```

---

### PlayerMatchData

Intermediate data structure for calculating leaderboard statistics (internal to leaderboard calculator).

```typescript
interface PlayerMatchData {
  playerId: string;
  playerName: string;
  matches: Array<{
    matchId: string;
    opponentId: string;
    isWin: boolean;
    isDraw: boolean;
    playerScore: number;
    opponentScore: number;
  }>;
}
```

**Purpose**: Aggregates all match data for a player before calculating derived statistics (win rates, opponent stats). Not exposed in API responses; used only in calculation pipeline.

---

## State Transitions

### League Selection Flow

```
[Initial Load]
    ↓
[Fetch Most Recent League] ──→ [Success] ──→ [Display Leaderboard + Stats]
    ↓                                              ↓
[404/Null] ──→ [Empty State]                 [User Selects League]
                                                   ↓
                                            [Fetch Selected League Leaderboard]
                                                   ↓
                                            [Update Leaderboard + Stats]
```

**State Variables**:
- `selectedLeagueId: string | null` - Currently selected league (null = no selection)
- `mostRecentLeague: League | null` - The league with latest end date
- `leaderboard: LeaderboardEntry[] | null` - Ranked players for selected league
- `stats: LeagueStats | null` - Aggregated stats for selected league

**Transition Rules**:
1. On initial page load: `selectedLeagueId` = `mostRecentLeague?.id`
2. When user selects league: `selectedLeagueId` = selected league ID
3. When "Most Recent" option selected: `selectedLeagueId` = `mostRecentLeague?.id`
4. Leaderboard and stats update reactively when `selectedLeagueId` changes

---

## Data Relationships

```
┌─────────────────┐
│     League      │ 1 ─────── * ┌─────────────┐
│  (Prisma DB)    │             │    Event    │ 1 ─────── * ┌────────────┐
└─────────────────┘             │ (Prisma DB) │             │   Match    │
        │                       └─────────────┘             │(Prisma DB) │
        │                                                    └────────────┘
        │                                                          │ *
        │                                                          │
        │                                                          │
        ↓                                                          ↓ *
┌──────────────────┐                                      ┌─────────────┐
│LeagueWithDates   │                                      │   Player    │
│ (TypeScript)     │                                      │ (Prisma DB) │
└──────────────────┘                                      └─────────────┘
        │                                                          │
        │                                                          │
        ↓ selection                                               ↓ aggregation
┌──────────────────┐                                      ┌──────────────────┐
│  LeagueStats     │                                      │LeaderboardEntry  │
│ (TypeScript)     │                                      │  (TypeScript)    │
└──────────────────┘                                      └──────────────────┘
```

**Key Relationships**:
1. `League` → `Event` → `Match` (Prisma foreign keys)
2. `League` → `LeagueWithDates` (derived, adds UI formatting)
3. `League` + `Event` + `Match` → `LeagueStats` (aggregation)
4. `Match` + `Player` → `PlayerMatchData` → `LeaderboardEntry` (multi-step aggregation and ranking)

---

## Constraints and Invariants

### Data Integrity

1. **Most Recent League**:
   - Invariant: There is always 0 or 1 "most recent" league (deterministic)
   - Constraint: If two leagues have same `endDate`, the one with most recent `createdAt` wins

2. **Leaderboard Ranking**:
   - Invariant: Ranks are sequential starting from 1, with possible gaps for shared ranks
   - Constraint: Two players have same rank IFF all 5 comparison criteria are equal

3. **Stats Consistency**:
   - Invariant: `LeagueStats` for a league must match the actual count of events/matches/players
   - Constraint: Stats calculated from filtered data must align with selected `leagueId`

### Performance Constraints

1. **Leaderboard Calculation**:
   - Must complete within 200ms for up to 100 players
   - Complexity: O(P log P) where P = number of players (due to sorting)

2. **Stats Aggregation**:
   - Must complete within 50ms for up to 1000 matches
   - Complexity: O(M + E) where M = matches, E = events

---

## Validation Rules

### Input Validation (API Endpoints)

```typescript
// GET /api/leagues/[id]/leaderboard - Path parameter validation
const LeagueIdSchema = z.string().cuid();

// League ID must be valid CUID format
// Return 400 Bad Request if invalid
// Return 404 Not Found if league doesn't exist
```

### Output Validation (Leaderboard Calculation)

```typescript
const LeaderboardEntrySchema = z.object({
  playerId: z.string().cuid(),
  playerName: z.string().min(1),
  rank: z.number().int().min(1),
  leaguePoints: z.number().int().min(0),
  matchesWon: z.number().int().min(0),
  matchesPlayed: z.number().int().min(0),
  matchWinRate: z.number().min(0).max(1),
  gamePoints: z.number().int().min(0),
  gamePossiblePoints: z.number().int().min(0),
  gameWinRate: z.number().min(0).max(1),
  opponentsMatchWinRate: z.number().min(0).max(1),
  opponentsGameWinRate: z.number().min(0).max(1),
}).refine(
  (data) => data.matchesWon <= data.matchesPlayed,
  "matchesWon cannot exceed matchesPlayed"
).refine(
  (data) => data.gamePoints <= data.gamePossiblePoints,
  "gamePoints cannot exceed gamePossiblePoints"
);
```

---

## Summary

| Entity | Type | Purpose | Persistence |
|--------|------|---------|-------------|
| `League` | Prisma Model | Core league data | PostgreSQL (existing) |
| `Event` | Prisma Model | Events within leagues | PostgreSQL (existing) |
| `Match` | Prisma Model | Match records | PostgreSQL (existing) |
| `Player` | Prisma Model | Player records | PostgreSQL (existing) |
| `LeaderboardEntry` | TypeScript Interface | Ranked player stats for a league | Computed (ephemeral) |
| `LeagueWithDates` | TypeScript Interface | League with formatted dates | Computed (ephemeral) |
| `LeagueStats` | TypeScript Interface | Aggregated league statistics | Computed (ephemeral) |
| `PlayerMatchData` | TypeScript Interface | Intermediate calculation data | Computed (internal only) |

**No database migrations required**. All new data structures are TypeScript-only interfaces for client-side and API response formatting.

---

**Next**: Proceed to generate API contracts in `contracts/` directory.
