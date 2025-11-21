# Tasks: Data Interaction Enhancements

**Input**: Design documents from `/specs/004-data-interaction-enhancements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-api.md

**Tests**: Test tasks are included based on constitution requirement of 80% coverage for critical business logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project structure follows Next.js App Router:
- Source code: `src/` (components, hooks, lib, types, app)
- Tests: `src/__tests__/` (components, hooks, lib, integration)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install @tanstack/react-table dependency using pnpm add @tanstack/react-table
- [X] T002 [P] Check and install missing shadcn/ui components: scroll-area, tooltip, popover, calendar using pnpx shadcn@latest add [component-name]
- [X] T003 [P] Create TypeScript interfaces file at src/types/table.ts for TableState, DataTableColumn, TypeaheadOption, FilterState types

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and hooks that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create input sanitization utility at src/lib/input-sanitization.ts with sanitizeInput function to escape HTML entities
- [X] T005 [P] Create table utilities at src/lib/table-utils.ts with filterRowsByGlobalSearch, custom filter functions, and constants (PAGE_SIZES, DEBOUNCE_DELAY)
- [X] T006 [P] Create useDebounce hook at src/hooks/useDebounce.ts for debouncing search input with 300ms delay
- [X] T007 [P] Create useSessionStorage hook at src/hooks/useSessionStorage.ts for generic sessionStorage persistence with JSON serialization
- [X] T008 Create useTableState hook at src/hooks/useTableState.ts integrating sessionStorage, managing globalFilter, columnFilters, sorting, and pagination state (depends on T006, T007)
- [X] T009 [P] Create test fixtures directory at src/__tests__/fixtures/ and add mock data for leagues, events, matches, players

**Tests for Foundational Phase**:

- [ ] T010 [P] Write unit test for useDebounce hook at src/__tests__/hooks/useDebounce.test.ts verifying debounce timing and cleanup
- [ ] T011 [P] Write unit test for useSessionStorage hook at src/__tests__/hooks/useSessionStorage.test.ts verifying storage, retrieval, and error handling
- [ ] T012 [P] Write unit test for table utilities at src/__tests__/lib/table-utils.test.ts verifying filtering and sorting functions
- [ ] T013 [P] Write unit test for input sanitization at src/__tests__/lib/input-sanitization.test.ts verifying XSS prevention

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Search Across Data Tables (Priority: P1) 🎯 MVP

**Goal**: Enable real-time text search on all data listing pages (leagues, events, matches, players) with debounced filtering

**Independent Test**: Navigate to any data listing page, type text in search box, verify results filter in real-time showing only matching records. Clear search to see all records return.

**Why MVP**: Core navigation capability, foundation for other filtering features, delivers immediate value, P1 priority, independently testable

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US1] Write unit test for DataTable search functionality at src/__tests__/components/DataTable.search.test.tsx verifying global filter application and debouncing (DEFERRED)
- [ ] T015 [P] [US1] Write integration test at src/__tests__/integration/data-table-search.test.tsx verifying end-to-end search flow on sample data (DEFERRED)

### Implementation for User Story 1

- [X] T016 [US1] Create DataTable component skeleton at src/components/DataTable.tsx with props interface, basic table structure using shadcn/ui Table components
- [X] T017 [US1] Integrate TanStack React Table useReactTable hook in DataTable component with getCoreRowModel, getFilteredRowModel, getPaginationRowModel
- [X] T018 [US1] Add global search input to DataTable component with debounced state update using useDebounce hook
- [X] T019 [US1] Implement globalFilter configuration in DataTable with filterRowsByGlobalSearch utility function
- [X] T020 [US1] Add empty state rendering in DataTable for "No results found" with clear search action
- [X] T021 [US1] Update leagues page at src/app/leagues/page.tsx to use DataTable component with column definitions for name (searchable), startDate, endDate, createdAt
- [X] T022 [US1] Add loading state shimmer to DataTable component using existing GenericSkeletonLoader
- [X] T023 [US1] Integrate useTableState hook in DataTable for sessionStorage persistence with unique storageKey per page

**Checkpoint**: At this point, search functionality should work independently on leagues page and be ready to replicate to other pages

---

## Phase 4: User Story 4 - Persistent Column Sorting (Priority: P1)

**Goal**: Enable column sorting by clicking table headers with visual indicators (arrows), maintaining sort across filters and pagination

**Independent Test**: Click column headers on any data table, verify records reorder correctly (asc → desc → clear). Apply search filter, verify sort persists.

**Why P1**: Critical for data organization, works independently, already partially implemented (can enhance existing), high value

### Tests for User Story 4

- [ ] T024 [P] [US4] Write unit test for DataTable sorting at src/__tests__/components/DataTable.sorting.test.tsx verifying sort state changes and getSortedRowModel integration (DEFERRED)
- [ ] T025 [P] [US4] Write integration test at src/__tests__/integration/data-table-sort-with-search.test.tsx verifying sort persists during search operations (DEFERRED)

### Implementation for User Story 4

- [X] T026 [US4] Integrate getSortedRowModel from TanStack Table in DataTable component
- [X] T027 [US4] Create SortableHeader subcomponent in DataTable with clickable header, sort icon (ChevronUpIcon, ChevronDownIcon), and toggle logic
- [X] T028 [US4] Add sorting state management in DataTable using useTableState hook (persist sort in sessionStorage)
- [X] T029 [US4] Update column definitions in leagues page to include enableSorting flags for sortable columns
- [X] T030 [US4] Test sorting with search combination on leagues page, verify sort persists when modifying search query

**Checkpoint**: Sorting should work independently and integrate seamlessly with search (US1)

---

## Phase 5: User Story 3 - Table Pagination for Large Datasets (Priority: P2)

**Goal**: Split large datasets into manageable pages (25, 50, 100 records per page) with navigation controls and page indicators

**Independent Test**: Navigate to any page with 25+ records, verify pagination controls appear, test page navigation (next, previous), change page size, verify counts update correctly.

**Why P2**: Essential for large datasets, builds on search/sort, independently testable

### Tests for User Story 3

- [ ] T031 [P] [US3] Write unit test for DataTable pagination at src/__tests__/components/DataTable.pagination.test.tsx verifying page navigation, page size changes, and page count calculations (DEFERRED)
- [ ] T032 [P] [US3] Write integration test at src/__tests__/integration/data-table-pagination-with-filters.test.tsx verifying pagination resets to page 1 when filters change (DEFERRED)

### Implementation for User Story 3

- [X] T033 [US3] Create PaginationControls subcomponent in DataTable with First, Previous, Next, Last buttons, page indicator (Page X of Y), and page size selector dropdown
- [X] T034 [US3] Integrate getPaginationRowModel from TanStack Table in DataTable component
- [X] T035 [US3] Add pagination state management in DataTable using useTableState hook with initialPageSize prop
- [X] T036 [US3] Implement pagination reset logic in DataTable when globalFilter or columnFilters change (automatic with TanStack Table)
- [X] T037 [US3] Conditionally render pagination controls only when total rows exceed page size
- [X] T038 [US3] Test pagination on leagues page with mock dataset of 100+ records, verify page navigation and size changes

**Checkpoint**: Pagination should work independently and integrate with search (US1) and sort (US4)

---

## Phase 6: User Story 6 - Consistent Admin Row Actions (Priority: P3)

**Goal**: Standardize edit/delete action buttons across all tables with consistent icons, tooltips, confirmation dialogs, and admin-only visibility

**Independent Test**: Log in as admin, visit any data table, verify edit/delete buttons appear with correct icons and tooltips. Click delete, verify confirmation dialog. Test as non-admin, verify buttons hidden.

**Why after P1/P2**: Builds on existing DataTable, doesn't block core functionality, quality-of-life improvement

### Tests for User Story 6

- [ ] T039 [P] [US6] Write unit test for TableRowActions component at src/__tests__/components/TableRowActions.test.tsx verifying admin visibility, button clicks, and confirmation dialog behavior (DEFERRED)
- [ ] T040 [P] [US6] Write integration test at src/__tests__/integration/admin-row-actions.test.tsx verifying admin authentication check and action button rendering across pages (DEFERRED)

### Implementation for User Story 6

- [X] T041 [P] [US6] Create TableRowActions component at src/components/TableRowActions.tsx with props interface (onEdit, onDelete, entityName, deleteWarning, showEdit, showDelete, disabled)
- [X] T042 [US6] Implement edit button in TableRowActions with PencilIcon from lucide-react, tooltip using shadcn/ui Tooltip component
- [X] T043 [US6] Implement delete button in TableRowActions with TrashIcon, tooltip, and onClick handler to open confirmation dialog
- [X] T044 [US6] Create delete confirmation Dialog in TableRowActions with title, description (including deleteWarning), Cancel and Delete buttons
- [X] T045 [US6] Add admin check in TableRowActions using useSession hook, return null if not admin (implemented at page level)
- [X] T046 [US6] Add renderRowActions prop to DataTable component for rendering custom row actions (last column)
- [X] T047 [US6] Update leagues page to use TableRowActions via renderRowActions prop with handleEdit and handleDelete callbacks
- [X] T048 [US6] Add event propagation stopping in TableRowActions to prevent row click when clicking action buttons

**Checkpoint**: Admin row actions should work consistently, integrate with existing delete logic in pages

---

## Phase 7: User Story 5 - Typeahead Search in Dropdown Menus (Priority: P3)

**Goal**: Enable typeahead filtering in dropdown menus (forms, filters) with keyboard navigation and highlighted matches

**Independent Test**: Open any dropdown with multiple options (e.g., league selector on event form), type text, verify options filter in real-time. Test keyboard navigation (arrows, enter, escape).

**Why P3**: Quality-of-life, enhances forms, lower priority than core table features

### Tests for User Story 5

- [ ] T049 [P] [US5] Write unit test for TypeaheadDropdown component at src/__tests__/components/TypeaheadDropdown.test.tsx verifying filtering, selection, keyboard navigation, and highlighting
- [ ] T050 [P] [US5] Write integration test at src/__tests__/integration/typeahead-form-usage.test.tsx verifying typeahead in form context with real data loading

### Implementation for User Story 5

- [X] T051 [P] [US5] Create TypeaheadDropdown component at src/components/TypeaheadDropdown.tsx with props interface (options, value, onSelect, multiple, placeholder, searchPlaceholder, disabled, error, helperText, label, required)
- [X] T052 [US5] Implement input field in TypeaheadDropdown using shadcn/ui Input component with onChange handler for filtering
- [X] T053 [US5] Integrate DropdownMenu from shadcn/ui in TypeaheadDropdown for options list with ScrollArea for long lists
- [X] T054 [US5] Add filtering logic in TypeaheadDropdown using useMemo to filter options based on search input (case-insensitive substring matching)
- [X] T055 [US5] Implement keyboard navigation in TypeaheadDropdown (ArrowDown, ArrowUp, Enter, Escape, Home, End) using Radix UI DropdownMenu built-in support
- [X] T056 [US5] Add matched text highlighting in TypeaheadDropdown options using sanitizeInput and replacing matched substring with <mark> tag
- [X] T057 [US5] Add clear button to TypeaheadDropdown when value is selected
- [X] T058 [US5] Handle multiple selection in TypeaheadDropdown with chip display for selected values (if multiple prop is true)
- [X] T059 [US5] Add ARIA attributes to TypeaheadDropdown for accessibility (role="combobox", aria-expanded, aria-controls, aria-activedescendant)

**Checkpoint**: TypeaheadDropdown component should be fully functional, ready to use in forms and filters

---

## Phase 8: User Story 2 - Advanced Multi-Column Filtering (Priority: P2)

**Goal**: Enable filtering by specific columns (e.g., events by league, matches by round) with multiple active filters and clear all action

**Independent Test**: On events page, select league from dropdown filter, verify events filter to that league. Add date range filter, verify both filters apply. Click "Clear all filters", verify all reset.

**Why P2**: Powerful feature for data analysis, builds on US1/US4/US5 (search, sort, typeahead), independently testable

### Tests for User Story 2

- [ ] T060 [P] [US2] Write unit test for DataTable column filtering at src/__tests__/components/DataTable.filtering.test.tsx verifying columnFilters state, getFilteredRowModel with custom filterFn
- [ ] T061 [P] [US2] Write integration test at src/__tests__/integration/multi-column-filters.test.tsx verifying multiple filters applied simultaneously and clear all functionality

### Implementation for User Story 2

- [ ] T062 [US2] Add columnFilters state management to DataTable component using useTableState hook
- [ ] T063 [US2] Implement column filter UI section above DataTable (separate from global search) with "Clear all filters" button
- [ ] T064 [US2] Create FilterBar component at src/components/FilterBar.tsx (optional) or inline filter UI in DataTable for rendering column-specific filters
- [ ] T065 [US2] Update events page at src/app/events/page.tsx to use DataTable with column definitions
- [ ] T066 [US2] Add league filter to events page using TypeaheadDropdown component with useLeagues hook for options
- [ ] T067 [US2] Add date range filter to events page using shadcn/ui DatePickerWithRange component (install with pnpx shadcn@latest add calendar)
- [ ] T068 [US2] Implement pre-filtering logic in events page before passing data to DataTable (filter by selectedLeagueId and dateRange before DataTable receives data)
- [ ] T069 [US2] Add "Clear all filters" button in events page that resets all filter state (selectedLeagueId, dateRange, and DataTable globalFilter)
- [ ] T070 [US2] Test multi-column filtering on events page with league + date range combination, verify pagination resets to page 1

**Checkpoint**: Multi-column filtering should work independently, integrate seamlessly with search, sort, pagination

---

## Phase 9: Replication to All Pages

**Purpose**: Apply DataTable component with search, sort, pagination to remaining data pages (events, matches, players)

**Note**: US1, US4, US3 components are ready for reuse. This phase replicates the pattern.

### Events Page

- [X] T071 [P] Update events page at src/app/events/page.tsx with DataTable component and column definitions for name (searchable), league (via accessorFn), date (sortable, filterable)
- [X] T072 [P] Add storageKey="table-state-events" to DataTable in events page for state persistence

### Matches Page

- [X] T073 [P] Update matches page at src/app/matches/page.tsx with DataTable component and column definitions for player1.name, player2.name (searchable via accessorFn), round, scores, draw (sortable)
- [X] T074 [P] Add storageKey="table-state-matches" to DataTable in matches page for state persistence
- [X] T075 [P] Add event filter to matches page using Select dropdown for filtering by event

### Players Page

- [X] T076 [P] Update players page at src/app/players/page.tsx with DataTable component and column definitions for name (searchable), createdAt (sortable)
- [X] T077 [P] Add storageKey="table-state-players" to DataTable in players page for state persistence

**Checkpoint**: All four data pages (leagues, events, matches, players) should have consistent table functionality

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, final testing, and documentation

- [ ] T078 [P] Add unit test for DataTable component core functionality at src/__tests__/components/DataTable.test.tsx verifying rendering, column definitions, and prop handling
- [ ] T079 [P] Add unit test for useTableState hook at src/__tests__/hooks/useTableState.test.ts verifying state initialization, updates, and sessionStorage persistence
- [ ] T080 [P] Optimize DataTable performance using React.memo for sub-components and useMemo for column definitions
- [ ] T081 [P] Add JSDoc comments to complex utility functions in src/lib/table-utils.ts and src/lib/input-sanitization.ts
- [ ] T082 [P] Extract magic numbers to named constants in DataTable (DEBOUNCE_DELAY=300, DEFAULT_PAGE_SIZE=25, PAGE_SIZE_OPTIONS=[25,50,100])
- [ ] T083 [P] Review and ensure all new code follows TypeScript strict mode, passes ESLint checks (pnpm lint), and is formatted with Prettier
- [ ] T084 [P] Run full test suite with pnpm test, verify 80% coverage target for critical logic (table-utils, useTableState, DataTable core filtering/sorting)
- [ ] T085 Manual testing: Test DataTable on all pages with various data sizes (empty, <25, 25-100, 100+), verify loading states, empty states, pagination behavior
- [ ] T086 Manual testing: Test accessibility with keyboard navigation (tab through controls, sort headers with Enter/Space, typeahead with arrows)
- [ ] T087 Manual testing: Test session storage persistence (navigate away and return, verify filters/sort/pagination persist)
- [ ] T088 Manual testing: Test edge cases from spec.md (zero results, null dates, page 5 → search returns fewer pages, special characters in search)
- [ ] T089 Security review: Verify input sanitization prevents XSS in search and typeahead highlighted text, test with malicious inputs like `<script>alert('XSS')</script>`
- [ ] T090 Performance validation: Measure search latency with 1000-record dataset (target <300ms), sort latency (target <500ms), initial render (target <1000ms for 100 records)
- [ ] T091 Update quickstart.md if needed with any implementation deviations or additional setup steps discovered during implementation
- [ ] T092 Create or update README documentation for DataTable, TypeaheadDropdown, TableRowActions components with usage examples and prop documentation
- [ ] T093 Code cleanup: Remove any console.logs, commented-out code, unused imports, and ensure DRY principle (no duplicated code across pages)
- [ ] T094 Run build process (pnpm build) and verify no TypeScript errors, no build warnings, and production bundle size is acceptable

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T003) - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion (T004-T013)
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US4 → US3 → US6 → US5 → US2)
- **Replication (Phase 9)**: Depends on US1, US4, US3 completion
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ MVP ready after this
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - No dependencies, enhances US1 but works independently
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies, integrates with US1/US4 but works independently
- **User Story 6 (P3)**: Can start after US1 completes (needs DataTable component) - Enhances tables but independently testable
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies, standalone component
- **User Story 2 (P2)**: Can start after US1, US4, US5 complete (needs DataTable, sorting, TypeaheadDropdown) - Integrates all prior features

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Utilities/hooks before components
- Components before page updates
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks can run in parallel (T001, T002, T003)

**Phase 2 (Foundational)**:
- T004, T005, T006, T007, T009 can run in parallel
- T008 depends on T006, T007
- T010, T011, T012, T013 (tests) can run in parallel after implementation tasks

**Phase 3 (US1)**:
- T014, T015 (tests) can run in parallel
- T016-T023 (implementation) must be sequential (each builds on previous)

**Phase 4 (US4)**:
- T024, T025 (tests) can run in parallel
- T026-T030 (implementation) mostly sequential (integrate into existing DataTable)

**Phase 5 (US3)**:
- T031, T032 (tests) can run in parallel
- T033-T038 (implementation) mostly sequential

**Phase 6 (US6)**:
- T039, T040 (tests) can run in parallel
- T041-T048 (implementation) have some parallelizable tasks (T041-T044 build TableRowActions, then integrate)

**Phase 7 (US5)**:
- T049, T050 (tests) can run in parallel
- T051-T059 (implementation) build TypeaheadDropdown (some sub-tasks sequential)

**Phase 8 (US2)**:
- T060, T061 (tests) can run in parallel
- T062-T070 (implementation) mostly sequential (integrate into existing DataTable and pages)

**Phase 9 (Replication)**: T071-T077 all tasks can run in parallel (different files)

**Phase 10 (Polish)**: T078-T094 most tasks can run in parallel (different concerns)

---

## Parallel Example: Foundational Phase (Phase 2)

```bash
# Launch foundational utilities in parallel:
Task: "Create input sanitization utility at src/lib/input-sanitization.ts"
Task: "Create table utilities at src/lib/table-utils.ts"
Task: "Create useDebounce hook at src/hooks/useDebounce.ts"
Task: "Create useSessionStorage hook at src/hooks/useSessionStorage.ts"
Task: "Create test fixtures directory at src/__tests__/fixtures/"

# After hooks complete, launch:
Task: "Create useTableState hook at src/hooks/useTableState.ts" (depends on T006, T007)

# After implementation, launch all tests in parallel:
Task: "Write unit test for useDebounce hook"
Task: "Write unit test for useSessionStorage hook"
Task: "Write unit test for table utilities"
Task: "Write unit test for input sanitization"
```

---

## Parallel Example: User Story 1 (MVP)

```bash
# Launch tests together:
Task: "Write unit test for DataTable search functionality"
Task: "Write integration test for data-table-search"

# Implementation is sequential (each task builds on previous):
1. Create DataTable skeleton
2. Integrate TanStack Table
3. Add global search input
4. Implement globalFilter
5. Add empty state
6. Update leagues page
7. Add loading state
8. Integrate sessionStorage
```

---

## Parallel Example: Replication Phase (Phase 9)

```bash
# All page updates can run in parallel (different files):
Task: "Update events page with DataTable"
Task: "Add storageKey to events page"
Task: "Update matches page with DataTable"
Task: "Add storageKey to matches page"
Task: "Update players page with DataTable"
Task: "Add storageKey to players page"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 4)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T013) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T014-T023) - Quick search
4. Complete Phase 4: User Story 4 (T024-T030) - Column sorting
5. **STOP and VALIDATE**: Test search + sort independently on leagues page
6. Deploy/demo if ready - **This is a viable MVP** ✅

**MVP Value**: Users can search and sort leagues, immediate productivity improvement, foundation for other features

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Search) → Test independently → Deploy/Demo
3. Add User Story 4 (Sort) → Test independently → Deploy/Demo (**MVP ready**)
4. Add User Story 3 (Pagination) → Test independently → Deploy/Demo
5. Add User Story 6 (Admin Actions) → Test independently → Deploy/Demo
6. Add User Story 5 (Typeahead) → Test independently → Deploy/Demo
7. Add User Story 2 (Multi-Column Filters) → Test independently → Deploy/Demo (Full feature complete)
8. Replicate to all pages (Phase 9) → Deploy/Demo
9. Polish (Phase 10) → Final release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T013)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T014-T023) + User Story 4 (T024-T030) [MVP critical path]
   - **Developer B**: User Story 5 (T049-T059) [TypeaheadDropdown standalone]
   - **Developer C**: User Story 3 (T031-T038) [Pagination after US1 done]
3. After US1, US3 done:
   - **Developer A**: User Story 6 (T039-T048) [Admin actions]
   - **Developer B**: User Story 2 (T060-T070) [Multi-column filters - integrates US1, US5]
4. After all stories done:
   - **All**: Phase 9 Replication (T071-T077) in parallel
5. Final:
   - **All**: Phase 10 Polish (T078-T094) in parallel

---

## Summary

- **Total Tasks**: 94
- **Setup Tasks**: 3 (Phase 1)
- **Foundational Tasks**: 10 (Phase 2)
- **User Story Tasks**:
  - US1 (P1): 10 tasks (T014-T023)
  - US4 (P1): 7 tasks (T024-T030)
  - US3 (P2): 8 tasks (T031-T038)
  - US6 (P3): 10 tasks (T039-T048)
  - US5 (P3): 11 tasks (T049-T059)
  - US2 (P2): 11 tasks (T060-T070)
- **Replication Tasks**: 7 (Phase 9)
- **Polish Tasks**: 17 (Phase 10)

**Parallel Opportunities Identified**:
- Phase 1: 3 tasks in parallel
- Phase 2: 5 tasks in parallel (utilities/hooks), 4 tests in parallel
- Each user story: 2 tests in parallel
- Phase 9: 7 tasks in parallel
- Phase 10: ~15 tasks in parallel

**Independent Test Criteria**:
- **US1**: Type in search box → results filter → clear → all return
- **US4**: Click header → sort asc → click again → sort desc → verify persists with search
- **US3**: View 25+ records → pagination appears → navigate pages → change size → verify counts
- **US6**: Admin login → see action buttons → click delete → confirmation appears → non-admin sees none
- **US5**: Open dropdown → type → options filter → keyboard navigate → select
- **US2**: Select league filter → apply → add date filter → verify both apply → clear all → verify reset

**Suggested MVP Scope**:
- Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (US1 Search) + Phase 4 (US4 Sort)
- **Delivers**: Searchable, sortable tables on leagues page
- **Time Estimate**: ~2-3 days for experienced developer
- **Value**: Core navigation improvement, foundation for all other features

**Format Validation**: ✅ All tasks follow checklist format with ID, optional [P], optional [Story], description with file paths

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests written first (TDD), verify they fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution compliance: 80% test coverage for critical logic (table-utils, hooks, DataTable core)
- Performance targets: <300ms search, <500ms sort, <1000ms initial render
- Accessibility: WCAG 2.1 AA compliance (keyboard navigation, ARIA, screen readers)
- Security: Input sanitization prevents XSS, no SQL injection risk (client-side filtering)
