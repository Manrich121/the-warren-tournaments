# Research: Configure League Scoring System

**Date**: 2026-01-18  
**Feature**: Configure League Scoring System  
**Branch**: `005-league-scoring`

## Overview

This document captures research decisions and best practices for implementing the Configure League Scoring System feature in a Next.js + TypeScript + Prisma application.

## Technology Stack Decisions

### 1. UI Component Pattern

**Decision**: Use shadcn/ui Dialog component with Radix UI primitives for the scoring system form modal

**Rationale**:
- Project already uses @radix-ui/react-dialog (v1.1.15)
- Consistent with existing UI patterns in `src/components/ui/`
- Provides accessible, keyboard-navigable modals
- Works well with react-hook-form for form state management

**Implementation Pattern**:
```typescript
// Pattern from existing codebase
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
```

### 2. Form State Management

**Decision**: Use react-hook-form (v7.63.0) with Zod (v4.1.11) for validation

**Rationale**:
- Already installed as project dependencies
- Aligns with Constitution requirement (Section V: User Experience Consistency)
- Type-safe form validation
- Excellent performance with controlled components
- Integrates seamlessly with shadcn/ui components

**Validation Schema Pattern**:
```typescript
import { z } from "zod"

const scoringSystemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  formulas: z.array(z.object({
    multiplier: z.number().int(),
    pointMetric: z.enum(["EVENT_ATTENDANCE", "MATCH_WINS", "GAME_WINS", "FIRST_PLACE", "SECOND_PLACE", "THIRD_PLACE"])
  })).min(1, "At least one formula required").max(10, "Maximum 10 formulas allowed"),
  tieBreakers: z.array(z.object({
    type: z.enum(["LEAGUE_POINTS", "MATCH_POINTS", "OPP_MATCH_WIN_PCT", "GAME_WIN_PCT", "OPP_GAME_WIN_PCT", "EVENT_ATTENDANCE", "MATCH_WINS"]),
    order: z.number().int().positive()
  })).max(7, "Maximum 7 tie-breakers allowed")
})
```

### 3. Tab Navigation Pattern

**Decision**: Use Radix UI Tabs with client-side routing state

**Rationale**:
- Scoring Systems will be displayed in a tab on `/leagues` page
- No dedicated route needed (per requirements)
- Tabs component already available: @radix-ui/react-tabs (can be added via shadcn/ui)
- Maintains URL state for better UX

**Implementation**:
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// On /leagues page:
<Tabs defaultValue="leagues">
  <TabsList>
    <TabsTrigger value="leagues">Leagues</TabsTrigger>
    <TabsTrigger value="scoring-systems">Scoring Systems</TabsTrigger>
  </TabsList>
  <TabsContent value="leagues">...</TabsContent>
  <TabsContent value="scoring-systems">...</TabsContent>
</Tabs>
```

### 4. Data Table Pattern

**Decision**: Use TanStack Table (v8.21.3) for Scoring Systems table

**Rationale**:
- Already installed (@tanstack/react-table v8.21.3)
- Provides sorting, filtering, pagination out of the box
- Type-safe column definitions
- Consistent with modern React data table patterns

**Reference Pattern**:
```typescript
// Follow pattern from existing table.ts types
import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table"
```

### 5. Server Actions vs API Routes

**Decision**: Use Next.js App Router API routes for all CRUD operations

**Rationale**:
- Existing codebase uses API routes pattern (see `src/app/api/*`)
- Clear separation of concerns
- Easy to add authentication middleware
- RESTful endpoints align with Constitution (Section VIII: API Design)
- Better for caching and revalidation strategies

**API Structure**:
```
src/app/api/scoring-systems/
├── route.ts              # GET (list), POST (create)
├── [id]/
│   └── route.ts          # GET (single), PATCH (update), DELETE
└── default/
    └── route.ts          # GET (retrieve default system)
```

### 6. Database Enum Strategy

**Decision**: Use Prisma enums for PointMetric and TieBreakerType

**Rationale**:
- Type-safe at database and TypeScript level
- Better query performance than string comparison
- Enforces valid values at DB level
- Aligns with existing Prisma usage pattern

**Schema Pattern**:
```prisma
enum PointMetricType {
  EVENT_ATTENDANCE
  MATCH_WINS
  GAME_WINS
  FIRST_PLACE
  SECOND_PLACE
  THIRD_PLACE
}

enum TieBreakerType {
  LEAGUE_POINTS
  MATCH_POINTS
  OPP_MATCH_WIN_PCT
  GAME_WIN_PCT
  OPP_GAME_WIN_PCT
  EVENT_ATTENDANCE_TIE
  MATCH_WINS_TIE
}
```

### 7. Default Scoring System Implementation

**Decision**: Seed default scoring system via Prisma seed script

**Rationale**:
- Ensures default system always exists
- Simplifies league creation logic
- Follows Prisma best practices
- Can be version controlled

**Implementation**:
```typescript
// prisma/seed.ts
const defaultScoringSystem = await prisma.scoringSystem.upsert({
  where: { name: "Default System" },
  update: {},
  create: {
    name: "Default System",
    isDefault: true,
    formulas: {
      create: [
        { multiplier: 1, pointMetric: "EVENT_ATTENDANCE", order: 1 },
        { multiplier: 3, pointMetric: "FIRST_PLACE", order: 2 },
        { multiplier: 2, pointMetric: "SECOND_PLACE", order: 3 },
        { multiplier: 1, pointMetric: "THIRD_PLACE", order: 4 }
      ]
    },
    tieBreakers: {
      create: [
        { type: "LEAGUE_POINTS", order: 1 },
        { type: "MATCH_POINTS", order: 2 },
        { type: "OPP_MATCH_WIN_PCT", order: 3 },
        { type: "GAME_WIN_PCT", order: 4 },
        { type: "OPP_GAME_WIN_PCT", order: 5 }
      ]
    }
  }
})
```

## Best Practices Applied

### 1. TypeScript Strict Mode

- All code will use strict TypeScript typing
- No `any` types except where absolutely necessary (e.g., dynamic form fields)
- Prisma types will be imported and extended as needed

### 2. Component Composition

- Split scoring system form into smaller sub-components:
  - `ScoringSystemDialog` - Main dialog wrapper
  - `FormulaList` - Manages formula array
  - `FormulaCard` - Individual formula input
  - `TieBreakerList` - Manages tie-breaker array
  - `TieBreakerCard` - Individual tie-breaker dropdown

### 3. Error Handling

- API routes will return consistent error structures:
```typescript
type ApiError = {
  error: string
  details?: Record<string, unknown>
}

type ApiSuccess<T> = {
  data: T
  message?: string
}
```

### 4. Optimistic UI Updates

- Use TanStack Query (v5.90.2) for data fetching and mutation
- Implement optimistic updates for better UX
- Rollback on failure with toast notifications

### 5. Accessibility

- Follow WCAG 2.1 AA standards (Constitution Section V)
- Proper ARIA labels for all interactive elements
- Keyboard navigation for formula/tie-breaker reordering
- Focus management in dialog

### 6. Testing Strategy

- Unit tests for utility functions (calculateLeaguePoints, applyTieBreakers)
- Component tests for form validation
- Integration tests for API routes
- Mock Prisma client for tests

## Performance Considerations

### 1. Query Optimization

**Challenge**: Calculating league points and rankings for 100+ players

**Solution**:
- Use Prisma's aggregation features
- Implement caching strategy using Next.js revalidation
- Consider computed columns for frequently accessed metrics

**Implementation**:
```typescript
// Efficient query pattern
const leaderboard = await prisma.player.findMany({
  where: { events: { some: { leagueId } } },
  select: {
    id: true,
    name: true,
    events: {
      where: { leagueId },
      select: {
        // Only select needed fields
      }
    },
    matchesAsPlayer1: {
      where: { event: { leagueId } },
      select: { /* minimal fields */ }
    }
  }
})
```

### 2. Client-Side Rendering

**Decision**: Use client components for interactive UI, server components for data fetching

**Pattern**:
```typescript
// Server Component (page.tsx)
export default async function LeaguesPage() {
  const scoringSystems = await fetchScoringSystems() // Server-side fetch
  return <LeaguesClient initialData={scoringSystems} />
}

// Client Component
'use client'
export function LeaguesClient({ initialData }: Props) {
  const { data } = useQuery({
    queryKey: ['scoring-systems'],
    queryFn: fetchScoringSystems,
    initialData
  })
  // ... interactive UI
}
```

## Integration Points

### 1. League Creation/Edit Forms

**Integration**: Add scoring system selector to existing league forms

**Location**: Modify `src/app/leagues/page.tsx` (or wherever league forms exist)

**Implementation**:
```typescript
<Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
  <SelectTrigger>
    <SelectValue placeholder="Select scoring system" />
  </SelectTrigger>
  <SelectContent>
    {scoringSystems.map((system) => (
      <SelectItem key={system.id} value={system.id}>
        {system.name} {system.isDefault && "(Default)"}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 2. Leaderboard Calculation

**Integration**: Modify existing leaderboard API route

**Location**: `src/app/api/leagues/[id]/leaderboard/route.ts`

**Changes Needed**:
- Fetch league's associated scoring system
- Apply formulas to calculate points
- Apply tie-breakers for ranking
- Handle shared ranks

## Alternatives Considered

### 1. Drag-and-Drop for Reordering

**Rejected**: Use numbered list with add/remove buttons instead

**Reasoning**:
- Simpler implementation
- Better accessibility
- Wireframe shows numbered approach
- Mobile-friendly

### 2. Inline Editing in Table

**Rejected**: Use dialog modal for create/edit

**Reasoning**:
- Wireframe specifies dialog approach
- Better for complex forms with multiple arrays
- Clearer save/discard flow
- Less state management complexity

### 3. GraphQL Instead of REST

**Rejected**: Continue using REST API routes

**Reasoning**:
- Existing codebase uses REST
- No GraphQL infrastructure in place
- REST is sufficient for CRUD operations
- Simpler authentication/authorization

## Risks and Mitigations

### Risk 1: Performance with 100+ Players

**Mitigation**:
- Implement caching with Next.js revalidation
- Use database indexes on foreign keys
- Consider background job for point calculation
- Add pagination to leaderboard if needed

### Risk 2: Complex Tie-Breaker Logic

**Mitigation**:
- Write comprehensive unit tests
- Document algorithm clearly
- Create helper utilities with clear interfaces
- Test with edge cases (all players tied)

### Risk 3: Concurrent Edits to Scoring System

**Mitigation**:
- Add version field to ScoringSystem model
- Implement optimistic locking
- Show warning if system is in use by leagues
- Consider "published" vs "draft" states

## Next Steps

This research phase is complete. Proceed to Phase 1: Data Model design.
