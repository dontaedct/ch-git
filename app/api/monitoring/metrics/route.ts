/**
 * @fileoverview Performance Metrics API Route - Phase 7.2
 * API endpoint for retrieving performance metrics
 */

import { NextRequest } from 'next/server';
import { handlePerformanceMetrics } from '@/lib/monitoring/api-middleware';

export async function GET(req: NextRequest) {
  return handlePerformanceMetrics(req);
}
