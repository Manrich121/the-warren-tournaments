'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type FilterValue = string | number | undefined | null;

export function useURLFilters<T extends Record<string, FilterValue>>(defaultFilters?: T) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: T = useMemo(() => {
    const newFilters: any = {};

    if (!defaultFilters) {
      return newFilters as T;
    }

    for (const key in defaultFilters) {
      if (searchParams.has(key)) {
        const value = searchParams.get(key);
        if (value && value !== 'all') {
          const defaultValue = defaultFilters[key];
          if (typeof defaultValue === 'number') {
            const numValue = Number(value);
            newFilters[key] = isNaN(numValue) ? defaultValue : numValue;
          } else {
            newFilters[key] = value;
          }
        } else {
          newFilters[key] = null;
        }
      } else {
        newFilters[key] = defaultFilters[key];
      }
    }
    return newFilters as T;
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

  const hasActiveFilters = useMemo(() => {
    for (const key in defaultFilters) {
      if (searchParams.has(key)) {
        const value = searchParams.get(key);
        if (value && value !== 'all') {
          return true;
        }
      }
    }
    return false;
  }, [searchParams, defaultFilters]);

  return {
    filters,
    setFilter,
    setFilters,
    clearFilter,
    clearFilters,
    hasActiveFilters
  };
}
