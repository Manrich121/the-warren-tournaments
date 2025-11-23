# Research: Data Interaction Enhancements

**Date**: 2025-01-21
**Feature**: Data Interaction Enhancements
**Status**: Completed

## Overview

This document consolidates research findings for implementing search, filtering, sorting, and pagination features across data tables in the tournament management application. All technology choices align with the project constitution and user requirements for client-side data manipulation.

---

## Decision 1: Table State Management

**Decision**: Use TanStack React Table v8 (@tanstack/react-table)

**Rationale**:
- **Headless architecture**: Provides powerful table logic without dictating UI, allowing full integration with shadcn/ui components
- **Built-in features**: Native support for sorting, filtering, pagination, and column management
- **TypeScript-first**: Excellent type safety with generics for row data
- **Performance**: Optimized for large datasets with virtual scrolling support (if needed later)
- **React 19 compatibility**: Fully compatible with React 19 and hooks-based patterns
- **Zero dependencies**: Minimal bundle size impact (~15KB gzipped)
- **Community adoption**: Industry standard with 25k+ GitHub stars, extensive documentation

**Alternatives Considered**:
1. **Manual state management (useState/useReducer)**:
   - Rejected: Would require reimplementing complex table logic (sorting, filtering, pagination coordination)
   - Too much maintenance burden for features already solved by TanStack Table
2. **react-table v7**:
   - Rejected: Older version with different API, not recommended for new projects
3. **AG Grid React**:
   - Rejected: Enterprise-focused with large bundle size, overkill for this use case
4. **Material-UI DataGrid**:
   - Rejected: Requires Material-UI dependency, conflicts with shadcn/ui design system

**Implementation Notes**:
- Use `useReactTable` hook with column definitions typed to entity schemas
- Integrate with shadcn/ui Table components for rendering
- Leverage `getCoreRowModel`, `getSortedRowModel`, `getFilteredRowModel`, and `getPaginationRowModel`

**References**:
- TanStack Table Docs: https://tanstack.com/table/v8/docs/guide/introduction
- React integration: https://tanstack.com/table/v8/docs/framework/react/react-table

---

## Decision 2: Typeahead/Autocomplete Component

**Decision**: Build custom TypeaheadDropdown using shadcn/ui DropdownMenu + Input + ScrollArea

**Rationale**:
- **Constitution compliance**: Stays within shadcn/ui ecosystem (Tailwind CSS, Radix UI primitives)
- **Full control**: Can customize behavior, styling, and keyboard navigation to match design system
- **Lightweight**: No additional dependencies beyond existing shadcn/ui components
- **Accessibility**: Radix UI DropdownMenu provides ARIA attributes and keyboard navigation out-of-box
- **Flexibility**: Easy to extend with features like highlighting matched text, custom rendering

**Alternatives Considered**:
1. **react-select**:
   - Rejected: Heavyweight library (45KB gzipped), requires custom styling to match design system
   - CSS-in-JS approach conflicts with Tailwind philosophy
2. **downshift (by PayPal)**:
   - Rejected: Headless but low-level, requires more boilerplate than shadcn composition
   - Overkill for simple typeahead use case
3. **Headless UI Combobox**:
   - Rejected: While compatible, shadcn/ui already provides DropdownMenu based on Radix UI
   - Mixing Headless UI and Radix UI is unnecessary complexity
4. **shadcn/ui Command component**:
   - Considered: cmdk-based command palette component
   - Partially suitable: Good for command-style search but over-engineered for dropdown filters
   - Decision: Use DropdownMenu for standard dropdowns, reserve Command for global search if needed later

**Implementation Notes**:
- Component structure: Input field triggers DropdownMenu with filtered options in ScrollArea
- State: useState for input value, useMemo for filtered options
- Keyboard nav: Arrow keys, Enter to select, Escape to close (handled by Radix DropdownMenu)
- Highlighting: Use string.replace with `<mark>` tag to highlight matched substrings

**References**:
- shadcn/ui DropdownMenu: https://ui.shadcn.com/docs/components/dropdown-menu
- Radix DropdownMenu: https://www.radix-ui.com/primitives/docs/components/dropdown-menu

---

## Decision 3: Debouncing Search Input

**Decision**: Implement custom `useDebounce` hook

**Rationale**:
- **Simple requirement**: Only need to debounce search input (single use case)
- **Minimal code**: ~15 lines for useDebounce hook using useEffect and setTimeout
- **No dependencies**: Avoid adding lodash or use-debounce libraries for one function
- **Performance**: Prevents excessive re-renders and filtering on every keystroke
- **Standard pattern**: Common React pattern, well-documented

**Alternatives Considered**:
1. **lodash.debounce**:
   - Rejected: Adds dependency for single function, increases bundle size unnecessarily
2. **use-debounce package**:
   - Rejected: Another dependency for trivial hook implementation
3. **No debouncing**:
   - Rejected: Would cause performance issues with large datasets, poor UX during typing

**Implementation Notes**:
- Debounce delay: 300ms (balances responsiveness with performance)
- Hook returns debounced value that updates after delay period
- Cleanup timeout on unmount or value change

**Example**:
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Decision 4: State Persistence (Filter/Sort State)

**Decision**: Use sessionStorage with custom `useSessionStorage` hook

**Rationale**:
- **Requirement**: Spec requires state persistence during browser session (FR-014)
- **Lightweight**: No backend changes or database persistence needed
- **Session-scoped**: State clears on tab close, appropriate for temporary UI preferences
- **Simple API**: Similar to useState but synced with sessionStorage
- **Type-safe**: Can be generic typed for different state shapes

**Alternatives Considered**:
1. **localStorage**:
   - Rejected: Persists across sessions, not desired for temporary filter state
   - Could confuse users if old filters appear on new visits
2. **URL query parameters**:
   - Rejected: Makes URLs messy, complicates sharing/bookmarking
   - Requires Next.js router integration, more complex state sync
3. **Backend persistence**:
   - Rejected: Overkill, requires database schema changes and API endpoints
   - Not needed for temporary UI state
4. **React Context**:
   - Rejected: State lost on page refresh, doesn't meet persistence requirement
5. **Zustand**:
   - Rejected: Too heavyweight for simple session-scoped state
   - Would need persistence middleware anyway

**Implementation Notes**:
- Hook signature: `useSessionStorage<T>(key: string, initialValue: T)`
- Store serialized JSON in sessionStorage
- Handle parse errors gracefully (return initialValue)
- Sync state across hook instances with same key using storage event

**Storage Keys**:
- `table-state-leagues`: Leagues table filters/sort
- `table-state-events`: Events table filters/sort
- `table-state-matches`: Matches table filters/sort
- `table-state-players`: Players table filters/sort

---

## Decision 5: Input Sanitization

**Decision**: Implement string escaping utility for search/filter inputs

**Rationale**:
- **Security requirement**: Spec requires input sanitization (FR-013)
- **Client-side filtering**: No SQL injection risk, but XSS prevention needed
- **Simple solution**: Escape HTML entities before rendering search results
- **React default**: React escapes by default, but explicit sanitization for highlighted text

**Alternatives Considered**:
1. **DOMPurify library**:
   - Rejected: Overkill for search input, heavy library (45KB)
   - Needed for rich text/HTML content, not plain text search
2. **xss package**:
   - Rejected: Another heavy library, unnecessary for controlled use case
3. **Regex-based validation**:
   - Considered: Validate input against allowed character set
   - Rejected: Too restrictive, would prevent legitimate searches with special characters

**Implementation Notes**:
- Function: `sanitizeInput(input: string): string`
- Escape HTML entities: `<`, `>`, `&`, `"`, `'`
- Apply before rendering highlighted text in TypeaheadDropdown
- No validation needed (allow all characters, just escape for display)

**Example**:
```typescript
function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

---

## Decision 6: Date Range Filtering

**Decision**: Use shadcn/ui Popover + Calendar components for date pickers

**Rationale**:
- **Constitution compliance**: shadcn/ui components match design system
- **Built-in component**: Calendar component already available in shadcn/ui
- **Accessibility**: Radix UI Popover provides keyboard navigation and ARIA attributes
- **Date library**: Uses react-day-picker under the hood (lightweight, 15KB)
- **Flexible**: Supports single dates, date ranges, and custom date formats

**Alternatives Considered**:
1. **react-datepicker**:
   - Rejected: Requires custom styling, doesn't match shadcn/ui design
2. **Native input[type="date"]**:
   - Rejected: Inconsistent browser support, poor mobile UX
   - Limited styling control
3. **MUI DatePicker**:
   - Rejected: Requires Material-UI dependency, conflicts with design system

**Implementation Notes**:
- Use DatePicker for single dates (events page: filter by specific date)
- Use DateRangePicker for ranges (events page: filter by start/end date range)
- Format dates as ISO-8601 strings for filtering
- Integrate with TanStack Table column filters

**References**:
- shadcn/ui DatePicker: https://ui.shadcn.com/docs/components/date-picker

---

## Decision 7: Pagination Controls

**Decision**: Build custom pagination UI using TanStack Table pagination API + shadcn/ui Button components

**Rationale**:
- **Integrated state**: TanStack Table provides `getPaginationRowModel` with built-in pagination logic
- **Custom UI control**: Can design pagination controls to match design system exactly
- **Lightweight**: No additional dependencies
- **Flexibility**: Easy to add page size selector, jump to page, etc.

**Alternatives Considered**:
1. **react-paginate**:
   - Rejected: Separate pagination library, doesn't integrate with TanStack Table state
2. **MUI Pagination**:
   - Rejected: Material-UI dependency, design system mismatch

**Implementation Notes**:
- Pagination controls: Previous, Next, First, Last buttons
- Page indicator: "Page X of Y"
- Page size selector: Dropdown with options [25, 50, 100]
- Hide pagination when total rows < page size
- Reset to page 1 when filters change (built into TanStack Table)

**UI Pattern**:
```
[< First] [< Previous] [Page 3 of 10] [Next >] [Last >]  [Show: 25 ▼]
```

---

## Decision 8: Admin Row Actions Pattern

**Decision**: Create reusable TableRowActions component with tooltips

**Rationale**:
- **Consistency requirement**: Spec requires consistent admin actions (FR-007)
- **DRY principle**: Single component for edit/delete actions across all tables
- **Props-based customization**: Pass callbacks and entity-specific labels
- **Accessibility**: Tooltips explain button purpose, icons have aria-labels

**Alternatives Considered**:
1. **Inline actions per page**:
   - Rejected: Violates DRY, inconsistent implementations, harder to maintain
2. **Dropdown menu for actions**:
   - Considered: Could use DropdownMenu for multiple actions
   - Decision: Stick with inline buttons (only 2 actions), dropdowns add complexity

**Implementation Notes**:
- Component props: `onEdit`, `onDelete`, `entityName`, `isAdmin`
- Icons: PencilIcon (edit), TrashIcon (delete) from lucide-react
- Tooltips: "Edit {entityName}", "Delete {entityName}"
- Delete confirmation: Dialog with warning message (including cascade info)
- Conditional render: Only show if `isAdmin` is true

**Example Usage**:
```tsx
<TableRowActions
  onEdit={() => handleEdit(league.id)}
  onDelete={() => handleDelete(league.id)}
  entityName="league"
  isAdmin={isAdmin}
/>
```

---

## Decision 9: Testing Strategy

**Decision**: Unit tests with Jest + React Testing Library, integration tests for user flows

**Rationale**:
- **Constitution requirement**: 80% coverage for critical logic (Testing Standards IV)
- **Existing setup**: Jest and RTL already configured in project
- **Component testing**: RTL best for testing React components from user perspective
- **User-centric**: Tests verify behavior (sorting, filtering) not implementation details

**Test Coverage Plan**:

**Unit Tests**:
- `DataTable.test.tsx`: Rendering, sorting, filtering, pagination state
- `TypeaheadDropdown.test.tsx`: Input filtering, keyboard navigation, selection
- `TableRowActions.test.tsx`: Admin visibility, button clicks, confirmation dialogs
- `useDebounce.test.ts`: Debounce timing, cleanup
- `useTableState.test.ts`: State initialization, updates, persistence
- `table-utils.test.ts`: Filter functions, sort functions

**Integration Tests**:
- `data-table-interactions.test.tsx`: End-to-end user flows
  - Search + sort combination
  - Filter + pagination combination
  - Clear all filters

**Mock Strategy**:
- Mock data fixtures in `src/__tests__/fixtures/`
- Mock Next-Auth session for admin tests
- Mock sessionStorage API

**References**:
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Jest: https://jestjs.io/docs/getting-started

---

## Decision 10: Performance Optimization

**Decision**: Use React.useMemo for expensive computations, virtualization if needed

**Rationale**:
- **Performance goal**: <300ms search latency, <500ms sort latency (Technical Context)
- **Client-side filtering**: All operations on full dataset in memory
- **Expected scale**: <10,000 records per entity (constraint from spec)
- **Optimization strategy**: Memoize filtered/sorted results, avoid unnecessary re-renders

**Optimizations to Implement**:

1. **useMemo for filtered data**:
   ```typescript
   const filteredData = useMemo(() => {
     return data.filter(row => /* filter logic */);
   }, [data, filterState]);
   ```

2. **useMemo for sorted data**:
   - TanStack Table handles this internally with `getSortedRowModel`

3. **Debounced search** (already decided):
   - 300ms delay prevents excessive filtering

4. **Conditional rendering**:
   - Only render visible page rows (TanStack Table pagination handles this)

5. **Virtual scrolling** (if needed):
   - TanStack Table supports `@tanstack/react-virtual`
   - Implement only if performance issues with 1000+ row datasets
   - Decision: NOT implemented initially, add if needed

**Performance Monitoring**:
- Use React DevTools Profiler to measure render times
- Test with 1000-record datasets
- Add console timing for filter/sort operations in development

**Fallback Plan**:
- If client-side filtering is too slow, move to server-side pagination with search params
- Requires new API endpoints, backend filtering logic
- Only pursue if client-side approach fails performance goals

---

## Summary of Decisions

| Decision Area | Choice | Key Rationale |
|---------------|--------|---------------|
| Table State Management | TanStack React Table v8 | Headless, TypeScript-first, built-in features |
| Typeahead Component | Custom with shadcn/ui DropdownMenu | Constitution compliance, full control |
| Search Debouncing | Custom useDebounce hook | Simple, no dependencies |
| State Persistence | sessionStorage + useSessionStorage | Session-scoped, lightweight |
| Input Sanitization | String escaping utility | XSS prevention, simple |
| Date Filtering | shadcn/ui DatePicker/DateRangePicker | Design system match, accessible |
| Pagination UI | Custom UI + TanStack Table API | Integrated state, flexible |
| Admin Row Actions | Reusable TableRowActions component | Consistency, DRY principle |
| Testing | Jest + RTL, 80% coverage | Constitution requirement, user-centric |
| Performance | useMemo, debouncing, conditional rendering | Meets latency goals, scalable |

All decisions align with project constitution requirements and feature specifications.

---

## Open Questions

**None** - All technical decisions resolved. Ready to proceed to Phase 1 (Design & Contracts).
