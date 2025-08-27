import { NextResponse } from 'next/server';
import { getFlag } from '@lib/flags/server';
import { checkRateLimit, RATE_LIMITS } from '@lib/rate-limit';
import { createGuardianLogger } from '@lib/guardian/structured-logger';
import { sendGuardianFailureNotification } from '@lib/notifications/slack';
import { requireUser } from '@lib/auth/guard';

// Force Node runtime and dynamic execution
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const startTime = Date.now();
  let tenantId = 'anonymous';
  
  try {
    // Get user context for tenant ID
    try {
      const { user } = await requireUser();
      tenantId = user.id;
    } catch {
      // Allow anonymous access for heartbeat but with stricter rate limits
      tenantId = 'anonymous';
    }
    
    const logger = createGuardianLogger('heartbeat', tenantId);
    
    // Check feature flag for Guardian system
    const guardianEnabled = await getFlag(tenantId, 'guardian_enabled');
    if (!guardianEnabled) {
      logger.featureDisabled('guardian_enabled');
      return NextResponse.json({
        ok: false,
        code: 'FEATURE_DISABLED',
        message: 'Guardian system is disabled for this tenant'
      }, { status: 403 });
    }
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(
      tenantId, 
      RATE_LIMITS.GUARDIAN_HEARTBEAT,
      request.headers.get('x-forwarded-for') ?? undefined
    );
    
    if (!rateLimitResult.allowed) {
      logger.rateLimited(rateLimitResult.retryAfter);
      return NextResponse.json({
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Too many heartbeat requests',
        retryAfter: rateLimitResult.retryAfter
      }, { 
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() ?? '60',
          'X-RateLimit-Limit': RATE_LIMITS.GUARDIAN_HEARTBEAT.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        }
      });
    }
    
    // Perform lightweight health checks
    const healthChecks = await performHealthChecks();
    
    const response = {
      ok: true,
      timestamp: new Date().toISOString(),
      tenantId,
      health: healthChecks,
      rateLimit: {
        remaining: rateLimitResult.remaining,
        resetTime: new Date(rateLimitResult.resetTime).toISOString(),
      }
    };
    
    logger.success({
      healthStatus: healthChecks.overall,
      rateLimitRemaining: rateLimitResult.remaining
    });
    
    return NextResponse.json(response);
    
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failure
    const logger = createGuardianLogger('heartbeat', tenantId);
    logger.failure(errorMessage, { durationMs });
    
    // Send Slack notification for failures
    await sendGuardianFailureNotification('heartbeat', errorMessage, tenantId, durationMs);
    
    return NextResponse.json({
      ok: false,
      code: 'HEARTBEAT_FAILED',
      message: 'Heartbeat check failed',
      error: errorMessage,
      timestamp: new Date().toISOString(),
      tenantId
    }, { status: 500 });
  }
}

/**
 * Perform lightweight health checks
 */
async function performHealthChecks(): Promise<{
  overall: 'healthy' | 'warning' | 'error';
  checks: Record<string, { status: string; message?: string }>;
}> {
  const checks: Record<string, { status: string; message?: string }> = {};
  
  // Check system memory
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
  checks.memory = {
    status: memoryUsageMB < 500 ? 'healthy' : memoryUsageMB < 1000 ? 'warning' : 'error',
    message: `${Math.round(memoryUsageMB)}MB used`
  };
  
  // Check system uptime
  const uptime = process.uptime();
  checks.uptime = {
    status: uptime > 60 ? 'healthy' : 'warning', // At least 1 minute uptime
    message: `${Math.round(uptime)}s uptime`
  };
  
  // Check Node.js version
  const nodeVersion = process.version;
  checks.nodeVersion = {
    status: 'healthy',
    message: nodeVersion
  };
  
  // Determine overall status
  const statuses = Object.values(checks).map(c => c.status);
  let overall: 'healthy' | 'warning' | 'error' = 'healthy';
  
  if (statuses.includes('error')) {
    overall = 'error';
  } else if (statuses.includes('warning')) {
    overall = 'warning';
  }
  
  return { overall, checks };
}
