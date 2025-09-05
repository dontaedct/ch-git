import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Incrementally re-enabling middleware - starting with harmless DNS prefetch control
  const res = NextResponse.next();
  
  // Add first harmless header: X-DNS-Prefetch-Control
  res.headers.set('X-DNS-Prefetch-Control', 'off');
  
  return res;
}

export const config = { matcher: "/:path*" };

