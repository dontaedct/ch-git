import { NextResponse, type NextRequest } from "next/server";
import { securityHeadersMiddleware, applySecurityHeaders } from "./lib/security/headers";
import { checkRateLimit, getRateLimitConfigForRoute, isIPBlocked } from "./lib/rate-limit";
import { logSecurityRequest } from "./lib/security/logging-clean";
import { UniversalObservability } from "./lib/observability/edge-client";

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/consultation", "/questionnaire"];

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // Start request tracking for observability
  const requestTracker = UniversalObservability.trackRequest(req.method, url.pathname);
  requestTracker.addMetadata({
    userAgent: req.headers.get("user-agent"),
    origin: req.headers.get("origin"),
    referer: req.headers.get("referer"),
  });

  // Security headers and bot detection
  const securityResult = securityHeadersMiddleware(req);

  // Block malicious requests immediately
  if (securityResult.shouldBlock) {
    UniversalObservability.logSecurityEvent("security-block", "warn", {
      eventType: "malicious_payload",
      severity: "high",
      ip: securityResult.context.ip,
      userAgent: securityResult.context.userAgent,
      route: securityResult.context.route,
      method: req.method,
      origin: req.headers.get("origin"),
      referer: req.headers.get("referer"),
      blockReason: securityResult.blockReason || "security_policy_violation",
      isBot: securityResult.context.isBot,
      riskLevel: securityResult.context.riskLevel,
    });

    logSecurityRequest(
      "malicious_payload",
      {
        ip: securityResult.context.ip,
        userAgent: securityResult.context.userAgent,
        route: securityResult.context.route,
        method: req.method,
        origin: req.headers.get("origin") || undefined,
        referer: req.headers.get("referer") || undefined,
      },
      {
        requestId: crypto.randomUUID(),
        isBot: securityResult.context.isBot,
        riskLevel: securityResult.context.riskLevel,
      },
      "blocked",
      {
        action: {
          type: "block",
          reason: securityResult.blockReason || "security_policy_violation",
        },
      }
    );

    requestTracker.addMetadata({ blocked: true, blockReason: securityResult.blockReason });
    requestTracker.finish(403, { securityEvent: "malicious_payload" });

    return new NextResponse(
      JSON.stringify({ ok: false, code: "SECURITY_VIOLATION", message: "Request blocked by security policy" }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          ...Object.fromEntries(Object.entries(securityResult.headers).map(([k, v]) => [k, v || ""])),
        },
      }
    );
  }

  // Check if IP is blocked
  if (isIPBlocked(securityResult.context.ip)) {
    UniversalObservability.logSecurityEvent("security-block", "warn", {
      eventType: "ip_blocked",
      severity: "high",
      ip: securityResult.context.ip,
      userAgent: securityResult.context.userAgent,
      route: securityResult.context.route,
      details: { method: req.method, isBot: securityResult.context.isBot },
    });

    logSecurityRequest(
      "ip_blocked",
      {
        ip: securityResult.context.ip,
        userAgent: securityResult.context.userAgent,
        route: securityResult.context.route,
        method: req.method,
      },
      { requestId: crypto.randomUUID(), isBot: securityResult.context.isBot, riskLevel: "high" },
      "blocked"
    );

    requestTracker.addMetadata({ blocked: true, blockReason: "ip_blocked" });
    requestTracker.finish(403, { securityEvent: "ip_blocked" });

    return new NextResponse(
      JSON.stringify({ ok: false, code: "IP_BLOCKED", message: "Access denied" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Handle auth for protected routes (Edge-safe: rely on Supabase cookies only)
  if (PROTECTED_ROUTES.some((route) => url.pathname.startsWith(route))) {
    const cookies = req.cookies;
    const hasAuthCookie = Boolean(
      cookies.get("sb-access-token")?.value ||
      cookies.get("sb:token")?.value ||
      cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth") && c.value)
    );

    if (!hasAuthCookie) {
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirectTo", url.pathname);

      if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEBUG === "1") {
        console.log("Middleware: Redirecting unauthenticated user", { from: url.pathname, to: redirectUrl.toString() });
      }

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Enhanced rate limiting for API routes
  if (url.pathname.startsWith("/api/")) {
    const rateLimitConfig = getRateLimitConfigForRoute(url.pathname);
    const rateLimitResult = checkRateLimit("global", rateLimitConfig, {
      ip: securityResult.context.ip,
      userAgent: securityResult.context.userAgent,
      isBot: securityResult.context.isBot,
      route: url.pathname,
    });

    if (!rateLimitResult.allowed) {
      UniversalObservability.logSecurityEvent("rate-limit-violation", "warn", {
        ip: securityResult.context.ip,
        route: securityResult.context.route,
        method: req.method,
        violations: rateLimitResult.violations,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
        retryAfter: rateLimitResult.retryAfter,
        riskLevel: rateLimitResult.riskLevel,
        isBot: securityResult.context.isBot,
      });

      logSecurityRequest(
        "rate_limit_exceeded",
        {
          ip: securityResult.context.ip,
          userAgent: securityResult.context.userAgent,
          route: securityResult.context.route,
          method: req.method,
        },
        { requestId: crypto.randomUUID(), isBot: securityResult.context.isBot, riskLevel: rateLimitResult.riskLevel },
        "rate_limited",
        {
          action: {
            type: "rate_limit",
            reason: rateLimitResult.blockReason || "rate_limit_exceeded",
            retryAfter: rateLimitResult.retryAfter,
          },
          metadata: {
            violations: rateLimitResult.violations,
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime,
          },
        }
      );

      const response = new NextResponse(
        JSON.stringify({ ok: false, code: "RATE_LIMIT", message: "Rate limit exceeded", retryAfter: rateLimitResult.retryAfter }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
            "X-RateLimit-Limit": rateLimitConfig.maxRequests.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimitResult.resetTime).toISOString(),
            ...Object.fromEntries(Object.entries(securityResult.headers).map(([k, v]) => [k, v || ""])),
          },
        }
      );

      requestTracker.addMetadata({ rateLimited: true, violations: rateLimitResult.violations, retryAfter: rateLimitResult.retryAfter });
      requestTracker.finish(429, { securityEvent: "rate_limit_exceeded" });

      return response;
    }

    logSecurityRequest(
      "request_received",
      {
        ip: securityResult.context.ip,
        userAgent: securityResult.context.userAgent,
        route: securityResult.context.route,
        method: req.method,
      },
      { requestId: crypto.randomUUID(), isBot: securityResult.context.isBot, riskLevel: rateLimitResult.riskLevel },
      "allowed",
      { metadata: { rateLimitRemaining: rateLimitResult.remaining, rateLimitReset: rateLimitResult.resetTime } }
    );
  }

  const res = NextResponse.next();
  const secureResponse = applySecurityHeaders(res, securityResult.headers);

  // Add basic tracing headers
  const requestId = crypto.randomUUID();
  secureResponse.headers.set("X-Request-ID", requestId);
  secureResponse.headers.set("X-Security-Level", securityResult.context.riskLevel.toUpperCase());
  if (securityResult.context.isBot) secureResponse.headers.set("X-Bot-Detected", "true");

  requestTracker.addMetadata({ requestId, securityLevel: securityResult.context.riskLevel, isBot: securityResult.context.isBot, hasAuth: PROTECTED_ROUTES.some((route) => url.pathname.startsWith(route)) });
  requestTracker.finish(200, { middleware: "completed", securityHeaders: "applied" });

  return secureResponse;
}

export const config = { matcher: "/:path*" };

