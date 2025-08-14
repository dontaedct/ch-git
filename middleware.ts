import { NextResponse } from "next/server";

const store = new Map<string,{count:number, ts:number}>();
const WINDOW = 60_000; // 1 min
const LIMIT = 100;

export function middleware(req: Request) {
  const url = new URL(req.url);
  if (!url.pathname.startsWith("/api/")) return NextResponse.next();

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const slot = store.get(ip) ?? { count: 0, ts: now };
  if (now - slot.ts > WINDOW) { slot.count = 0; slot.ts = now; }
  slot.count += 1; store.set(ip, slot);

  if (slot.count > LIMIT) {
    return new NextResponse(JSON.stringify({ ok:false, code:"RATE_LIMIT" }), { status: 429 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };


