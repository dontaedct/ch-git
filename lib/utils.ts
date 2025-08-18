import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function to apply pagination to a Supabase query
 * @param query - The Supabase query builder
 * @param page - Current page (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Object with paginated query and total count
 */
export async function applyPagination<T>(
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

    // Apply pagination
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
