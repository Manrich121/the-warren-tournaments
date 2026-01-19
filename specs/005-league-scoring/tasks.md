---
description: "Task list for Configure League Scoring System implementation"
---

# Tasks: Configure League Scoring System

**Input**: Design documents from `/specs/005-league-scoring/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-spec.md
**Branch**: `005-league-scoring`

**Tests**: Tests are OPTIONAL per project guidelines. This implementation does NOT include explicit test tasks unless requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, etc.)
- Exact file paths included in descriptions

## Path Conventions

Project structure per plan.md:
- Source: `src/`
- API routes: `src/app/api/`
- Components: `src/components/`
- Types: `src/types/`
- Database: `prisma/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema, types, and core infrastructure

- [X] T001 Update Prisma schema with PointMetricType and TieBreakerType enums in prisma/schema.prisma
- [X] T002 Add ScoringSystem model with relations to ScoreFormula, TieBreaker, and League in prisma/schema.prisma
- [X] T003 Add ScoreFormula model with scoringSystemId foreign key in prisma/schema.prisma
- [X] T004 Add TieBreaker model with unique constraint on (scoringSystemId, order) in prisma/schema.prisma
- [X] T005 Modify League model to add optional scoringSystemId field in prisma/schema.prisma
- [X] T006 Run Prisma format and validate schema
- [X] T007 Create migration with `pnpx prisma migrate dev --name add_scoring_system`
- [X] T008 [P] Create TypeScript domain types in src/types/scoring-system.ts (ScoringSystemWithRelations, ScoringSystemSummary, ScoreFormula, TieBreaker, ScoringSystemFormData, PlayerWithPoints)
- [X] T009 [P] Create display label maps in src/lib/constants/scoring-labels.ts (POINT_METRIC_LABELS, TIE_BREAKER_LABELS, options arrays)
- [X] T010 Create Zod validation schemas in src/lib/validations/scoring-system.ts (formulaSchema, tieBreakerSchema, createScoringSystemSchema, updateScoringSystemSchema)
- [X] T011 Update seed script in prisma/seed.ts to create default scoring system with specified formulas and tie-breakers
- [X] T012 Run seed script with `pnpx prisma db seed`
- [X] T013 Generate Prisma client with `pnpm run db:generate`
- [X] T014 Add shadcn/ui Tabs component with `pnpx shadcn@latest add tabs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API infrastructure and utilities needed by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T015 [P] Create TanStack Query hooks skeleton in src/lib/hooks/use-scoring-systems.ts (useScoringSystems, useCreateScoringSystem, useUpdateScoringSystem, useDeleteScoringSystem)
- [X] T016 [P] Create point calculation utility function in src/lib/utils/calculate-points.ts
- [X] T017 [P] Create tie-breaker ranking utility function in src/lib/utils/apply-tie-breakers.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create New Scoring System (Priority: P1) 🎯 MVP

**Goal**: Allow admin users to create new scoring systems with formulas (point calculation rules)

**Independent Test**: Create a scoring system with name "Test System" and multiple formulas (e.g., "1 x Event Attendance", "3 x 1st in Event"), save it, then verify it appears in the scoring systems list and persists in the database.

### Implementation for User Story 1

- [X] T018 [US1] Implement POST /api/scoring-systems route in src/app/api/scoring-systems/route.ts (create scoring system with validation, uniqueness check, formula creation)
- [X] T019 [US1] Implement GET /api/scoring-systems route in src/app/api/scoring-systems/route.ts (list all systems with summary data)
- [X] T020 [US1] Implement useScoringSystems hook in src/lib/hooks/use-scoring-systems.ts (fetch list of scoring systems)
- [X] T021 [US1] Implement useCreateScoringSystem hook in src/lib/hooks/use-scoring-systems.ts (mutation for creating systems)
- [X] T022 [P] [US1] Create FormulaCard component in src/components/scoring-system/formula-card.tsx (single formula input with multiplier number input, point metric dropdown, and remove button)
- [X] T023 [P] [US1] Create FormulaList component in src/components/scoring-system/formula-list.tsx (manages formula array with Add button, renders FormulaCard components)
- [X] T024 [US1] Create ScoringSystemDialog component in src/components/scoring-system/scoring-system-dialog.tsx (Dialog with react-hook-form, name input, FormulaList integration, Save/Discard buttons)
- [X] T025 [US1] Create ScoringSystemTable component in src/components/scoring-system/scoring-system-table.tsx (TanStack Table displaying system name, formula count, league count, default flag, created date, actions)
- [X] T026 [US1] Add Tabs to leagues page in src/app/leagues/page.tsx (two tabs: "Leagues" and "Scoring Systems", integrate ScoringSystemTable in second tab)
- [X] T027 [US1] Add validation and error handling for name uniqueness (FR-017), minimum one formula (FR-018), and maximum limits

**Checkpoint**: At this point, User Story 1 should be fully functional - admin can create scoring systems with formulas and see them listed

---

## Phase 4: User Story 2 - Configure Tie-Breakers (Priority: P2)

**Goal**: Allow admin users to configure ordered tie-breaker lists for ranking players with equal points

**Independent Test**: Edit an existing scoring system, add tie-breakers in specific order (e.g., "1. League Points", "2. Event Attendance", "3. Match Points"), save, reload, and verify order is preserved.

### Implementation for User Story 2

- [X] T028 [P] [US2] Create TieBreakerCard component in src/components/scoring-system/TieBreakerCard.tsx (dropdown for tie-breaker type with numbering display and remove button)
- [X] T029 [P] [US2] Create TieBreakerList component in src/components/scoring-system/TieBreakerList.tsx (manages tie-breaker array with Add button, auto-numbering, renders TieBreakerCard components)
- [X] T030 [US2] Integrate TieBreakerList into ScoringSystemDialog component in src/components/scoring-system/ScoringSystemDialog.tsx (add below FormulaList section)
- [X] T031 [US2] Update POST route in src/app/api/scoring-systems/route.ts to handle tie-breaker creation with order validation
- [X] T032 [US2] Update GET routes to include tie-breakers ordered by order field
- [X] T033 [US2] Add validation for maximum 7 tie-breakers and unique order values within system
- [X] T034 [US2] Implement automatic renumbering when tie-breakers are removed

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - systems can be created with formulas and tie-breakers

---

## Phase 5: User Story 3 - Edit Existing Scoring System (Priority: P3)

**Goal**: Allow admin users to modify existing scoring systems by changing formulas, tie-breakers, or name

**Independent Test**: Load an existing scoring system into edit mode, change a formula multiplier, add/remove tie-breakers, change name, save, and verify all changes persist correctly.

### Implementation for User Story 3

- [X] T035 [US3] Implement GET /api/scoring-systems/[id] route in src/app/api/scoring-systems/[id]/route.ts (fetch single system with all relations)
- [X] T036 [US3] Implement PATCH /api/scoring-systems/[id] route in src/app/api/scoring-systems/[id]/route.ts (update system, replace formulas and tie-breakers)
- [X] T037 [US3] Implement DELETE /api/scoring-systems/[id] route in src/app/api/scoring-systems/[id]/route.ts (delete with league association check, prevent default deletion)
- [X] T038 [US3] Implement useUpdateScoringSystem hook in src/hooks/scoring-systems/useUpdateScoringSystem.ts (mutation for updating)
- [X] T039 [US3] Implement useDeleteScoringSystem hook in src/hooks/scoring-systems/useDeleteScoringSystem.ts (mutation for deletion with error handling)
- [X] T040 [US3] Add edit mode to ScoringSystemDialog in src/components/scoring-system/ScoringSystemDialog.tsx (load existing data, populate form fields, update title and button text)
- [X] T041 [US3] Add Edit and Delete action buttons to ScoringSystemTable in src/components/scoring-system/ScoringSystemTable.tsx
- [X] T042 [US3] Implement delete confirmation dialog with league association error display
- [X] T043 [US3] Add validation for name uniqueness excluding current system ID during updates

**Checkpoint**: All CRUD operations for scoring systems should now be functional

---

## Phase 6: User Story 4 - Associate Scoring System with League (Priority: P2)

**Goal**: Allow admin users to select a scoring system when creating or editing leagues, with automatic default fallback

**Independent Test**: Create a new league, select a scoring system from dropdown, save, view league details, and verify the selected scoring system is associated. Create another league without selecting a system and verify default system is used.

### Implementation for User Story 4

- [X] T044 [US4] Implement GET /api/scoring-systems/default route in src/app/api/scoring-systems/default/route.ts (fetch default system)
- [X] T045 [US4] Locate and update League creation form (likely in src/app/leagues or src/components/leagues)
- [X] T046 [US4] Add scoring system Select field to league form using shadcn/ui Select component
- [X] T047 [US4] Integrate useScoringSystems hook to populate dropdown with available systems
- [X] T048 [US4] Add "Default" indicator next to default system name in dropdown
- [X] T049 [US4] Update league creation API route to accept scoringSystemId and set to default if null
- [X] T050 [US4] Update league edit form with same scoring system selection field
- [X] T051 [US4] Display associated scoring system name in league detail views

**Checkpoint**: Leagues can now be associated with scoring systems during creation and editing

---

## Phase 7: User Story 5 - Calculate Player Points Using Scoring System (Priority: P3)

**Goal**: Automatically calculate player league points by applying scoring system formulas to player performance data

**Independent Test**: Create test data (player with 2 event attendances, 1 match win, 1st place finish), associate league with scoring system "1 x Event Attendance, 3 x 1st in Event", calculate points, and verify player receives 5 points (2 + 3).

### Implementation for User Story 5

- [X] T052 [US5] Implement calculateLeaguePoints function in src/lib/utils/calculate-points.ts (takes player performance data, formulas, returns total points)
- [X] T053 [US5] Create utility to fetch player performance data (events attended, matches won, games won, placements)
- [X] T054 [US5] Locate or create league leaderboard API route (src/app/api/leagues/[id]/leaderboard/route.ts)
- [X] T055 [US5] Integrate calculateLeaguePoints into leaderboard generation (fetch league's scoring system, apply formulas to each player)
- [X] T056 [US5] Handle edge cases (missing data treated as zero, negative/zero multipliers)
- [X] T057 [US5] Add caching strategy for calculated points using Next.js revalidation
- [X] T058 [US5] Optimize query performance for 100+ players (meet SC-002: <2 seconds)

---

## Phase 8: User Story 6 - Rank Players Using Tie-Breakers (Priority: P3)

**Goal**: Rank players on leaderboards using configured tie-breakers when players have equal league points

**Independent Test**: Create test data with 2 players having identical league points but different event attendance. Configure tie-breakers with "Event Attendance" as first tie-breaker. Generate leaderboard and verify player with higher attendance ranks higher. Test shared rank scenario with all metrics equal.

### Implementation for User Story 6

- [ ] T059 [US6] Implement applyTieBreakers function in src/lib/utils/apply-tie-breakers.ts (takes players with equal points, tie-breaker order, returns ranked list)
- [ ] T060 [US6] Implement tie-breaker metric calculation functions (Opponent Match Win %, Game Win %, Opponent Game Win %)
- [ ] T061 [US6] Integrate applyTieBreakers into leaderboard generation (rank by points first, then apply tie-breakers for each tied group)
- [ ] T062 [US6] Implement shared rank logic (FR-016b: players tied on all metrics get same rank, subsequent ranks skip positions)
- [ ] T063 [US6] Handle missing tie-breaker data (FR-016a: treat as zero)
- [ ] T064 [US6] Update leaderboard display to show rank with proper handling of shared ranks
- [ ] T065 [US6] Ensure tie-breakers are applied in configured order from scoring system

**Checkpoint**: All user stories complete - full scoring system functionality operational

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T066 [P] Add loading states and error boundaries to all components
- [ ] T067 [P] Implement optimistic UI updates with TanStack Query for better UX
- [ ] T068 [P] Add toast notifications for all success/error states
- [ ] T069 [P] Verify accessibility (WCAG 2.1 AA) for all dialogs and forms
- [ ] T070 [P] Add keyboard navigation support for formula/tie-breaker lists
- [ ] T071 [P] Verify responsive design for mobile devices
- [ ] T072 Run ESLint with `pnpm run lint` and fix any issues
- [ ] T073 Run TypeScript type checking with `pnpx tsc --noEmit` and resolve errors
- [ ] T074 Build production bundle with `pnpm run build` and verify success
- [ ] T075 Validate against quickstart.md checklist
- [ ] T076 [P] Update project documentation in AGENTS.md with new technologies/patterns
- [ ] T077 Performance audit - verify SC-002 (100+ players in <2 seconds)
- [ ] T078 User experience validation - verify SC-001 (create system in <3 minutes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational (Phase 2) completion
  - User stories can proceed in parallel if staffed
  - Or sequentially in priority order: US1 → US2/US4 → US3/US5/US6
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 - Create Scoring System (P1)**: Can start after Foundational - No dependencies on other stories ✅ MVP
- **US2 - Configure Tie-Breakers (P2)**: Can start after Foundational - Extends US1 UI but independently testable
- **US3 - Edit Scoring System (P3)**: Requires US1 complete (needs systems to exist for editing)
- **US4 - Associate with League (P2)**: Requires US1 complete (needs systems to exist for selection)
- **US5 - Calculate Points (P3)**: Requires US1 and US4 complete (needs systems associated with leagues)
- **US6 - Rank with Tie-Breakers (P3)**: Requires US2 and US5 complete (needs tie-breakers and point calculation)

### Within Each User Story

- API routes before hooks
- Hooks before components that use them
- Child components (FormulaCard, TieBreakerCard) before parent components (FormulaList, TieBreakerList)
- Parent components before dialog integration
- Core functionality before error handling and optimization

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T008 (types) and T009 (labels) can run in parallel
- T008/T009/T010 (types/labels/validation) all in parallel after T007 (migration)

**Foundational Phase (Phase 2)**:
- T015, T016, T017 (all utilities) can run in parallel

**User Story 1 (Phase 3)**:
- T022 (FormulaCard) and T023 (FormulaList) in sequence but parallel to T020/T021 (hooks)
- After T018/T019 (API routes) complete → T020 and T021 (hooks) can run in parallel

**User Story 2 (Phase 4)**:
- T028 (TieBreakerCard) and T029 (TieBreakerList) can run in parallel

**Between User Stories**:
- US2 and US4 can run in parallel after US1
- US1, US2, and US4 can all be worked on by different developers simultaneously if staffed

---

## Parallel Example: User Story 1

```bash
# After T019 completes, launch hooks in parallel:
Task T020: "Implement useScoringSystems hook"
Task T021: "Implement useCreateScoringSystem hook"

# Launch component work in parallel (after planning):
Task T022: "Create FormulaCard component" 
# (T023 depends on T022, so sequential)

# Different developers can work simultaneously:
Developer A: T018-T021 (API + Hooks)
Developer B: T022-T024 (Components)
Developer C: T025 (Table)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T014)
2. Complete Phase 2: Foundational (T015-T017)
3. Complete Phase 3: User Story 1 (T018-T027)
4. **STOP and VALIDATE**: Test creating, viewing, and listing scoring systems
5. Ready for demo/feedback with core functionality

**Estimated Time**: 2-3 days for experienced developer

**Value Delivered**: Admin can create and manage scoring system formulas

### Incremental Delivery

1. **MVP (Phases 1-3)**: Create systems with formulas → Deploy
2. **+Tie-Breakers (Phase 4)**: Add tie-breaker configuration → Deploy
3. **+League Integration (Phase 6)**: Associate systems with leagues → Deploy
4. **+Edit (Phase 5)**: Enable editing existing systems → Deploy
5. **+Calculation (Phases 7-8)**: Automatic point and rank calculation → Deploy
6. Each increment adds value without breaking previous functionality

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

1. **Developer A**: US1 (Create) → US3 (Edit) → US5 (Calculate)
2. **Developer B**: US2 (Tie-breakers) → US6 (Ranking)
3. **Developer C**: US4 (League Association) → Integration testing

All stories integrate independently and can be tested in isolation.

---

## Task Summary

**Total Tasks**: 78
- Setup: 14 tasks
- Foundational: 3 tasks
- User Story 1: 10 tasks
- User Story 2: 7 tasks
- User Story 3: 9 tasks
- User Story 4: 8 tasks
- User Story 5: 7 tasks
- User Story 6: 7 tasks
- Polish: 13 tasks

**Parallelizable Tasks**: 18 marked with [P]

**Independent Test Criteria**:
- US1: Create and list systems
- US2: Configure and persist tie-breaker order
- US3: Edit and delete systems
- US4: Associate systems with leagues
- US5: Calculate points correctly
- US6: Rank with tie-breakers

**MVP Scope**: Phases 1-3 only (User Story 1) = 27 tasks

---

## Notes

- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] marker indicates parallelizable tasks (different files, no blocking dependencies)
- [Story] label (US1-US6) maps tasks to user stories from spec.md
- Each user story phase is independently completable and testable
- Tests are NOT included per project convention (can be added if requested)
- Commit after each task or logical group
- Run validation commands (lint, typecheck, build) at checkpoints
- Stop at any checkpoint to validate story independence
- File paths use project structure from plan.md (src/, components/, etc.)
