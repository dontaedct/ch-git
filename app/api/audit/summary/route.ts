/**
 * Audit Log Summary and Analytics API Routes
 * HT-004.5.3: Comprehensive audit trail analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@lib/supabase/server';
import { requireClient } from '@lib/auth/guard';
import { AuditLoggerFactory } from '@lib/audit/enhanced-audit-logger';

// GET /api/audit/summary - Get audit log summary
export async function GET(request: NextRequest) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : undefined;
    const endDate = searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : undefined;
    const userId = searchParams.get('user_id') || undefined;
    const action = searchParams.get('action') as any || undefined;
    const resourceType = searchParams.get('resource_type') as any || undefined;
    const severity = searchParams.get('severity') as any || undefined;

    const auditLogger = AuditLoggerFactory.getInstance().createLogger();
    const summary = await auditLogger.getAuditSummary(
      startDate,
      endDate,
      userId,
      action,
      resourceType,
      severity
    );

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
