import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.version
    };
    
    return NextResponse.json({
      ok: true,
      data: healthData
    });
  } catch {
    return NextResponse.json({
      ok: false,
      error: 'Health check failed'
    }, { status: 500 });
  }
}
