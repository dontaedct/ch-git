import { NextResponse, NextRequest } from "next/server";
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const store = new Map<string,{count:number, ts:number}>();
const WINDOW = 60_000; // 1 min
const LIMIT = 100;

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const isDebugMode = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEBUG === '1';
  
  // Debug-only tracing (never in production)
  if (isDebugMode) {
    console.log(`[MIDDLEWARE] Processing: ${url.pathname}${url.search}${url.hash}`);
  }

  // Check for redirect guard cookie to prevent redirect chains
  const redirectGuard = req.headers.get('cookie')?.includes('__redirect_guard=1');
  
  // If redirect guard cookie is present, skip middleware processing to prevent chains
  if (redirectGuard) {
    if (isDebugMode) {
      console.log(`[MIDDLEWARE] Redirect guard cookie detected, skipping processing for: ${url.pathname}`);
    }
    const response = NextResponse.next();
    // Clear the redirect guard cookie for the destination
    response.cookies.set('__redirect_guard', '', { maxAge: 0, path: '/' });
    return response;
  }

  // Loop detection for redirects (debug only, never in production)
  if (isDebugMode) {
    const referer = req.headers.get('referer');
    if (referer) {
      const refererUrl = new URL(referer);
      const isSamePath = url.pathname === refererUrl.pathname;
      const isSamePathWithHash = url.pathname === refererUrl.pathname && url.hash === refererUrl.hash;
      
      if (isSamePath || isSamePathWithHash) {
        console.warn(`[MIDDLEWARE] Potential redirect loop detected: ${url.pathname}`);
        const response = NextResponse.next();
        response.headers.set('X-Loop-Detected', '1');
        // Set redirect guard cookie to prevent further redirects
        response.cookies.set('__redirect_guard', '1', { maxAge: 30, path: '/' }); // 30 second TTL
        return response;
      }
    }
  }

  // Route protection logic - only protect specific routes
  const protectedPatterns = [
    /^\/client-portal(\/.*)?$/,  // /client-portal and /client-portal/*
    /^\/sessions(\/.*)?$/        // /sessions and /sessions/*
  ];
  
  const isProtectedRoute = protectedPatterns.some(pattern => pattern.test(url.pathname));
  
  if (isProtectedRoute) {
    if (isDebugMode) {
      console.log(`[MIDDLEWARE] Protected route detected: ${url.pathname}`);
    }
    
    // For protected routes, check authentication
    const supabase = createMiddlewareClient({ req, res: NextResponse.next() });
    
    // Check if user has a valid session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      if (isDebugMode) {
        console.log(`[MIDDLEWARE] Unauthenticated access to protected route: ${url.pathname}`);
      }
      
      // Redirect to login or show access denied
      // For now, we'll let the page handle the auth check to avoid middleware complexity
      // The page will show appropriate login/CTA UI
      return NextResponse.next();
    }
    
    if (isDebugMode) {
      console.log(`[MIDDLEWARE] Authenticated access to protected route: ${url.pathname}`);
    }
  } else if (isDebugMode) {
    console.log(`[MIDDLEWARE] Public route: ${url.pathname}`);
  }

  // API rate limiting (existing logic)
  if (!url.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const slot = store.get(ip) ?? { count: 0, ts: now };
  if (now - slot.ts > WINDOW) { slot.count = 0; slot.ts = now; }
  slot.count += 1; store.set(ip, slot);

  if (slot.count > LIMIT) {
    // Set redirect guard cookie to prevent immediate re-triggering
    const response = new NextResponse(JSON.stringify({ ok:false, code:"RATE_LIMIT" }), { status: 429 });
    response.cookies.set('__redirect_guard', '1', { maxAge: 10, path: '/' }); // 10 second TTL
    return response;
  }
  
  return NextResponse.next();
}

export const config = { 
  matcher: [
    // Protect specific routes
    '/client-portal/:path*',
    '/sessions/:path*',
    // Keep API rate limiting
    '/api/:path*'
  ]
};


