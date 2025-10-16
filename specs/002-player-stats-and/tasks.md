# Tasks: Player Stats and Leaderboard Calculations

**Input**: Design documents from `/specs/002-player-stats-and/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `src/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup & Quality Tools
- [ ] T001 Create the file `src/lib/playerStats.ts` for the calculation logic.
- [ ] T002 Create the test file `src/__tests__/playerStats.test.ts` for the calculation logic.

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T003 [P] Write a failing unit test in `src/__tests__/playerStats.test.ts` for the `calculateMatchPoints` function.
- [ ] T004 [P] Write a failing unit test in `src/__tests__/playerStats.test.ts` for the `calculateGamePoints` function.
- [ ] T005 [P] Write a failing unit test in `src/__tests__/playerStats.test.ts` for the `calculateMatchWinPercentage` function.
- [ ] T006 [P] Write a failing unit test in `src/__tests__/playerStats.test.ts` for the `calculateGameWinPercentage` function.
- [ ] T007 [P] Write a failing unit test in `src/__tests__/playerStats.test.ts` for the `calculateOpponentMatchWinPercentage` function.
- [ ] T008 [P] Write a failing unit test in `src/__tests__/playerStats.test.ts` for the `calculateOpponentGameWinPercentage` function.
- [ ] T009 [P] Write a failing unit test in `src/__tests__/playerStats.test.ts` for the `calculateEventRanking` function.
- [ ] T010 [P] Write a failing unit test in `src/__tests__/playerStats.test.ts` for the `calculateLeagueRanking` function.
- [ ] T011 [P] Create a failing integration test for the event leaderboard API endpoint `/api/events/[id]/leaderboard`.
- [ ] T012 [P] Create a failing integration test for the league leaderboard API endpoint `/api/leagues/[id]/leaderboard`.
- [ ] T012a [P] Create a failing integration test for the active league API endpoint `/api/leagues/active`.

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T013 Implement the `calculateMatchPoints` function in `src/lib/playerStats.ts` (Note: This function assumes input match data correctly reflects the outcome based on the 'best-of-3' games rule).
- [ ] T014 Implement the `calculateGamePoints` function in `src/lib/playerStats.ts`.
- [ ] T015 Implement the `calculateMatchWinPercentage` function in `src/lib/playerStats.ts`.
- [ ] T016 Implement the `calculateGameWinPercentage` function in `src/lib/playerStats.ts`.
- [ ] T017 Implement the `calculateOpponentMatchWinPercentage` function in `src/lib/playerStats.ts`.
- [ ] T018 Implement the `calculateOpponentGameWinPercentage` function in `src/lib/playerStats.ts`.
- [ ] T019 Implement the `calculateEventRanking` function in `src/lib/playerStats.ts`.
- [ ] T020 Implement the `calculateLeagueRanking` function in `src/lib/playerStats.ts`.
- [ ] T021 Create the API route `src/app/api/events/[id]/leaderboard/route.ts` and implement the event leaderboard endpoint.
- [ ] T022 Create the API route `src/app/api/leagues/[id]/leaderboard/route.ts` and implement the league leaderboard endpoint.
- [ ] T022a Create the API route `src/app/api/leagues/active/route.ts` and implement the active league endpoint.

## Phase 3.4: UI Implementation
- [ ] T026 [P] Create a new reusable `Leaderboard` component in `src/components/Leaderboard.tsx`.
- [ ] T027 [P] Create a new hook `src/hooks/useLeagueLeaderboard.ts` to fetch league leaderboard data.
- [ ] T028 [P] Create a new hook `src/hooks/useEventLeaderboard.ts` to fetch event leaderboard data.
- [ ] T029 Display the active league leaderboard on the dashboard page (`src/app/page.tsx`) using the new component and hook.
- [ ] T030 Display the league leaderboard on the league details page (`src/app/leagues/[id]/page.tsx`) using the new component and hook.
- [ ] T031 Display the event leaderboard on the event details page (`src/app/events/[id]/page.tsx`) using the new component and hook.

## Phase 3.5: Integration
- [ ] T023 Integrate the calculation functions from `src/lib/playerStats.ts` into the API endpoints.

## Phase 3.6: Polish
- [ ] T024 [P] Add comprehensive unit tests for all calculation functions in `src/__tests__/playerStats.test.ts`.
- [ ] T025 [P] Update the API documentation with the new leaderboard endpoints.

## Dependencies
- T001, T002 before T003-T012a
- T003-T012a before T013-T022a
- T013-T022a before T023
- T023 before T026-T031
- T026-T031 before T024, T025

## Parallel Example
```
# Launch T003-T012 together:
Task: "Write a failing unit test in `src/__tests__/playerStats.test.ts` for the `calculateMatchPoints` function."
Task: "Write a failing unit test in `src/__tests__/playerStats.test.ts` for the `calculateGamePoints` function."
Task: "Create a failing integration test for the event leaderboard API endpoint `/api/events/[id]/leaderboard`."
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task

2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks

3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
