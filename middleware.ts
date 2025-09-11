import { NextResponse, type NextRequest } from "next/server";
import { createSecurityMiddleware } from "./lib/security/enhanced-middleware";

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
  try {
    // Process request through enhanced security middleware
    const securityResult = await securityMiddleware.processRequest(req);
    
    // If request should be blocked, return the security response
    if (securityResult.shouldBlock && securityResult.response) {
      console.warn(`Request blocked: ${securityResult.blockReason}`, {
        url: req.url,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      });
      return securityResult.response;
    }
    
    // Continue with normal response and apply security headers
    const response = NextResponse.next();
    
    // Apply all security headers
    Object.entries(securityResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error) {
    console.error('Middleware security error:', error);
    // Fail securely - continue with basic protection
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }
}

export const config = { 
  matcher: [
    '/((?!_next|api|favicon.ico|manifest.json|sw.js).*)',
  ],
};

