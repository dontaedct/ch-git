import { ok, fail } from "@/lib/errors";
import { createRealSupabaseClient } from "@/lib/supabase/server";

// Prevent prerendering - this route must be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const supabase = await createRealSupabaseClient();
    
    // Get user from Supabase directly
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json(fail("unauthorized", "UNAUTHORIZED"), { status: 401 });
    }
    
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20)));

    const from = (page-1)*pageSize;
    const to = from + pageSize - 1;

    const list = supabase
      .from("clients")
      .select("id, full_name, email, created_at", { count: "exact" })
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    const { data, error, count } = await list;
    if (error) throw error;

    return Response.json(ok({ data, page, pageSize, total: count ?? 0 }));
  } catch (e) {
    return Response.json(fail(e instanceof Error ? e.message : "error"), { status: 500 });
  }
}
