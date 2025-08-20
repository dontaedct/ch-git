// app/probe/route.ts
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export function GET() {
  const env =
    process.env.VERCEL_ENV ??
    (process.env.NODE_ENV === 'production' ? 'production' : 'development');

  const html = `<!doctype html><meta charset="utf-8"><title>__probe OK</title>
<style>body{font:14px system-ui,sans-serif;margin:2rem}</style>
<h1>__probe OK</h1>
<p>env: ${env}</p>
<p>time: ${new Date().toISOString()}</p>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
