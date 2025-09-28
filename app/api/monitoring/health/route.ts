/**
 * @fileoverview Performance Health API Route - Phase 7.2
 * API endpoint for system health status
 */

import { handlePerformanceHealth } from '@/lib/monitoring/api-middleware';

export async function GET() {
  return handlePerformanceHealth();
}