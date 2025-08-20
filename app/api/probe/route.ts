// app/api/probe/route.ts
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return NextResponse.redirect(new URL('/probe', request.url), 308);
}
