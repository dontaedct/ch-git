/**
 * Module Marketplace API Endpoints
 * 
 * RESTful API for module discovery, installation, and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { moduleRegistry } from '@/lib/marketplace/module-registry';
import { installationEngine } from '@/lib/marketplace/installation-engine';
import { pricingEngine } from '@/lib/marketplace/pricing-engine';
import { qualityAssuranceEngine } from '@/lib/marketplace/quality-assurance';

// Request/Response schemas
const SearchModulesSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pricing: z.enum(['free', 'paid']).optional(),
  minRating: z.number().min(1).max(5).optional(),
  sortBy: z.enum(['relevance', 'rating', 'installCount', 'createdAt', 'updatedAt']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const InstallModuleSchema = z.object({
  moduleId: z.string(),
  tenantId: z.string(),
  version: z.string().optional(),
  skipDependencies: z.boolean().default(false),
  forceInstall: z.boolean().default(false),
});

const UninstallModuleSchema = z.object({
  moduleId: z.string(),
  tenantId: z.string(),
  forceUninstall: z.boolean().default(false),
  cleanupData: z.boolean().default(true),
});

const UpdateModuleSchema = z.object({
  moduleId: z.string(),
  tenantId: z.string(),
  targetVersion: z.string(),
  backupCurrent: z.boolean().default(true),
});

const AddReviewSchema = z.object({
  moduleId: z.string(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string(),
  review: z.string(),
});

/**
 * GET /api/marketplace/modules
 * Search and list modules
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = {
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      pricing: searchParams.get('pricing') as 'free' | 'paid' || undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'relevance',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
    };

    const validatedQuery = SearchModulesSchema.parse(query);
    const modules = await moduleRegistry.searchModules(validatedQuery);
    const stats = await moduleRegistry.getModuleStatistics();

    return NextResponse.json({
      success: true,
      data: {
        modules,
        pagination: {
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
          total: stats.totalModules,
        },
        stats,
      },
    });

  } catch (error) {
    console.error('Error searching modules:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/modules
 * Submit a new module for review
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real implementation, this would validate the module submission
    // and create a submission record for moderation
    
    const submission = await qualityAssuranceEngine.submitModule({
      moduleId: body.moduleId,
      authorId: body.authorId,
      version: body.version,
      status: 'pending',
      metadata: body.metadata,
    });

    return NextResponse.json({
      success: true,
      data: {
        submissionId: submission.id,
        status: submission.status,
        message: 'Module submitted for review',
      },
    });

  } catch (error) {
    console.error('Error submitting module:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
