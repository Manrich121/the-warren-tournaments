# Quickstart Guide: Data Interaction Enhancements

**Date**: 2025-01-21
**Feature**: Data Interaction Enhancements
**Audience**: Developers implementing this feature

## Overview

This guide provides a quick reference for developers implementing the data interaction enhancements. It covers:
- Development environment setup
- Key component usage patterns
- Common implementation scenarios
- Testing strategies
- Troubleshooting tips

---

## Prerequisites

Ensure you have the following installed and configured:

- **Node.js**: v18+ (check with `node --version`)
- **pnpm**: v8+ (check with `pnpm --version`)
- **TypeScript**: v5.9+ (project dependency)
- **Next.js**: 16.0.0 (project dependency)
- **Git**: Branch `004-data-interaction-enhancements` checked out

### Install Dependencies

```bash
# Install @tanstack/react-table (new dependency)
pnpm add @tanstack/react-table

# Install development dependencies
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Verify installation
pnpm list @tanstack/react-table
```

### Check shadcn/ui Components

Verify the following shadcn/ui components are installed:

```bash
# Check existing components
ls src/components/ui/

# Install missing components (if needed)
pnpx shadcn@latest add table
pnpx shadcn@latest add input
pnpx shadcn@latest add button
pnpx shadcn@latest add dropdown-menu
pnpx shadcn@latest add dialog
pnpx shadcn@latest add scroll-area
pnpx shadcn@latest add tooltip
pnpx shadcn@latest add popover
pnpx shadcn@latest add calendar
```

---

## Project Structure Orientation

Key directories and files for this feature:

```
src/
├── components/
│   ├── DataTable.tsx               # Main reusable table component
│   ├── TypeaheadDropdown.tsx       # Searchable dropdown component
│   ├── TableRowActions.tsx         # Admin action buttons
│   └── ui/                         # shadcn/ui primitives
│
├── hooks/
│   ├── useTableState.ts            # Table state + sessionStorage
│   ├── useDebounce.ts              # Search input debouncing
│   └── useSessionStorage.ts        # Generic sessionStorage hook
│
├── lib/
│   ├── table-utils.ts              # Filtering, sorting utilities
│   └── input-sanitization.ts      # XSS prevention
│
├── types/
│   └── table.ts                    # TypeScript interfaces
│
├── app/
│   ├── leagues/page.tsx            # Updated with DataTable
│   ├── events/page.tsx             # Updated with DataTable
│   ├── matches/page.tsx            # Updated with DataTable
│   └── players/page.tsx            # Updated with DataTable
│
└── __tests__/
    ├── components/                 # Component tests
    ├── hooks/                      # Hook tests
    ├── lib/                        # Utility tests
    └── integration/                # Integration tests
```

---

## Quick Implementation Guide

### Scenario 1: Convert Existing Table Page to DataTable

**Before** (existing leagues page with manual table):

```typescript
// src/app/leagues/page.tsx
export default function LeaguesPage() {
  const { data: leagues, isLoading } = useLeagues();
  const [sortField, setSortField] = useState<keyof League>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedLeagues = leagues ? genericSort(leagues, sortField, sortDirection) : [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort('name')}>Name</TableHead>
          {/* ... */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedLeagues.map(league => (
          <TableRow key={league.id}>{/* ... */}</TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**After** (using DataTable component):

```typescript
// src/app/leagues/page.tsx
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { League } from '@prisma/client';

export default function LeaguesPage() {
  const router = useRouter();
  const { data: leagues, isLoading } = useLeagues();
  const { status } = useSession();
  const isAdmin = status === 'authenticated';

  const columns: ColumnDef<League>[] = [
    {
      id: 'name',
      header: 'Name',
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
    {
      id: 'endDate',
      header: 'End Date',
      accessorKey: 'endDate',
      enableSorting: true,
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessorKey: 'createdAt',
      enableSorting: true,
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
  ];

  return (
    <>
      <Header />
      <div className="container mx-auto space-y-6">
        <Nav />
        <div className="py-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Leagues</h1>
            {isAdmin && (
              <AddLeagueDialog>
                <Button>Add New League</Button>
              </AddLeagueDialog>
            )}
          </div>

          <DataTable
            data={leagues || []}
            columns={columns}
            isLoading={isLoading}
            storageKey="table-state-leagues"
            enableGlobalFilter={true}
            enableColumnFilters={false} // Add later if needed
            onRowClick={(league) => router.push(`/leagues/${league.id}`)}
            renderRowActions={
              isAdmin
                ? (league) => (
                    <TableRowActions
                      onEdit={() => handleEdit(league)}
                      onDelete={() => handleDelete(league)}
                      entityName="league"
                      deleteWarning="This will also delete all associated events and matches."
                    />
                  )
                : undefined
            }
          />
        </div>
      </div>
    </>
  );
}
```

**Key Changes**:
1. Replace manual table HTML with `<DataTable />`
2. Define column structure with `ColumnDef<League>[]`
3. Enable global search: `enableGlobalFilter={true}`
4. Add `storageKey` for state persistence
5. Use `renderRowActions` for admin buttons
6. Remove manual sorting logic (handled by DataTable)

---

### Scenario 2: Add Typeahead Filter to Events Page

**Goal**: Filter events by league using searchable dropdown.

```typescript
// src/app/events/page.tsx
import { TypeaheadDropdown } from '@/components/TypeaheadDropdown';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Event, League } from '@prisma/client';

export default function EventsPage() {
  const { data: events } = useEvents();
  const { data: leagues } = useLeagues();

  // Local filter state (not part of DataTable state)
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

  // Prepare typeahead options
  const leagueOptions = leagues?.map(league => ({
    label: league.name,
    value: league.id,
  })) || [];

  // Filter events by selected league (before passing to DataTable)
  const filteredEvents = selectedLeagueId
    ? events?.filter(event => event.leagueId === selectedLeagueId)
    : events;

  const columns: ColumnDef<Event>[] = [
    {
      id: 'name',
      header: 'Event Name',
      accessorKey: 'name',
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      id: 'league',
      header: 'League',
      accessorFn: (row) => {
        const league = leagues?.find(l => l.id === row.leagueId);
        return league?.name || 'Unknown';
      },
      enableSorting: true,
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      enableSorting: true,
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
  ];

  return (
    <div className="py-8 space-y-6">
      <h1 className="text-3xl font-bold">Events</h1>

      {/* Filter UI above table */}
      <div className="flex gap-4">
        <TypeaheadDropdown
          options={leagueOptions}
          value={selectedLeagueId}
          onSelect={setSelectedLeagueId}
          label="Filter by League"
          placeholder="All leagues"
          searchPlaceholder="Search leagues..."
        />

        {selectedLeagueId && (
          <Button
            variant="ghost"
            onClick={() => setSelectedLeagueId(null)}
          >
            Clear filter
          </Button>
        )}
      </div>

      <DataTable
        data={filteredEvents || []}
        columns={columns}
        storageKey="table-state-events"
      />
    </div>
  );
}
```

**Key Points**:
- TypeaheadDropdown manages its own state (`selectedLeagueId`)
- Pre-filter data before passing to DataTable (simpler than column filters for this use case)
- Provide clear action to reset filter
- League name resolved via `accessorFn` (handles deleted leagues gracefully)

---

### Scenario 3: Add Date Range Filter

**Goal**: Filter events by date range.

```typescript
import { DatePickerWithRange } from '@/components/ui/date-picker'; // shadcn/ui component

export default function EventsPage() {
  const { data: events } = useEvents();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

  const filteredEvents = events?.filter(event => {
    if (!dateRange) return true;
    const eventDate = new Date(event.date);
    return eventDate >= dateRange.from && eventDate <= dateRange.to;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <DatePickerWithRange
          value={dateRange}
          onChange={setDateRange}
          placeholder="Filter by date range"
        />
        {dateRange && (
          <Button variant="ghost" onClick={() => setDateRange(undefined)}>
            Clear date filter
          </Button>
        )}
      </div>

      <DataTable data={filteredEvents || []} columns={columns} />
    </div>
  );
}
```

---

## Testing Guide

### Unit Test Example: DataTable Component

```typescript
// src/__tests__/components/DataTable.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';

const mockData = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
];

const mockColumns: ColumnDef<typeof mockData[0]>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
  { id: 'age', header: 'Age', accessorKey: 'age' },
];

describe('DataTable', () => {
  it('should render table with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('should filter data on search input', () => {
    render(<DataTable data={mockData} columns={mockColumns} enableGlobalFilter />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    // Wait for debounce (300ms)
    setTimeout(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    }, 350);
  });

  it('should sort column on header click', () => {
    render(<DataTable data={mockData} columns={mockColumns} enableSorting />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Alice');
    expect(rows[2]).toHaveTextContent('Bob');
  });
});
```

### Integration Test Example: Search + Sort

```typescript
// src/__tests__/integration/data-table-interactions.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LeaguesPage from '@/app/leagues/page';
import { useLeagues } from '@/hooks/useLeagues';

jest.mock('@/hooks/useLeagues');

const mockLeagues = [
  { id: '1', name: 'Summer League', startDate: '2025-06-01', /* ... */ },
  { id: '2', name: 'Winter League', startDate: '2025-12-01', /* ... */ },
];

describe('Leagues Page Interactions', () => {
  beforeEach(() => {
    (useLeagues as jest.Mock).mockReturnValue({ data: mockLeagues, isLoading: false });
  });

  it('should search and sort together', async () => {
    render(<LeaguesPage />);

    // Search for "summer"
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'summer' } });

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('Summer League')).toBeInTheDocument();
      expect(screen.queryByText('Winter League')).not.toBeInTheDocument();
    }, { timeout: 400 });

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText('Winter League')).toBeInTheDocument();
    });

    // Sort by name descending
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader); // asc
    fireEvent.click(nameHeader); // desc

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Winter League');
    expect(rows[2]).toHaveTextContent('Summer League');
  });
});
```

---

## Common Pitfalls & Solutions

### Issue 1: Search Not Debouncing

**Symptom**: Table re-renders on every keystroke, performance issues.

**Cause**: Forgot to use `useDebounce` hook.

**Solution**:
```typescript
// ❌ Wrong
<Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />

// ✅ Correct
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 300);

useEffect(() => {
  setGlobalFilter(debouncedSearch);
}, [debouncedSearch]);

<Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
```

---

### Issue 2: Column Filters Not Working

**Symptom**: Dropdown filter doesn't filter table rows.

**Cause**: Column doesn't have `enableColumnFilter: true` or missing `filterFn`.

**Solution**:
```typescript
const columns: ColumnDef<Event>[] = [
  {
    id: 'leagueId',
    header: 'League',
    accessorKey: 'leagueId',
    enableColumnFilter: true, // ✅ Enable filtering
    filterFn: 'equals', // ✅ Built-in filter function
    meta: {
      filterType: 'select',
      filterOptions: leagueOptions,
    },
  },
];
```

---

### Issue 3: State Not Persisting

**Symptom**: Filters/sort reset on page navigation.

**Cause**: Missing `storageKey` prop or sessionStorage quota exceeded.

**Solution**:
```typescript
// ✅ Provide unique storage key per page
<DataTable storageKey="table-state-leagues" /* ... */ />

// Check sessionStorage quota
console.log('Storage used:', JSON.stringify(sessionStorage).length);
```

---

### Issue 4: Admin Actions Visible to Non-Admins

**Symptom**: Edit/delete buttons show for non-authenticated users.

**Cause**: Not checking session status before rendering actions.

**Solution**:
```typescript
const { status } = useSession();
const isAdmin = status === 'authenticated';

<DataTable
  renderRowActions={
    isAdmin // ✅ Conditional rendering
      ? (row) => <TableRowActions /* ... */ />
      : undefined
  }
/>
```

---

## Performance Optimization Checklist

- [ ] Use `useMemo` for column definitions (prevents re-creation on re-renders)
- [ ] Debounce search input with 300ms delay
- [ ] Limit page size options to [25, 50, 100] (avoid "show all")
- [ ] Use `React.memo` for DataTable if parent re-renders frequently
- [ ] Test with 1000+ row datasets, monitor render times
- [ ] Avoid inline functions in `cell` renderers (define outside component)

**Example**:
```typescript
const columns = useMemo<ColumnDef<League>[]>(() => [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cell: ({ getValue }) => formatName(getValue<string>()), // ✅ Named function
  },
], []); // ✅ Empty deps, columns don't change
```

---

## Debugging Tips

### Enable TanStack Table Devtools

```typescript
import { useReactTable } from '@tanstack/react-table';

const table = useReactTable({
  data,
  columns,
  debugTable: true, // ✅ Enable debug logging
  debugHeaders: true,
  debugColumns: true,
});
```

### Inspect sessionStorage

```javascript
// Browser console
sessionStorage.getItem('table-state-leagues'); // View stored state
sessionStorage.clear(); // Clear all state
```

### Check Filtering Logic

```typescript
const table = useReactTable({
  data,
  columns,
  onStateChange: (updater) => {
    console.log('Table state changed:', updater); // ✅ Log state changes
  },
});
```

---

## Next Steps

1. **Run existing tests**: `pnpm test` (ensure no regressions)
2. **Install dependencies**: `pnpm install`
3. **Start dev server**: `pnpm dev`
4. **Implement components** in order:
   - Utilities (input-sanitization, table-utils)
   - Hooks (useDebounce, useSessionStorage, useTableState)
   - Components (TypeaheadDropdown, TableRowActions, DataTable)
   - Pages (update leagues, events, matches, players)
5. **Write tests** as you go (TDD approach recommended)
6. **Run linter**: `pnpm lint` (ensure code quality)
7. **Manually test** in browser with real data

---

## Resources

- **TanStack Table Docs**: https://tanstack.com/table/v8
- **shadcn/ui Components**: https://ui.shadcn.com/docs/components
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro
- **Project Constitution**: `.specify/memory/constitution.md`
- **Feature Spec**: `specs/004-data-interaction-enhancements/spec.md`
- **Component API**: `specs/004-data-interaction-enhancements/contracts/component-api.md`

---

## Support

If you encounter issues:
1. Check this quickstart guide first
2. Review component API contracts in `contracts/component-api.md`
3. Inspect browser console for errors
4. Check TanStack Table docs for advanced use cases
5. Review existing similar components (e.g., `src/app/leagues/page.tsx`)

Happy coding! 🚀
