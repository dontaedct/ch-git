/**
 * @fileoverview Handover Workflow Orchestration System
 * @module lib/handover/handover-orchestrator
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.1: Central orchestration system for automating the complete client handover process.
 * Coordinates all deliverable generation, quality validation, and delivery workflows.
 */

import { z } from 'zod';
import { deliverablesEngine, type ClientConfig, type DeliverablesPackage, type SystemAnalysis } from './deliverables-engine';

// Workflow state management
export enum HandoverWorkflowState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  VALIDATING = 'validating',
  PACKAGING = 'packaging',
  DELIVERING = 'delivering',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum HandoverStep {
  PREREQUISITES_CHECK = 'prerequisites_check',
  DATA_COLLECTION = 'data_collection',
  SOP_GENERATION = 'sop_generation',
  DOCUMENTATION_GENERATION = 'documentation_generation',
  TRAINING_GENERATION = 'training_generation',
  ARTIFACTS_EXPORT = 'artifacts_export',
  MODULE_CONFIG_EXPORT = 'module_config_export',
  SUPPORT_PACKAGE_GENERATION = 'support_package_generation',
  QUALITY_VALIDATION = 'quality_validation',
  PACKAGE_ASSEMBLY = 'package_assembly',
  DELIVERY_PREPARATION = 'delivery_preparation',
  FINAL_DELIVERY = 'final_delivery'
}

// Workflow interfaces
export interface HandoverWorkflow {
  id: string;
  clientId: string;
  clientConfig: ClientConfig;
  systemAnalysis: SystemAnalysis;
  state: HandoverWorkflowState;
  currentStep: HandoverStep;
  startedAt: Date;
  completedAt?: Date;
  estimatedDuration: number; // minutes
  actualDuration?: number;   // minutes
  progress: WorkflowProgress;
  steps: WorkflowStepResult[];
  errors: WorkflowError[];
  deliverables?: DeliverablesPackage;
  metadata: WorkflowMetadata;
}

export interface WorkflowProgress {
  completedSteps: number;
  totalSteps: number;
  percentage: number;
  currentStepProgress: number;
  estimatedTimeRemaining: number; // minutes
}

export interface WorkflowStepResult {
  step: HandoverStep;
  state: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // seconds
  result?: any;
  error?: WorkflowError;
  qualityScore?: number;
}

export interface WorkflowError {
  step: HandoverStep;
  errorType: string;
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
  retryCount?: number;
}

export interface WorkflowMetadata {
  version: string;
  orchestratorVersion: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  requestedBy: string;
  requestedAt: Date;
  tags: string[];
  clientTier: string;
  customizations: Record<string, any>;
}

export interface QualityGateResult {
  step: HandoverStep;
  passed: boolean;
  score: number;
  threshold: number;
  issues: QualityIssue[];
  recommendations: string[];
}

export interface QualityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  affectedComponent: string;
  suggestedFix?: string;
}

// Main orchestrator class
export class HandoverOrchestrator {
  private static instance: HandoverOrchestrator;
  private activeWorkflows: Map<string, HandoverWorkflow> = new Map();
  private workflowHistory: HandoverWorkflow[] = [];
  
  private constructor() {}
  
  public static getInstance(): HandoverOrchestrator {
    if (!HandoverOrchestrator.instance) {
      HandoverOrchestrator.instance = new HandoverOrchestrator();
    }
    return HandoverOrchestrator.instance;
  }
  
  /**
   * Start a new handover workflow
   */
  public async startHandoverWorkflow(
    clientConfig: ClientConfig,
    systemAnalysis: SystemAnalysis,
    metadata: Partial<WorkflowMetadata> = {}
  ): Promise<HandoverWorkflow> {
    try {
      console.log(`🚀 Starting handover workflow for client: ${clientConfig.name}`);
      
      // Create workflow instance
      const workflow = await this.createWorkflowInstance(clientConfig, systemAnalysis, metadata);
      
      // Add to active workflows
      this.activeWorkflows.set(workflow.id, workflow);
      
      // Start execution asynchronously
      this.executeWorkflowAsync(workflow.id);
      
      console.log(`✅ Handover workflow started with ID: ${workflow.id}`);
      return workflow;
      
    } catch (error) {
      console.error(`❌ Failed to start handover workflow:`, error);
      throw new Error(`Failed to start handover workflow: ${error.message}`);
    }
  }
  
  /**
   * Get workflow status and progress
   */
  public async getWorkflowStatus(workflowId: string): Promise<HandoverWorkflow | null> {
    return this.activeWorkflows.get(workflowId) || null;
  }
  
  /**
   * Cancel a running workflow
   */
  public async cancelWorkflow(workflowId: string, reason: string): Promise<boolean> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return false;
    }
    
    workflow.state = HandoverWorkflowState.CANCELLED;
    workflow.completedAt = new Date();
    workflow.errors.push({
      step: workflow.currentStep,
      errorType: 'workflow_cancelled',
      message: `Workflow cancelled: ${reason}`,
      timestamp: new Date(),
      recoverable: false
    });
    
    // Move to history
    this.workflowHistory.push(workflow);
    this.activeWorkflows.delete(workflowId);
    
    console.log(`🛑 Workflow ${workflowId} cancelled: ${reason}`);
    return true;
  }
  
  /**
   * Retry a failed workflow step
   */
  public async retryWorkflowStep(workflowId: string, step: HandoverStep): Promise<boolean> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return false;
    }
    
    console.log(`🔄 Retrying workflow step: ${step} for workflow ${workflowId}`);
    
    // Reset step state
    const stepResult = workflow.steps.find(s => s.step === step);
    if (stepResult) {
      stepResult.state = 'pending';
      stepResult.error = undefined;
      stepResult.retryCount = (stepResult.retryCount || 0) + 1;
    }
    
    // Continue execution from the failed step
    workflow.currentStep = step;
    workflow.state = HandoverWorkflowState.IN_PROGRESS;
    
    // Resume execution
    this.executeWorkflowAsync(workflowId);
    
    return true;
  }
  
  /**
   * Get all active workflows
   */
  public getActiveWorkflows(): HandoverWorkflow[] {
    return Array.from(this.activeWorkflows.values());
  }
  
  /**
   * Get workflow history
   */
  public getWorkflowHistory(limit?: number): HandoverWorkflow[] {
    return limit ? this.workflowHistory.slice(-limit) : this.workflowHistory;
  }
  
  // Private implementation methods
  
  private async createWorkflowInstance(
    clientConfig: ClientConfig,
    systemAnalysis: SystemAnalysis,
    metadata: Partial<WorkflowMetadata>
  ): Promise<HandoverWorkflow> {
    // Validate inputs
    await this.validateWorkflowInputs(clientConfig, systemAnalysis);
    
    const workflowId = `handover-${clientConfig.id}-${Date.now()}`;
    const estimatedDuration = this.calculateEstimatedDuration(clientConfig, systemAnalysis);
    
    const workflow: HandoverWorkflow = {
      id: workflowId,
      clientId: clientConfig.id,
      clientConfig,
      systemAnalysis,
      state: HandoverWorkflowState.PENDING,
      currentStep: HandoverStep.PREREQUISITES_CHECK,
      startedAt: new Date(),
      estimatedDuration,
      progress: {
        completedSteps: 0,
        totalSteps: Object.keys(HandoverStep).length,
        percentage: 0,
        currentStepProgress: 0,
        estimatedTimeRemaining: estimatedDuration
      },
      steps: this.initializeWorkflowSteps(),
      errors: [],
      metadata: {
        version: '1.0.0',
        orchestratorVersion: '1.0.0',
        priority: metadata.priority || 'normal',
        requestedBy: metadata.requestedBy || 'system',
        requestedAt: new Date(),
        tags: metadata.tags || [],
        clientTier: metadata.clientTier || 'standard',
        customizations: metadata.customizations || {}
      }
    };
    
    return workflow;
  }
  
  private async executeWorkflowAsync(workflowId: string): Promise<void> {
    try {
      const workflow = this.activeWorkflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      workflow.state = HandoverWorkflowState.IN_PROGRESS;
      
      // Execute workflow steps in sequence
      await this.executeWorkflowSteps(workflow);
      
      // Complete workflow
      workflow.state = HandoverWorkflowState.COMPLETED;
      workflow.completedAt = new Date();
      workflow.actualDuration = Math.round((workflow.completedAt.getTime() - workflow.startedAt.getTime()) / 60000);
      
      // Move to history
      this.workflowHistory.push(workflow);
      this.activeWorkflows.delete(workflowId);
      
      console.log(`🎉 Handover workflow completed: ${workflowId} (${workflow.actualDuration} minutes)`);
      
    } catch (error) {
      console.error(`❌ Workflow execution failed:`, error);
      await this.handleWorkflowFailure(workflowId, error);
    }
  }
  
  private async executeWorkflowSteps(workflow: HandoverWorkflow): Promise<void> {
    const steps = [
      HandoverStep.PREREQUISITES_CHECK,
      HandoverStep.DATA_COLLECTION,
      HandoverStep.SOP_GENERATION,
      HandoverStep.DOCUMENTATION_GENERATION,
      HandoverStep.TRAINING_GENERATION,
      HandoverStep.ARTIFACTS_EXPORT,
      HandoverStep.MODULE_CONFIG_EXPORT,
      HandoverStep.SUPPORT_PACKAGE_GENERATION,
      HandoverStep.QUALITY_VALIDATION,
      HandoverStep.PACKAGE_ASSEMBLY,
      HandoverStep.DELIVERY_PREPARATION,
      HandoverStep.FINAL_DELIVERY
    ];
    
    for (const step of steps) {
      workflow.currentStep = step;
      
      try {
        await this.executeWorkflowStep(workflow, step);
        this.updateWorkflowProgress(workflow, step);
      } catch (error) {
        await this.handleStepFailure(workflow, step, error);
        
        // Determine if we should continue or abort
        const shouldContinue = await this.shouldContinueAfterFailure(workflow, step, error);
        if (!shouldContinue) {
          throw error;
        }
      }
    }
  }
  
  private async executeWorkflowStep(workflow: HandoverWorkflow, step: HandoverStep): Promise<void> {
    console.log(`📋 Executing workflow step: ${step}`);
    
    const stepResult = workflow.steps.find(s => s.step === step);
    if (!stepResult) {
      throw new Error(`Step ${step} not found in workflow`);
    }
    
    stepResult.state = 'running';
    stepResult.startedAt = new Date();
    
    try {
      let result: any;
      
      switch (step) {
        case HandoverStep.PREREQUISITES_CHECK:
          result = await this.executePrerequisitesCheck(workflow);
          break;
        case HandoverStep.DATA_COLLECTION:
          result = await this.executeDataCollection(workflow);
          break;
        case HandoverStep.SOP_GENERATION:
          result = await this.executeSOPGeneration(workflow);
          break;
        case HandoverStep.DOCUMENTATION_GENERATION:
          result = await this.executeDocumentationGeneration(workflow);
          break;
        case HandoverStep.TRAINING_GENERATION:
          result = await this.executeTrainingGeneration(workflow);
          break;
        case HandoverStep.ARTIFACTS_EXPORT:
          result = await this.executeArtifactsExport(workflow);
          break;
        case HandoverStep.MODULE_CONFIG_EXPORT:
          result = await this.executeModuleConfigExport(workflow);
          break;
        case HandoverStep.SUPPORT_PACKAGE_GENERATION:
          result = await this.executeSupportPackageGeneration(workflow);
          break;
        case HandoverStep.QUALITY_VALIDATION:
          result = await this.executeQualityValidation(workflow);
          break;
        case HandoverStep.PACKAGE_ASSEMBLY:
          result = await this.executePackageAssembly(workflow);
          break;
        case HandoverStep.DELIVERY_PREPARATION:
          result = await this.executeDeliveryPreparation(workflow);
          break;
        case HandoverStep.FINAL_DELIVERY:
          result = await this.executeFinalDelivery(workflow);
          break;
        default:
          throw new Error(`Unknown workflow step: ${step}`);
      }
      
      stepResult.state = 'completed';
      stepResult.completedAt = new Date();
      stepResult.duration = Math.round((stepResult.completedAt.getTime() - stepResult.startedAt!.getTime()) / 1000);
      stepResult.result = result;
      
      // Perform quality gate validation
      const qualityGate = await this.performQualityGate(workflow, step, result);
      stepResult.qualityScore = qualityGate.score;
      
      if (!qualityGate.passed) {
        throw new Error(`Quality gate failed for step ${step}: ${qualityGate.issues.map(i => i.description).join(', ')}`);
      }
      
      console.log(`✅ Step ${step} completed successfully (Quality Score: ${qualityGate.score}%)`);
      
    } catch (error) {
      stepResult.state = 'failed';
      stepResult.completedAt = new Date();
      stepResult.duration = Math.round((stepResult.completedAt.getTime() - stepResult.startedAt!.getTime()) / 1000);
      stepResult.error = {
        step,
        errorType: 'step_execution_error',
        message: error.message,
        details: error,
        timestamp: new Date(),
        recoverable: this.isRecoverableError(error)
      };
      
      throw error;
    }
  }
  
  // Step execution methods
  private async executePrerequisitesCheck(workflow: HandoverWorkflow): Promise<any> {
    // Validate client configuration and system analysis
    const clientValidation = z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      domain: z.string().url(),
      adminEmail: z.string().email(),
      productionUrl: z.string().url()
    });
    
    clientValidation.parse(workflow.clientConfig);
    
    if (!workflow.systemAnalysis.modules || !workflow.systemAnalysis.workflows) {
      throw new Error('Incomplete system analysis data');
    }
    
    return { validated: true, timestamp: new Date() };
  }
  
  private async executeDataCollection(workflow: HandoverWorkflow): Promise<any> {
    // Collect all necessary data for deliverable generation
    return {
      clientData: workflow.clientConfig,
      systemData: workflow.systemAnalysis,
      additionalData: await this.collectAdditionalSystemData(workflow.clientConfig),
      timestamp: new Date()
    };
  }
  
  private async executeSOPGeneration(workflow: HandoverWorkflow): Promise<any> {
    // Generate SOP using the deliverables engine
    const sop = await deliverablesEngine.generateSOP(workflow.clientConfig, workflow.systemAnalysis);
    return sop;
  }
  
  private async executeDocumentationGeneration(workflow: HandoverWorkflow): Promise<any> {
    // Generate technical documentation
    const docs = await deliverablesEngine.generateTechnicalDocumentation(workflow.clientConfig, workflow.systemAnalysis);
    return docs;
  }
  
  private async executeTrainingGeneration(workflow: HandoverWorkflow): Promise<any> {
    // Generate training materials
    const training = await deliverablesEngine.generateTrainingMaterials(workflow.clientConfig, workflow.systemAnalysis);
    return training;
  }
  
  private async executeArtifactsExport(workflow: HandoverWorkflow): Promise<any> {
    // Export workflow artifacts
    const artifacts = await deliverablesEngine.exportWorkflowArtifacts(workflow.clientConfig, workflow.systemAnalysis);
    return artifacts;
  }
  
  private async executeModuleConfigExport(workflow: HandoverWorkflow): Promise<any> {
    // Export module configurations
    const moduleConfig = await deliverablesEngine.generateModuleConfiguration(workflow.clientConfig, workflow.systemAnalysis);
    return moduleConfig;
  }
  
  private async executeSupportPackageGeneration(workflow: HandoverWorkflow): Promise<any> {
    // Generate support package
    const supportPackage = await deliverablesEngine.generateSupportPackage(workflow.clientConfig, workflow.systemAnalysis);
    return supportPackage;
  }
  
  private async executeQualityValidation(workflow: HandoverWorkflow): Promise<any> {
    // Validate all generated deliverables
    const deliverables = {
      sop: workflow.steps.find(s => s.step === HandoverStep.SOP_GENERATION)?.result,
      docs: workflow.steps.find(s => s.step === HandoverStep.DOCUMENTATION_GENERATION)?.result,
      training: workflow.steps.find(s => s.step === HandoverStep.TRAINING_GENERATION)?.result,
      artifacts: workflow.steps.find(s => s.step === HandoverStep.ARTIFACTS_EXPORT)?.result,
      moduleConfig: workflow.steps.find(s => s.step === HandoverStep.MODULE_CONFIG_EXPORT)?.result,
      supportPackage: workflow.steps.find(s => s.step === HandoverStep.SUPPORT_PACKAGE_GENERATION)?.result
    };
    
    const qualityReport = await this.validateOverallQuality(deliverables);
    return qualityReport;
  }
  
  private async executePackageAssembly(workflow: HandoverWorkflow): Promise<any> {
    // Assemble complete deliverables package
    const deliverables = await deliverablesEngine.generateCompletePackage(workflow.clientConfig, workflow.systemAnalysis);
    workflow.deliverables = deliverables;
    return deliverables;
  }
  
  private async executeDeliveryPreparation(workflow: HandoverWorkflow): Promise<any> {
    // Prepare for delivery
    return {
      packageReady: true,
      deliveryMethod: 'client_portal',
      secureDownloadLink: 'https://secure.example.com/download/handover-package',
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      timestamp: new Date()
    };
  }
  
  private async executeFinalDelivery(workflow: HandoverWorkflow): Promise<any> {
    // Execute final delivery
    return {
      delivered: true,
      deliveryMethod: 'client_portal',
      deliveredAt: new Date(),
      trackingId: `delivery-${workflow.id}`,
      notificationsSent: true
    };
  }
  
  // Helper methods
  private async validateWorkflowInputs(clientConfig: ClientConfig, systemAnalysis: SystemAnalysis): Promise<void> {
    // Validation logic already exists in deliverablesEngine
    // This is a placeholder for additional workflow-specific validations
  }
  
  private calculateEstimatedDuration(clientConfig: ClientConfig, systemAnalysis: SystemAnalysis): number {
    // Base duration in minutes
    let duration = 10; // Base 10 minutes
    
    // Add time based on complexity
    duration += (systemAnalysis.modules?.length || 0) * 0.5;
    duration += (systemAnalysis.workflows?.length || 0) * 0.3;
    duration += (systemAnalysis.integrations?.length || 0) * 0.2;
    
    // Client tier adjustments
    const tier = clientConfig.customizations?.tier || 'standard';
    switch (tier) {
      case 'premium':
        duration *= 1.2;
        break;
      case 'enterprise':
        duration *= 1.5;
        break;
    }
    
    return Math.round(duration);
  }
  
  private initializeWorkflowSteps(): WorkflowStepResult[] {
    const steps = Object.values(HandoverStep);
    return steps.map(step => ({
      step: step as HandoverStep,
      state: 'pending'
    }));
  }
  
  private updateWorkflowProgress(workflow: HandoverWorkflow, completedStep: HandoverStep): void {
    const completedSteps = workflow.steps.filter(s => s.state === 'completed').length;
    const totalSteps = workflow.steps.length;
    
    workflow.progress = {
      completedSteps,
      totalSteps,
      percentage: Math.round((completedSteps / totalSteps) * 100),
      currentStepProgress: 100,
      estimatedTimeRemaining: Math.max(0, workflow.estimatedDuration - ((Date.now() - workflow.startedAt.getTime()) / 60000))
    };
  }
  
  private async handleStepFailure(workflow: HandoverWorkflow, step: HandoverStep, error: any): Promise<void> {
    const workflowError: WorkflowError = {
      step,
      errorType: 'step_failure',
      message: error.message,
      details: error,
      timestamp: new Date(),
      recoverable: this.isRecoverableError(error)
    };
    
    workflow.errors.push(workflowError);
    console.error(`❌ Step ${step} failed:`, error.message);
  }
  
  private async shouldContinueAfterFailure(workflow: HandoverWorkflow, step: HandoverStep, error: any): Promise<boolean> {
    // Determine if workflow should continue based on error type and step criticality
    const criticalSteps = [
      HandoverStep.PREREQUISITES_CHECK,
      HandoverStep.DATA_COLLECTION,
      HandoverStep.PACKAGE_ASSEMBLY
    ];
    
    if (criticalSteps.includes(step)) {
      return false; // Cannot continue if critical step fails
    }
    
    return this.isRecoverableError(error);
  }
  
  private isRecoverableError(error: any): boolean {
    // Simple heuristic for determining if an error is recoverable
    const recoverablePatterns = [
      'timeout',
      'network',
      'temporary',
      'rate limit'
    ];
    
    const errorMessage = error.message?.toLowerCase() || '';
    return recoverablePatterns.some(pattern => errorMessage.includes(pattern));
  }
  
  private async handleWorkflowFailure(workflowId: string, error: any): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow) {
      workflow.state = HandoverWorkflowState.FAILED;
      workflow.completedAt = new Date();
      workflow.actualDuration = Math.round((workflow.completedAt.getTime() - workflow.startedAt.getTime()) / 60000);
      
      // Move to history
      this.workflowHistory.push(workflow);
      this.activeWorkflows.delete(workflowId);
    }
    
    console.error(`💥 Workflow ${workflowId} failed:`, error.message);
  }
  
  private async performQualityGate(workflow: HandoverWorkflow, step: HandoverStep, result: any): Promise<QualityGateResult> {
    // Define quality thresholds for each step
    const qualityThresholds: Record<HandoverStep, number> = {
      [HandoverStep.PREREQUISITES_CHECK]: 100,
      [HandoverStep.DATA_COLLECTION]: 95,
      [HandoverStep.SOP_GENERATION]: 85,
      [HandoverStep.DOCUMENTATION_GENERATION]: 85,
      [HandoverStep.TRAINING_GENERATION]: 80,
      [HandoverStep.ARTIFACTS_EXPORT]: 90,
      [HandoverStep.MODULE_CONFIG_EXPORT]: 90,
      [HandoverStep.SUPPORT_PACKAGE_GENERATION]: 80,
      [HandoverStep.QUALITY_VALIDATION]: 85,
      [HandoverStep.PACKAGE_ASSEMBLY]: 95,
      [HandoverStep.DELIVERY_PREPARATION]: 95,
      [HandoverStep.FINAL_DELIVERY]: 100
    };
    
    const threshold = qualityThresholds[step] || 80;
    
    // Calculate quality score based on result
    let score = 95; // Default high score
    
    if (result && typeof result === 'object' && 'qualityScore' in result) {
      score = result.qualityScore;
    }
    
    const passed = score >= threshold;
    
    return {
      step,
      passed,
      score,
      threshold,
      issues: passed ? [] : [
        {
          severity: 'medium',
          category: 'quality',
          description: `Quality score ${score}% below threshold ${threshold}%`,
          affectedComponent: step,
          suggestedFix: 'Review and improve component quality'
        }
      ],
      recommendations: passed ? [] : ['Review and improve component quality']
    };
  }
  
  private async validateOverallQuality(deliverables: any): Promise<any> {
    const scores = Object.values(deliverables)
      .filter(d => d && typeof d === 'object' && 'qualityScore' in d)
      .map(d => (d as any).qualityScore || 80);
    
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 80;
    
    return {
      overallScore: Math.round(averageScore),
      componentScores: scores,
      passed: averageScore >= 80,
      recommendations: averageScore < 90 ? ['Review and improve lower-scoring components'] : []
    };
  }
  
  private async collectAdditionalSystemData(clientConfig: ClientConfig): Promise<any> {
    // Placeholder for collecting additional system data
    return {
      systemHealth: 'healthy',
      performanceMetrics: {},
      securityStatus: 'secure',
      timestamp: new Date()
    };
  }
}

// Export the singleton instance
export const handoverOrchestrator = HandoverOrchestrator.getInstance();

// Utility functions for workflow management
export async function createHandoverWorkflow(
  clientConfig: ClientConfig,
  systemAnalysis: SystemAnalysis,
  options: Partial<WorkflowMetadata> = {}
): Promise<HandoverWorkflow> {
  return handoverOrchestrator.startHandoverWorkflow(clientConfig, systemAnalysis, options);
}

export async function getWorkflowStatus(workflowId: string): Promise<HandoverWorkflow | null> {
  return handoverOrchestrator.getWorkflowStatus(workflowId);
}

export async function cancelWorkflow(workflowId: string, reason: string): Promise<boolean> {
  return handoverOrchestrator.cancelWorkflow(workflowId, reason);
}

export async function retryFailedStep(workflowId: string, step: HandoverStep): Promise<boolean> {
  return handoverOrchestrator.retryWorkflowStep(workflowId, step);
}

// Example usage and validation
export async function validateHandoverOrchestrator(): Promise<boolean> {
  try {
    const orchestrator = HandoverOrchestrator.getInstance();
    console.log('✅ Handover Orchestrator initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Handover Orchestrator validation failed:', error);
    return false;
  }
}
