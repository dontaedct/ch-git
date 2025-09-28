import { NextResponse, type NextRequest } from "next/server";
import { createSecurityMiddleware } from "./lib/security/enhanced-middleware";
import { createServerSupabase } from "./lib/supabase/server";
import { RoutePermissionChecker } from "./lib/auth/permissions";

// Initialize enhanced security middleware with comprehensive protection
const securityMiddleware = createSecurityMiddleware({
  enforceHttps: process.env.NODE_ENV === 'production',
  hstsMaxAge: 31536000, // 1 year
  cspDirectives: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    process.env.NODE_ENV === 'production' 
      ? "connect-src 'self' https:" 
      : "connect-src 'self' https: ws:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'self'",
  ],
  rateLimiting: {
    enabled: true,
    maxRequests: 100,
    windowMs: 900000, // 15 minutes
  },
  threatProtection: {
    enabled: true,
    blockSuspiciousIPs: true,
    scanUserAgents: true,
    detectBots: true,
  },
});

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Apply security middleware
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Skip auth checks for public routes
  const publicRoutes = [
    '/',
    '/login',
    '/auth/callback',
    '/privacy',
    '/consent',
    '/offline',
    '/status',
    '/probe'
  ];

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/auth/')
  );

  if (isPublicRoute) {
    return response;
  }

  // Skip auth checks for API routes that don't require authentication
  const publicApiRoutes = [
    '/api/health',
    '/api/ping',
    '/api/probe',
    '/api/ready',
    '/api/env-check',
    '/api/debug-env'
  ];

  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  if (isPublicApiRoute) {
    return response;
  }

  try {
    // Check if we're in safe mode or development mode - bypass authentication
    const isSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE === '1';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isSafeMode || isDevelopment) {
      // In safe/development mode, bypass authentication and set mock user headers
      response.headers.set('X-User-ID', 'dev-user-123');
      response.headers.set('X-User-Role', 'admin');
      response.headers.set('X-User-Email', 'dev@example.com');
      response.headers.set('X-Dev-Mode', 'true');
      return response;
    }

    // Check authentication for protected routes
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Redirect to login for unauthenticated users
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Get user role for permission checking
    const { data: client } = await supabase
      .from('clients')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = client?.role || 'viewer';

    // Check route permissions
    const canAccess = RoutePermissionChecker.canAccessRoute(userRole, pathname);

    if (!canAccess) {
      // Redirect to appropriate page based on role
      const redirectUrl = new URL('/dashboard', req.url);
      redirectUrl.searchParams.set('error', 'access_denied');
      redirectUrl.searchParams.set('message', 'You do not have permission to access this page');
      return NextResponse.redirect(redirectUrl);
    }

    // Add user info to headers for downstream use
    response.headers.set('X-User-ID', user.id);
    response.headers.set('X-User-Role', userRole);
    response.headers.set('X-User-Email', user.email || '');

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, redirect to login for safety
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'middleware_error');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = { 
  matcher: [
    '/((?!_next|api|favicon.ico|manifest.json|sw.js).*)',
  ],
};

