import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from '@supabase/ssr'

const store = new Map<string,{count:number, ts:number}>();
const WINDOW = 60_000; // 1 min
const LIMIT = 100;

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/consultation', '/questionnaire'];

export async function middleware(req: NextRequest) {
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

  // Handle auth for protected routes
  if (PROTECTED_ROUTES.some(route => url.pathname.startsWith(route))) {
    let response = NextResponse.next({
      request: {
        headers: req.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            req.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            req.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', url.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return response
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

  const res = NextResponse.next();

  // CSP is now handled in next.config.ts headers() function
  // No need to override here as it would conflict with the configuration

  return res;
}

export const config = { matcher: "/:path*" };
