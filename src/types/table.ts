/**
 * TypeScript interfaces for table state management and data structures
 * Used by DataTable, TypeaheadDropdown, and TableRowActions components
 */

import { ColumnDef } from '@tanstack/react-table';

/**
 * Table state interface for storing filter, sort, and pagination state
 * @template TData - The type of data in the table rows
 */
export interface TableState<TData = unknown> {
  /** Global search query (applies to all searchable columns) */
  globalFilter: string;

  /** Column-specific filters (e.g., { leagueId: 'abc123', startDate: '2025-01-01' }) */
  columnFilters: ColumnFilter[];

  /** Sorting state (e.g., [{ id: 'name', desc: false }]) */
  sorting: SortingState[];

  /** Pagination state */
  pagination: PaginationState;
}

/**
 * Column filter interface
 */
export interface ColumnFilter {
  /** Column ID (matches TanStack Table column definition) */
  id: string;

  /** Filter value (string, number, date, etc.) */
  value: unknown;
}

/**
 * Sorting state interface
 */
export interface SortingState {
  /** Column ID */
  id: string;

  /** true = descending, false = ascending */
  desc: boolean;
}

/**
 * Pagination state interface
 */
export interface PaginationState {
  /** Zero-based page index */
  pageIndex: number;

  /** Rows per page (25, 50, 100) */
  pageSize: number;
}

/**
 * Data table column type alias for TanStack Table's ColumnDef with additional metadata
 * @template TData - The type of data in the table rows
 *
 * Note: Use ColumnDef<TData> directly in components. This type is provided for reference.
 * Additional properties like enableSorting, enableGlobalFilter are supported via TanStack Table's ColumnDef.
 */
export type DataTableColumn<TData> = ColumnDef<TData> & {
  /** Metadata for filter configuration (optional) */
  meta?: {
    filterType?: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean';
    filterOptions?: { label: string; value: string }[];
  };
};

/**
 * Typeahead option interface for dropdown menus
 * @template T - The type of the option value
 */
export interface TypeaheadOption<T = string> {
  /** Display label shown to user */
  label: string;

  /** Internal value (entity ID, enum value, etc.) */
  value: T;

  /** Optional additional data (e.g., full entity for rendering) */
  data?: unknown;
}

/**
 * Filter state interface for page-level filter management
 */
export interface FilterState {
  /** Key-value pairs for active filters (column ID → filter value) */
  [columnId: string]: FilterValue;
}

/**
 * Filter value type union
 */
export type FilterValue = string | number | boolean | Date | [Date, Date] | null;

/**
 * Default table state constant
 */
export const DEFAULT_TABLE_STATE: TableState = {
  globalFilter: '',
  columnFilters: [],
  sorting: [],
  pagination: {
    pageIndex: 0,
    pageSize: 25
  }
};

/**
 * Page size options for pagination dropdown
 */
export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

/**
 * Debounce delay for search input (milliseconds)
 */
export const DEBOUNCE_DELAY = 300;
