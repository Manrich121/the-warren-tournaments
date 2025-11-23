# Data Model: Data Interaction Enhancements

**Date**: 2025-01-21
**Feature**: Data Interaction Enhancements
**Status**: Completed

## Overview

This feature does NOT modify the existing database schema. Instead, it defines the **client-side data structures** and **TypeScript interfaces** needed to manage table interactions (search, filtering, sorting, pagination). All entities referenced are existing Prisma models.

---

## Existing Entities (No Changes)

These entities already exist in the Prisma schema and are used by the feature:

### League
```prisma
model League {
  id        String      @id @default(cuid())
  name      String
  startDate DateTime
  endDate   DateTime
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  events    Event[]
  prizePool PrizePool[]
}
```

**Searchable Fields**: `name`
**Sortable Fields**: `name`, `startDate`, `endDate`, `createdAt`
**Filterable Fields**: `startDate` (date range), `endDate` (date range)

---

### Event
```prisma
model Event {
  id           String   @id @default(cuid())
  leagueId     String
  name         String
  date         DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  league       League   @relation(fields: [leagueId], references: [id])
  matches      Match[]
  participants Player[] @relation("EventParticipants")
}
```

**Searchable Fields**: `name`
**Sortable Fields**: `name`, `date`, `createdAt`
**Filterable Fields**: `leagueId` (dropdown), `date` (date range)

---

### Match
```prisma
model Match {
  id           String   @id @default(cuid())
  eventId      String
  player1Id    String
  player2Id    String
  player1Score Int
  player2Score Int
  round        Int
  draw         Boolean
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  event        Event    @relation(fields: [eventId], references: [id])
  player1      Player   @relation("Player1", fields: [player1Id], references: [id])
  player2      Player   @relation("Player2", fields: [player2Id], references: [id])
}
```

**Searchable Fields**: `player1.name`, `player2.name` (via relations)
**Sortable Fields**: `round`, `player1Score`, `player2Score`, `createdAt`
**Filterable Fields**: `eventId` (dropdown), `round` (number), `draw` (boolean)

---

### Player
```prisma
model Player {
  id               String   @id @default(cuid())
  name             String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  matchesAsPlayer1 Match[]  @relation("Player1")
  matchesAsPlayer2 Match[]  @relation("Player2")
  events           Event[]  @relation("EventParticipants")
}
```

**Searchable Fields**: `name`
**Sortable Fields**: `name`, `createdAt`
**Filterable Fields**: None (could add event participation filter in future)

---

## Client-Side Data Structures

These TypeScript interfaces define the shape of client-side table state. They are NOT database models.

### TableState<TData>

**Purpose**: Stores the current state of a table (search query, filters, sort, pagination).

**Definition**:
```typescript
interface TableState<TData> {
  // Global search query (applies to all searchable columns)
  globalFilter: string;

  // Column-specific filters (e.g., { leagueId: 'abc123', startDate: '2025-01-01' })
  columnFilters: ColumnFilter[];

  // Sorting state (e.g., [{ id: 'name', desc: false }])
  sorting: SortingState;

  // Pagination state
  pagination: PaginationState;
}

interface ColumnFilter {
  id: string; // Column ID (matches TanStack Table column definition)
  value: unknown; // Filter value (string, number, date, etc.)
}

interface SortingState {
  id: string; // Column ID
  desc: boolean; // true = descending, false = ascending
}

interface PaginationState {
  pageIndex: number; // Zero-based page index
  pageSize: number; // Rows per page (25, 50, 100)
}
```

**Storage**: Persisted in sessionStorage as JSON (per-page basis)

**Initialization**:
```typescript
const DEFAULT_TABLE_STATE: TableState<any> = {
  globalFilter: '',
  columnFilters: [],
  sorting: [],
  pagination: {
    pageIndex: 0,
    pageSize: 25,
  },
};
```

---

### DataTableColumn<TData>

**Purpose**: Defines a column in the DataTable component, including display name, accessor, and capabilities.

**Definition**:
```typescript
interface DataTableColumn<TData> {
  // Column identifier (must match TData field)
  id: string;

  // Human-readable header label
  header: string;

  // Accessor function to get cell value from row data
  accessorKey?: keyof TData;
  accessorFn?: (row: TData) => any;

  // Column capabilities
  enableSorting?: boolean; // Default: true
  enableColumnFilter?: boolean; // Default: false
  enableGlobalFilter?: boolean; // Default: true (for searchable columns)

  // Custom cell rendering (optional)
  cell?: (info: CellContext<TData, any>) => React.ReactNode;

  // Filter configuration (for column-specific filters)
  filterFn?: FilterFn<TData>; // Custom filter function
  meta?: {
    filterType?: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean';
    filterOptions?: { label: string; value: string }[]; // For select filters
  };
}
```

**Example** (Leagues table):
```typescript
const leagueColumns: DataTableColumn<League>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableSorting: true,
    enableGlobalFilter: true, // Searchable
  },
  {
    id: 'startDate',
    header: 'Start Date',
    accessorKey: 'startDate',
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    meta: { filterType: 'date' },
  },
  {
    id: 'endDate',
    header: 'End Date',
    accessorKey: 'endDate',
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    meta: { filterType: 'date' },
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    enableSorting: true,
    cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
  },
];
```

---

### TypeaheadOption

**Purpose**: Represents an option in a typeahead dropdown (used for filters and form inputs).

**Definition**:
```typescript
interface TypeaheadOption<T = string> {
  // Display label shown to user
  label: string;

  // Internal value (entity ID, enum value, etc.)
  value: T;

  // Optional additional data (e.g., full entity for rendering)
  data?: any;
}
```

**Example** (League filter for Events page):
```typescript
const leagueOptions: TypeaheadOption[] = leagues.map(league => ({
  label: league.name,
  value: league.id,
  data: league, // Full league object for metadata
}));
```

---

### FilterState

**Purpose**: Represents active filters for a specific page (used in UI state, not TanStack Table).

**Definition**:
```typescript
interface FilterState {
  // Key-value pairs for active filters (column ID → filter value)
  [columnId: string]: FilterValue;
}

type FilterValue = string | number | boolean | Date | [Date, Date] | null;
```

**Example** (Events page with league and date range filters):
```typescript
const filtersState: FilterState = {
  leagueId: 'abc123', // Selected league ID
  dateRange: [new Date('2025-01-01'), new Date('2025-12-31')], // Date range
};
```

**State Coordination**:
- `FilterState` (UI state) → converted to → `ColumnFilter[]` (TanStack Table state)
- Conversion happens in `useTableState` hook

---

## State Transitions

### Search Flow

```
User types in search box
  ↓
[useDebounce] delays update by 300ms
  ↓
Debounced value updates
  ↓
[DataTable] sets globalFilter state
  ↓
[TanStack Table] applies getFilteredRowModel
  ↓
[DataTable] re-renders with filtered rows
  ↓
[useSessionStorage] persists globalFilter
```

---

### Filter Flow (Column-Specific)

```
User selects option in TypeaheadDropdown (e.g., league)
  ↓
[TypeaheadDropdown] calls onSelect(option.value)
  ↓
Parent component updates FilterState
  ↓
FilterState converted to ColumnFilter[]
  ↓
[DataTable] sets columnFilters state
  ↓
[TanStack Table] applies getFilteredRowModel with custom filterFn
  ↓
[DataTable] re-renders with filtered rows
  ↓
[DataTable] resets pagination to page 0 (TanStack Table automatic)
  ↓
[useSessionStorage] persists columnFilters
```

---

### Sort Flow

```
User clicks column header
  ↓
[DataTable] calls column.toggleSorting()
  ↓
[TanStack Table] updates sorting state:
  - First click: asc
  - Second click: desc
  - Third click: remove sort
  ↓
[TanStack Table] applies getSortedRowModel
  ↓
[DataTable] re-renders with sorted rows
  ↓
[useSessionStorage] persists sorting
```

---

### Pagination Flow

```
User clicks "Next Page" button
  ↓
[DataTable] calls table.nextPage()
  ↓
[TanStack Table] increments pageIndex
  ↓
[TanStack Table] applies getPaginationRowModel
  ↓
[DataTable] re-renders with new page rows
  ↓
[useSessionStorage] persists pagination
```

**Pagination Reset Triggers**:
- Global filter change → reset to page 0
- Column filter change → reset to page 0
- Sort change → maintain current page

---

## Validation Rules

### Search Input
- **Max length**: 100 characters (prevent abuse)
- **Allowed characters**: All Unicode characters (no regex restrictions)
- **Sanitization**: Escape HTML entities before rendering in highlights

### Date Filters
- **Format**: ISO-8601 strings (YYYY-MM-DD) for storage
- **Range validation**: Start date must be <= end date
- **Invalid dates**: Treated as null (no filter applied)

### Pagination
- **Page size options**: [25, 50, 100]
- **Default page size**: 25
- **Page index bounds**: 0 <= pageIndex < totalPages
- **Invalid page**: Reset to page 0

### Column Filters
- **Select filters**: Value must match one of filterOptions
- **Number filters**: Parse as integer/float, reject non-numeric input
- **Boolean filters**: true/false only

---

## Error Handling

### sessionStorage Failures
- **Quota exceeded**: Silently fail, revert to default state
- **Parse error**: Log warning, use default state
- **Missing key**: Use default state (first visit)

### Filter Errors
- **Invalid filter value**: Ignore filter, log warning
- **Missing relation data**: Show "Unknown" in display (e.g., deleted league)

### Search Errors
- **Regex injection**: Not applicable (no regex used, plain string matching)
- **XSS attempts**: Escaped by sanitizeInput utility

---

## Performance Considerations

### Client-Side Filtering Scale
- **Target**: <300ms filter latency for 1000 rows
- **Approach**: useMemo for filtered data, TanStack Table optimization
- **Fallback**: If >10,000 rows, consider server-side filtering

### Memory Usage
- **Full dataset in memory**: Acceptable for <10,000 rows per entity
- **sessionStorage limit**: 5-10MB per origin (plenty for table state)

### Re-Render Optimization
- **useMemo**: Filtered/sorted data
- **React.memo**: DataTable sub-components (cells, headers)
- **Debouncing**: Search input (300ms)

---

## Summary

This feature introduces **zero database changes**. All new data structures are client-side TypeScript interfaces for managing table interactions. The feature leverages:
- **Existing Prisma models** (League, Event, Match, Player) for data source
- **TanStack React Table** for table state management (sorting, filtering, pagination)
- **sessionStorage** for persisting UI state across page navigations

State flows are unidirectional: User interaction → Component state → TanStack Table state → Re-render. All state is ephemeral (session-scoped) and does not affect backend data.
