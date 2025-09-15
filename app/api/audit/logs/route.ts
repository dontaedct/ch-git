/**
 * Audit Log Management API Routes
 * HT-004.5.3: Comprehensive audit trail API
 * 
 * Provides API endpoints for managing and querying audit logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@lib/supabase/server';
import { requireClient } from '@lib/auth/guard';
import { AuditLoggerFactory, AuditLogFilter } from '@lib/audit/enhanced-audit-logger';

// GET /api/audit/logs - Get audit logs with filtering
export async function GET(request: NextRequest) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    
    const filters: AuditLogFilter['filter_criteria'] = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      user_id: searchParams.get('user_id') || undefined,
      action: searchParams.get('action') as any || undefined,
      resource_type: searchParams.get('resource_type') as any || undefined,
      severity: searchParams.get('severity') as any || undefined,
      compliance_category: searchParams.get('compliance_category') as any || undefined,
      data_classification: searchParams.get('data_classification') as any || undefined,
      search_text: searchParams.get('search_text') || undefined
    };

    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const auditLogger = AuditLoggerFactory.getInstance().createLogger();
    const logs = await auditLogger.getAuditLogs(filters, limit, offset);

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST /api/audit/logs - Create audit log entry (for testing)
export async function POST(request: NextRequest) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const body = await request.json();
    
    const auditLogger = AuditLoggerFactory.getInstance().createLogger();
    const logId = await auditLogger.logEvent(body);

    return NextResponse.json({ logId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create audit log' },
      { status: 500 }
    );
  }
}
