/**
 * Integration Analytics API
 * 
 * API endpoint for getting integration analytics,
 * usage statistics, and performance metrics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIntegrationRegistry, initializeIntegrationSystem } from '@/lib/integrations';
import { ok, fail } from '@/lib/errors';

export const runtime = 'nodejs';

/**
 * Get integration analytics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') ?? new Date().toISOString();
    const providerId = searchParams.get('providerId');
    const instanceId = searchParams.get('instanceId');

    // Initialize integration system
    const registry = initializeIntegrationSystem();

    // Get analytics
    const analytics = registry.getAnalytics(startDate, endDate);

    // Filter by provider if specified
    if (providerId) {
      analytics.usageByProvider = analytics.usageByProvider.filter(u => u.providerId === providerId);
      analytics.popularProviders = analytics.popularProviders.filter(p => p.providerId === providerId);
    }

    // Get instances
    const instances = registry.getAllInstances();
    const filteredInstances = instanceId 
      ? instances.filter(i => i.id === instanceId)
      : instances;

    // Get errors
    const errors = filteredInstances.flatMap(instance => 
      registry.getErrors(instance.id)
    );

    // Get usage
    const usage = filteredInstances.flatMap(instance => 
      registry.getUsage(instance.id)
    );

    return NextResponse.json(ok({
      analytics,
      instances: filteredInstances,
      errors: errors.slice(0, 100), // Limit to recent errors
      usage: usage.slice(0, 1000), // Limit to recent usage
      filters: {
        startDate,
        endDate,
        providerId,
        instanceId
      },
      generatedAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Integration analytics error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'INTEGRATION_ANALYTICS_ERROR'
      ),
      { status: 500 }
    );
  }
}
