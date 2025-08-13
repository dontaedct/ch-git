import { createServerSupabase } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error("Unauthorized");
  return { user: data.user, supabase };
}
