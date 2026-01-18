/**
 * Custom hook for managing table state with sessionStorage persistence
 * Integrates global search, column filters, sorting, and pagination
 * Used by DataTable component
 */

import { useEffect, useMemo, useState } from 'react';
import { useSessionStorage } from './useSessionStorage';
import { TableState, DEFAULT_TABLE_STATE } from '@/types/table';
import { ColumnFiltersState, SortingState, PaginationState, OnChangeFn } from '@tanstack/react-table';

/**
 * Props for useTableState hook
 */
export interface UseTableStateProps {
  /** Unique key for sessionStorage (e.g., 'table-state-leagues') */
  storageKey: string;

  /** Initial page size (default: 25) */
  initialPageSize?: number;

  /** Enable state persistence (default: true) */
  enablePersistence?: boolean;
}

/**
 * Return type for useTableState hook
 */
export interface UseTableStateReturn {
  /** Current global filter value */
  globalFilter: string;

  /** Set global filter */
  setGlobalFilter: OnChangeFn<string>;

  /** Current column filters */
  columnFilters: ColumnFiltersState;

  /** Set column filters */
  setColumnFilters: OnChangeFn<ColumnFiltersState>;

  /** Current sorting state */
  sorting: SortingState;

  /** Set sorting state */
  setSorting: OnChangeFn<SortingState>;

  /** Current pagination state */
  pagination: PaginationState;

  /** Set pagination state */
  setPagination: OnChangeFn<PaginationState>;

  /** Reset all filters to default */
  resetFilters: () => void;
}

/**
 * Hook for managing table state with sessionStorage persistence
 * @param props - Configuration options
 * @returns Table state management functions
 * @example
 * const tableState = useTableState({
 *   storageKey: 'table-state-leagues',
 *   initialPageSize: 25
 * });
 *
 * const table = useReactTable({
 *   data,
 *   columns,
 *   state: {
 *     globalFilter: tableState.globalFilter,
 *     columnFilters: tableState.columnFilters,
 *     sorting: tableState.sorting,
 *     pagination: tableState.pagination,
 *   },
 *   onGlobalFilterChange: tableState.setGlobalFilter,
 *   onColumnFiltersChange: tableState.setColumnFilters,
 *   onSortingChange: tableState.setSorting,
 *   onPaginationChange: tableState.setPagination,
 * });
 */
export function useTableState(props: UseTableStateProps): UseTableStateReturn {
  const { storageKey, initialPageSize = 25, enablePersistence = true } = props;

  // Initialize state with sessionStorage or defaults
  const defaultState: TableState = useMemo(
    () => ({
      ...DEFAULT_TABLE_STATE,
      pagination: {
        ...DEFAULT_TABLE_STATE.pagination,
        pageSize: initialPageSize
      }
    }),
    [initialPageSize]
  );

  // Use sessionStorage if persistence is enabled, otherwise use regular useState
  const [persistedState, setPersistedState] = enablePersistence
    ? useSessionStorage<TableState>(storageKey, defaultState)
    : useState<TableState>(defaultState);

  // Individual state values for TanStack Table
  const [globalFilter, setGlobalFilterState] = useState<string>(persistedState.globalFilter);
  const [columnFilters, setColumnFiltersState] = useState<ColumnFiltersState>(persistedState.columnFilters);
  const [sorting, setSortingState] = useState<SortingState>(persistedState.sorting);
  const [pagination, setPaginationState] = useState<PaginationState>(persistedState.pagination);

  // Sync individual states with persisted state
  useEffect(() => {
    setGlobalFilterState(persistedState.globalFilter);
    setColumnFiltersState(persistedState.columnFilters);
    setSortingState(persistedState.sorting);
    setPaginationState(persistedState.pagination);
  }, [persistedState]);

  // Update persisted state when individual states change
  useEffect(() => {
    const newState: TableState = {
      globalFilter,
      columnFilters,
      sorting,
      pagination
    };

    // Only update if state actually changed
    if (JSON.stringify(newState) !== JSON.stringify(persistedState)) {
      setPersistedState(newState);
    }
  }, [globalFilter, columnFilters, sorting, pagination, persistedState, setPersistedState]);

  // Wrapped setters that match TanStack Table's OnChangeFn type
  const setGlobalFilter: OnChangeFn<string> = updaterOrValue => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(globalFilter) : updaterOrValue;
    setGlobalFilterState(newValue);
  };

  const setColumnFilters: OnChangeFn<ColumnFiltersState> = updaterOrValue => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(columnFilters) : updaterOrValue;
    setColumnFiltersState(newValue);

    // Reset to first page when column filters change
    setPaginationState(prev => ({ ...prev, pageIndex: 0 }));
  };

  const setSorting: OnChangeFn<SortingState> = updaterOrValue => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSortingState(newValue);
  };

  const setPagination: OnChangeFn<PaginationState> = updaterOrValue => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;
    setPaginationState(newValue);
  };

  // Reset all filters to default
  const resetFilters = () => {
    setGlobalFilterState(defaultState.globalFilter);
    setColumnFiltersState(defaultState.columnFilters);
    setSortingState(defaultState.sorting);
    setPaginationState(defaultState.pagination);
  };

  return {
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    pagination,
    setPagination,
    resetFilters
  };
}
