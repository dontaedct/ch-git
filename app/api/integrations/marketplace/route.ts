/**
 * Integration Marketplace API
 * 
 * API endpoint for browsing integration marketplace,
 * getting provider details, and managing integration templates.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getIntegrationRegistry, 
  initializeIntegrationSystem,
  IntegrationProvider,
  IntegrationCategory
} from '@/lib/integrations';
import { ok, fail } from '@/lib/errors';

export const runtime = 'nodejs';

/**
 * Get marketplace data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as IntegrationCategory | null;
    const provider = searchParams.get('provider');
    const verified = searchParams.get('verified') === 'true';
    const status = searchParams.get('status');
    const search = searchParams.get('search');
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
    if (search) {
      providers = registry.searchProviders(search);
    }

    // Sort by popularity
    providers.sort((a, b) => b.popularityScore - a.popularityScore);

    // Apply pagination
    const total = providers.length;
    const paginatedProviders = providers.slice(offset, offset + limit);

    // Get categories
    const categories = Array.from(new Set(providers.map(p => p.category)));

    // Get popular providers
    const popularProviders = registry.getPopularProviders(10);

    // Get featured providers (high popularity + verified)
    const featuredProviders = providers
      .filter(p => p.verified && p.popularityScore >= 80)
      .slice(0, 6);

    // Get recently added providers
    const recentlyAdded = providers
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 6);

    // Get provider statistics
    const stats = {
      totalProviders: providers.length,
      verifiedProviders: providers.filter(p => p.verified).length,
      categories: categories.length,
      activeProviders: providers.filter(p => p.status === 'active').length
    };

    return NextResponse.json(ok({
      providers: paginatedProviders,
      categories,
      popularProviders,
      featuredProviders,
      recentlyAdded,
      stats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      generatedAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Integration marketplace error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'INTEGRATION_MARKETPLACE_ERROR'
      ),
      { status: 500 }
    );
  }
}

/**
 * Get provider details
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { providerId } = body;

    if (!providerId) {
      return NextResponse.json(
        fail('Missing required field: providerId'),
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

    // Get instances for this provider
    const instances = registry.getInstancesByProvider(providerId);

    // Get related providers (same category)
    const relatedProviders = registry.getProvidersByCategory(provider.category)
      .filter(p => p.id !== providerId)
      .slice(0, 4);

    return NextResponse.json(ok({
      provider,
      instances,
      relatedProviders,
      generatedAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Provider details error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'PROVIDER_DETAILS_ERROR'
      ),
      { status: 500 }
    );
  }
}
