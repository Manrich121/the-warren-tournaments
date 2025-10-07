'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type FilterValue = string | number | undefined | null;

export function useURLFilters<T extends Record<string, FilterValue>>(defaultFilters?: T) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: T = useMemo(() => {
    const currentFilters: any = { ...defaultFilters };

    searchParams.forEach((value, key) => {
      if (value && value !== 'all') {
        currentFilters[key] = value;
      } else {
        currentFilters[key] = null;
      }
    });

    return currentFilters as T;
  }, [searchParams, defaultFilters]);

  const setFilter = useCallback(
    (key: keyof T, value: FilterValue) => {
      const params = new URLSearchParams(searchParams);

      if (value !== null && value !== undefined && value !== 'all') {
        params.set(key as string, String(value));
      } else {
        params.delete(key as string);
      }

      router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const setFilters = useCallback(
    (newFilters: Partial<T>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== 'all') {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  const clearFilter = useCallback(
    (key: keyof T) => {
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
    hasActiveFilters
  };
}
