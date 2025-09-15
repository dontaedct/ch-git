/**
 * Suspicious Activity Detection API Routes
 * HT-004.5.3: Security monitoring and threat detection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@lib/supabase/server';
import { requireClient } from '@lib/auth/guard';
import { AuditLoggerFactory } from '@lib/audit/enhanced-audit-logger';

// GET /api/audit/suspicious-activity - Detect suspicious activity
export async function GET(request: NextRequest) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    
    const hours = parseInt(searchParams.get('hours') || '24');
    const threshold = parseInt(searchParams.get('threshold') || '100');

    const auditLogger = AuditLoggerFactory.getInstance().createLogger();
    const suspiciousActivity = await auditLogger.detectSuspiciousActivity(hours, threshold);

    return NextResponse.json({ suspiciousActivity });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
