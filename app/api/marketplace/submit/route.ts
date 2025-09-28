/**
 * HT-035.3.4: Module Submission API
 * 
 * Handles module submission for quality assurance and moderation.
 * 
 * POST /api/marketplace/submit
 * - Submit a module for review and approval
 * - Trigger automated quality assurance checks
 * - Create submission record with validation results
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { qualityAssuranceEngine } from '@lib/marketplace/quality-assurance';
import { moduleRegistry } from '@lib/marketplace/module-registry';

// Request validation schema
const SubmissionRequestSchema = z.object({
  moduleId: z.string().min(1),
  authorId: z.string().min(1),
  version: z.string().min(1),
  moduleData: z.object({
    name: z.string().min(1),
    displayName: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    pricing: z.object({
      type: z.enum(['free', 'one-time', 'subscription', 'usage-based']),
      amount: z.number().optional(),
      currency: z.string().default('USD'),
    }),
    compatibility: z.object({
      minVersion: z.string(),
      maxVersion: z.string().optional(),
      dependencies: z.array(z.string()).default([]),
      conflicts: z.array(z.string()).default([]),
    }),
    downloadUrl: z.string().url().optional(),
    documentationUrl: z.string().url().optional(),
    supportUrl: z.string().url().optional(),
  }),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = SubmissionRequestSchema.parse(body);

    // Step 1: Register module in registry
    const moduleMetadata = await moduleRegistry.registerModule({
      id: validatedRequest.moduleId,
      name: validatedRequest.moduleData.name,
      displayName: validatedRequest.moduleData.displayName,
      description: validatedRequest.moduleData.description,
      version: validatedRequest.version,
      author: validatedRequest.authorId,
      category: validatedRequest.moduleData.category,
      tags: validatedRequest.moduleData.tags,
      pricing: validatedRequest.moduleData.pricing,
      compatibility: validatedRequest.moduleData.compatibility,
      downloadUrl: validatedRequest.moduleData.downloadUrl,
      documentationUrl: validatedRequest.moduleData.documentationUrl,
      supportUrl: validatedRequest.moduleData.supportUrl,
      status: 'pending',
    });

    // Step 2: Submit for quality assurance
    const submission = await qualityAssuranceEngine.submitModule({
      moduleId: validatedRequest.moduleId,
      authorId: validatedRequest.authorId,
      version: validatedRequest.version,
      metadata: validatedRequest.metadata,
    });

    // Step 3: Run initial validation
    const validationResult = await qualityAssuranceEngine.validateModule(
      validatedRequest.moduleId,
      validatedRequest.version
    );

    // Step 4: Update submission with validation results
    submission.validationResult = validationResult;

    return NextResponse.json({
      success: true,
      submission,
      module: moduleMetadata,
      validation: validationResult,
      message: 'Module submitted successfully for review',
    });

  } catch (error) {
    console.error('Module submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid submission data',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to submit module',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    let submissions;

    if (authorId) {
      // Get submissions by author
      submissions = await qualityAssuranceEngine.getPendingSubmissions();
      submissions = submissions.filter(s => s.authorId === authorId);
    } else {
      // Get all pending submissions for moderation
      submissions = await qualityAssuranceEngine.getPendingSubmissions();
    }

    if (status) {
      submissions = submissions.filter(s => s.status === status);
    }

    return NextResponse.json({
      success: true,
      submissions: submissions.slice(0, limit),
      count: submissions.length,
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve submissions',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
