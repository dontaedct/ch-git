/**
 * @fileoverview Performance Alerts API Route - Phase 7.2
 * API endpoint for managing performance alerts
 */

import { NextRequest } from 'next/server';
import { handlePerformanceAlerts } from '@/lib/monitoring/api-middleware';

export async function GET(req: NextRequest) {
  return handlePerformanceAlerts(req);
}

export async function POST(req: NextRequest) {
  return handlePerformanceAlerts(req);
}