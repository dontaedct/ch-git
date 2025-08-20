import { NextResponse, type NextRequest } from "next/server";

const store = new Map<string,{count:number, ts:number}>();
const WINDOW = 60_000; // 1 min
const LIMIT = 100;

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  
  // Dev-only tracing and loop detection
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    console.log(`🔍 Middleware: ${req.method} ${url.pathname}`);
    
    // Check for self-redirects (same pathname)
    const referer = req.headers.get('referer');
    if (referer) {
      const refererUrl = new URL(referer);
      if (refererUrl.pathname === url.pathname) {
        console.warn('⚠️ Middleware: Potential self-redirect detected', {
          pathname: url.pathname,
          referer: refererUrl.pathname
        });
        
        // Add loop detection header
        const response = NextResponse.next();
        response.headers.set('X-Loop-Detected', '1');
        return response;
      }
    }
  }

  // Handle API rate limiting
  if (url.pathname.startsWith("/api/")) {
    const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
    const now = Date.now();
    const slot = store.get(ip) ?? { count: 0, ts: now };
    if (now - slot.ts > WINDOW) { slot.count = 0; slot.ts = now; }
    slot.count += 1; store.set(ip, slot);

    if (slot.count > LIMIT) {
      return new NextResponse(JSON.stringify({ ok:false, code:"RATE_LIMIT" }), { status: 429 });
    }
  }

  // Auth protection for protected routes only
  const protectedPaths = ['/client-portal', '/sessions'];
  const isProtectedPath = protectedPaths.some(path => 
    url.pathname === path || url.pathname.startsWith(path + '/')
  );

  if (isProtectedPath) {
    // Check if user is authenticated (you can implement your own auth logic here)
    // For now, we'll redirect to login or show a CTA
    const authToken = req.cookies.get('auth-token')?.value || req.headers.get('authorization');
    
    if (!authToken) {
      // Redirect to login or show CTA page
      if (url.pathname.startsWith('/client-portal')) {
        return NextResponse.redirect(new URL('/login?redirect=/client-portal', req.url));
      } else if (url.pathname.startsWith('/sessions')) {
        return NextResponse.redirect(new URL('/login?redirect=/sessions', req.url));
      }
    }
  }

  const res = NextResponse.next();

  // Force-relaxed CSP only on Vercel Preview to allow hydration & vercel.live
  if (process.env.VERCEL_ENV === "preview") {
    const previewCsp = [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "media-src 'self' blob:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.live",
      "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https: wss: https://vercel.live https://*.vercel.live wss://vercel.live wss://*.vercel.live",
      "frame-ancestors 'none'",
      "base-uri 'self'",
    ].join("; ") + ";";

    // remove any prior CSP and set our relaxed one
    res.headers.delete("Content-Security-Policy");
    res.headers.set("Content-Security-Policy", previewCsp);
  }

  return res;
}

export const config = { 
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/health (health check)
     * - probe (probe endpoint)
     * - images (static images)
     * - assets (static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/health|probe|images|assets).*)',
  ]
};
