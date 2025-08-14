
import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getPublicEnv();

/** Browser client singleton - prevents multiple instances and Node polyfill pulls */
export const supabaseBrowser = createBrowserClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/** Back-compat alias used by older files */
export const createClient = () => supabaseBrowser;

/** Back-compat alias used by older files */
export const createBrowserSupabase = () => supabaseBrowser;
