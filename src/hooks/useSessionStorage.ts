/**
 * Custom hook for persisting state in sessionStorage
 * Used for maintaining table state (filters, sort, pagination) during browser session
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing state synchronized with sessionStorage
 * @param key - The sessionStorage key
 * @param initialValue - Initial value if key doesn't exist in sessionStorage
 * @returns Tuple of [storedValue, setValue] similar to useState
 * @example
 * const [tableState, setTableState] = useSessionStorage('table-state-leagues', {
 *   globalFilter: '',
 *   sorting: [],
 *   pagination: { pageIndex: 0, pageSize: 25 }
 * });
 */
export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Get from sessionStorage by key
      const item = window.sessionStorage.getItem(key);

      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to sessionStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to sessionStorage
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        // Handle quota exceeded errors gracefully
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes to sessionStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing sessionStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}
