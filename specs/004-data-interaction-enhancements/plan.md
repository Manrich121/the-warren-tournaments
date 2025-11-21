# Implementation Plan: Data Interaction Enhancements

**Branch**: `004-data-interaction-enhancements` | **Date**: 2025-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-data-interaction-enhancements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add comprehensive search, filtering, sorting, and pagination capabilities to all data interaction pages (leagues, events, matches, players) with typeahead dropdown search and consistent admin actions. Implementation uses client-side data manipulation with TanStack React Table for advanced table state management, shadcn/ui components for UI primitives, and session storage for state persistence.

## Technical Context

**Language/Version**: TypeScript 5.9+ with Next.js 16.0.0 (App Router) + React 19.2
**Primary Dependencies**:
- @tanstack/react-table 8.x (table state management)
- @tanstack/react-query 5.90 (server state)
- shadcn/ui components (Table, ScrollArea, DropdownMenu, Dialog, Input, Button)
- next-auth 5.0 (authentication)
- lucide-react (icons)
- zod 4.1 (validation)

**Storage**: PostgreSQL via Prisma ORM 6.17 (existing schema unchanged)
**Testing**: Jest + React Testing Library (80% coverage target for critical logic)
**Target Platform**: Web (Next.js App Router, client-side rendering for table interactions)
**Project Type**: Web application (Next.js monolith)
**Performance Goals**:
- Search/filter response: <300ms after typing stops
- Sorting operations: <500ms for datasets up to 1000 records
- Initial table render: <1000ms for 100 records

**Constraints**:
- Client-side filtering only (no new API search parameters)
- Datasets expected <10,000 records per entity
- Session storage for state persistence (no backend state)
- No database schema changes
- Maintain existing Next-Auth admin authentication pattern

**Scale/Scope**:
- 4 data listing pages (leagues, events, matches, players)
- 1 reusable DataTable component
- 1 reusable TypeaheadDropdown component
- 1 reusable TableRowActions component
- ~500 lines of new component code
- ~200 lines of utility/hook code

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Technology Stack Compliance ✅
- ✅ **Next.js (React)**: Using Next.js 16.0.0 with App Router
- ✅ **TypeScript**: All new code in TypeScript with strict mode
- ✅ **Tailwind CSS**: shadcn/ui components use Tailwind
- ✅ **Prisma ORM**: No database changes, using existing Prisma client
- ✅ **pnpm**: Using pnpm for dependency management

### Component-Based Architecture ✅
- ✅ **Reusable components**: Creating DataTable, TypeaheadDropdown, TableRowActions components
- ✅ **Functional components**: All components using React hooks (useState, useEffect, useMemo)
- ✅ **Single responsibility**: Each component has clear purpose (table management, typeahead, actions)
- ✅ **File structure**: Components in `src/components/`, UI primitives in `src/components/ui/`
- ✅ **TypeScript typing**: All props typed with interfaces

### Code Quality Standards ✅
- ✅ **ESLint**: Code will pass `next/core-web-vitals` configuration
- ✅ **Prettier**: Code will be formatted per project config
- ✅ **TypeScript strict mode**: All type errors will be resolved
- ✅ **Naming conventions**: PascalCase components, camelCase functions, SCREAMING_SNAKE_CASE constants
- ✅ **JSDoc comments**: Complex utility functions will include JSDoc
- ✅ **No magic values**: Constants for page sizes, debounce delays, etc.

### Testing Standards ✅
- ✅ **Jest + React Testing Library**: Unit tests for DataTable, TypeaheadDropdown components
- ✅ **80% coverage**: Critical table filtering, sorting, pagination logic
- ✅ **Integration tests**: User flows for search, filter, sort, paginate
- ✅ **Descriptive names**: Tests follow "should [expected behavior] when [condition]" pattern
- ✅ **Mock data**: Centralized test fixtures in `src/__tests__/fixtures/`

### User Experience Consistency ✅
- ✅ **Consistent design**: Using shadcn/ui components with Tailwind classes
- ✅ **Interactive feedback**: Loading states during data fetching, hover effects on buttons
- ✅ **Form validation**: Input sanitization for search/filter inputs
- ✅ **Navigation consistency**: Table components follow existing page patterns
- ✅ **Responsive design**: shadcn/ui components are responsive by default
- ✅ **Accessibility**: WCAG 2.1 AA compliance (keyboard navigation, ARIA labels, screen reader support)
- ✅ **Loading states**: Shimmer loaders during data fetching
- ✅ **Error states**: "No results found" messages with clear actions

### State Management ✅
- ✅ **React Query**: Using existing pattern for server state (data fetching)
- ✅ **Component state**: Table state managed by TanStack React Table
- ✅ **Minimal global state**: Filter/sort state stored in sessionStorage, not global context
- ✅ **Immutable updates**: Following React best practices

### Database Management ✅
- ✅ **No schema changes**: Feature uses existing entities
- ✅ **Prisma client**: All data access through existing hooks using Prisma
- ✅ **Error handling**: Proper try-catch and error states in data fetching hooks

### API Design ✅
- ✅ **No new API routes**: Feature uses existing data fetching endpoints
- ✅ **Existing auth checks**: Admin actions use existing NextAuth session checks
- ✅ **Consistent patterns**: Following existing API route structure in `src/app/api/`

### Constitution Gate: **PASS** ✅

No violations detected. All constitutional requirements are met:
- Using mandated technology stack (Next.js, TypeScript, Prisma, Tailwind)
- Following component-based architecture patterns
- Adhering to code quality, testing, and UX standards
- Maintaining state management best practices
- No database or API changes required

## Project Structure

### Documentation (this feature)

```text
specs/004-data-interaction-enhancements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── component-api.md # Component prop interfaces and usage patterns
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/                           # shadcn/ui primitives (existing)
│   │   ├── table.tsx                 # Existing
│   │   ├── input.tsx                 # Existing
│   │   ├── button.tsx                # Existing
│   │   ├── dropdown-menu.tsx         # Existing
│   │   ├── dialog.tsx                # Existing
│   │   ├── scroll-area.tsx           # Existing or to be added
│   │   └── ...
│   ├── DataTable.tsx                 # NEW: Generic table component with TanStack Table
│   ├── TypeaheadDropdown.tsx         # NEW: Searchable dropdown component
│   ├── TableRowActions.tsx           # NEW: Consistent admin action buttons
│   └── [existing components...]
│
├── hooks/
│   ├── useTableState.ts              # NEW: Custom hook for table state management
│   ├── useDebounce.ts                # NEW: Debounce hook for search input
│   ├── useSessionStorage.ts          # NEW: Hook for persisting table state
│   └── [existing hooks...]
│
├── lib/
│   ├── table-utils.ts                # NEW: Table filtering, sorting utilities
│   ├── input-sanitization.ts         # NEW: XSS/injection prevention for search inputs
│   └── [existing utils...]
│
├── types/
│   ├── table.ts                      # NEW: TypeScript interfaces for table state
│   └── [existing types...]
│
├── app/
│   ├── leagues/
│   │   └── page.tsx                  # MODIFIED: Replace existing table with DataTable
│   ├── events/
│   │   └── page.tsx                  # MODIFIED: Replace existing table with DataTable
│   ├── matches/
│   │   └── page.tsx                  # MODIFIED: Replace existing table with DataTable
│   ├── players/
│   │   └── page.tsx                  # MODIFIED: Replace existing table with DataTable
│   └── [other pages...]
│
└── __tests__/
    ├── components/
    │   ├── DataTable.test.tsx        # NEW: DataTable component tests
    │   ├── TypeaheadDropdown.test.tsx # NEW: TypeaheadDropdown tests
    │   └── TableRowActions.test.tsx  # NEW: TableRowActions tests
    ├── hooks/
    │   ├── useTableState.test.ts     # NEW: Table state hook tests
    │   └── useDebounce.test.ts       # NEW: Debounce hook tests
    ├── lib/
    │   └── table-utils.test.ts       # NEW: Utility function tests
    └── integration/
        └── data-table-interactions.test.tsx # NEW: Integration tests
```

**Structure Decision**: Web application using Next.js App Router. The project follows a monolithic structure with `src/app/` for pages (App Router), `src/components/` for shared React components, `src/hooks/` for custom hooks, and `src/lib/` for utilities. Component tests are co-located in `src/__tests__/components/`, following the existing pattern. This structure aligns with the constitution's file organization requirements and the existing codebase layout.

## Complexity Tracking

> **No violations detected - this section is intentionally empty**

All constitutional requirements are met without exceptions. The feature:
- Uses the mandated technology stack without additions that violate principles
- Follows existing architectural patterns (component-based, hooks, no global state)
- Requires no new infrastructure or external services
- Maintains code quality, testing, and UX standards
- Implements changes within established component and page structure
