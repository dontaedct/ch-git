import { NextResponse } from 'next/server';
import { getFlag } from '@lib/flags/server';
import { checkRateLimit, RATE_LIMITS } from '@lib/rate-limit';
import { createGuardianLogger } from '@lib/guardian/structured-logger';
import { sendGuardianFailureNotification, sendGuardianSuccessNotification } from '@lib/notifications/slack';
import { requireUser } from '@lib/auth/guard';
import { runBackupOnce } from '@lib/guardian/service';

// Force Node runtime and dynamic execution
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const startTime = Date.now();
  let tenantId = 'anonymous';
  
  try {
    // Require authenticated user for backup operations
    const { user } = await requireUser();
    tenantId = user.id;
    
    const logger = createGuardianLogger('backup-intent', tenantId);
    
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
    
    // Check rate limit for backup operations
    const rateLimitResult = checkRateLimit(
      tenantId, 
      RATE_LIMITS.GUARDIAN_BACKUP_INTENT,
      { ip: request.headers.get('x-forwarded-for') ?? undefined }
    );
    
    if (!rateLimitResult.allowed) {
      logger.rateLimited(rateLimitResult.retryAfter);
      return NextResponse.json({
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Too many backup requests. Please wait before requesting another backup.',
        retryAfter: rateLimitResult.retryAfter
      }, { 
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() ?? '3600',
          'X-RateLimit-Limit': RATE_LIMITS.GUARDIAN_BACKUP_INTENT.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        }
      });
    }
    
    // Parse request body for backup reason
    let backupReason = 'Scheduled backup';
    try {
      const body = await request.json();
      if (body.reason && typeof body.reason === 'string') {
        backupReason = body.reason;
      }
    } catch {
      // Invalid JSON, use default reason
    }
    
    // Execute backup operation
    const backupResult = await runBackupOnce({ 
      reason: `${backupReason} (tenant: ${tenantId})`,
      timeout: 60 * 1000 // 60 second timeout for API responsiveness
    });
    
    const durationMs = Date.now() - startTime;
    
    if (backupResult.ok) {
      // Success
      logger.success({
        artifacts: backupResult.artifacts.length,
        durationMs,
        reason: backupReason
      });
      
      // Send success notification (optional)
      await sendGuardianSuccessNotification(
        'backup-intent', 
        tenantId, 
        durationMs,
        `Created ${backupResult.artifacts.length} backup artifacts`
      );
      
      return NextResponse.json({
        ok: true,
        message: 'Backup completed successfully',
        timestamp: new Date().toISOString(),
        tenantId,
        backup: {
          startedAt: backupResult.startedAt,
          finishedAt: backupResult.finishedAt,
          artifacts: backupResult.artifacts,
          reason: backupReason
        },
        rateLimit: {
          remaining: rateLimitResult.remaining,
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
        }
      });
    } else {
      // Backup failed
      logger.failure(backupResult.error ?? 'Backup failed', {
        durationMs,
        reason: backupReason,
        startedAt: backupResult.startedAt,
        finishedAt: backupResult.finishedAt
      });
      
      // Send failure notification
      await sendGuardianFailureNotification(
        'backup-intent', 
        backupResult.error ?? 'Backup failed', 
        tenantId, 
        durationMs
      );
      
      return NextResponse.json({
        ok: false,
        code: 'BACKUP_FAILED',
        message: 'Backup operation failed',
        error: backupResult.error,
        timestamp: new Date().toISOString(),
        tenantId,
        backup: {
          startedAt: backupResult.startedAt,
          finishedAt: backupResult.finishedAt,
          reason: backupReason
        }
      }, { status: 500 });
    }
    
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failure
    const logger = createGuardianLogger('backup-intent', tenantId);
    logger.failure(errorMessage, { durationMs });
    
    // Send Slack notification for failures
    await sendGuardianFailureNotification('backup-intent', errorMessage, tenantId, durationMs);
    
    return NextResponse.json({
      ok: false,
      code: 'BACKUP_INTENT_FAILED',
      message: 'Backup intent request failed',
      error: errorMessage,
      timestamp: new Date().toISOString(),
      tenantId
    }, { status: 500 });
  }
}

/**
 * GET endpoint for checking backup status without triggering backup
 */
export async function GET(request: Request) {
  const startTime = Date.now();
  let tenantId = 'anonymous';
  
  try {
    // Require authenticated user
    const { user } = await requireUser();
    tenantId = user.id;
    
    const logger = createGuardianLogger('backup-status', tenantId);
    
    // Check feature flag
    const guardianEnabled = await getFlag(tenantId, 'guardian_enabled');
    if (!guardianEnabled) {
      logger.featureDisabled('guardian_enabled');
      return NextResponse.json({
        ok: false,
        code: 'FEATURE_DISABLED',
        message: 'Guardian system is disabled for this tenant'
      }, { status: 403 });
    }
    
    // Check rate limit (use heartbeat limits for status checks)
    const rateLimitResult = checkRateLimit(
      tenantId, 
      RATE_LIMITS.GUARDIAN_HEARTBEAT,
      { ip: request.headers.get('x-forwarded-for') ?? undefined }
    );
    
    if (!rateLimitResult.allowed) {
      logger.rateLimited(rateLimitResult.retryAfter);
      return NextResponse.json({
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Too many status requests',
        retryAfter: rateLimitResult.retryAfter
      }, { 
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() ?? '60',
        }
      });
    }
    
    // Import and use existing status reading functionality
    const { readStatus, isLastBackupSuccessful } = await import('@lib/guardian/service');
    const status = await readStatus();
    const lastBackupOk = await isLastBackupSuccessful();
    
    const durationMs = Date.now() - startTime;
    
    logger.success({
      hasStatus: !!status,
      lastBackupOk,
      durationMs
    });
    
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      tenantId,
      status: {
        hasStatus: !!status,
        lastBackup: status?.finishedAt ?? null,
        lastBackupOk,
        artifacts: status?.artifacts ?? []
      },
      rateLimit: {
        remaining: rateLimitResult.remaining,
        resetTime: new Date(rateLimitResult.resetTime).toISOString(),
      }
    });
    
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const logger = createGuardianLogger('backup-status', tenantId);
    logger.failure(errorMessage, { durationMs });
    
    return NextResponse.json({
      ok: false,
      code: 'STATUS_CHECK_FAILED',
      message: 'Backup status check failed',
      error: errorMessage,
      timestamp: new Date().toISOString(),
      tenantId
    }, { status: 500 });
  }
}
