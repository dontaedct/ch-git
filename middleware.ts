import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from '@supabase/ssr';
import { securityHeadersMiddleware, applySecurityHeaders, logSecurityEvent } from './lib/security/headers';
import { checkRateLimit, getRateLimitConfigForRoute, isIPBlocked } from './lib/rate-limit';
import { logSecurityRequest } from './lib/security/logging-clean';
import { Observing } from './lib/observability';

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/consultation', '/questionnaire'];

// Dashboard routes that require enhanced client context
const DASHBOARD_ROUTES = ['/dashboard'];

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  
  // Start request tracking for observability
  const requestTracker = Observing.trackRequest(req.method, url.pathname);
  requestTracker.addMetadata({
    userAgent: req.headers.get('user-agent'),
    origin: req.headers.get('origin'),
    referer: req.headers.get('referer'),
  });
  
  // Security headers and bot detection
  const securityResult = securityHeadersMiddleware(req);
  
  // Block malicious requests immediately
  if (securityResult.shouldBlock) {
    // Record security event in observability system
    Observing.recordSecurityEvent({
      eventType: 'malicious_payload',
      severity: 'high',
      ip: securityResult.context.ip,
      userAgent: securityResult.context.userAgent,
      route: securityResult.context.route,
      details: {
        method: req.method,
        origin: req.headers.get('origin'),
        referer: req.headers.get('referer'),
        blockReason: securityResult.blockReason || 'security_policy_violation',
        isBot: securityResult.context.isBot,
        riskLevel: securityResult.context.riskLevel,
      },
    });
    
    logSecurityRequest(
      'malicious_payload',
      {
        ip: securityResult.context.ip,
        userAgent: securityResult.context.userAgent,
        route: securityResult.context.route,
        method: req.method,
        origin: req.headers.get('origin') || undefined,
        referer: req.headers.get('referer') || undefined,
      },
      {
        requestId: crypto.randomUUID(),
        isBot: securityResult.context.isBot,
        riskLevel: securityResult.context.riskLevel,
      },
      'blocked',
      {
        action: {
          type: 'block',
          reason: securityResult.blockReason || 'security_policy_violation'
        }
      }
    );
    
    // Finish request tracking for blocked request
    requestTracker.addMetadata({ blocked: true, blockReason: securityResult.blockReason });
    requestTracker.finish(403, { securityEvent: 'malicious_payload' });
    
    return new NextResponse(
      JSON.stringify({ 
        ok: false, 
        code: 'SECURITY_VIOLATION',
        message: 'Request blocked by security policy'
      }),
      { 
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(
            Object.entries(securityResult.headers).map(([k, v]) => [k, v || ''])
          )
        }
      }
    );
  }
  
  // Check if IP is blocked
  if (isIPBlocked(securityResult.context.ip)) {
    // Record IP blocking event
    Observing.recordSecurityEvent({
      eventType: 'ip_blocked',
      severity: 'high',
      ip: securityResult.context.ip,
      userAgent: securityResult.context.userAgent,
      route: securityResult.context.route,
      details: {
        method: req.method,
        isBot: securityResult.context.isBot,
      },
    });
    
    logSecurityRequest(
      'ip_blocked',
      {
        ip: securityResult.context.ip,
        userAgent: securityResult.context.userAgent,
        route: securityResult.context.route,
        method: req.method,
      },
      {
        requestId: crypto.randomUUID(),
        isBot: securityResult.context.isBot,
        riskLevel: 'high',
      },
      'blocked'
    );
    
    // Finish request tracking for blocked IP
    requestTracker.addMetadata({ blocked: true, blockReason: 'ip_blocked' });
    requestTracker.finish(403, { securityEvent: 'ip_blocked' });
    
    return new NextResponse(
      JSON.stringify({ 
        ok: false, 
        code: 'IP_BLOCKED',
        message: 'Access denied'
      }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
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
      
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
        console.log('🚫 Middleware: Redirecting unauthenticated user', {
          from: url.pathname,
          to: redirectUrl.toString()
        });
      }
      
      return NextResponse.redirect(redirectUrl)
    }

    // Enhanced validation for dashboard routes
    if (DASHBOARD_ROUTES.some(route => url.pathname.startsWith(route))) {
      try {
        // Validate client context exists for dashboard access
        const { data: client } = await supabase
          .from('clients')
          .select('id, email, role')
          .eq('email', user.email)
          .single();

        if (!client) {
          // Auto-create client record if missing
          const { error: insertError } = await supabase
            .from('clients')
            .insert({ 
              email: user.email,
              role: 'viewer'
            });
          
          if (insertError) {
            console.error('Failed to create client record:', insertError);
            const errorUrl = new URL('/login', req.url);
            errorUrl.searchParams.set('error', 'account_setup_failed');
            return NextResponse.redirect(errorUrl);
          }
          
          if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
            console.log('✅ Middleware: Created client record for dashboard access', { email: user.email });
          }
        } else {
          if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
            console.log('✅ Middleware: Client context validated for dashboard', { 
              clientId: client.id, 
              role: client.role 
            });
          }
        }
      } catch (error) {
        console.error('Dashboard middleware error:', error);
        const errorUrl = new URL('/login', req.url);
        errorUrl.searchParams.set('error', 'access_validation_failed');
        return NextResponse.redirect(errorUrl);
      }
    }

    return response
  }

  // Enhanced rate limiting for API routes
  if (url.pathname.startsWith("/api/")) {
    const rateLimitConfig = getRateLimitConfigForRoute(url.pathname);
    
    const rateLimitResult = checkRateLimit(
      'global', // Using global tenant for now
      rateLimitConfig,
      {
        ip: securityResult.context.ip,
        userAgent: securityResult.context.userAgent,
        isBot: securityResult.context.isBot,
        route: url.pathname
      }
    );
    
    if (!rateLimitResult.allowed) {
      // Record rate limit violation in observability system
      Observing.recordRateLimitViolation(
        securityResult.context.ip,
        securityResult.context.route,
        {
          method: req.method,
          violations: rateLimitResult.violations,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
          retryAfter: rateLimitResult.retryAfter,
          riskLevel: rateLimitResult.riskLevel,
          isBot: securityResult.context.isBot,
        }
      );
      
      logSecurityRequest(
        'rate_limit_exceeded',
        {
          ip: securityResult.context.ip,
          userAgent: securityResult.context.userAgent,
          route: securityResult.context.route,
          method: req.method,
        },
        {
          requestId: crypto.randomUUID(),
          isBot: securityResult.context.isBot,
          riskLevel: rateLimitResult.riskLevel,
        },
        'rate_limited',
        {
          action: {
            type: 'rate_limit',
            reason: rateLimitResult.blockReason || 'rate_limit_exceeded',
            retryAfter: rateLimitResult.retryAfter
          },
          metadata: {
            violations: rateLimitResult.violations,
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime
          }
        }
      );
      
      const response = new NextResponse(
        JSON.stringify({ 
          ok: false, 
          code: "RATE_LIMIT",
          message: "Rate limit exceeded",
          retryAfter: rateLimitResult.retryAfter
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            ...Object.fromEntries(
              Object.entries(securityResult.headers).map(([k, v]) => [k, v || ''])
            )
          }
        }
      );
      
      // Finish request tracking for rate limited request
      requestTracker.addMetadata({ 
        rateLimited: true, 
        violations: rateLimitResult.violations,
        retryAfter: rateLimitResult.retryAfter 
      });
      requestTracker.finish(429, { securityEvent: 'rate_limit_exceeded' });
      
      return response;
    }
    
    // Log successful API request with security context
    logSecurityRequest(
      'request_received',
      {
        ip: securityResult.context.ip,
        userAgent: securityResult.context.userAgent,
        route: securityResult.context.route,
        method: req.method,
      },
      {
        requestId: crypto.randomUUID(),
        isBot: securityResult.context.isBot,
        riskLevel: rateLimitResult.riskLevel,
      },
      'allowed',
      {
        metadata: {
          rateLimitRemaining: rateLimitResult.remaining,
          rateLimitReset: rateLimitResult.resetTime
        }
      }
    );
  }

  const res = NextResponse.next();
  
  // Apply comprehensive security headers
  const secureResponse = applySecurityHeaders(res, securityResult.headers);
  
  // Generate request ID for tracing
  const requestId = crypto.randomUUID();
  
  // Add additional security headers for monitoring
  secureResponse.headers.set('X-Request-ID', requestId);
  secureResponse.headers.set('X-Security-Level', securityResult.context.riskLevel.toUpperCase());
  
  if (securityResult.context.isBot) {
    secureResponse.headers.set('X-Bot-Detected', 'true');
  }
  
  // Complete request tracking for successful requests
  requestTracker.addMetadata({
    requestId,
    securityLevel: securityResult.context.riskLevel,
    isBot: securityResult.context.isBot,
    hasAuth: PROTECTED_ROUTES.some(route => url.pathname.startsWith(route)),
  });
  
  // Since we can't determine the actual response status in middleware,
  // we'll assume success (200) and let individual route handlers override this
  requestTracker.finish(200, {
    middleware: 'completed',
    securityHeaders: 'applied',
  });
  
  return secureResponse;
}

export const config = { matcher: "/:path*" };
