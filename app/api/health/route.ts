import { createServerSupabase } from "@/lib/supabase/server";
import { ok, fail } from "@/lib/errors";

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { error } = await supabase.from("sessions").select("id").limit(1);
    const db = !error;
    return Response.json(ok({
      time: new Date().toISOString(),
      env: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      db,
    }));
  } catch (e) {
    return Response.json(fail("health failed"), { status: 500 });
  }
}
