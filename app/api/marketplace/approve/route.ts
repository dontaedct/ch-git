/**
 * HT-035.3.4: Module Approval API
 * 
 * Handles module approval, rejection, and moderation actions.
 * 
 * POST /api/marketplace/approve
 * - Approve or reject module submissions
 * - Process moderation actions (suspend, unsuspend)
 * - Update module status in registry
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { qualityAssuranceEngine } from '@lib/marketplace/quality-assurance';
import { moduleRegistry } from '@lib/marketplace/module-registry';

// Request validation schema
const ApprovalRequestSchema = z.object({
  submissionId: z.string().min(1),
  action: z.enum(['approve', 'reject', 'request_changes', 'suspend', 'unsuspend']),
  moderatorId: z.string().min(1),
  reason: z.string().min(1),
  comments: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = ApprovalRequestSchema.parse(body);

    // Step 1: Perform moderation action
    const moderationAction = await qualityAssuranceEngine.moderateSubmission(
      validatedRequest.submissionId,
      validatedRequest.action,
      validatedRequest.moderatorId,
      validatedRequest.reason,
      validatedRequest.comments
    );

    // Step 2: Update module status in registry
    let moduleUpdate = null;
    if (validatedRequest.action === 'approve' || validatedRequest.action === 'unsuspend') {
      moduleUpdate = await moduleRegistry.updateModule(
        moderationAction.moduleId,
        { status: 'approved' }
      );
    } else if (validatedRequest.action === 'reject' || validatedRequest.action === 'suspend') {
      moduleUpdate = await moduleRegistry.updateModule(
        moderationAction.moduleId,
        { status: 'rejected' }
      );
    }

    // Step 3: Get updated submission details
    const submissions = await qualityAssuranceEngine.getPendingSubmissions();
    const updatedSubmission = submissions.find(s => s.id === validatedRequest.submissionId);

    return NextResponse.json({
      success: true,
      moderationAction,
      module: moduleUpdate,
      submission: updatedSubmission,
      message: `Module ${validatedRequest.action}ed successfully`,
    });

  } catch (error) {
    console.error('Module approval error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid approval data',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to process moderation action',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');

    if (submissionId) {
      // Get specific submission details
      const submissions = await qualityAssuranceEngine.getPendingSubmissions();
      const submission = submissions.find(s => s.id === submissionId);
      
      if (!submission) {
        return NextResponse.json({
          success: false,
          error: 'Submission not found',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        submission,
      });
    } else {
      // Get moderation statistics
      const stats = await qualityAssuranceEngine.getModerationStats();
      
      return NextResponse.json({
        success: true,
        stats,
      });
    }

  } catch (error) {
    console.error('Get approval data error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve approval data',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
