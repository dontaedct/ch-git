/**
 * User Activity and Suspicious Activity API Routes
 * HT-004.5.3: User activity monitoring and security
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@lib/supabase/server';
import { requireClient } from '@lib/auth/guard';
import { AuditLoggerFactory } from '@lib/audit/enhanced-audit-logger';

// GET /api/audit/user-activity/[userId] - Get user activity summary
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    
    const days = parseInt(searchParams.get('days') || '30');

    const auditLogger = AuditLoggerFactory.getInstance().createLogger();
    const activity = await auditLogger.getUserActivitySummary(params.userId, days);

    return NextResponse.json({ activity });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
