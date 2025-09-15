/**
 * Individual SSO Configuration API Routes
 * HT-004.5.2: Enterprise SSO Integration API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@lib/supabase/server';
import { requireClient } from '@lib/auth/guard';
import { SSOManager } from '@lib/auth/sso';

// GET /api/sso/configurations/[id] - Get specific SSO configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const ssoManager = new SSOManager(supabase);

    const configuration = await ssoManager.getSSOConfiguration(params.id);

    if (!configuration) {
      return NextResponse.json(
        { error: 'SSO configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ configuration });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// PUT /api/sso/configurations/[id] - Update SSO configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const ssoManager = new SSOManager(supabase);
    const body = await request.json();

    const configuration = await ssoManager.updateSSOConfiguration(params.id, body);

    return NextResponse.json({ configuration });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update SSO configuration' },
      { status: 500 }
    );
  }
}

// DELETE /api/sso/configurations/[id] - Delete SSO configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await requireClient();
    const supabase = await createServerSupabase();
    const ssoManager = new SSOManager(supabase);

    await ssoManager.deleteSSOConfiguration(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete SSO configuration' },
      { status: 500 }
    );
  }
}
