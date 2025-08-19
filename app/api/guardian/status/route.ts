import { NextResponse } from 'next/server';
import { readStatus } from '@lib/guardian/service';

// Force Node runtime and dynamic execution
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await readStatus();
    
    if (status) {
      return NextResponse.json(status);
    } else {
      return NextResponse.json({
        ok: false,
        code: 'NO_STATUS'
      });
    }
    
  } catch (error) {
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
