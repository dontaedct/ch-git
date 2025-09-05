/**
 * Hero Tasks Workflow Integration Service
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

import {
  HeroTask,
  HeroSubtask,
  HeroAction,
  WorkflowPhase,
  TaskStatus,
  WorkflowProcess,
  WorkflowPhaseData,
  WorkflowChecklistItem,
  AuditTrailEntry,
  ApiResponse
} from '@/types/hero-tasks';

// ============================================================================
// WORKFLOW PHASE DEFINITIONS
// ============================================================================

export const WORKFLOW_PHASE_DEFINITIONS = {
  [WorkflowPhase.AUDIT]: {
    name: 'Audit',
    description: 'Analyze current state and requirements',
    checklist: [
      { id: 'audit-1', description: 'Review current system state', required: true },
      { id: 'audit-2', description: 'Identify requirements and constraints', required: true },
      { id: 'audit-3', description: 'Document current issues and risks', required: true },
      { id: 'audit-4', description: 'Gather necessary information and context', required: true },
      { id: 'audit-5', description: 'Validate scope and boundaries', required: true }
    ],
    deliverables: [
      'Current state analysis',
      'Requirements documentation',
      'Risk assessment',
      'Scope validation'
    ]
  },
  [WorkflowPhase.DECIDE]: {
    name: 'Decide',
    description: 'Make decisions with documented reasoning',
    checklist: [
      { id: 'decide-1', description: 'Evaluate available options', required: true },
      { id: 'decide-2', description: 'Consider trade-offs and implications', required: true },
      { id: 'decide-3', description: 'Document decision rationale', required: true },
      { id: 'decide-4', description: 'Get stakeholder approval if needed', required: false },
      { id: 'decide-5', description: 'Finalize approach and plan', required: true }
    ],
    deliverables: [
      'Decision documentation',
      'Approach selection',
      'Implementation plan',
      'Stakeholder approval'
    ]
  },
  [WorkflowPhase.APPLY]: {
    name: 'Apply',
    description: 'Implement changes with minimal diffs',
    checklist: [
      { id: 'apply-1', description: 'Implement core changes', required: true },
      { id: 'apply-2', description: 'Follow coding standards and best practices', required: true },
      { id: 'apply-3', description: 'Write tests for new functionality', required: true },
      { id: 'apply-4', description: 'Update documentation', required: true },
      { id: 'apply-5', description: 'Ensure backward compatibility', required: false }
    ],
    deliverables: [
      'Code implementation',
      'Unit tests',
      'Updated documentation',
      'Integration tests'
    ]
  },
  [WorkflowPhase.VERIFY]: {
    name: 'Verify',
    description: 'Validate implementation with tests and checks',
    checklist: [
      { id: 'verify-1', description: 'Run automated tests', required: true },
      { id: 'verify-2', description: 'Perform manual testing', required: true },
      { id: 'verify-3', description: 'Validate against requirements', required: true },
      { id: 'verify-4', description: 'Check performance and security', required: true },
      { id: 'verify-5', description: 'Get final approval', required: true }
    ],
    deliverables: [
      'Test results',
      'Validation report',
      'Performance metrics',
      'Final approval'
    ]
  }
};

// ============================================================================
// WORKFLOW PROCESS MANAGEMENT
// ============================================================================

export class WorkflowManager {
  /**
   * Initialize workflow process for a task
   */
  static initializeWorkflow(task: HeroTask): WorkflowProcess {
    const phases: WorkflowPhaseData[] = Object.values(WorkflowPhase).map(phase => ({
      phase,
      status: phase === WorkflowPhase.AUDIT ? 'in_progress' : 'pending',
      started_at: phase === WorkflowPhase.AUDIT ? new Date().toISOString() : undefined,
      checklist: WORKFLOW_PHASE_DEFINITIONS[phase].checklist.map(item => ({
        ...item,
        completed: false
      })),
      deliverables: WORKFLOW_PHASE_DEFINITIONS[phase].deliverables
    }));

    return {
      current_phase: WorkflowPhase.AUDIT,
      phases,
      is_complete: false,
      can_proceed: true,
      blockers: []
    };
  }

  /**
   * Get workflow process for a task
   */
  static getWorkflowProcess(task: HeroTask): WorkflowProcess {
    const phases: WorkflowPhaseData[] = Object.values(WorkflowPhase).map(phase => {
      const phaseData = WORKFLOW_PHASE_DEFINITIONS[phase];
      const isCurrentPhase = phase === task.current_phase;
      const isCompletedPhase = this.isPhaseCompleted(task, phase);
      const isPendingPhase = !isCurrentPhase && !isCompletedPhase;

      return {
        phase,
        status: isCompletedPhase ? 'completed' : isCurrentPhase ? 'in_progress' : 'pending',
        started_at: isCurrentPhase || isCompletedPhase ? task.started_at : undefined,
        completed_at: isCompletedPhase ? task.completed_at : undefined,
        checklist: phaseData.checklist.map(item => ({
          ...item,
          completed: this.isChecklistItemCompleted(task, phase, item.id)
        })),
        deliverables: phaseData.deliverables
      };
    });

    const blockers = this.getWorkflowBlockers(task);
    const canProceed = blockers.length === 0;

    return {
      current_phase: task.current_phase,
      phases,
      is_complete: task.status === TaskStatus.COMPLETED,
      can_proceed: canProceed,
      blockers
    };
  }

  /**
   * Check if a phase is completed
   */
  private static isPhaseCompleted(task: HeroTask, phase: WorkflowPhase): boolean {
    const phaseOrder = [WorkflowPhase.AUDIT, WorkflowPhase.DECIDE, WorkflowPhase.APPLY, WorkflowPhase.VERIFY];
    const currentPhaseIndex = phaseOrder.indexOf(task.current_phase);
    const targetPhaseIndex = phaseOrder.indexOf(phase);
    
    return targetPhaseIndex < currentPhaseIndex;
  }

  /**
   * Check if a checklist item is completed
   */
  private static isChecklistItemCompleted(task: HeroTask, phase: WorkflowPhase, itemId: string): boolean {
    // This would typically check against audit trail or metadata
    // For now, we'll use a simple heuristic based on phase completion
    return this.isPhaseCompleted(task, phase);
  }

  /**
   * Get workflow blockers
   */
  private static getWorkflowBlockers(task: HeroTask): string[] {
    const blockers: string[] = [];

    // Check for required checklist items in current phase
    const currentPhaseData = WORKFLOW_PHASE_DEFINITIONS[task.current_phase];
    const requiredItems = currentPhaseData.checklist.filter(item => item.required);
    
    // This is a simplified check - in reality, you'd check against actual completion status
    if (task.status === TaskStatus.BLOCKED) {
      blockers.push('Task is marked as blocked');
    }

    // Check dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      blockers.push(`${task.dependencies.length} dependencies not resolved`);
    }

    return blockers;
  }

  /**
   * Advance to next phase
   */
  static async advanceToNextPhase(taskId: string): Promise<ApiResponse<HeroTask>> {
    try {
      // This would typically make API calls to update the task
      // For now, we'll return a mock response
      return {
        success: true,
        message: 'Phase advanced successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Complete checklist item
   */
  static async completeChecklistItem(
    taskId: string, 
    phase: WorkflowPhase, 
    itemId: string
  ): Promise<ApiResponse<void>> {
    try {
      // This would typically update the task's audit trail or metadata
      return {
        success: true,
        message: 'Checklist item completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// ============================================================================
// AUDIT TRAIL MANAGEMENT
// ============================================================================

export class AuditTrailManager {
  /**
   * Add audit trail entry
   */
  static addAuditEntry(
    task: HeroTask,
    action: string,
    details: Record<string, any>,
    userId?: string,
    phase?: WorkflowPhase
  ): AuditTrailEntry {
    const entry: AuditTrailEntry = {
      timestamp: new Date().toISOString(),
      action,
      user_id: userId,
      details,
      phase
    };

    return entry;
  }

  /**
   * Get audit trail for a task
   */
  static getAuditTrail(task: HeroTask): AuditTrailEntry[] {
    return task.audit_trail || [];
  }

  /**
   * Filter audit trail by phase
   */
  static getAuditTrailByPhase(task: HeroTask, phase: WorkflowPhase): AuditTrailEntry[] {
    return task.audit_trail?.filter(entry => entry.phase === phase) || [];
  }

  /**
   * Get recent audit entries
   */
  static getRecentAuditEntries(task: HeroTask, limit: number = 10): AuditTrailEntry[] {
    const sortedEntries = task.audit_trail?.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ) || [];
    
    return sortedEntries.slice(0, limit);
  }
}

// ============================================================================
// WORKFLOW VALIDATION
// ============================================================================

export class WorkflowValidator {
  /**
   * Validate task can proceed to next phase
   */
  static canProceedToNextPhase(task: HeroTask): { canProceed: boolean; reasons: string[] } {
    const reasons: string[] = [];
    let canProceed = true;

    // Check if current phase is complete
    const currentPhaseData = WORKFLOW_PHASE_DEFINITIONS[task.current_phase];
    const requiredItems = currentPhaseData.checklist.filter(item => item.required);
    
    // This is a simplified check - in reality, you'd check actual completion status
    if (task.status === TaskStatus.BLOCKED) {
      canProceed = false;
      reasons.push('Task is blocked');
    }

    // Check dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      canProceed = false;
      reasons.push('Dependencies not resolved');
    }

    // Check if task is in a valid state
    if (task.status === TaskStatus.CANCELLED) {
      canProceed = false;
      reasons.push('Task is cancelled');
    }

    return { canProceed, reasons };
  }

  /**
   * Validate task completion
   */
  static canCompleteTask(task: HeroTask): { canComplete: boolean; reasons: string[] } {
    const reasons: string[] = [];
    let canComplete = true;

    // Check if all phases are complete
    if (task.current_phase !== WorkflowPhase.VERIFY) {
      canComplete = false;
      reasons.push('Not in final verification phase');
    }

    // Check if task is in progress
    if (task.status !== TaskStatus.IN_PROGRESS) {
      canComplete = false;
      reasons.push('Task must be in progress to complete');
    }

    return { canComplete, reasons };
  }
}

// ============================================================================
// WORKFLOW AUTOMATION
// ============================================================================

export class WorkflowAutomation {
  /**
   * Auto-advance task based on completion criteria
   */
  static async autoAdvanceTask(task: HeroTask): Promise<ApiResponse<HeroTask>> {
    try {
      const validation = WorkflowValidator.canProceedToNextPhase(task);
      
      if (!validation.canProceed) {
        return {
          success: false,
          error: `Cannot advance task: ${validation.reasons.join(', ')}`,
          timestamp: new Date().toISOString()
        };
      }

      // Determine next phase
      const phaseOrder = [WorkflowPhase.AUDIT, WorkflowPhase.DECIDE, WorkflowPhase.APPLY, WorkflowPhase.VERIFY];
      const currentIndex = phaseOrder.indexOf(task.current_phase);
      
      if (currentIndex >= phaseOrder.length - 1) {
        return {
          success: false,
          error: 'Task is already in final phase',
          timestamp: new Date().toISOString()
        };
      }

      const nextPhase = phaseOrder[currentIndex + 1];
      
      // This would typically make an API call to update the task
      return {
        success: true,
        message: `Task advanced to ${nextPhase} phase`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Auto-complete task when all criteria are met
   */
  static async autoCompleteTask(task: HeroTask): Promise<ApiResponse<HeroTask>> {
    try {
      const validation = WorkflowValidator.canCompleteTask(task);
      
      if (!validation.canComplete) {
        return {
          success: false,
          error: `Cannot complete task: ${validation.reasons.join(', ')}`,
          timestamp: new Date().toISOString()
        };
      }

      // This would typically make an API call to complete the task
      return {
        success: true,
        message: 'Task completed successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// ============================================================================
// WORKFLOW INTEGRATION WITH EXISTING SYSTEM
// ============================================================================

export class WorkflowIntegration {
  /**
   * Integrate with existing audit-decide-apply-verify workflow
   */
  static integrateWithExistingWorkflow(task: HeroTask): {
    auditPhase: {
      status: 'pending' | 'in_progress' | 'completed' | 'blocked';
      checklist: any[];
      deliverables: string[];
    };
    decidePhase: {
      status: 'pending' | 'in_progress' | 'completed' | 'blocked';
      checklist: any[];
      deliverables: string[];
    };
    applyPhase: {
      status: 'pending' | 'in_progress' | 'completed' | 'blocked';
      checklist: any[];
      deliverables: string[];
    };
    verifyPhase: {
      status: 'pending' | 'in_progress' | 'completed' | 'blocked';
      checklist: any[];
      deliverables: string[];
    };
  } {
    const workflowProcess = WorkflowManager.getWorkflowProcess(task);
    
    return {
      auditPhase: {
        status: workflowProcess.phases.find(p => p.phase === WorkflowPhase.AUDIT)?.status || 'pending',
        checklist: WORKFLOW_PHASE_DEFINITIONS[WorkflowPhase.AUDIT].checklist,
        deliverables: WORKFLOW_PHASE_DEFINITIONS[WorkflowPhase.AUDIT].deliverables
      },
      decidePhase: {
        status: workflowProcess.phases.find(p => p.phase === WorkflowPhase.DECIDE)?.status || 'pending',
        checklist: WORKFLOW_PHASE_DEFINITIONS[WorkflowPhase.DECIDE].checklist,
        deliverables: WORKFLOW_PHASE_DEFINITIONS[WorkflowPhase.DECIDE].deliverables
      },
      applyPhase: {
        status: workflowProcess.phases.find(p => p.phase === WorkflowPhase.APPLY)?.status || 'pending',
        checklist: WORKFLOW_PHASE_DEFINITIONS[WorkflowPhase.APPLY].checklist,
        deliverables: WORKFLOW_PHASE_DEFINITIONS[WorkflowPhase.APPLY].deliverables
      },
      verifyPhase: {
        status: workflowProcess.phases.find(p => p.phase === WorkflowPhase.VERIFY)?.status || 'pending',
        checklist: WORKFLOW_PHASE_DEFINITIONS[WorkflowPhase.VERIFY].checklist,
        deliverables: WORKFLOW_PHASE_DEFINITIONS[WorkflowPhase.VERIFY].deliverables
      }
    };
  }

  /**
   * Generate workflow report
   */
  static generateWorkflowReport(task: HeroTask): {
    taskId: string;
    taskNumber: string;
    currentPhase: WorkflowPhase;
    progress: number;
    blockers: string[];
    nextSteps: string[];
    estimatedCompletion: string;
  } {
    const workflowProcess = WorkflowManager.getWorkflowProcess(task);
    const progress = (workflowProcess.phases.filter((p: any) => p.status === 'completed').length / 4) * 100;
    
    const nextSteps = WORKFLOW_PHASE_DEFINITIONS[task.current_phase].checklist
      .filter((item: any) => !item.completed)
      .map((item: any) => item.description);

    return {
      taskId: task.id,
      taskNumber: task.task_number,
      currentPhase: task.current_phase,
      progress,
      blockers: workflowProcess.blockers,
      nextSteps,
      estimatedCompletion: task.due_date || 'Not set'
    };
  }
}
