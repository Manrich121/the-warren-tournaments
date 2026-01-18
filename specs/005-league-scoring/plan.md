# Implementation Plan: Configure League Scoring System

**Branch**: `005-league-scoring` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-league-scoring/spec.md`

## Summary

Implement a Configure League Scoring System that allows admin users to define custom formulas for calculating player league points and configure tie-breakers for ranking players. The system uses a dialog-based UI with tab navigation on the `/leagues` page, backed by Prisma database models and Next.js API routes. Scoring systems consist of configurable formulas (multiplier × point metric) and ordered tie-breakers, with support for a default system and validation to prevent deletion of systems in use by leagues.

## Technical Context

**Language/Version**: TypeScript 5.9.2 / Next.js 16.0.0-beta.0 / React 19.2.0
**Primary Dependencies**: 
- Prisma 6.17.0 (ORM)
- react-hook-form 7.63.0 (Form management)
- Zod 4.1.11 (Validation)
- TanStack Table 8.21.3 (Data tables)
- TanStack Query 5.90.2 (Server state)
- Radix UI (Dialog, Select, Tabs components)
- Tailwind CSS 4.1.13 (Styling)
**Storage**: PostgreSQL (via Prisma)
**Testing**: Jest 30.1.3 + React Testing Library 16.3.0
**Target Platform**: Web application (Next.js App Router)
**Project Type**: Web application (full-stack)
**Performance Goals**: 
- Calculate points for 100+ players within 2 seconds (SC-002)
- Admin can create scoring system in <3 minutes (SC-001)
- Form interactions <100ms response time
**Constraints**: 
- Admin-only feature (requires authentication)
- Max 10 formulas per scoring system
- Max 7 tie-breakers per scoring system
- No duplicate point metrics in formulas
- Cannot delete scoring systems in use by leagues
**Scale/Scope**: 
- CRUD operations for scoring systems
- 3 new database models (ScoringSystem, ScoreFormula, TieBreaker)
- 2 new enums
- 6 React components
- 3 API route files
- Tab UI integration on existing /leagues page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Research)

✅ **Technology Stack** (Constitution I):
- Uses Next.js (React) for SPA ✓
- Uses Next.js API routes for backend ✓
- Uses PostgreSQL via Prisma ✓
- Uses Tailwind CSS for styling ✓
- Uses pnpm for package management ✓
- All code in TypeScript with strict mode ✓

✅ **Component-Based Architecture** (Constitution II):
- Functional components with hooks ✓
- Clear single responsibility per component ✓
- File structure follows `src/components/` pattern ✓
- Props typed with TypeScript interfaces ✓

✅ **Code Quality Standards** (Constitution III):
- ESLint with next/core-web-vitals ✓
- Prettier configured ✓
- TypeScript strict mode enabled ✓
- Naming conventions: PascalCase for components, camelCase for functions ✓

✅ **Testing Standards** (Constitution IV):
- Jest + React Testing Library available ✓
- Plan includes unit, component, and integration tests ✓

✅ **User Experience Consistency** (Constitution V):
- Tailwind CSS for consistent design ✓
- Forms use react-hook-form + Zod ✓
- Loading/error states planned ✓
- Accessibility considerations (WCAG 2.1 AA) ✓

✅ **State Management** (Constitution VI):
- Client state: React Context + local state ✓
- Server state: TanStack Query ✓

✅ **Database Management** (Constitution VII):
- Prisma Migrate for schema changes ✓
- All access through Prisma client ✓
- Proper error handling planned ✓

✅ **API Design** (Constitution VIII):
- RESTful principles ✓
- Routes in `src/app/api/` ✓
- JSON responses ✓
- Zod validation ✓
- Authentication checks planned ✓

**Result**: ✅ All constitution requirements met. Proceed with implementation.

### Post-Design Check
*To be completed after Phase 1 (Design & Contracts)*

- [ ] Data model aligns with Prisma best practices
- [ ] API contracts follow RESTful conventions
- [ ] Component structure maintains single responsibility
- [ ] All validation schemas use Zod
- [ ] TypeScript types properly exported and reused

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
│   ├── api/
│   │   └── scoring-systems/
│   │       ├── route.ts                 # GET (list), POST (create)
│   │       ├── [id]/
│   │       │   └── route.ts             # GET, PATCH, DELETE
│   │       └── default/
│   │           └── route.ts             # GET default system
│   └── leagues/
│       └── page.tsx                     # Modified: add tabs
│
├── components/
│   ├── scoring-system/                  # NEW
│   │   ├── scoring-system-dialog.tsx    # Main create/edit dialog
│   │   ├── scoring-system-table.tsx     # TanStack Table
│   │   ├── formula-list.tsx             # Formula array manager
│   │   ├── formula-card.tsx             # Single formula input
│   │   ├── tie-breaker-list.tsx         # Tie-breaker array manager
│   │   └── tie-breaker-card.tsx         # Single tie-breaker input
│   └── ui/                              # Existing shadcn/ui components
│       ├── dialog.tsx
│       ├── select.tsx
│       ├── tabs.tsx                     # NEW (add via shadcn)
│       └── ...
│
├── lib/
│   ├── constants/
│   │   └── scoring-labels.ts            # NEW: Display label maps
│   ├── hooks/
│   │   └── use-scoring-systems.ts       # NEW: TanStack Query hooks
│   ├── utils/
│   │   ├── calculate-points.ts          # NEW: Point calculation logic
│   │   └── apply-tie-breakers.ts        # NEW: Ranking logic
│   └── validations/
│       └── scoring-system.ts            # NEW: Zod schemas
│
├── types/
│   └── scoring-system.ts                # NEW: TypeScript types
│
└── prisma.ts                            # Existing Prisma client

prisma/
├── schema.prisma                        # MODIFIED: Add new models/enums
├── migrations/
│   └── XXX_add_scoring_system/          # NEW migration
└── seed.ts                              # MODIFIED: Add default system

__tests__/                               # NEW tests
├── lib/
│   ├── validations/
│   │   └── scoring-system.test.ts
│   └── utils/
│       ├── calculate-points.test.ts
│       └── apply-tie-breakers.test.ts
├── components/
│   └── scoring-system/
│       ├── scoring-system-dialog.test.tsx
│       └── formula-list.test.tsx
└── app/
    └── api/
        └── scoring-systems/
            └── route.test.ts
```

**Structure Decision**: Web application using Next.js App Router pattern. All API routes in `src/app/api/`, components in `src/components/`, with proper separation of concerns. Database schema managed by Prisma, with types generated from schema and extended in `src/types/`.

## Implementation Artifacts

### Phase 0: Research (Completed)
- ✅ **research.md**: Technology stack decisions, best practices, alternatives considered

### Phase 1: Design & Contracts (Completed)
- ✅ **data-model.md**: Prisma schema, TypeScript types, validation schemas
- ✅ **contracts/api-spec.md**: REST API endpoints, request/response formats
- ✅ **quickstart.md**: Step-by-step implementation guide

### Phase 2: Task Breakdown (Next)
- ⏳ **tasks.md**: Detailed implementation tasks (created by `/speckit.tasks` command)

## Next Steps

1. **Review Planning Artifacts**: 
   - Read `research.md` for technical decisions
   - Review `data-model.md` for database schema
   - Check `contracts/api-spec.md` for API specifications
   - Follow `quickstart.md` for implementation order

2. **Run `/speckit.tasks`**: Generate detailed task breakdown for implementation

3. **Begin Implementation**: Follow task order in `tasks.md`

4. **Update Agent Context**: Run `.specify/scripts/bash/update-agent-context.sh` to add new technologies to AGENTS.md

---

**Planning Phase Complete** ✅

**Branch**: `005-league-scoring`  
**Spec File**: `specs/005-league-scoring/spec.md`  
**Plan File**: `specs/005-league-scoring/plan.md`  
**Next Command**: `/speckit.tasks`
