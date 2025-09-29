/**
 * @fileoverview Workflow Artifact Export System
 * @module lib/handover/workflow-exporter
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.4: Automated workflow artifact export system for client handover packages.
 * Exports all workflow definitions, configurations, and execution artifacts.
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

// Types and interfaces
export interface WorkflowArtifact {
  id: string;
  name: string;
  type: 'n8n_workflow' | 'temporal_workflow' | 'custom_workflow';
  version: string;
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: Date;
  updatedAt: Date;
  metadata: WorkflowMetadata;
  definition: WorkflowDefinition;
  executionHistory: WorkflowExecution[];
  dependencies: WorkflowDependency[];
}

export interface WorkflowMetadata {
  description: string;
  tags: string[];
  category: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  owner: string;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number; // seconds
  customFields: Record<string, any>;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  settings: WorkflowSettings;
  variables: WorkflowVariable[];
  triggers: WorkflowTrigger[];
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  parameters: Record<string, any>;
  credentials?: string;
  disabled: boolean;
}

export interface WorkflowConnection {
  source: string;
  target: string;
  sourceOutput: string;
  targetInput: string;
}

export interface WorkflowSettings {
  executionOrder: 'parallel' | 'sequential';
  retryPolicy: RetryPolicy;
  timeout: number; // seconds
  concurrency: number;
  errorHandling: ErrorHandlingPolicy;
}

export interface RetryPolicy {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number; // seconds
  backoffMultiplier: number;
}

export interface ErrorHandlingPolicy {
  onError: 'stop' | 'continue' | 'retry';
  errorNotification: boolean;
  errorRecipients: string[];
}

export interface WorkflowVariable {
  name: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  sensitive: boolean;
}

export interface WorkflowTrigger {
  type: 'webhook' | 'schedule' | 'manual' | 'event';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // seconds
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: WorkflowError;
  logs: ExecutionLog[];
}

export interface WorkflowError {
  message: string;
  code: string;
  stack?: string;
  nodeId?: string;
  timestamp: Date;
}

export interface ExecutionLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  nodeId?: string;
  data?: any;
}

export interface WorkflowDependency {
  type: 'module' | 'service' | 'api' | 'database';
  name: string;
  version?: string;
  required: boolean;
  description?: string;
}

export interface ExportOptions {
  includeExecutionHistory: boolean;
  includeLogs: boolean;
  includeCredentials: boolean;
  format: 'json' | 'yaml' | 'zip';
  compressionLevel: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface WorkflowExportResult {
  artifacts: WorkflowArtifact[];
  exportMetadata: ExportMetadata;
  files: ExportFile[];
  summary: ExportSummary;
}

export interface ExportMetadata {
  exportedAt: Date;
  exportedBy: string;
  clientId: string;
  version: string;
  totalArtifacts: number;
  totalSize: number; // bytes
}

export interface ExportFile {
  name: string;
  path: string;
  size: number;
  type: string;
  checksum: string;
}

export interface ExportSummary {
  workflowsExported: number;
  executionsExported: number;
  totalSize: number;
  compressionRatio: number;
  exportDuration: number; // seconds
}

// Main exporter class
export class WorkflowExporter {
  private supabase = createClient();

  /**
   * Export all workflow artifacts for a client
   */
  async exportWorkflowArtifacts(
    clientId: string,
    options: ExportOptions = {
      includeExecutionHistory: true,
      includeLogs: true,
      includeCredentials: false,
      format: 'json',
      compressionLevel: 6
    }
  ): Promise<WorkflowExportResult> {
    try {
      console.log(`📦 Starting workflow artifact export for client: ${clientId}`);

      // Collect all workflow artifacts
      const artifacts = await this.collectWorkflowArtifacts(clientId, options);

      // Generate export files
      const files = await this.generateExportFiles(artifacts, options);

      // Create export metadata
      const exportMetadata: ExportMetadata = {
        exportedAt: new Date(),
        exportedBy: 'system',
        clientId,
        version: '1.0.0',
        totalArtifacts: artifacts.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0)
      };

      // Calculate summary
      const summary: ExportSummary = {
        workflowsExported: artifacts.length,
        executionsExported: artifacts.reduce((sum, artifact) => sum + artifact.executionHistory.length, 0),
        totalSize: exportMetadata.totalSize,
        compressionRatio: this.calculateCompressionRatio(files),
        exportDuration: 0 // Will be set by caller
      };

      const result: WorkflowExportResult = {
        artifacts,
        exportMetadata,
        files,
        summary
      };

      console.log(`✅ Workflow artifact export completed: ${artifacts.length} artifacts, ${files.length} files`);
      return result;

    } catch (error) {
      console.error('❌ Workflow artifact export failed:', error);
      throw new Error(`Failed to export workflow artifacts: ${error.message}`);
    }
  }

  /**
   * Export specific workflow by ID
   */
  async exportWorkflowById(
    workflowId: string,
    options: ExportOptions = {
      includeExecutionHistory: true,
      includeLogs: true,
      includeCredentials: false,
      format: 'json',
      compressionLevel: 6
    }
  ): Promise<WorkflowArtifact | null> {
    try {
      const artifact = await this.getWorkflowArtifact(workflowId, options);
      return artifact;
    } catch (error) {
      console.error(`❌ Failed to export workflow ${workflowId}:`, error);
      return null;
    }
  }

  /**
   * Validate workflow artifacts before export
   */
  async validateWorkflowArtifacts(artifacts: WorkflowArtifact[]): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    let validCount = 0;

    for (const artifact of artifacts) {
      const artifactIssues = await this.validateWorkflowArtifact(artifact);
      if (artifactIssues.length === 0) {
        validCount++;
      } else {
        issues.push(...artifactIssues);
      }
    }

    return {
      valid: issues.length === 0,
      validCount,
      totalCount: artifacts.length,
      issues
    };
  }

  // Private implementation methods

  private async collectWorkflowArtifacts(
    clientId: string,
    options: ExportOptions
  ): Promise<WorkflowArtifact[]> {
    const artifacts: WorkflowArtifact[] = [];

    try {
      // Get workflows from database
      const { data: workflows, error } = await this.supabase
        .from('workflows')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true);

      if (error) throw error;

      for (const workflow of workflows || []) {
        const artifact = await this.buildWorkflowArtifact(workflow, options);
        artifacts.push(artifact);
      }

      return artifacts;

    } catch (error) {
      console.error('Error collecting workflow artifacts:', error);
      throw error;
    }
  }

  private async buildWorkflowArtifact(
    workflow: any,
    options: ExportOptions
  ): Promise<WorkflowArtifact> {
    // Build workflow definition
    const definition: WorkflowDefinition = {
      nodes: workflow.nodes || [],
      connections: workflow.connections || [],
      settings: workflow.settings || this.getDefaultWorkflowSettings(),
      variables: workflow.variables || [],
      triggers: workflow.triggers || []
    };

    // Get execution history if requested
    const executionHistory = options.includeExecutionHistory
      ? await this.getWorkflowExecutionHistory(workflow.id, options.dateRange)
      : [];

    // Get dependencies
    const dependencies = await this.getWorkflowDependencies(workflow.id);

    const artifact: WorkflowArtifact = {
      id: workflow.id,
      name: workflow.name,
      type: workflow.type || 'custom_workflow',
      version: workflow.version || '1.0.0',
      status: workflow.status || 'active',
      createdAt: new Date(workflow.created_at),
      updatedAt: new Date(workflow.updated_at),
      metadata: {
        description: workflow.description || '',
        tags: workflow.tags || [],
        category: workflow.category || 'general',
        priority: workflow.priority || 'normal',
        owner: workflow.owner || 'system',
        lastExecuted: workflow.last_executed ? new Date(workflow.last_executed) : undefined,
        executionCount: workflow.execution_count || 0,
        successRate: workflow.success_rate || 0,
        averageExecutionTime: workflow.average_execution_time || 0,
        customFields: workflow.custom_fields || {}
      },
      definition,
      executionHistory,
      dependencies
    };

    return artifact;
  }

  private async getWorkflowExecutionHistory(
    workflowId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<WorkflowExecution[]> {
    try {
      let query = this.supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false })
        .limit(100); // Limit to last 100 executions

      if (dateRange) {
        query = query
          .gte('started_at', dateRange.start.toISOString())
          .lte('started_at', dateRange.end.toISOString());
      }

      const { data: executions, error } = await query;

      if (error) throw error;

      return (executions || []).map(exec => this.mapExecutionToWorkflowExecution(exec));

    } catch (error) {
      console.error('Error getting workflow execution history:', error);
      return [];
    }
  }

  private async getWorkflowDependencies(workflowId: string): Promise<WorkflowDependency[]> {
    try {
      const { data: dependencies, error } = await this.supabase
        .from('workflow_dependencies')
        .select('*')
        .eq('workflow_id', workflowId);

      if (error) throw error;

      return (dependencies || []).map(dep => ({
        type: dep.type,
        name: dep.name,
        version: dep.version,
        required: dep.required,
        description: dep.description
      }));

    } catch (error) {
      console.error('Error getting workflow dependencies:', error);
      return [];
    }
  }

  private async getWorkflowArtifact(
    workflowId: string,
    options: ExportOptions
  ): Promise<WorkflowArtifact | null> {
    try {
      const { data: workflow, error } = await this.supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;
      if (!workflow) return null;

      return await this.buildWorkflowArtifact(workflow, options);

    } catch (error) {
      console.error('Error getting workflow artifact:', error);
      return null;
    }
  }

  private async generateExportFiles(
    artifacts: WorkflowArtifact[],
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = [];

    try {
      // Generate main artifacts file
      const artifactsContent = JSON.stringify(artifacts, null, 2);
      const artifactsFile: ExportFile = {
        name: 'workflow-artifacts.json',
        path: '/exports/workflow-artifacts.json',
        size: Buffer.byteLength(artifactsContent, 'utf8'),
        type: 'application/json',
        checksum: this.calculateChecksum(artifactsContent)
      };
      files.push(artifactsFile);

      // Generate individual workflow files
      for (const artifact of artifacts) {
        const workflowContent = JSON.stringify(artifact, null, 2);
        const workflowFile: ExportFile = {
          name: `workflow-${artifact.id}.json`,
          path: `/exports/workflows/workflow-${artifact.id}.json`,
          size: Buffer.byteLength(workflowContent, 'utf8'),
          type: 'application/json',
          checksum: this.calculateChecksum(workflowContent)
        };
        files.push(workflowFile);
      }

      // Generate summary file
      const summary = {
        exportedAt: new Date().toISOString(),
        totalWorkflows: artifacts.length,
        totalExecutions: artifacts.reduce((sum, artifact) => sum + artifact.executionHistory.length, 0),
        workflowsByType: this.groupWorkflowsByType(artifacts),
        workflowsByStatus: this.groupWorkflowsByStatus(artifacts)
      };

      const summaryContent = JSON.stringify(summary, null, 2);
      const summaryFile: ExportFile = {
        name: 'workflow-summary.json',
        path: '/exports/workflow-summary.json',
        size: Buffer.byteLength(summaryContent, 'utf8'),
        type: 'application/json',
        checksum: this.calculateChecksum(summaryContent)
      };
      files.push(summaryFile);

      return files;

    } catch (error) {
      console.error('Error generating export files:', error);
      throw error;
    }
  }

  private async validateWorkflowArtifact(artifact: WorkflowArtifact): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Validate required fields
    if (!artifact.id) {
      issues.push({
        severity: 'critical',
        field: 'id',
        message: 'Workflow ID is required'
      });
    }

    if (!artifact.name) {
      issues.push({
        severity: 'high',
        field: 'name',
        message: 'Workflow name is required'
      });
    }

    if (!artifact.definition) {
      issues.push({
        severity: 'critical',
        field: 'definition',
        message: 'Workflow definition is required'
      });
    }

    // Validate workflow definition
    if (artifact.definition) {
      if (!artifact.definition.nodes || artifact.definition.nodes.length === 0) {
        issues.push({
          severity: 'high',
          field: 'definition.nodes',
          message: 'Workflow must have at least one node'
        });
      }

      if (!artifact.definition.settings) {
        issues.push({
          severity: 'medium',
          field: 'definition.settings',
          message: 'Workflow settings are missing'
        });
      }
    }

    return issues;
  }

  private getDefaultWorkflowSettings(): WorkflowSettings {
    return {
      executionOrder: 'sequential',
      retryPolicy: {
        enabled: true,
        maxRetries: 3,
        retryDelay: 5,
        backoffMultiplier: 2
      },
      timeout: 300, // 5 minutes
      concurrency: 1,
      errorHandling: {
        onError: 'stop',
        errorNotification: true,
        errorRecipients: []
      }
    };
  }

  private mapExecutionToWorkflowExecution(exec: any): WorkflowExecution {
    return {
      id: exec.id,
      workflowId: exec.workflow_id,
      status: exec.status,
      startedAt: new Date(exec.started_at),
      completedAt: exec.completed_at ? new Date(exec.completed_at) : undefined,
      duration: exec.duration,
      input: exec.input || {},
      output: exec.output,
      error: exec.error ? {
        message: exec.error.message,
        code: exec.error.code,
        stack: exec.error.stack,
        nodeId: exec.error.node_id,
        timestamp: new Date(exec.error.timestamp)
      } : undefined,
      logs: exec.logs || []
    };
  }

  private calculateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private calculateCompressionRatio(files: ExportFile[]): number {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    // Estimate compression ratio (simplified)
    return totalSize > 0 ? Math.round((totalSize * 0.7) / totalSize * 100) / 100 : 1;
  }

  private groupWorkflowsByType(artifacts: WorkflowArtifact[]): Record<string, number> {
    return artifacts.reduce((groups, artifact) => {
      groups[artifact.type] = (groups[artifact.type] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  private groupWorkflowsByStatus(artifacts: WorkflowArtifact[]): Record<string, number> {
    return artifacts.reduce((groups, artifact) => {
      groups[artifact.status] = (groups[artifact.status] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }
}

// Validation interfaces
export interface ValidationResult {
  valid: boolean;
  validCount: number;
  totalCount: number;
  issues: ValidationIssue[];
}

export interface ValidationIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  field: string;
  message: string;
}

// Export the singleton instance
export const workflowExporter = new WorkflowExporter();

// Utility functions
export async function exportClientWorkflows(
  clientId: string,
  options?: ExportOptions
): Promise<WorkflowExportResult> {
  return workflowExporter.exportWorkflowArtifacts(clientId, options);
}

export async function validateWorkflowExport(
  artifacts: WorkflowArtifact[]
): Promise<ValidationResult> {
  return workflowExporter.validateWorkflowArtifacts(artifacts);
}

// Example usage and validation
export async function validateWorkflowExporter(): Promise<boolean> {
  try {
    const exporter = new WorkflowExporter();
    console.log('✅ Workflow Exporter initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Workflow Exporter validation failed:', error);
    return false;
  }
}
