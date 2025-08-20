export async function paginate<T extends Record<string, unknown>>(
  q: import("@supabase/postgrest-js").PostgrestFilterBuilder<any, any, any, any, any>, // Supabase query builder
  page = 1,
  size = 20
): Promise<{ data: T[]; count: number }> {
  const from = (page - 1) * size;
  const to = from + size - 1;
  const { data, count, error } = await q.select("*", { count: "exact" }).range(from, to);
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}
