/**
 * @fileoverview Performance Alerts API Route - Phase 7.2
 * API endpoint for managing performance alerts
 */

import { NextRequest, NextResponse } from 'next/server';
// TODO: Re-enable when monitoring system is implemented
// import { handlePerformanceAlerts } from '@/lib/monitoring/api-middleware';

// Temporary stub for MVP
const handlePerformanceAlerts = async () => {
  return NextResponse.json({ alerts: [] });
};

export async function GET(req: NextRequest) {
  return handlePerformanceAlerts(req);
}

export async function POST(req: NextRequest) {
  return handlePerformanceAlerts(req);
}