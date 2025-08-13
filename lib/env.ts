import { z } from "zod";

/** Server-side env (works in API routes, server components, actions) */
const ServerSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DEFAULT_COACH_ID: z.string().uuid().optional(),
  NODE_ENV: z.enum(["development","test","production"]).default("development"),
});

let serverCached: z.infer<typeof ServerSchema> | null = null;

/** Use this on the server only */
export function getEnv() {
  if (serverCached) return serverCached;
  const parsed = ServerSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${msg}`);
  }
  serverCached = parsed.data;
  return serverCached;
}

/** Browser-safe public env (NEXT_PUBLIC_* only), validated at module init */
const PublicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

let publicCached: z.infer<typeof PublicSchema> | null = null;

/** Use this in client components/browser code */
export function getPublicEnv() {
  if (publicCached) return publicCached;
  publicCached = PublicSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return publicCached;
}
