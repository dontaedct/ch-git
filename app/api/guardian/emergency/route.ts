import { NextResponse } from 'next/server';
import { runBackupOnce } from '@lib/guardian/service';

// Force Node runtime and dynamic execution
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    let body: { reason?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Invalid JSON, continue with empty body
    }
    
    // Lightweight validation
    if (body.reason && typeof body.reason !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Invalid reason format' },
        { status: 400 }
      );
    }
    
    // Run backup
    const result = await runBackupOnce({ reason: body.reason });
    
    if (result.ok) {
      return NextResponse.json({
        ok: true,
        artifacts: result.artifacts,
        startedAt: result.startedAt,
        finishedAt: result.finishedAt
      });
    } else {
      return NextResponse.json({
        ok: false,
        error: result.error,
        startedAt: result.startedAt,
        finishedAt: result.finishedAt
      }, { status: 500 });
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

