/**
 * SSO Management API Routes
 * HT-004.5.2: Enterprise SSO Integration API
 * 
 * Provides API endpoints for managing SSO configurations and authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@lib/supabase/server';
import { requireClient } from '@lib/auth/guard';
import { SSOManager } from '@lib/auth/sso';

// GET /api/sso/configurations - List SSO configurations
export async function GET(request: NextRequest) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const ssoManager = new SSOManager(supabase);

    const configurations = await ssoManager.getSSOConfigurations();

    return NextResponse.json({ configurations });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST /api/sso/configurations - Create SSO configuration
export async function POST(request: NextRequest) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const ssoManager = new SSOManager(supabase);
    const body = await request.json();

    const configuration = await ssoManager.createSSOConfiguration(body);

    return NextResponse.json({ configuration });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create SSO configuration' },
      { status: 500 }
    );
  }
}
