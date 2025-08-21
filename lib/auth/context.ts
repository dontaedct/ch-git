import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerClientWithCookies } from "@/lib/supabase/server";

export type UserContext = { user: User; supabase: SupabaseClient };

// Accept an OPTIONAL getter; default to next/headers cookies()
export async function getUserContext(
  getCookies: () => ReturnType<typeof cookies> = cookies
): Promise<UserContext> {
  const supabase = await createServerClientWithCookies(getCookies);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { user, supabase };
}

export async function getUserOrFail(
  getCookies?: () => ReturnType<typeof cookies>
): Promise<User> {
  return (await getUserContext(getCookies ?? cookies)).user;
}
