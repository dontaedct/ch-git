
import { NextResponse } from 'next/server';
import { upsertWeeklyCheckIn, getWeeklyCheckIn } from '@/data/checkins.repo';
import { createRealSupabaseClient } from '@/lib/supabase/server';

// Prevent prerendering - this route must be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const supabase = await createRealSupabaseClient();
    
    // Get user from Supabase directly
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
    }
    
    const body = await req.json();
    const data = await upsertWeeklyCheckIn(supabase, user, body);
    return NextResponse.json({ ok: true, data });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createRealSupabaseClient();
    
    const { searchParams } = new URL(req.url);
    const client_id = searchParams.get('client_id');
    const date = searchParams.get('date');
    
    if (!client_id) {
      return NextResponse.json({ ok: false, error: 'client_id required' }, { status: 400 });
    }
    
    const checkInDate = date ? new Date(date) : new Date();
    const data = await getWeeklyCheckIn(supabase, client_id, checkInDate);
    
    return NextResponse.json({ ok: true, data });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  }
}
