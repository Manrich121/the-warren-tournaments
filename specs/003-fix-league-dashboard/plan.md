# Implementation Plan: Fix League Dashboard and Leaderboard Display

**Branch**: `003-fix-league-dashboard` | **Date**: 2025-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-fix-league-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Replace the problematic "Active League" concept with a "Most Recent League" approach that displays the league with the latest end date (active or past) on the home page dashboard. Implement a league selector to allow users to switch between different league leaderboards, with accurate Quick Stats that update based on the selected league. The leaderboard will rank players by league points with cascading tie-breakers (match win rate → opponents' match win rate → game win rate → opponents' game win rate).

## Technical Context

**Language/Version**: TypeScript 5.9+ with Next.js 16.0.0 (App Router)
**Primary Dependencies**: React 19.2, @tanstack/react-query 5.90, Prisma 6.17, Next-Auth 5.0, Zod 4.1
**Storage**: PostgreSQL (via Prisma ORM) with existing League, Event, Match, Player schema
**Testing**: Jest 30.1 with React Testing Library 16.3, minimum 80% coverage for business logic
**Target Platform**: Web application (SSR + client-side) supporting desktop, tablet, mobile viewports
**Project Type**: Web (Next.js App Router monorepo)
**Performance Goals**: <2s initial leaderboard load, <1s league switch, <200ms API response
**Constraints**: Must not modify existing Prisma schema; graceful degradation when no leagues exist; UTC date handling
**Scale/Scope**: Handle hundreds of leagues with thousands of matches; complex leaderboard calculations with 4-level tie-breaking

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Technology Stack Compliance ✅
- **Frontend**: Next.js (React) with App Router - COMPLIANT
- **Backend**: Next.js API routes - COMPLIANT
- **Database**: PostgreSQL via Prisma - COMPLIANT
- **Styling**: Tailwind CSS (existing patterns) - COMPLIANT
- **Package Manager**: pnpm - COMPLIANT
- **TypeScript**: Strict mode enabled - COMPLIANT

### Component Architecture ✅
- Functional React components with hooks - COMPLIANT
- Single responsibility (LeagueSelector, Leaderboard, QuickStats) - COMPLIANT
- File structure: `src/components/` for shared components - COMPLIANT
- TypeScript interfaces for all props - COMPLIANT

### Code Quality ✅
- ESLint (next/core-web-vitals configuration) - COMPLIANT
- Prettier formatting - COMPLIANT
- Naming conventions: PascalCase components, camelCase functions - COMPLIANT
- JSDoc for complex leaderboard calculation logic - REQUIRED

### Testing ✅
- Jest + React Testing Library - COMPLIANT
- 80% coverage for leaderboard calculation logic - REQUIRED
- Component testing for LeagueSelector, QuickStats - REQUIRED
- Integration tests for league switching - REQUIRED

### UX Consistency ✅
- Tailwind CSS classes following design system - COMPLIANT
- Loading states for data fetching - REQUIRED
- Error states with actionable feedback - REQUIRED
- Responsive design (desktop/tablet/mobile) - COMPLIANT
- Accessibility (WCAG 2.1 AA): semantic HTML, keyboard nav - REQUIRED

### State Management ✅
- TanStack Query (React Query) for server state - COMPLIANT
- React useState/Context for client state (selected league) - COMPLIANT
- Minimize global state - COMPLIANT

### Database Management ✅
- No schema changes required - COMPLIANT
- All access via Prisma client - COMPLIANT
- Proper error handling - REQUIRED

### API Design ✅
- RESTful principles with proper HTTP status codes - REQUIRED
- Routes in `src/app/api/` (App Router) - COMPLIANT
- JSON responses with consistent error structure - REQUIRED
- Zod validation for inputs - REQUIRED

**Gate Status**: ✅ **PASS** - All constitutional requirements met. No violations to justify.

### Post-Design Re-evaluation ✅

After completing Phase 1 design (data-model.md, API contracts, quickstart.md):

- **No database schema changes**: ✅ COMPLIANT - All new entities are TypeScript-only interfaces
- **Prisma ORM usage**: ✅ COMPLIANT - All database access via Prisma client
- **API error handling**: ✅ COMPLIANT - Consistent error structure with Zod validation
- **Testing requirements**: ✅ COMPLIANT - 80%+ coverage planned for business logic, component tests, integration tests
- **TypeScript strict mode**: ✅ COMPLIANT - All new code uses strict TypeScript with proper interfaces
- **Code quality**: ✅ COMPLIANT - ESLint, Prettier, JSDoc for complex functions planned
- **Accessibility**: ✅ COMPLIANT - WCAG 2.1 AA compliance with keyboard nav, ARIA labels, semantic HTML
- **Performance targets**: ✅ COMPLIANT - <2s load, <1s switch, <200ms API response targets defined

**Final Gate Status**: ✅ **PASS** - Design maintains full constitutional compliance. Ready for implementation (Phase 2: Tasks).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                          # [MODIFY] Home/Dashboard page (main integration point)
│   └── api/
│       └── leagues/
│           ├── route.ts                  # [NEW] GET /api/leagues - List all leagues
│           ├── [id]/
│           │   └── leaderboard/
│           │       └── route.ts          # [NEW] GET /api/leagues/[id]/leaderboard
│           ├── most-recent/
│           │   └── route.ts              # [NEW] GET /api/leagues/most-recent
│           └── active/
│               └── route.ts              # [MODIFY] Return 200 with null or 404 (graceful handling)
├── components/
│   ├── LeagueSelector.tsx                # [NEW] Dropdown for selecting leagues
│   ├── Leaderboard.tsx                   # [EXISTS] May need modifications for tie-breaking
│   ├── QuickStats.tsx                    # [NEW] Stat cards component (extract from page.tsx)
│   └── ui/
│       └── select.tsx                    # [EXISTS] shadcn/ui select component
├── hooks/
│   ├── useLeagues.ts                     # [NEW] Fetch all leagues
│   ├── useMostRecentLeague.ts            # [NEW] Fetch most recent league
│   ├── useLeagueLeaderboard.ts           # [EXISTS] May need query config updates
│   ├── useActiveLeague.ts                # [MODIFY] Handle 404 gracefully, adjust staleTime
│   └── keys.ts                           # [MODIFY] Add new query keys
├── lib/
│   ├── leaderboard-calculator.ts         # [NEW] Calculate rankings with tie-breakers
│   ├── league-utils.ts                   # [NEW] Date comparison, tie-breaking logic
│   └── utils.ts                          # [EXISTS] Existing utilities
└── types/
    └── leaderboard.ts                    # [NEW] TypeScript interfaces for leaderboard data

__tests__/
├── lib/
│   ├── leaderboard-calculator.test.ts    # [NEW] Unit tests for ranking logic
│   └── league-utils.test.ts              # [NEW] Unit tests for date/tie-breaking
├── components/
│   ├── LeagueSelector.test.tsx           # [NEW] Component tests
│   └── QuickStats.test.tsx               # [NEW] Component tests
└── integration/
    └── league-switching.test.tsx         # [NEW] Integration test for switching leagues
```

**Structure Decision**: Next.js App Router web application. The codebase follows a standard Next.js monorepo pattern with `src/app/` for pages and API routes, `src/components/` for UI components, `src/hooks/` for data fetching, and `src/lib/` for business logic. Tests mirror the source structure in `__tests__/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations. All implementation patterns align with the project constitution.
