/**
 * Security Headers Middleware
 * 
 * Comprehensive security headers implementation with environment-aware CSP,
 * bot detection, and security event logging.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "../logger";

export interface SecurityContext {
  ip: string;
  userAgent: string;
  route: string;
  isBot: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: number;
}

export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'Content-Security-Policy-Report-Only'?: string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security'?: string;
  'X-DNS-Prefetch-Control': string;
  'X-Download-Options': string;
  'X-Permitted-Cross-Domain-Policies': string;
  // Expose CSP nonce for Next.js to propagate to inline scripts/styles
  'x-nonce'?: string;
}

/**
 * Bot detection patterns
 */
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /http\.client/i,
  /axios/i,
  /libwww/i,
  /perl/i,
  /facebookexternalhit/i,
  /whatsapp/i,
  /linkedinbot/i,
  /twitterbot/i,
  /googlebot/i,
  /bingbot/i,
  /slackbot/i,
  /telegrambot/i
];

/**
 * Suspicious IP patterns (basic implementation)
 */
const SUSPICIOUS_IP_PATTERNS = [
  /^10\./, // Private IPs shouldn't hit production
  /^127\./, // Localhost
  /^0\./, // Invalid range
];

/**
 * High-risk routes that need extra protection
 */
const HIGH_RISK_ROUTES = [
  '/api/webhooks/',
  '/api/admin/',
  '/api/guardian/',
  '/operability/diagnostics',
  '/operability/flags'
];

/**
 * Generate a cryptographic nonce for CSP
 * Uses Web Crypto API for Edge Runtime compatibility
 */
export function generateNonce(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Detect if request is from a bot
 */
export function detectBot(userAgent: string): boolean {
  if (!userAgent) return true; // No user agent is suspicious
  
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

/**
 * Calculate risk level based on various factors
 */
export function calculateRiskLevel(
  ip: string,
  userAgent: string,
  route: string,
  isBot: boolean
): 'low' | 'medium' | 'high' {
  let riskScore = 0;
  
  // Bot detection
  if (isBot) riskScore += 2;
  
  // Suspicious IP patterns
  if (SUSPICIOUS_IP_PATTERNS.some(pattern => pattern.test(ip))) {
    riskScore += 3;
  }
  
  // High-risk routes (extract pathname from full URL for matching)
  const routeForMatching = route.startsWith('http') ? new URL(route).pathname : route;
  if (HIGH_RISK_ROUTES.some(route_pattern => routeForMatching.startsWith(route_pattern))) {
    riskScore += 2;
  }
  
  // No user agent
  if (!userAgent || userAgent.length < 10) riskScore += 1;
  
  // Very short or very long user agents
  if (userAgent && userAgent.length < 20) {
    riskScore += 1;
  }
  
  // Very long user agents are more suspicious
  if (userAgent && userAgent.length > 300) {
    riskScore += 2;
  }
  
  // Common attack patterns in route
  if (/\.\.|\/\.\./g.test(route) || /<script/i.test(route) || /union.*select/i.test(route)) {
    riskScore += 5;
  }
  
  if (riskScore >= 5) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
}

/**
 * Create security context from request
 */
export function createSecurityContext(req: NextRequest): SecurityContext {
  const ip = (req.headers.get("x-forwarded-for") || 
             req.headers.get("x-real-ip") || 
             "unknown").split(",")[0].trim();
  
  const userAgent = req.headers.get("user-agent") || "";
  const url = new URL(req.url);
  const route = url.pathname; // Store just pathname in context
  const isBot = detectBot(userAgent);
  // Use original URL string for security pattern detection to avoid normalization
  const riskLevel = calculateRiskLevel(ip, userAgent, req.url, isBot);
  
  return {
    ip,
    userAgent,
    route,
    isBot,
    riskLevel,
    timestamp: Date.now()
  };
}

/**
 * Get environment-appropriate CSP
 */
export function getContentSecurityPolicy(nonce: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  
  const baseDirectives = [
    "default-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  if (isProduction && !isPreview) {
    // Production CSP with strict nonce-based security
    return [
      ...baseDirectives,
      // Use nonce for scripts and styles
      `script-src 'self' 'nonce-${nonce}' https://js.stripe.com`,
      `script-src-elem 'self' 'nonce-${nonce}' https://js.stripe.com`,
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
      "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://*.stripe.com",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.resend.com https://api.stripe.com https://*.sentry.io wss://*.supabase.co",
      "font-src 'self' data: https://fonts.gstatic.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      // Additional security directives
      "require-trusted-types-for 'script'",
      "trusted-types default"
    ].join("; ");
  } else {
    // Development/Preview CSP with more flexibility but still secure
    return [
      ...baseDirectives.filter(d => !d.includes('upgrade-insecure-requests')), // Remove HTTPS requirement in dev
      `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://vercel.live https://*.vercel.live https://js.stripe.com`,
      `script-src-elem 'self' 'nonce-${nonce}' 'unsafe-eval' https://vercel.live https://*.vercel.live https://js.stripe.com`,
      `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com`,
      "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://*.stripe.com",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.resend.com https://api.stripe.com https://*.sentry.io https://vercel.live https://*.vercel.live wss://*.supabase.co wss://vercel.live wss://*.vercel.live",
      "font-src 'self' data: https://fonts.gstatic.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'"
    ].join("; ");
  }
}

/**
 * Generate comprehensive security headers
 */
export function generateSecurityHeaders(context: SecurityContext): SecurityHeaders {
  const isProduction = process.env.NODE_ENV === 'production';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const nonce = generateNonce();
  
  const headers: SecurityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
    // Provide nonce header so Next.js can attach it to inline runtime scripts/styles
    'x-nonce': nonce
  };
  
  // Add HSTS in production
  if (isProduction) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }
  
  // Re-enable CSP with proper Google Fonts support
  const csp = getContentSecurityPolicy(nonce);
  headers['Content-Security-Policy'] = csp;
  
  return headers;
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse, 
  headers: SecurityHeaders
): NextResponse {
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });
  
  return response;
}

/**
 * Log security events
 */
export function logSecurityEvent(
  context: SecurityContext,
  event: 'request' | 'blocked' | 'rate_limited' | 'suspicious',
  details?: Record<string, any>
): void {
  const logData = {
    event,
    context,
    details,
    timestamp: new Date().toISOString()
  };
  
  if (context.riskLevel === 'high' || event === 'blocked') {
    logger.warn('Security event', logData);
  } else {
    logger.info('Security event', logData);
  }
}

/**
 * Main security headers middleware function
 */
export function securityHeadersMiddleware(req: NextRequest): {
  context: SecurityContext;
  headers: SecurityHeaders;
  shouldBlock: boolean;
  blockReason?: string;
} {
  const context = createSecurityContext(req);
  const headers = generateSecurityHeaders(context);
  
  // Use original URL string to detect malicious patterns before normalization
  const originalUrl = req.url;
  
  // Determine if request should be blocked
  let shouldBlock = false;
  let blockReason: string | undefined;
  
  // Block obviously malicious requests (check original URL to catch path traversal)
  if (originalUrl.includes('..') || 
      originalUrl.includes('<script') ||
      /union.*select/i.test(originalUrl)) {
    shouldBlock = true;
    blockReason = 'malicious_route_pattern';
  }
  
  // Block requests with no user agent to admin routes
  if (!context.userAgent && HIGH_RISK_ROUTES.some(route => context.route.startsWith(route))) {
    shouldBlock = true;
    blockReason = 'no_user_agent_admin_route';
  }
  
  // Log security event
  logSecurityEvent(context, shouldBlock ? 'blocked' : 'request');
  
  return {
    context,
    headers,
    shouldBlock,
    blockReason
  };
}
