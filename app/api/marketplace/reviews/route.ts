/**
 * HT-035.3.4: Module Reviews API
 * 
 * Handles module reviews, ratings, and reputation management.
 * 
 * GET /api/marketplace/reviews - Get reviews for a module
 * POST /api/marketplace/reviews - Add a new review
 * PUT /api/marketplace/reviews/[id] - Update a review
 * DELETE /api/marketplace/reviews/[id] - Delete a review
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { qualityAssuranceEngine } from '@lib/marketplace/quality-assurance';
import { moduleRegistry } from '@lib/marketplace/module-registry';

// Request validation schema
const ReviewRequestSchema = z.object({
  moduleId: z.string().min(1),
  userId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  review: z.string().min(10).max(1000),
  verified: z.boolean().default(false),
});

const UpdateReviewRequestSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().min(1).max(100).optional(),
  review: z.string().min(10).max(1000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!moduleId) {
      return NextResponse.json({
        success: false,
        error: 'Module ID is required',
      }, { status: 400 });
    }

    // Get reviews for the module
    const reviews = await qualityAssuranceEngine.getModuleReviews(moduleId, limit);
    const reputationScore = await qualityAssuranceEngine.getReputationScore(moduleId);

    return NextResponse.json({
      success: true,
      reviews: reviews.slice(offset, offset + limit),
      reputation: reputationScore,
      pagination: {
        limit,
        offset,
        total: reviews.length,
        hasMore: offset + limit < reviews.length,
      },
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve reviews',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = ReviewRequestSchema.parse(body);

    // Step 1: Add review to quality assurance system
    const review = await qualityAssuranceEngine.addReview({
      moduleId: validatedRequest.moduleId,
      userId: validatedRequest.userId,
      rating: validatedRequest.rating,
      title: validatedRequest.title,
      review: validatedRequest.review,
      verified: validatedRequest.verified,
    });

    // Step 2: Update module rating in registry
    await moduleRegistry.updateModuleRating(
      validatedRequest.moduleId,
      validatedRequest.rating
    );

    // Step 3: Get updated reputation score
    const reputationScore = await qualityAssuranceEngine.getReputationScore(validatedRequest.moduleId);

    return NextResponse.json({
      success: true,
      review,
      reputation: reputationScore,
      message: 'Review added successfully',
    });

  } catch (error) {
    console.error('Add review error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid review data',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to add review',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
