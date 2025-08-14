import { createServerSupabase } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

export async function requireUser(): Promise<{ 
  user: User; 
  supabase: SupabaseClient 
}> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error("Unauthorized");
  return { user: data.user, supabase };
}

export async function getUserOrFail(supabase: SupabaseClient): Promise<User> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error("Unauthorized");
  return data.user;
}
