# Implementation Plan: Player Stats and Leaderboard Calculations

**Branch**: `002-player-stats-and` | **Date**: 2025-10-15 | **Spec**: [link](./spec.md)
**Input**: Feature specification from `/Users/manrichvangreunen/Documents/my-projects/the-warren-tournaments/specs/002-player-stats-and/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
This feature will introduce a comprehensive player statistics and leaderboard calculation system. The core of the feature is a set of rules for calculating player rankings within events and leagues. The technical approach is to implement the calculation logic in a new TypeScript module (`src/lib/playerStats.ts`) and expose the results via new API endpoints.

## Technical Context
**Language/Version**: TypeScript
**Primary Dependencies**: Next.js, Prisma, Jest
**Storage**: PostgreSQL
**Testing**: Jest, React Testing Library
**Target Platform**: Web
**Project Type**: Web Application
**Constraints**: Must adhere to the existing project architecture and coding standards.
**Scale/Scope**: The system should be able to handle leaderboards for leagues with up to 100 players.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Code Quality Standards
- [x] TypeScript strict mode enabled with no type errors
- [x] ESLint configuration follows next/core-web-vitals
- [x] Prettier formatting configuration applied
- [x] Component structure follows src/components/ hierarchy
- [x] Naming conventions aligned (PascalCase components, camelCase functions)

### Testing Requirements
- [x] Jest and React Testing Library configured
- [x] Unit tests planned for critical components
- [x] Integration tests planned for authentication and data flows
- [x] Test utilities and mock data strategy defined

### User Experience Consistency
- [x] Component reusability strategy aligned with existing UI system
- [x] Form validation approach using react-hook-form and Zod
- [x] Loading states and error handling patterns defined
- [x] Responsive design requirements for all viewports
- [x] Consistent navigation and visual hierarchy maintained

## Project Structure

### Documentation (this feature)
```
specs/002-player-stats-and/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/
│   ├── event-leaderboard.yaml
│   └── league-leaderboard.yaml
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Monolithic Next.js Application
src/
├── app/
│   ├── api/
│   ├── (pages)/
│   └── layout.tsx
├── components/
│   └── ui/
├── hooks/
├── lib/
└── __tests__/
```

**Structure Decision**: Monolithic Next.js Application

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - All unknowns have been resolved.

2. **Generate and dispatch research agents**:
   - Research has been completed and documented in `research.md`.

3. **Consolidate findings** in `research.md` using format:
   - Decision: Implement calculation logic in `src/lib/playerStats.ts`.
   - Rationale: Separation of concerns, testability, and maintainability.
   - Alternatives considered: None that were viable.

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Data model has been created and documented in `data-model.md`.

2. **Generate API contracts** from functional requirements:
   - API contracts have been created and saved in the `/contracts/` directory.

3. **Generate contract tests** from contracts:
   - Contract tests will be generated in the next phase.

4. **Extract test scenarios** from user stories:
   - Test scenarios have been documented in `quickstart.md`.

5. **Update agent file incrementally** (O(1) operation):
   - The `GEMINI.md` file has been updated.

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
|           |            |                                     |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v1.1.0 - See `GEMINI.md`*