/**
 * Integration Management API
 * 
 * Main API endpoint for managing third-party integrations,
 * browsing providers, and managing integration instances.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getIntegrationRegistry, 
  initializeIntegrationSystem,
  IntegrationProvider,
  IntegrationInstance,
  IntegrationCategory
} from '@/lib/integrations';
import { ok, fail } from '@/lib/errors';

export const runtime = 'nodejs';

/**
 * Get all integration providers and instances
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as IntegrationCategory | null;
    const provider = searchParams.get('provider');
    const verified = searchParams.get('verified') === 'true';
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    // Initialize integration system
    const registry = initializeIntegrationSystem();

    // Get providers
    let providers = registry.getAllProviders();

    // Apply filters
    if (category) {
      providers = providers.filter(p => p.category === category);
    }
    if (provider) {
      providers = providers.filter(p => p.id === provider);
    }
    if (verified) {
      providers = providers.filter(p => p.verified);
    }
    if (status) {
      providers = providers.filter(p => p.status === status);
    }

    // Apply pagination
    const total = providers.length;
    const paginatedProviders = providers.slice(offset, offset + limit);

    // Get instances
    const instances = registry.getAllInstances();

    // Get categories
    const categories = Array.from(new Set(providers.map(p => p.category)));

    // Get popular providers
    const popularProviders = registry.getPopularProviders(10);

    return NextResponse.json(ok({
      providers: paginatedProviders,
      instances,
      categories,
      popularProviders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      generatedAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Integration API error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'INTEGRATION_API_ERROR'
      ),
      { status: 500 }
    );
  }
}

/**
 * Create a new integration instance
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { providerId, name, description, configuration } = body;

    // Validate required fields
    if (!providerId || !name || !configuration) {
      return NextResponse.json(
        fail('Missing required fields: providerId, name, configuration'),
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

    // Create instance
    const instance: IntegrationInstance = {
      id: `instance_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      providerId,
      name,
      description,
      configuration,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system' // This would be the actual user ID in a real implementation
    };

    // Register instance
    registry.createInstance(instance);

    return NextResponse.json(ok({
      instance,
      message: 'Integration instance created successfully'
    }));

  } catch (error) {
    console.error('Integration creation error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'INTEGRATION_CREATION_ERROR'
      ),
      { status: 500 }
    );
  }
}

/**
 * Update an integration instance
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { instanceId, updates } = body;

    if (!instanceId || !updates) {
      return NextResponse.json(
        fail('Missing required fields: instanceId, updates'),
        { status: 400 }
      );
    }

    // Initialize integration system
    const registry = initializeIntegrationSystem();

    // Get instance
    const instance = registry.getInstance(instanceId);
    if (!instance) {
      return NextResponse.json(
        fail(`Instance ${instanceId} not found`),
        { status: 404 }
      );
    }

    // Update instance
    const updatedInstance = {
      ...instance,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    registry.createInstance(updatedInstance);

    return NextResponse.json(ok({
      instance: updatedInstance,
      message: 'Integration instance updated successfully'
    }));

  } catch (error) {
    console.error('Integration update error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'INTEGRATION_UPDATE_ERROR'
      ),
      { status: 500 }
    );
  }
}

/**
 * Delete an integration instance
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get('instanceId');

    if (!instanceId) {
      return NextResponse.json(
        fail('Missing required parameter: instanceId'),
        { status: 400 }
      );
    }

    // Initialize integration system
    const registry = initializeIntegrationSystem();

    // Delete instance
    const deleted = registry.deleteInstance(instanceId);
    if (!deleted) {
      return NextResponse.json(
        fail(`Instance ${instanceId} not found`),
        { status: 404 }
      );
    }

    return NextResponse.json(ok({
      message: 'Integration instance deleted successfully'
    }));

  } catch (error) {
    console.error('Integration deletion error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'INTEGRATION_DELETION_ERROR'
      ),
      { status: 500 }
    );
  }
}
