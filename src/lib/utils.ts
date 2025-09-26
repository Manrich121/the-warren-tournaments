import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function genericSort <T,>(array: T[], field: keyof T, direction: 'asc' | 'desc') {
  return [...array].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    let comparison = 0;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      const dateA = new Date(aValue as string);
      const dateB = new Date(bValue as string);
      comparison = dateA.getTime() - dateB.getTime();
    }

    return direction === 'asc' ? comparison : -comparison;
  });
};