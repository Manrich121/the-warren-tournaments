'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type FilterValue = string | null;
export type Filters = Record<string, FilterValue>;

export function useURLFilters(defaultFilters: Filters = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filters from URL
  const filters = useMemo(() => {
    const currentFilters: Filters = { ...defaultFilters };
    
    searchParams.forEach((value, key) => {
      if (value && value !== 'all') {
        currentFilters[key] = value;
      } else {
        currentFilters[key] = null;
      }
    });

    return currentFilters;
  }, [searchParams, defaultFilters]);

  // Update a specific filter
  const setFilter = useCallback(
    (key: string, value: FilterValue) => {
      const params = new URLSearchParams(searchParams);
      
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Update multiple filters at once
  const setFilters = useCallback(
    (newFilters: Partial<Filters>) => {
      const params = new URLSearchParams(searchParams);
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push(window.location.pathname, { scroll: false });
  }, [router]);

  // Clear a specific filter
  const clearFilter = useCallback(
    (key: string) => {
      setFilter(key, null);
    },
    [setFilter]
  );

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== null);
  }, [filters]);

  return {
    filters,
    setFilter,
    setFilters,
    clearFilter,
    clearFilters,
    hasActiveFilters,
  };
}