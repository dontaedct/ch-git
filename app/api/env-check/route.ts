import { NextResponse } from "next/server";
import { ok } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";

export const revalidate = 60;

async function GETHandler() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json(ok({
    hasUrl: !!url,
    hasAnon: !!anon,
    hasService: !!svc,
    // show only first 8 characters for debugging
    urlStart: url ? url.slice(0, 30) : null,
    anonStart: anon ? anon.slice(0, 8) : null,
    serviceStart: svc ? svc.slice(0, 8) : null,
  }));
}

export const GET = withSentry(GETHandler);