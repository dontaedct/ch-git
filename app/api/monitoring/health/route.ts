/**
 * @fileoverview Performance Health API Route - Phase 7.2
 * API endpoint for system health status
 */

import { NextResponse } from 'next/server';
// TODO: Re-enable when monitoring system is implemented
// import { handlePerformanceHealth } from '@/lib/monitoring/api-middleware';

// Temporary stub for MVP
const handlePerformanceHealth = async () => {
  return NextResponse.json({ status: 'healthy', uptime: 0 });
};

export async function GET() {
  return handlePerformanceHealth();
}