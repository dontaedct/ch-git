
import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";

let _client: ReturnType<typeof createBrowserClient> | null = null;

/** Preferred browser helper */
export function createBrowserSupabase() {
  if (_client) return _client;
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getPublicEnv();
  _client = createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return _client;
}

/** Back-compat alias used by older files */
export const createClient = createBrowserSupabase;
