import { cookies } from "next/headers";
import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

/** Authenticated client bound to request cookies */
export async function createServerSupabase() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getEnv();
  const cookieStore = await cookies();
  return createSSRServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (n: string) => cookieStore.get(n)?.value,
      set: (n: string, v: string, o: { path?: string; domain?: string; maxAge?: number; secure?: boolean; httpOnly?: boolean; sameSite?: "strict" | "lax" | "none" }) => { cookieStore.set({ name: n, value: v, ...o }); return; },
      remove: (n: string, o: { path?: string; domain?: string }) => { cookieStore.set({ name: n, value: "", ...o }); return; },
    },
  });
}

/** Back-compat alias for old imports */
export const createServerClient = createServerSupabase;

/** Service-role client (server-only) for intake/cron jobs */
export function createServiceRoleSupabase() {
  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnv();
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Back-compat alias for old imports */
export const createServiceRoleClient = createServiceRoleSupabase;
