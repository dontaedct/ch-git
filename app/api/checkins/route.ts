import { NextResponse } from 'next/server';
import { upsertWeeklyCheckIn, getWeeklyCheckIn } from '@/data/checkins.repo';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await upsertWeeklyCheckIn(body);
    return NextResponse.json({ ok: true, data });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const client_id = searchParams.get('client_id');
    const date = searchParams.get('date');
    
    if (!client_id) {
      return NextResponse.json({ ok: false, error: 'client_id required' }, { status: 400 });
    }
    
    const checkInDate = date ? new Date(date) : new Date();
    const data = await getWeeklyCheckIn(client_id, checkInDate);
    
    return NextResponse.json({ ok: true, data });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  }
}
