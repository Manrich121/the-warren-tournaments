# Component API Contracts

**Date**: 2025-01-21
**Feature**: Data Interaction Enhancements
**Status**: Completed

## Overview

This document defines the public API contracts for all reusable components created by this feature. These contracts serve as the source of truth for component interfaces, ensuring consistency across implementations.

---

## 1. DataTable Component

**Purpose**: Generic, reusable table component with built-in search, filtering, sorting, and pagination.

### Type Signature

```typescript
<TData extends Record<string, any>>(
  props: DataTableProps<TData>
) => React.ReactElement
```

### Props Interface

```typescript
interface DataTableProps<TData> {
  // Table data (array of entities)
  data: TData[];

  // Column definitions (structure, rendering, capabilities)
  columns: ColumnDef<TData>[];

  // Optional: Enable global search (default: true)
  enableGlobalFilter?: boolean;

  // Optional: Enable column filters (default: false)
  enableColumnFilters?: boolean;

  // Optional: Enable sorting (default: true)
  enableSorting?: boolean;

  // Optional: Enable pagination (default: true)
  enablePagination?: boolean;

  // Optional: Initial page size (default: 25)
  initialPageSize?: 25 | 50 | 100;

  // Optional: Search placeholder text (default: "Search...")
  searchPlaceholder?: string;

  // Optional: Storage key for persisting state in sessionStorage
  // (default: derived from table ID or undefined for no persistence)
  storageKey?: string;

  // Optional: Loading state (shows skeleton loader)
  isLoading?: boolean;

  // Optional: Custom empty state message
  emptyStateMessage?: string;

  // Optional: Row click handler
  onRowClick?: (row: TData) => void;

  // Optional: Custom row actions (e.g., edit, delete buttons)
  // Rendered in last column if provided
  renderRowActions?: (row: TData) => React.ReactNode;
}
```

### Column Definition (TanStack Table)

```typescript
type ColumnDef<TData> = {
  // Column identifier
  id: string;

  // Header label
  header: string | ((props: HeaderContext<TData, unknown>) => React.ReactNode);

  // Data accessor
  accessorKey?: keyof TData;
  accessorFn?: (row: TData) => any;

  // Cell rendering
  cell?: (info: CellContext<TData, any>) => React.ReactNode;

  // Column capabilities
  enableSorting?: boolean; // Default: true
  enableColumnFilter?: boolean; // Default: false
  enableGlobalFilter?: boolean; // Default: true

  // Filter configuration
  filterFn?: FilterFn<TData>;
  meta?: {
    filterType?: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean';
    filterOptions?: TypeaheadOption[]; // For select-type filters
  };
};
```

### Usage Example

```typescript
import { DataTable } from '@/components/DataTable';
import { League } from '@prisma/client';

const LeaguesPage = () => {
  const { data: leagues, isLoading } = useLeagues();

  const columns: ColumnDef<League>[] = [
    {
      id: 'name',
      header: 'League Name',
      accessorKey: 'name',
      enableSorting: true,
      enableGlobalFilter: true,
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
  ];

  return (
    <DataTable
      data={leagues || []}
      columns={columns}
      isLoading={isLoading}
      storageKey="table-state-leagues"
      onRowClick={(league) => router.push(`/leagues/${league.id}`)}
      renderRowActions={(league) => (
        <TableRowActions
          onEdit={() => handleEdit(league.id)}
          onDelete={() => handleDelete(league.id)}
          entityName="league"
        />
      )}
    />
  );
};
```

### Behavior Contract

- **Search**: Debounced by 300ms, filters rows across all columns with `enableGlobalFilter: true`
- **Sort**: Click header once for ascending, twice for descending, thrice to clear
- **Filter**: Applied immediately on selection, resets pagination to page 0
- **Pagination**: Shows controls only when total rows > page size
- **State persistence**: Saves search, filters, sort, pagination to sessionStorage under `storageKey`
- **Loading state**: Renders skeleton loader when `isLoading: true`
- **Empty state**: Shows `emptyStateMessage` when filtered data is empty
- **Accessibility**: Full keyboard navigation, ARIA labels, screen reader support

---

## 2. TypeaheadDropdown Component

**Purpose**: Searchable dropdown with keyboard navigation for selecting from large option lists.

### Type Signature

```typescript
<T = string>(
  props: TypeaheadDropdownProps<T>
) => React.ReactElement
```

### Props Interface

```typescript
interface TypeaheadDropdownProps<T = string> {
  // Available options
  options: TypeaheadOption<T>[];

  // Currently selected value(s)
  value: T | T[] | null;

  // Change handler
  onSelect: (value: T | T[] | null) => void;

  // Optional: Allow multiple selections (default: false)
  multiple?: boolean;

  // Optional: Placeholder text (default: "Select...")
  placeholder?: string;

  // Optional: Search placeholder (default: "Search...")
  searchPlaceholder?: string;

  // Optional: Disabled state (default: false)
  disabled?: boolean;

  // Optional: Error state (default: false)
  error?: boolean;

  // Optional: Helper text shown below dropdown
  helperText?: string;

  // Optional: Label shown above dropdown
  label?: string;

  // Optional: Mark as required field
  required?: boolean;

  // Optional: Max dropdown height in pixels (default: 300)
  maxHeight?: number;

  // Optional: Custom render for selected value
  renderValue?: (value: T) => React.ReactNode;

  // Optional: Custom render for option in list
  renderOption?: (option: TypeaheadOption<T>) => React.ReactNode;

  // Optional: Empty state message when no options match search
  emptyMessage?: string; // Default: "No results found"
}

interface TypeaheadOption<T = string> {
  label: string; // Display text
  value: T; // Internal value
  disabled?: boolean; // Optional: disable this option
}
```

### Usage Example

```typescript
import { TypeaheadDropdown } from '@/components/TypeaheadDropdown';

const EventFilters = () => {
  const { data: leagues } = useLeagues();
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

  const leagueOptions: TypeaheadOption[] = leagues.map(league => ({
    label: league.name,
    value: league.id,
  }));

  return (
    <TypeaheadDropdown
      options={leagueOptions}
      value={selectedLeagueId}
      onSelect={setSelectedLeagueId}
      label="Filter by League"
      placeholder="Select a league"
      searchPlaceholder="Search leagues..."
    />
  );
};
```

### Behavior Contract

- **Search**: Case-insensitive substring matching on option labels, real-time filtering
- **Keyboard navigation**:
  - `ArrowDown`: Move to next option
  - `ArrowUp`: Move to previous option
  - `Enter`: Select highlighted option
  - `Escape`: Close dropdown
  - `Home`: Jump to first option
  - `End`: Jump to last option
- **Highlighting**: Matched search substring highlighted in option labels
- **Clear button**: Shown when value is selected, clears selection on click
- **Multiple selection**: If `multiple: true`, selected values shown as chips
- **Accessibility**: ARIA combobox role, aria-expanded, aria-selected, screen reader announcements

---

## 3. TableRowActions Component

**Purpose**: Consistent edit/delete action buttons for table rows (admin-only).

### Type Signature

```typescript
(props: TableRowActionsProps) => React.ReactElement | null
```

### Props Interface

```typescript
interface TableRowActionsProps {
  // Edit button click handler
  onEdit: () => void;

  // Delete button click handler
  onDelete: () => void;

  // Entity name for confirmation dialog (e.g., "league", "event")
  entityName: string;

  // Optional: Additional context for delete warning (e.g., "and all associated events")
  deleteWarning?: string;

  // Optional: Show edit button (default: true)
  showEdit?: boolean;

  // Optional: Show delete button (default: true)
  showDelete?: boolean;

  // Optional: Disable buttons (default: false)
  disabled?: boolean;
}
```

### Usage Example

```typescript
import { TableRowActions } from '@/components/TableRowActions';

const LeagueRow = ({ league }: { league: League }) => {
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const handleEdit = () => {
    // Open edit dialog
  };

  const handleDelete = () => {
    // Show delete confirmation, then call delete mutation
  };

  return (
    <tr>
      <td>{league.name}</td>
      <td>
        {isAdmin && (
          <TableRowActions
            onEdit={handleEdit}
            onDelete={handleDelete}
            entityName="league"
            deleteWarning="This will also delete all associated events and matches."
          />
        )}
      </td>
    </tr>
  );
};
```

### Behavior Contract

- **Visibility**: Component returns `null` if not admin (checked via useSession hook internally)
- **Edit button**: PencilIcon, tooltip "Edit {entityName}"
- **Delete button**: TrashIcon, tooltip "Delete {entityName}", opens confirmation dialog
- **Confirmation dialog**:
  - Title: "Delete {entityName}?"
  - Message: "Are you sure you want to delete this {entityName}? {deleteWarning}"
  - Buttons: Cancel (secondary), Delete (destructive red)
- **Click propagation**: Stops event propagation to prevent triggering row click handler
- **Icons**: lucide-react icons with aria-labels
- **Accessibility**: Tooltips, keyboard navigation, focus management

---

## 4. useTableState Hook

**Purpose**: Custom hook for managing table state with sessionStorage persistence.

### Type Signature

```typescript
<TData>(
  storageKey: string,
  options?: UseTableStateOptions
) => UseTableStateReturn<TData>
```

### Interface

```typescript
interface UseTableStateOptions {
  // Initial page size (default: 25)
  initialPageSize?: 25 | 50 | 100;
}

interface UseTableStateReturn<TData> {
  // Current table state
  tableState: TableState<TData>;

  // Update global filter (search query)
  setGlobalFilter: (value: string) => void;

  // Update column filters
  setColumnFilters: (filters: ColumnFilter[]) => void;

  // Update sorting
  setSorting: (sorting: SortingState) => void;

  // Update pagination
  setPagination: (pagination: PaginationState) => void;

  // Clear all filters and search
  clearFilters: () => void;

  // Reset table state to defaults
  resetState: () => void;
}
```

### Usage Example

```typescript
import { useTableState } from '@/hooks/useTableState';

const DataTable = <TData,>({ storageKey, initialPageSize }: DataTableProps<TData>) => {
  const {
    tableState,
    setGlobalFilter,
    setColumnFilters,
    setSorting,
    setPagination,
    clearFilters,
  } = useTableState<TData>(storageKey, { initialPageSize });

  // Pass state to TanStack Table
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: tableState.globalFilter,
      columnFilters: tableState.columnFilters,
      sorting: tableState.sorting,
      pagination: tableState.pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    // ... other options
  });

  return (
    <div>
      <Input
        value={tableState.globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />
      {/* ... rest of table UI */}
    </div>
  );
};
```

### Behavior Contract

- **Persistence**: Saves state to sessionStorage under `storageKey` on every update
- **Initialization**: Loads state from sessionStorage on mount, falls back to defaults
- **Debouncing**: NOT applied here (handled by consuming component for search input)
- **Error handling**: Silently falls back to defaults if sessionStorage fails (quota, parsing errors)
- **Type safety**: Generic `TData` ensures type safety for column filters

---

## 5. useDebounce Hook

**Purpose**: Debounce rapidly changing values (e.g., search input).

### Type Signature

```typescript
<T>(value: T, delay: number) => T
```

### Interface

```typescript
function useDebounce<T>(value: T, delay: number): T
```

**Parameters**:
- `value`: The value to debounce
- `delay`: Delay in milliseconds (e.g., 300)

**Returns**: Debounced value

### Usage Example

```typescript
import { useDebounce } from '@/hooks/useDebounce';

const SearchInput = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    // Only runs when debouncedQuery changes (300ms after last keystroke)
    console.log('Searching for:', debouncedQuery);
  }, [debouncedQuery]);

  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

### Behavior Contract

- **Delay**: Value updates only after `delay` milliseconds of inactivity
- **Cleanup**: Clears timeout on unmount or when `value` changes
- **Initial value**: Returns `value` immediately on first render (no delay)
- **Type safety**: Generic `T` preserves value type

---

## 6. useSessionStorage Hook

**Purpose**: Persist state in sessionStorage with React state synchronization.

### Type Signature

```typescript
<T>(key: string, initialValue: T) => [T, (value: T) => void]
```

### Interface

```typescript
function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>]
```

**Parameters**:
- `key`: sessionStorage key (must be unique)
- `initialValue`: Fallback value if key not found

**Returns**: Tuple of `[value, setValue]` (like `useState`)

### Usage Example

```typescript
import { useSessionStorage } from '@/hooks/useSessionStorage';

const Component = () => {
  const [filters, setFilters] = useSessionStorage('my-filters', { search: '' });

  return (
    <input
      value={filters.search}
      onChange={(e) => setFilters({ search: e.target.value })}
    />
  );
};
```

### Behavior Contract

- **Storage**: Saves to sessionStorage on every `setValue` call
- **Serialization**: Uses JSON.stringify/parse (must be JSON-serializable)
- **Error handling**: Falls back to `initialValue` on parse errors or quota exceeded
- **Cross-tab sync**: Does NOT sync across tabs (sessionStorage is tab-scoped)
- **Cleanup**: No cleanup needed (sessionStorage persists until tab closes)

---

## Utility Functions

### sanitizeInput

**Purpose**: Escape HTML entities to prevent XSS in search/filter inputs.

**Signature**:
```typescript
function sanitizeInput(input: string): string
```

**Parameters**:
- `input`: Raw user input string

**Returns**: Escaped string safe for HTML rendering

**Example**:
```typescript
import { sanitizeInput } from '@/lib/input-sanitization';

const userInput = '<script>alert("XSS")</script>';
const safeInput = sanitizeInput(userInput);
// Result: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
```

**Behavior**:
- Escapes: `<`, `>`, `&`, `"`, `'`
- Does NOT validate or restrict input (all characters allowed)
- Use before rendering highlighted text in TypeaheadDropdown

---

### filterRowsByGlobalSearch

**Purpose**: Filter table rows by global search query.

**Signature**:
```typescript
function filterRowsByGlobalSearch<TData>(
  rows: TData[],
  query: string,
  searchableColumns: string[]
): TData[]
```

**Parameters**:
- `rows`: Array of row data
- `query`: Search query string
- `searchableColumns`: Array of column keys to search

**Returns**: Filtered rows matching query

**Example**:
```typescript
import { filterRowsByGlobalSearch } from '@/lib/table-utils';

const leagues = [/* ... */];
const results = filterRowsByGlobalSearch(
  leagues,
  'summer',
  ['name', 'description']
);
```

**Behavior**:
- Case-insensitive substring matching
- Searches across all `searchableColumns`
- Returns row if query matches ANY column
- Empty query returns all rows

---

## Error States

### DataTable Empty State
```typescript
<div className="text-center text-muted-foreground py-8">
  {emptyStateMessage || 'No results found'}
</div>
```

### TypeaheadDropdown No Results
```typescript
<div className="p-2 text-center text-sm text-muted-foreground">
  {emptyMessage || 'No results found'}
</div>
```

### Delete Confirmation Dialog
```typescript
<Dialog>
  <DialogHeader>
    <DialogTitle>Delete {entityName}?</DialogTitle>
    <DialogDescription>
      Are you sure you want to delete this {entityName}? This action cannot be undone.
      {deleteWarning && ` ${deleteWarning}`}
    </DialogDescription>
  </DialogHeader>
  <DialogFooter>
    <Button variant="outline" onClick={onCancel}>Cancel</Button>
    <Button variant="destructive" onClick={onConfirm}>Delete</Button>
  </DialogFooter>
</Dialog>
```

---

## Accessibility Requirements

All components MUST meet WCAG 2.1 AA standards:

### DataTable
- `<table>` with proper semantic structure
- Column headers with `scope="col"`
- ARIA labels for sort buttons: `aria-label="Sort by {column}, {direction}"`
- Keyboard navigation for sortable headers (Enter/Space to toggle)

### TypeaheadDropdown
- `role="combobox"` on input
- `aria-expanded` indicates dropdown state
- `aria-controls` links input to listbox
- `aria-activedescendant` tracks highlighted option
- `role="option"` on each list item
- `aria-selected` on selected options

### TableRowActions
- Tooltip text also in `aria-label`
- Buttons have visible focus indicator
- Delete dialog has focus trap
- Escape key closes dialog

---

## Summary

These component APIs provide:
- **Type safety**: Full TypeScript interfaces with generics
- **Flexibility**: Composable props for customization
- **Consistency**: Standardized behavior across all tables
- **Accessibility**: WCAG 2.1 AA compliance built-in
- **Performance**: Optimized with debouncing, memoization, virtualization support

All contracts are stable and ready for implementation in Phase 2 (tasks generation).
