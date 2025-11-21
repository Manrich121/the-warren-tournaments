/**
 * Reusable DataTable component with search, filtering, sorting, and pagination
 * Built with TanStack React Table and shadcn/ui components
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef
} from '@tanstack/react-table';
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useTableState } from '@/hooks/useTableState';
import { useDebounce } from '@/hooks/useDebounce';
import { filterRowsByGlobalSearch, PAGE_SIZES } from '@/lib/table-utils';
import { GenericSkeletonLoader } from '@/components/ShimmeringLoader';

/**
 * Props for DataTable component
 * @template TData - The type of data in the table rows
 */
export interface DataTableProps<TData> {
  /** Table data */
  data: TData[];

  /** Column definitions */
  columns: ColumnDef<TData>[];

  /** Unique storage key for sessionStorage persistence */
  storageKey: string;

  /** Enable global search filter (default: true) */
  enableGlobalFilter?: boolean;

  /** Enable column-specific filters (default: false) */
  enableColumnFilters?: boolean;

  /** Enable sorting (default: true) */
  enableSorting?: boolean;

  /** Enable pagination (default: true) */
  enablePagination?: boolean;

  /** Initial page size (default: 25) */
  initialPageSize?: number;

  /** Loading state */
  isLoading?: boolean;

  /** Optional row click handler */
  onRowClick?: (row: TData) => void;

  /** Optional function to render row actions (edit/delete buttons) */
  renderRowActions?: (row: TData) => React.ReactNode;

  /** Custom empty state message */
  emptyMessage?: string;

  /** Search placeholder text */
  searchPlaceholder?: string;
}

/**
 * DataTable component with built-in search, sort, and pagination
 */
export function DataTable<TData>({
  data,
  columns,
  storageKey,
  enableGlobalFilter = true,
  enableColumnFilters = false,
  enableSorting = true,
  enablePagination = true,
  initialPageSize = 25,
  isLoading = false,
  onRowClick,
  renderRowActions,
  emptyMessage = 'No results found.',
  searchPlaceholder = 'Search...'
}: DataTableProps<TData>) {
  // Local state for search input (before debouncing)
  const [searchInput, setSearchInput] = useState('');

  // Debounce search input for performance
  const debouncedSearch = useDebounce(searchInput, 300);

  // Manage table state with sessionStorage persistence
  const tableState = useTableState({
    storageKey,
    initialPageSize,
    enablePersistence: true
  });

  // Sync debounced search with table state
  useEffect(() => {
    tableState.setGlobalFilter(debouncedSearch);
  }, [debouncedSearch, tableState]);

  // Add actions column if renderRowActions is provided
  const columnsWithActions = useMemo<ColumnDef<TData>[]>(() => {
    if (!renderRowActions) return columns;

    return [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => renderRowActions(row.original),
        enableSorting: false,
        enableGlobalFilter: false
      }
    ];
  }, [columns, renderRowActions]);

  // Initialize TanStack Table
  const table = useReactTable({
    data,
    columns: columnsWithActions,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableGlobalFilter || enableColumnFilters ? getFilteredRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onGlobalFilterChange: tableState.setGlobalFilter,
    onColumnFiltersChange: tableState.setColumnFilters,
    onSortingChange: tableState.setSorting,
    onPaginationChange: tableState.setPagination,
    globalFilterFn: 'fuzzy',
    filterFns: {
      fuzzy: filterRowsByGlobalSearch
    },
    state: {
      globalFilter: tableState.globalFilter,
      columnFilters: tableState.columnFilters,
      sorting: tableState.sorting,
      pagination: tableState.pagination
    }
  });

  // Loading state
  if (isLoading) {
    return <GenericSkeletonLoader />;
  }

  return (
    <div className="space-y-4">
      {/* Search and controls */}
      <div className="flex items-center justify-between gap-4">
        {enableGlobalFilter && (
          <div className="flex-1 max-w-sm">
            <Input
              placeholder={searchPlaceholder}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {enableGlobalFilter && searchInput && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchInput('');
              tableState.resetFilters();
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const canSort = header.column.getCanSort();

                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              canSort
                                ? 'flex items-center space-x-1 cursor-pointer hover:text-foreground select-none'
                                : ''
                            }
                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          >
                            <span className="font-medium">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {canSort && (
                              <span className="ml-2">
                                {header.column.getIsSorted() === 'asc' ? (
                                  <ChevronUpIcon className="h-4 w-4" />
                                ) : header.column.getIsSorted() === 'desc' ? (
                                  <ChevronDownIcon className="h-4 w-4" />
                                ) : (
                                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={onRowClick ? 'cursor-pointer' : ''}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        onClick={cell.column.id === 'actions' ? e => e.stopPropagation() : undefined}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columnsWithActions.length} className="h-24 text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {enablePagination && data.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length === 0 ? (
              'No results'
            ) : (
              <>
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{' '}
                of {table.getFilteredRowModel().rows.length} results
              </>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={value => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {PAGE_SIZES.map(pageSize => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>«
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>‹
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>›
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>»
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
