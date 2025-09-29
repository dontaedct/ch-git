/**
 * Integration Testing API
 * 
 * API endpoint for testing integration configurations,
 * running validation tests, and debugging integration issues.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIntegrationRegistry, initializeIntegrationSystem } from '@/lib/integrations';
import { ok, fail } from '@/lib/errors';

export const runtime = 'nodejs';

/**
 * Run integration tests
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { testId, configuration, providerId } = body;

    if (!testId || !configuration) {
      return NextResponse.json(
        fail('Missing required fields: testId, configuration'),
        { status: 400 }
      );
    }

    // Initialize integration system
    const registry = initializeIntegrationSystem();

    // Run test
    const result = await registry.runTest(testId, configuration);

    return NextResponse.json(ok({
      testId,
      result,
      configuration: {
        // Don't return sensitive configuration data
        providerId: providerId || 'unknown'
      }
    }));

  } catch (error) {
    console.error('Integration test error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'INTEGRATION_TEST_ERROR'
      ),
      { status: 500 }
    );
  }
}

/**
 * Get available tests for a provider
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        fail('Missing required parameter: providerId'),
        { status: 400 }
      );
    }

    // Initialize integration system
    const registry = initializeIntegrationSystem();

    // Get provider
    const provider = registry.getProvider(providerId);
    if (!provider) {
      return NextResponse.json(
        fail(`Provider ${providerId} not found`),
        { status: 404 }
      );
    }

    // Get tests for provider (this would be implemented in the registry)
    const tests = Array.from(registry['tests'].values())
      .filter(test => test.providerId === providerId);

    return NextResponse.json(ok({
      providerId,
      providerName: provider.name,
      tests,
      generatedAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Integration tests fetch error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'INTEGRATION_TESTS_FETCH_ERROR'
      ),
      { status: 500 }
    );
  }
}
