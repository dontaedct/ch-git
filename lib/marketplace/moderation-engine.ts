/**
 * HT-035.3.4: Marketplace Moderation Engine
 * 
 * Marketplace moderation and approval workflow system.
 * 
 * Features:
 * - Automated moderation workflows
 * - Quality gate enforcement
 * - Approval/rejection workflows
 * - Moderation queue management
 * - Moderation analytics and reporting
 */

import { z } from 'zod';
import { qualityAssuranceEngine, ValidationResult, Submission } from './quality-assurance';
import { automatedTestingEngine, TestSuite } from './automated-testing';
import { securityScannerEngine, SecurityScanResult } from './security-scanner';
import { codeReviewEngine, CodeReviewResult } from './code-review';

// Schema definitions
export const ModerationWorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  steps: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['automated', 'manual', 'approval']),
    conditions: z.array(z.string()).default([]),
    actions: z.array(z.string()).default([]),
    timeout: z.number().optional(),
    required: z.boolean().default(true),
  })),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ModerationQueueSchema = z.object({
  id: z.string(),
  submissionId: z.string(),
  workflowId: z.string(),
  currentStep: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'cancelled']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  assignedModerator: z.string().optional(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  estimatedDuration: z.number().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const ModerationDecisionSchema = z.object({
  id: z.string(),
  submissionId: z.string(),
  moderatorId: z.string(),
  decision: z.enum(['approve', 'reject', 'request_changes', 'suspend']),
  reason: z.string(),
  comments: z.string().optional(),
  evidence: z.array(z.object({
    type: z.string(),
    data: z.unknown(),
    description: z.string(),
  })).default([]),
  createdAt: z.date(),
  metadata: z.record(z.unknown()).default({}),
});

export const ModerationRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'greater_than', 'less_than', 'contains', 'matches']),
    value: z.unknown(),
  })),
  actions: z.array(z.object({
    type: z.enum(['auto_approve', 'auto_reject', 'flag_for_review', 'send_notification']),
    parameters: z.record(z.unknown()).default({}),
  })),
  priority: z.number().default(0),
  enabled: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type ModerationWorkflow = z.infer<typeof ModerationWorkflowSchema>;
export type ModerationQueue = z.infer<typeof ModerationQueueSchema>;
export type ModerationDecision = z.infer<typeof ModerationDecisionSchema>;
export type ModerationRule = z.infer<typeof ModerationRuleSchema>;

export interface ModerationStep {
  id: string;
  name: string;
  type: 'automated' | 'manual' | 'approval';
  execute: (submission: Submission) => Promise<{
    success: boolean;
    result: any;
    nextStep?: string;
    skipSteps?: string[];
  }>;
}

/**
 * Marketplace Moderation Engine
 * 
 * Orchestrates moderation workflows and quality gate enforcement
 */
export class ModerationEngine {
  private workflows: Map<string, ModerationWorkflow> = new Map();
  private moderationQueue: Map<string, ModerationQueue> = new Map();
  private decisions: Map<string, ModerationDecision> = new Map();
  private rules: Map<string, ModerationRule> = new Map();
  private steps: Map<string, ModerationStep> = new Map();

  constructor() {
    this.initializeDefaultWorkflows();
    this.initializeDefaultSteps();
    this.initializeDefaultRules();
  }

  /**
   * Start moderation process for a submission
   */
  async startModeration(submissionId: string, workflowId?: string): Promise<ModerationQueue> {
    const submission = await this.getSubmission(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    // Determine workflow to use
    const workflow = workflowId 
      ? this.workflows.get(workflowId)
      : this.selectWorkflow(submission);

    if (!workflow) {
      throw new Error('No suitable workflow found for submission');
    }

    // Create moderation queue entry
    const queueId = this.generateQueueId();
    const queue: ModerationQueue = {
      id: queueId,
      submissionId,
      workflowId: workflow.id,
      currentStep: workflow.steps[0]?.id || '',
      status: 'pending',
      priority: this.calculatePriority(submission),
      startedAt: new Date(),
      estimatedDuration: this.estimateDuration(workflow),
      metadata: {
        submission: submission,
        workflow: workflow,
      },
    };

    this.moderationQueue.set(queueId, queue);

    // Start the moderation process
    this.processModerationQueue(queueId);

    return queue;
  }

  /**
   * Process moderation queue
   */
  private async processModerationQueue(queueId: string): Promise<void> {
    const queue = this.moderationQueue.get(queueId);
    if (!queue) return;

    const workflow = this.workflows.get(queue.workflowId);
    if (!workflow) return;

    try {
      queue.status = 'in_progress';
      const submission = await this.getSubmission(queue.submissionId);
      if (!submission) {
        queue.status = 'failed';
        return;
      }

      // Execute current step
      const currentStepDef = workflow.steps.find(s => s.id === queue.currentStep);
      if (!currentStepDef) {
        queue.status = 'completed';
        queue.completedAt = new Date();
        return;
      }

      const step = this.steps.get(currentStepDef.type);
      if (!step) {
        console.warn(`No step handler found for type: ${currentStepDef.type}`);
        queue.currentStep = this.getNextStep(workflow, queue.currentStep);
        await this.processModerationQueue(queueId);
        return;
      }

      const stepResult = await step.execute(submission);
      
      if (stepResult.success) {
        // Move to next step or complete
        if (stepResult.nextStep) {
          queue.currentStep = stepResult.nextStep;
          await this.processModerationQueue(queueId);
        } else {
          queue.status = 'completed';
          queue.completedAt = new Date();
        }
      } else {
        queue.status = 'failed';
        queue.completedAt = new Date();
      }

    } catch (error) {
      console.error(`Moderation process failed for queue ${queueId}:`, error);
      queue.status = 'failed';
      queue.completedAt = new Date();
    }
  }

  /**
   * Make moderation decision
   */
  async makeDecision(
    submissionId: string,
    moderatorId: string,
    decision: ModerationDecision['decision'],
    reason: string,
    comments?: string,
    evidence?: ModerationDecision['evidence']
  ): Promise<ModerationDecision> {
    const submission = await this.getSubmission(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    const decisionId = this.generateDecisionId();
    const moderationDecision: ModerationDecision = {
      id: decisionId,
      submissionId,
      moderatorId,
      decision,
      reason,
      comments,
      evidence: evidence || [],
      createdAt: new Date(),
      metadata: {
        submission: submission,
        automated: false,
      },
    };

    this.decisions.set(decisionId, moderationDecision);

    // Apply the decision
    await this.applyDecision(moderationDecision);

    return moderationDecision;
  }

  /**
   * Apply moderation decision
   */
  private async applyDecision(decision: ModerationDecision): Promise<void> {
    // Update submission status through quality assurance engine
    await qualityAssuranceEngine.moderateSubmission(
      decision.submissionId,
      decision.decision,
      decision.moderatorId,
      decision.reason,
      decision.comments
    );

    // Update moderation queue
    const queue = Array.from(this.moderationQueue.values())
      .find(q => q.submissionId === decision.submissionId);
    
    if (queue) {
      queue.status = 'completed';
      queue.completedAt = new Date();
    }

    // Trigger any post-decision actions
    await this.triggerPostDecisionActions(decision);
  }

  /**
   * Get moderation queue status
   */
  async getModerationQueue(status?: string, limit: number = 50): Promise<ModerationQueue[]> {
    let queue = Array.from(this.moderationQueue.values());

    if (status) {
      queue = queue.filter(q => q.status === status);
    }

    return queue
      .sort((a, b) => {
        // Sort by priority and start time
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return a.startedAt.getTime() - b.startedAt.getTime();
      })
      .slice(0, limit);
  }

  /**
   * Get moderation statistics
   */
  async getModerationStatistics(): Promise<{
    totalSubmissions: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
    averageProcessingTime: number;
    moderatorPerformance: Array<{
      moderatorId: string;
      decisionsCount: number;
      approvalRate: number;
      averageProcessingTime: number;
    }>;
    workflowPerformance: Array<{
      workflowId: string;
      name: string;
      submissionsCount: number;
      averageProcessingTime: number;
      successRate: number;
    }>;
  }> {
    const submissions = await qualityAssuranceEngine.getPendingSubmissions();
    const decisions = Array.from(this.decisions.values());
    const queue = Array.from(this.moderationQueue.values());

    const pendingSubmissions = submissions.filter(s => s.status === 'pending' || s.status === 'under_review').length;
    const approvedSubmissions = decisions.filter(d => d.decision === 'approve').length;
    const rejectedSubmissions = decisions.filter(d => d.decision === 'reject').length;

    const completedQueue = queue.filter(q => q.completedAt);
    const averageProcessingTime = completedQueue.length > 0
      ? completedQueue.reduce((sum, q) => {
          const duration = q.completedAt!.getTime() - q.startedAt.getTime();
          return sum + duration;
        }, 0) / completedQueue.length
      : 0;

    // Calculate moderator performance
    const moderatorStats = new Map<string, {
      decisionsCount: number;
      approvals: number;
      totalTime: number;
      processingTimes: number[];
    }>();

    decisions.forEach(decision => {
      const stats = moderatorStats.get(decision.moderatorId) || {
        decisionsCount: 0,
        approvals: 0,
        totalTime: 0,
        processingTimes: [],
      };

      stats.decisionsCount++;
      if (decision.decision === 'approve') {
        stats.approvals++;
      }

      // Find processing time from queue
      const queueEntry = queue.find(q => q.submissionId === decision.submissionId);
      if (queueEntry && queueEntry.completedAt) {
        const processingTime = queueEntry.completedAt.getTime() - queueEntry.startedAt.getTime();
        stats.totalTime += processingTime;
        stats.processingTimes.push(processingTime);
      }

      moderatorStats.set(decision.moderatorId, stats);
    });

    const moderatorPerformance = Array.from(moderatorStats.entries()).map(([moderatorId, stats]) => ({
      moderatorId,
      decisionsCount: stats.decisionsCount,
      approvalRate: Math.round((stats.approvals / stats.decisionsCount) * 100),
      averageProcessingTime: stats.processingTimes.length > 0
        ? Math.round(stats.processingTimes.reduce((sum, time) => sum + time, 0) / stats.processingTimes.length)
        : 0,
    }));

    // Calculate workflow performance
    const workflowStats = new Map<string, {
      submissionsCount: number;
      totalTime: number;
      processingTimes: number[];
      completedCount: number;
    }>();

    queue.forEach(q => {
      const stats = workflowStats.get(q.workflowId) || {
        submissionsCount: 0,
        totalTime: 0,
        processingTimes: [],
        completedCount: 0,
      };

      stats.submissionsCount++;
      if (q.completedAt) {
        stats.completedCount++;
        const processingTime = q.completedAt.getTime() - q.startedAt.getTime();
        stats.totalTime += processingTime;
        stats.processingTimes.push(processingTime);
      }

      workflowStats.set(q.workflowId, stats);
    });

    const workflowPerformance = Array.from(workflowStats.entries()).map(([workflowId, stats]) => {
      const workflow = this.workflows.get(workflowId);
      return {
        workflowId,
        name: workflow?.name || 'Unknown',
        submissionsCount: stats.submissionsCount,
        averageProcessingTime: stats.processingTimes.length > 0
          ? Math.round(stats.processingTimes.reduce((sum, time) => sum + time, 0) / stats.processingTimes.length)
          : 0,
        successRate: Math.round((stats.completedCount / stats.submissionsCount) * 100),
      };
    });

    return {
      totalSubmissions: submissions.length,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      averageProcessingTime: Math.round(averageProcessingTime),
      moderatorPerformance,
      workflowPerformance,
    };
  }

  // Private helper methods

  private initializeDefaultWorkflows(): void {
    const defaultWorkflow: ModerationWorkflow = {
      id: 'standard-moderation',
      name: 'Standard Moderation Workflow',
      description: 'Standard workflow for module moderation including automated checks and manual review',
      steps: [
        {
          id: 'automated-validation',
          name: 'Automated Validation',
          type: 'automated',
          conditions: [],
          actions: ['run_validation', 'security_scan', 'code_review'],
          timeout: 300000, // 5 minutes
          required: true,
        },
        {
          id: 'quality-gate',
          name: 'Quality Gate Check',
          type: 'automated',
          conditions: ['validation_score >= 80', 'security_score >= 90'],
          actions: ['check_quality_gates'],
          required: true,
        },
        {
          id: 'manual-review',
          name: 'Manual Review',
          type: 'manual',
          conditions: [],
          actions: ['assign_moderator', 'review_submission'],
          required: true,
        },
        {
          id: 'final-approval',
          name: 'Final Approval',
          type: 'approval',
          conditions: [],
          actions: ['make_decision'],
          required: true,
        },
      ],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workflows.set(defaultWorkflow.id, defaultWorkflow);
  }

  private initializeDefaultSteps(): void {
    // Automated validation step
    this.steps.set('automated', {
      id: 'automated-validation',
      name: 'Automated Validation',
      type: 'automated',
      execute: async (submission) => {
        try {
          // Run comprehensive validation
          const validationResult = await qualityAssuranceEngine.validateModule(
            submission.moduleId,
            submission.version
          );

          return {
            success: validationResult.success,
            result: validationResult,
            nextStep: validationResult.success ? 'quality-gate' : undefined,
          };
        } catch (error) {
          return {
            success: false,
            result: { error: error instanceof Error ? error.message : String(error) },
          };
        }
      },
    });

    // Manual review step
    this.steps.set('manual', {
      id: 'manual-review',
      name: 'Manual Review',
      type: 'manual',
      execute: async (submission) => {
        // Manual review requires human intervention
        // This step just marks it as ready for manual review
        return {
          success: true,
          result: { status: 'awaiting_manual_review' },
          nextStep: 'final-approval',
        };
      },
    });

    // Approval step
    this.steps.set('approval', {
      id: 'final-approval',
      name: 'Final Approval',
      type: 'approval',
      execute: async (submission) => {
        // Approval step requires manual decision
        return {
          success: true,
          result: { status: 'awaiting_approval' },
        };
      },
    });
  }

  private initializeDefaultRules(): void {
    const autoApproveRule: ModerationRule = {
      id: 'auto-approve-high-quality',
      name: 'Auto-approve High Quality Modules',
      description: 'Automatically approve modules with high quality scores',
      conditions: [
        {
          field: 'validation_result.overall_score',
          operator: 'greater_than',
          value: 95,
        },
        {
          field: 'validation_result.security_issues.length',
          operator: 'equals',
          value: 0,
        },
      ],
      actions: [
        {
          type: 'auto_approve',
          parameters: {
            reason: 'High quality score with no security issues',
          },
        },
      ],
      priority: 100,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rules.set(autoApproveRule.id, autoApproveRule);
  }

  private async getSubmission(submissionId: string): Promise<Submission | null> {
    const submissions = await qualityAssuranceEngine.getPendingSubmissions();
    return submissions.find(s => s.id === submissionId) || null;
  }

  private selectWorkflow(submission: Submission): ModerationWorkflow | null {
    // Simple workflow selection - in real app, this would be more sophisticated
    return this.workflows.get('standard-moderation') || null;
  }

  private calculatePriority(submission: Submission): 'low' | 'normal' | 'high' | 'urgent' {
    // Simple priority calculation based on validation results
    if (submission.validationResult) {
      if (submission.validationResult.overallScore >= 95) {
        return 'high';
      } else if (submission.validationResult.overallScore >= 80) {
        return 'normal';
      } else {
        return 'low';
      }
    }
    return 'normal';
  }

  private estimateDuration(workflow: ModerationWorkflow): number {
    // Estimate duration based on workflow steps
    const stepDurations = {
      automated: 300000, // 5 minutes
      manual: 3600000,   // 1 hour
      approval: 1800000, // 30 minutes
    };

    return workflow.steps.reduce((total, step) => {
      return total + (stepDurations[step.type] || 300000);
    }, 0);
  }

  private getNextStep(workflow: ModerationWorkflow, currentStepId: string): string {
    const currentIndex = workflow.steps.findIndex(s => s.id === currentStepId);
    if (currentIndex >= 0 && currentIndex < workflow.steps.length - 1) {
      return workflow.steps[currentIndex + 1].id;
    }
    return '';
  }

  private async triggerPostDecisionActions(decision: ModerationDecision): Promise<void> {
    // Trigger any post-decision actions like notifications, logging, etc.
    console.log(`Post-decision actions triggered for ${decision.decision} decision on submission ${decision.submissionId}`);
  }

  private generateQueueId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDecisionId(): string {
    return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const moderationEngine = new ModerationEngine();
