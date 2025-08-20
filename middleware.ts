import { NextResponse, type NextRequest } from "next/server";

const store = new Map<string,{count:number, ts:number}>();
const WINDOW = 60_000; // 1 min
const LIMIT = 100;

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  
  // Always log in production for debugging
  console.log(`🔍 Middleware executing for: ${req.method} ${url.pathname}`);

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
    console.log(`🔒 Middleware: Protecting path ${url.pathname}`);
    
    // Check if user is authenticated (simplified auth check)
    const authToken = req.cookies.get('auth-token')?.value || 
                     req.cookies.get('sb-access-token')?.value ||
                     req.headers.get('authorization');
    
    console.log(`🔑 Middleware: Auth token found: ${!!authToken}`);
    
    if (!authToken) {
      // Always redirect unauthenticated users to login
      const redirectUrl = url.pathname.startsWith('/client-portal') 
        ? '/login?redirect=/client-portal'
        : '/login?redirect=/sessions';
      
      console.log(`🚫 Middleware: Redirecting to ${redirectUrl}`);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
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
     * Match all routes except static files and api routes we don't want to protect
     * This ensures middleware runs for protected routes
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};
