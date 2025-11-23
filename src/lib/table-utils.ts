/**
 * Table utility functions for filtering and sorting operations
 * Used by DataTable component with TanStack React Table
 */

import { Row, FilterFn } from '@tanstack/react-table';
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';

declare module '@tanstack/react-table' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

/**
 * Page size options for pagination dropdown
 */
export const PAGE_SIZES = [25, 50, 100] as const;

/**
 * Debounce delay for search input (milliseconds)
 */
export const DEBOUNCE_DELAY = 300;

/**
 * Fuzzy filter function using match-sorter for intelligent ranking
 * Searches across all searchable columns
 */
export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the ranking info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

/**
 * Global filter function for searching across all searchable columns
 * @param row - The table row to filter
 * @param columnId - The column ID (unused, required by TanStack Table interface)
 * @param filterValue - The search query string
 * @returns true if the row matches the search query, false otherwise
 */
export function filterRowsByGlobalSearch<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string
): boolean {
  // If no filter value, show all rows
  if (!filterValue) return true;

  const searchValue = filterValue.toLowerCase().trim();

  // Search across all columns that have enableGlobalFilter: true
  return row.getAllCells().some((cell) => {
    const column = cell.column;

    // Skip columns that don't enable global filter
    if (column.columnDef.enableGlobalFilter === false) {
      return false;
    }

    // Get the cell value
    const cellValue = cell.getValue();

    // Handle different data types
    if (cellValue === null || cellValue === undefined) {
      return false;
    }

    // Convert to string and search (case-insensitive)
    const cellString = String(cellValue).toLowerCase();
    return cellString.includes(searchValue);
  });
}

/**
 * Custom filter function for exact match filtering (e.g., dropdown filters)
 * @param row - The table row to filter
 * @param columnId - The column ID
 * @param filterValue - The filter value to match
 * @returns true if the row matches the filter value, false otherwise
 */
export function filterExactMatch<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown
): boolean {
  if (filterValue === null || filterValue === undefined || filterValue === '') {
    return true;
  }

  const cellValue = row.getValue(columnId);
  return cellValue === filterValue;
}

/**
 * Custom filter function for date range filtering
 * @param row - The table row to filter
 * @param columnId - The column ID
 * @param filterValue - Date range array [startDate, endDate]
 * @returns true if the row date is within the range, false otherwise
 */
export function filterDateRange<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: [Date, Date] | null
): boolean {
  if (!filterValue || !Array.isArray(filterValue) || filterValue.length !== 2) {
    return true;
  }

  const [startDate, endDate] = filterValue;
  const cellValue = row.getValue(columnId);

  if (!cellValue) return false;

  const cellDate = cellValue instanceof Date ? cellValue : new Date(cellValue as string);

  return cellDate >= startDate && cellDate <= endDate;
}

/**
 * Custom filter function for number range filtering
 * @param row - The table row to filter
 * @param columnId - The column ID
 * @param filterValue - Number range object { min, max }
 * @returns true if the row number is within the range, false otherwise
 */
export function filterNumberRange<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: { min?: number; max?: number } | null
): boolean {
  if (!filterValue) return true;

  const cellValue = row.getValue(columnId);
  if (typeof cellValue !== 'number') return false;

  const { min, max } = filterValue;

  if (min !== undefined && cellValue < min) return false;
  if (max !== undefined && cellValue > max) return false;

  return true;
}

/**
 * Custom filter function for boolean filtering
 * @param row - The table row to filter
 * @param columnId - The column ID
 * @param filterValue - Boolean value to match
 * @returns true if the row matches the boolean filter, false otherwise
 */
export function filterBoolean<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: boolean | null
): boolean {
  if (filterValue === null || filterValue === undefined) {
    return true;
  }

  const cellValue = row.getValue(columnId);
  return cellValue === filterValue;
}
