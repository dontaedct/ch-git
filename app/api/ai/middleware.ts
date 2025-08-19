/**
 * 🧠 MIT HERO SYSTEM - AI API Rate Limiting
 * 
 * AI-specific rate limiting middleware with modest caps
 * to prevent abuse while maintaining functionality.
 */

import { NextRequest, NextResponse } from "next/server";

// AI-specific rate limiting constants
const AI_RATE_LIMIT_WINDOW = 60_000; // 1 minute
const AI_RATE_LIMIT_MAX_REQUESTS = 20; // Modest cap: 20 AI requests per minute per IP

// In-memory store for AI rate limiting (consider Redis for production)
const aiRateLimitStore = new Map<string, { count: number; ts: number }>();

export function aiRateLimitMiddleware(req: NextRequest): NextResponse | null {
  // Only apply to AI routes
  if (!req.nextUrl.pathname.startsWith("/api/ai/")) {
    return null;
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const slot = aiRateLimitStore.get(ip) ?? { count: 0, ts: now };
  
  // Reset counter if window has passed
  if (now - slot.ts > AI_RATE_LIMIT_WINDOW) {
    slot.count = 0;
    slot.ts = now;
  }
  
  slot.count += 1;
  aiRateLimitStore.set(ip, slot);

  if (slot.count > AI_RATE_LIMIT_MAX_REQUESTS) {
    return new NextResponse(
      JSON.stringify({ 
        ok: false, 
        error: "AI rate limit exceeded",
        retryAfter: Math.ceil((slot.ts + AI_RATE_LIMIT_WINDOW - now) / 1000)
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((slot.ts + AI_RATE_LIMIT_WINDOW - now) / 1000).toString()
        }
      }
    );
  }

  return null;
}
