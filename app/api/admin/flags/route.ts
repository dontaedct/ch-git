import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@lib/supabase/server';
import { isAdmin, setFlag } from '@lib/flags/server';

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user.id);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { tenantId, key, enabled, payload } = body;

    if (!tenantId || !key || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, key, enabled' },
        { status: 400 }
      );
    }

    const success = await setFlag(tenantId, key, enabled, payload ?? {});
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update flag' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating flag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user.id);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenantId parameter' },
        { status: 400 }
      );
    }

    // Get all flags for the tenant
    const { data: flags, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('key');

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch flags' },
        { status: 500 }
      );
    }

    return NextResponse.json({ flags });
  } catch (error) {
    console.error('Error fetching flags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
