import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Debounce function to limit the rate at which a function can fire
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Utility function to apply pagination to a Supabase query
 * @param query - The Supabase query builder
 * @param page - Current page (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Object with paginated query and total count
 */
export async function applyPagination<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  page: number,
  pageSize: number
): Promise<{ data: T[]; total: number }> {
  try {
    // Get total count first
    const { count, error: countError } = await query.count();
    if (countError) {
      console.error('Count error:', countError);
      return { data: [], total: 0 };
    }
    const total = count ?? 0;

    // Apply pagination using Supabase's range method
    const offset = (page - 1) * pageSize;
    const { data, error: dataError } = await query.range(offset, offset + pageSize - 1);
    
    if (dataError) {
      console.error('Data error:', dataError);
      return { data: [], total };
    }

    return {
      data: data ?? [],
      total,
    };
  } catch (error) {
    console.error('Pagination error:', error);
    return { data: [], total: 0 };
  }
}

/**
 * Get the start of the current week (Monday) as an ISO date string
 * @returns ISO date string for Monday of current week
 */
export function getWeekStartDate(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so we need 6 days back
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

/**
 * Get the start of a specific week (Monday) as an ISO date string
 * @param date - Date to get week start for
 * @returns ISO date string for Monday of the week containing the date
 */
export function getWeekStartDateForDate(date: Date): string {
  const dayOfWeek = date.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}
