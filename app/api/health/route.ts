import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    ts: Date.now(),
    env: {
      ai_enabled: process.env.AI_ENABLED ?? null,
      ai_provider: process.env.AI_PROVIDER ?? null,
      vercel_env: process.env.VERCEL_ENV ?? null,
    }
  });
}
