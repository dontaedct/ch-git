import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(
    { ok: true, env: process.env.VERCEL_ENV ?? 'local', time: new Date().toISOString() },
    { status: 200 }
  );
}
