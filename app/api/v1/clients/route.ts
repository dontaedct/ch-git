import { requireUser } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const { user, supabase } = await requireUser();
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
