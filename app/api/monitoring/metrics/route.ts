/**
 * @fileoverview Performance Metrics API Route - Phase 7.2
 * API endpoint for retrieving performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
// TODO: Re-enable when monitoring system is implemented
// import { handlePerformanceMetrics } from '@/lib/monitoring/api-middleware';

// Temporary stub for MVP
const handlePerformanceMetrics = async () => {
  return NextResponse.json({ metrics: [] });
};

export async function GET(req: NextRequest) {
  return handlePerformanceMetrics();
}
