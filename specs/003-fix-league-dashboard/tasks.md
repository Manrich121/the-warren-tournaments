# Tasks: Fix League Dashboard and Leaderboard Display

**Input**: Design documents from `/specs/003-fix-league-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included (required per constitution - 80% coverage for business logic, component tests, integration tests)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router structure: `src/app/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/types/`
- Tests: `__tests__/` mirroring source structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and TypeScript type definitions

- [x] T001 [P] Create TypeScript interfaces for leaderboard data in src/types/leaderboard.ts
- [x] T002 [P] Add new TanStack Query keys to src/hooks/keys.ts (mostRecentLeague, leaderboard)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core business logic and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create league utility functions in src/lib/league-utils.ts (getMostRecentLeague, getLeagueStatus, formatDateRange)
- [x] T004 Create leaderboard calculation logic in src/lib/leaderboard-calculator.ts (calculateLeaderboardRankings with 4-level tie-breaking)
- [x] T005 [P] Write unit tests for league-utils.ts in __tests__/lib/league-utils.test.ts (date comparison, tie-breaking, status calculation)
- [x] T006 [P] Write unit tests for leaderboard-calculator.ts in __tests__/lib/leaderboard-calculator.test.ts (ranking, all tie-breaker levels, shared ranks, edge cases)
- [x] T007 Create GET /api/leagues endpoint in src/app/api/leagues/route.ts (list all leagues ordered by endDate DESC, createdAt DESC)
- [x] T008 [P] Create GET /api/leagues/most-recent endpoint in src/app/api/leagues/most-recent/route.ts (return most recent league or null)
- [x] T009 [P] Modify GET /api/leagues/active endpoint in src/app/api/leagues/active/route.ts (graceful 404 handling with error object, 5-minute staleTime)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Most Recent League Leaderboard (Priority: P1) 🎯 MVP

**Goal**: Users visit the home page and see the leaderboard for the most recent league (active or past) with accurate rankings

**Independent Test**: Visit home page → Verify leaderboard displays players from most recent league → Verify rankings follow league points + tie-breakers → Verify empty state when no leagues exist

### API Implementation for User Story 1

- [x] T010 [US1] Create GET /api/leagues/[id]/leaderboard endpoint in src/app/api/leagues/[id]/leaderboard/route.ts (validate leagueId with Zod, fetch events/matches, call calculateLeaderboardRankings, return ranked list or empty array)

### Data Fetching Hooks for User Story 1

- [x] T011 [P] [US1] Create useMostRecentLeague hook in src/hooks/useMostRecentLeague.ts (fetch most recent league, 30-second staleTime)
- [x] T012 [P] [US1] Modify useActiveLeague hook in src/hooks/useActiveLeague.ts (handle 404 gracefully return null, 5-minute staleTime per user input)
- [x] T013 [P] [US1] Create or modify useLeagueLeaderboard hook in src/hooks/useLeagueLeaderboard.ts (fetch leaderboard for league ID, 1-minute staleTime)

### UI Components for User Story 1

- [x] T014 [US1] Modify Leaderboard component in src/components/Leaderboard.tsx (display ranked players with league points and win rates, handle empty state with "No matches played in this league yet" message, responsive table layout)
- [x] T015 [US1] Integrate most recent league leaderboard into home page in src/app/page.tsx (fetch most recent league on load, display leaderboard, handle loading/error states, graceful degradation when no leagues exist)

### Tests for User Story 1

- [x] T016 [P] [US1] Write unit tests for leaderboard ranking edge cases in __tests__/lib/leaderboard-calculator.test.ts (0 matches, identical stats, alphabetical tie-breaker, verify 100% coverage)
- [x] T017 [P] [US1] Write component test for Leaderboard in __tests__/components/Leaderboard.test.tsx (rendering with data, empty state, loading state)

**Checkpoint**: User Story 1 is fully functional - users can see most recent league leaderboard on home page with correct rankings

---

## Phase 4: User Story 2 - View Quick Stats for Current/Recent League (Priority: P1)

**Goal**: Users see accurate Quick Stats cards (Total Leagues, Total Events, Total Players, Total Matches) that reflect the currently displayed league

**Independent Test**: Load home page → Verify Quick Stats show correct counts for most recent league → Verify "Total Leagues" shows all leagues (global), other cards show league-specific counts

### UI Components for User Story 2

- [x] T018 [US2] Create QuickStats component in src/components/QuickStats.tsx (extract stat cards from page.tsx, accept LeagueStats prop, display Total Leagues (global) and Events/Players/Matches (league-specific), loading skeleton)
- [x] T019 [US2] Integrate QuickStats into home page in src/app/page.tsx (calculate league stats with useMemo from existing events/matches data, pass to QuickStats component, update when league selection changes)

### Tests for User Story 2

- [x] T020 [P] [US2] Write component test for QuickStats in __tests__/components/QuickStats.test.tsx (stat display, loading state, correct league-specific vs global counts)

**Checkpoint**: User Stories 1 AND 2 are both functional - users see leaderboard AND accurate stats

---

## Phase 5: User Story 3 - Switch Between League Leaderboards (Priority: P2)

**Goal**: Users can select any league from a dropdown selector above the leaderboard to view its historical leaderboard and stats

**Independent Test**: Select league from dropdown → Verify leaderboard updates → Verify Quick Stats update → Verify "Most Recent" option returns to most recent league

### API Implementation for User Story 3

- [x] T021 [US3] Verify GET /api/leagues endpoint returns all leagues for selector options (already implemented in T007, verify it works for dropdown population)

### Data Fetching Hooks for User Story 3

- [x] T022 [US3] Create useLeagues hook in src/hooks/useLeagues.ts (fetch all leagues, 1-minute staleTime, format with date ranges for selector display)

### UI Components for User Story 3

- [x] T023 [US3] Create LeagueSelector component in src/components/LeagueSelector.tsx (use shadcn/ui Select, label "Select League", format options as "{League Name} ({Date Range})", handle selection change, keyboard accessible, ARIA labels)
- [x] T024 [US3] Integrate LeagueSelector into home page in src/app/page.tsx (add selectedLeagueId state, render selector above leaderboard, fetch selected league's leaderboard, update QuickStats when league changes, default to most recent league)

### Tests for User Story 3

- [x] T025 [P] [US3] Write component test for LeagueSelector in __tests__/components/LeagueSelector.test.tsx (selection change, keyboard navigation, empty leagues array, accessibility)
- [x] T026 [US3] Write integration test for league switching in __tests__/integration/league-switching.test.tsx (mock API responses, render page, verify initial load shows most recent league, select different league, verify leaderboard and stats update, verify loading states)

**Checkpoint**: All user stories are independently functional - users can view most recent league, see accurate stats, and switch between leagues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately ✅ COMPLETE
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories ✅ COMPLETE
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion ✅ COMPLETE
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ **MVP Target**
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 page but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1/US2 but independently testable

### Within Each User Story

- API endpoints before hooks that call them
- Hooks before components that use them
- Components before page integration
- Tests can run in parallel with implementation (TDD) or after (validation)

### Parallel Opportunities

**Phase 1 (Setup)**: T001, T002 can run in parallel

**Phase 2 (Foundational)**:
- T003, T005 can run in parallel (different files)
- T006 can run in parallel with T004 (different files)
- T007, T008, T009 can run in parallel (different API routes)

**Phase 3 (US1)**:
- T011, T012, T013 can run in parallel (different hooks)
- T016, T017 can run in parallel (different test files)

**Phase 4 (US2)**:
- T020 can run in parallel with T018 (test while implementing)

**Phase 5 (US3)**:
- T025 can run in parallel with T023 (test while implementing)

**Cross-Story Parallelization**: Once Phase 2 completes, US1, US2, and US3 can all be worked on in parallel by different developers (each story is independent).

---

## Parallel Example: Foundational Phase (Phase 2)

```bash
# Launch all foundational tasks in parallel:
Task: "Create league utility functions in src/lib/league-utils.ts"
Task: "Write unit tests for league-utils.ts in __tests__/lib/league-utils.test.ts"
Task: "Create GET /api/leagues endpoint in src/app/api/leagues/route.ts"
Task: "Create GET /api/leagues/most-recent endpoint in src/app/api/leagues/most-recent/route.ts"
Task: "Modify GET /api/leagues/active endpoint in src/app/api/leagues/active/route.ts"
```

## Parallel Example: User Story 1 Hooks

```bash
# Launch all hooks for User Story 1 together:
Task: "Create useMostRecentLeague hook in src/hooks/useMostRecentLeague.ts"
Task: "Modify useActiveLeague hook in src/hooks/useActiveLeague.ts"
Task: "Create or modify useLeagueLeaderboard hook in src/hooks/useLeagueLeaderboard.ts"
```

## Parallel Example: Multi-Story Team Execution

```bash
# After Phase 2 completes, assign stories to developers:
Developer A: Work on User Story 1 (Phase 3) - Tasks T010-T017
Developer B: Work on User Story 2 (Phase 4) - Tasks T018-T020
Developer C: Work on User Story 3 (Phase 5) - Tasks T021-T026
# All three developers work simultaneously on independent stories
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T009) ⚠️ **CRITICAL BLOCKER**
3. Complete Phase 3: User Story 1 (T010-T017)
4. **STOP and VALIDATE**:
   - Visit home page
   - Verify leaderboard shows most recent league
   - Verify rankings are correct (league points + tie-breakers)
   - Verify empty state when no leagues
   - Run tests: pnpm test
5. Deploy/demo MVP if ready ✅

### Incremental Delivery (All User Stories)

1. Complete Setup (Phase 1) + Foundational (Phase 2) → Foundation ready
2. Add User Story 1 (Phase 3) → Test independently → Deploy/Demo ✅ **MVP!**
3. Add User Story 2 (Phase 4) → Test independently → Deploy/Demo (users now see accurate stats)
4. Add User Story 3 (Phase 5) → Test independently → Deploy/Demo (users can now switch leagues)
5. Complete Polish (Phase 6) → Final quality checks → Production release
6. Each story adds value without breaking previous stories

### Parallel Team Strategy (3+ Developers)

With multiple developers:

1. **Together**: Complete Setup (Phase 1) + Foundational (Phase 2)
2. **Once Foundational done**:
   - Developer A: User Story 1 (Phase 3) - T010-T017
   - Developer B: User Story 2 (Phase 4) - T018-T020
   - Developer C: User Story 3 (Phase 5) - T021-T026
3. **Integration**: Stories complete and merge independently
4. **Together**: Polish phase (Phase 6) - T027-T034

---

## Task Count Summary

- **Phase 1 (Setup)**: 2 tasks ✅ COMPLETE
- **Phase 2 (Foundational)**: 7 tasks ✅ COMPLETE
- **Phase 3 (User Story 1 - P1)**: 8 tasks ✅ COMPLETE 🎯 **MVP**
- **Phase 4 (User Story 2 - P1)**: 3 tasks ✅ COMPLETE
- **Phase 5 (User Story 3 - P2)**: 6 tasks ✅ COMPLETE

**Total**: 26 tasks ✅ **ALL COMPLETE**

**Parallel Opportunities**: 18 tasks marked [P] ran in parallel with other tasks (69% parallelized)

**Independent Test Criteria**:
- **US1**: Visit home page → See most recent league leaderboard → Verify rankings → Verify empty state
- **US2**: Load home page → Verify Quick Stats accuracy for displayed league
- **US3**: Select league from dropdown → Verify leaderboard and stats update

**Implementation Complete**: All 26 tasks completed successfully
- ✅ User Story 1: View most recent league leaderboard
- ✅ User Story 2: View accurate Quick Stats for displayed league  
- ✅ User Story 3: Switch between different league leaderboards

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label (US1, US2, US3) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are included per constitutional requirement (80% coverage for business logic)
- Foundational phase (Phase 2) is critical blocker - must complete before any user story work
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Performance targets: <2s load, <1s switch, <200ms API response
- Accessibility required: WCAG 2.1 AA compliance with keyboard nav, ARIA labels, semantic HTML
