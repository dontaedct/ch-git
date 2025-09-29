/**
 * Development Automation Engine
 * 
 * Provides comprehensive automation capabilities for development workflows,
 * script execution, and intelligent tooling integration.
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { EventEmitter } from 'events';

export interface ScriptConfig {
  id: string;
  name: string;
  description: string;
  command: string;
  category: 'development' | 'quality' | 'maintenance' | 'deployment' | 'testing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout?: number;
  retries?: number;
  dependencies?: string[];
  environment?: Record<string, string>;
  tags?: string[];
}

export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  trigger: 'manual' | 'git-push' | 'schedule' | 'webhook' | 'file-change';
  steps: WorkflowStep[];
  parallel?: boolean;
  environment?: Record<string, string>;
  schedule?: string; // cron format
}

export interface WorkflowStep {
  id: string;
  name: string;
  script: string;
  condition?: string;
  continueOnError?: boolean;
  timeout?: number;
}

export interface ExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  metadata?: Record<string, any>;
}

export interface ExecutionContext {
  scriptId: string;
  workflowId?: string;
  stepId?: string;
  environment: Record<string, string>;
  workingDirectory: string;
  userId?: string;
}

export class AutomationEngine extends EventEmitter {
  private scripts = new Map<string, ScriptConfig>();
  private workflows = new Map<string, WorkflowConfig>();
  private executionHistory: ExecutionResult[] = [];
  private activeExecutions = new Map<string, AbortController>();
  private maxHistorySize = 1000;

  constructor(private projectRoot: string = process.cwd()) {
    super();
    this.loadBuiltinScripts();
  }

  /**
   * Load built-in development scripts
   */
  private loadBuiltinScripts(): void {
    const builtinScripts: ScriptConfig[] = [
      {
        id: 'dev-start',
        name: 'Development Server',
        description: 'Start development server with full tooling',
        command: 'npm run dev',
        category: 'development',
        priority: 'high',
        timeout: 300000, // 5 minutes
        tags: ['server', 'development']
      },
      {
        id: 'build-prod',
        name: 'Production Build',
        description: 'Build optimized production bundle',
        command: 'npm run build',
        category: 'development',
        priority: 'high',
        timeout: 600000, // 10 minutes
        tags: ['build', 'production']
      },
      {
        id: 'type-check',
        name: 'TypeScript Check',
        description: 'Run TypeScript type checking',
        command: 'npm run typecheck',
        category: 'quality',
        priority: 'medium',
        timeout: 120000, // 2 minutes
        tags: ['typescript', 'validation']
      },
      {
        id: 'lint-fix',
        name: 'Lint & Fix',
        description: 'Run linting with auto-fix',
        command: 'npm run lint:fix',
        category: 'quality',
        priority: 'medium',
        timeout: 60000, // 1 minute
        tags: ['lint', 'fix']
      },
      {
        id: 'test-suite',
        name: 'Test Suite',
        description: 'Run comprehensive test suite',
        command: 'npm run test',
        category: 'testing',
        priority: 'high',
        timeout: 300000, // 5 minutes
        tags: ['test', 'quality']
      },
      {
        id: 'security-audit',
        name: 'Security Audit',
        description: 'Security vulnerability scan',
        command: 'npm audit --audit-level moderate',
        category: 'quality',
        priority: 'critical',
        timeout: 180000, // 3 minutes
        tags: ['security', 'audit']
      },
      {
        id: 'performance-audit',
        name: 'Performance Audit',
        description: 'Performance and optimization analysis',
        command: 'node scripts/performance-audit.mjs',
        category: 'quality',
        priority: 'medium',
        timeout: 240000, // 4 minutes
        tags: ['performance', 'audit']
      },
      {
        id: 'accessibility-check',
        name: 'Accessibility Check',
        description: 'WCAG compliance validation',
        command: 'node scripts/accessibility-audit-final.mjs',
        category: 'quality',
        priority: 'medium',
        timeout: 180000, // 3 minutes
        tags: ['accessibility', 'wcag']
      },
      {
        id: 'system-doctor',
        name: 'System Doctor',
        description: 'Diagnose and fix system issues',
        command: 'npm run doctor',
        category: 'maintenance',
        priority: 'high',
        timeout: 120000, // 2 minutes
        tags: ['doctor', 'health']
      },
      {
        id: 'clean-build',
        name: 'Clean Build',
        description: 'Clean cache and rebuild',
        command: 'npm run clean && npm run build',
        category: 'maintenance',
        priority: 'medium',
        timeout: 600000, // 10 minutes
        tags: ['clean', 'rebuild']
      },
      {
        id: 'db-migrate',
        name: 'Database Migration',
        description: 'Run database migrations',
        command: 'npm run db:migrate',
        category: 'maintenance',
        priority: 'critical',
        timeout: 300000, // 5 minutes
        tags: ['database', 'migration']
      },
      {
        id: 'bundle-analysis',
        name: 'Bundle Analysis',
        description: 'Analyze bundle size and dependencies',
        command: 'npm run analyze',
        category: 'maintenance',
        priority: 'low',
        timeout: 120000, // 2 minutes
        tags: ['bundle', 'analysis']
      }
    ];

    builtinScripts.forEach(script => this.scripts.set(script.id, script));
  }

  /**
   * Register a new script
   */
  registerScript(script: ScriptConfig): void {
    this.scripts.set(script.id, script);
    this.emit('script-registered', script);
  }

  /**
   * Register a new workflow
   */
  registerWorkflow(workflow: WorkflowConfig): void {
    this.workflows.set(workflow.id, workflow);
    this.emit('workflow-registered', workflow);
  }

  /**
   * Get all registered scripts
   */
  getScripts(): ScriptConfig[] {
    return Array.from(this.scripts.values());
  }

  /**
   * Get scripts by category
   */
  getScriptsByCategory(category: ScriptConfig['category']): ScriptConfig[] {
    return this.getScripts().filter(script => script.category === category);
  }

  /**
   * Get script by ID
   */
  getScript(id: string): ScriptConfig | undefined {
    return this.scripts.get(id);
  }

  /**
   * Execute a script
   */
  async executeScript(
    scriptId: string, 
    context: Partial<ExecutionContext> = {}
  ): Promise<ExecutionResult> {
    const script = this.scripts.get(scriptId);
    if (!script) {
      throw new Error(`Script not found: ${scriptId}`);
    }

    const executionId = `${scriptId}-${Date.now()}`;
    const abortController = new AbortController();
    this.activeExecutions.set(executionId, abortController);

    const fullContext: ExecutionContext = {
      scriptId,
      environment: { ...process.env, ...script.environment, ...context.environment },
      workingDirectory: context.workingDirectory || this.projectRoot,
      userId: context.userId,
      ...context
    };

    this.emit('script-started', { script, context: fullContext });

    const startTime = new Date();
    let result: ExecutionResult;

    try {
      result = await this.runCommand(
        script.command,
        fullContext,
        script.timeout,
        abortController.signal
      );
    } catch (error) {
      result = {
        success: false,
        exitCode: -1,
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime.getTime(),
        startTime,
        endTime: new Date(),
        metadata: { error: true }
      };
    } finally {
      this.activeExecutions.delete(executionId);
    }

    // Add to execution history
    this.addToHistory(result);

    this.emit('script-completed', { 
      script, 
      context: fullContext, 
      result 
    });

    return result;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    context: Partial<ExecutionContext> = {}
  ): Promise<ExecutionResult[]> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const fullContext: ExecutionContext = {
      scriptId: '',
      workflowId,
      environment: { ...process.env, ...workflow.environment, ...context.environment },
      workingDirectory: context.workingDirectory || this.projectRoot,
      userId: context.userId,
      ...context
    };

    this.emit('workflow-started', { workflow, context: fullContext });

    const results: ExecutionResult[] = [];

    try {
      if (workflow.parallel) {
        // Execute steps in parallel
        const promises = workflow.steps.map(step => 
          this.executeWorkflowStep(step, { ...fullContext, stepId: step.id })
        );
        results.push(...await Promise.all(promises));
      } else {
        // Execute steps sequentially
        for (const step of workflow.steps) {
          const stepResult = await this.executeWorkflowStep(
            step, 
            { ...fullContext, stepId: step.id }
          );
          results.push(stepResult);

          // Stop if step failed and continueOnError is false
          if (!stepResult.success && !step.continueOnError) {
            break;
          }
        }
      }
    } catch (error) {
      this.emit('workflow-error', { workflow, context: fullContext, error });
    }

    this.emit('workflow-completed', { 
      workflow, 
      context: fullContext, 
      results 
    });

    return results;
  }

  /**
   * Execute a single workflow step
   */
  private async executeWorkflowStep(
    step: WorkflowStep,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Check condition if specified
    if (step.condition && !this.evaluateCondition(step.condition, context)) {
      return {
        success: true,
        exitCode: 0,
        stdout: 'Step skipped due to condition',
        stderr: '',
        duration: 0,
        startTime: new Date(),
        endTime: new Date(),
        metadata: { skipped: true }
      };
    }

    const executionId = `${step.id}-${Date.now()}`;
    const abortController = new AbortController();
    this.activeExecutions.set(executionId, abortController);

    const startTime = new Date();
    let result: ExecutionResult;

    try {
      result = await this.runCommand(
        step.script,
        context,
        step.timeout,
        abortController.signal
      );
    } catch (error) {
      result = {
        success: false,
        exitCode: -1,
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime.getTime(),
        startTime,
        endTime: new Date(),
        metadata: { error: true }
      };
    } finally {
      this.activeExecutions.delete(executionId);
    }

    this.addToHistory(result);
    return result;
  }

  /**
   * Run a command with timeout and cancellation support
   */
  private runCommand(
    command: string,
    context: ExecutionContext,
    timeout = 60000,
    signal?: AbortSignal
  ): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const startTime = new Date();
      let stdout = '';
      let stderr = '';

      const child = spawn(command, [], {
        shell: true,
        cwd: context.workingDirectory,
        env: context.environment,
        signal
      });

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        this.emit('script-output', { 
          type: 'stdout', 
          data: data.toString(), 
          context 
        });
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        this.emit('script-output', { 
          type: 'stderr', 
          data: data.toString(), 
          context 
        });
      });

      child.on('close', (code) => {
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        resolve({
          success: code === 0,
          exitCode: code || 0,
          stdout,
          stderr,
          duration,
          startTime,
          endTime
        });
      });

      child.on('error', (error) => {
        reject(error);
      });

      // Set timeout
      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);

      child.on('close', () => {
        clearTimeout(timeoutId);
      });
    });
  }

  /**
   * Evaluate a condition string (simple implementation)
   */
  private evaluateCondition(condition: string, context: ExecutionContext): boolean {
    // Simple condition evaluation - can be extended
    try {
      // Replace environment variables
      const processedCondition = condition.replace(
        /\$\{(\w+)\}/g,
        (_, varName) => context.environment[varName] || ''
      );

      // Basic evaluation (extend as needed)
      return eval(processedCondition);
    } catch {
      return false;
    }
  }

  /**
   * Add execution result to history
   */
  private addToHistory(result: ExecutionResult): void {
    this.executionHistory.unshift(result);
    
    // Trim history to max size
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 50): ExecutionResult[] {
    return this.executionHistory.slice(0, limit);
  }

  /**
   * Get execution statistics
   */
  getExecutionStats(): {
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    categoryStats: Record<string, { count: number; successRate: number }>;
  } {
    const total = this.executionHistory.length;
    const successful = this.executionHistory.filter(r => r.success).length;
    const totalDuration = this.executionHistory.reduce((sum, r) => sum + r.duration, 0);

    const categoryStats: Record<string, { count: number; successRate: number }> = {};
    
    // Calculate category stats (would need to track script categories in execution results)
    for (const category of ['development', 'quality', 'maintenance', 'deployment', 'testing']) {
      const categoryResults = this.executionHistory.filter(r => {
        const script = this.scripts.get(r.metadata?.scriptId);
        return script?.category === category;
      });
      
      if (categoryResults.length > 0) {
        categoryStats[category] = {
          count: categoryResults.length,
          successRate: categoryResults.filter(r => r.success).length / categoryResults.length
        };
      }
    }

    return {
      totalExecutions: total,
      successRate: total > 0 ? successful / total : 0,
      averageDuration: total > 0 ? totalDuration / total : 0,
      categoryStats
    };
  }

  /**
   * Stop a running execution
   */
  stopExecution(executionId: string): boolean {
    const controller = this.activeExecutions.get(executionId);
    if (controller) {
      controller.abort();
      this.activeExecutions.delete(executionId);
      return true;
    }
    return false;
  }

  /**
   * Stop all running executions
   */
  stopAllExecutions(): void {
    for (const [id, controller] of this.activeExecutions) {
      controller.abort();
    }
    this.activeExecutions.clear();
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): string[] {
    return Array.from(this.activeExecutions.keys());
  }

  /**
   * Save configuration to file
   */
  async saveConfiguration(filePath: string): Promise<void> {
    const config = {
      scripts: Array.from(this.scripts.values()),
      workflows: Array.from(this.workflows.values()),
      version: '1.0.0',
      savedAt: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf8');
  }

  /**
   * Load configuration from file
   */
  async loadConfiguration(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const config = JSON.parse(content);

      if (config.scripts) {
        config.scripts.forEach((script: ScriptConfig) => {
          this.scripts.set(script.id, script);
        });
      }

      if (config.workflows) {
        config.workflows.forEach((workflow: WorkflowConfig) => {
          this.workflows.set(workflow.id, workflow);
        });
      }

      this.emit('configuration-loaded', config);
    } catch (error) {
      this.emit('configuration-error', error);
      throw error;
    }
  }

  /**
   * Get system health metrics
   */
  getSystemHealth(): {
    cpu: number;
    memory: number;
    disk: number;
    network: {
      apiResponseTime: number;
      dbLatency: number;
      uptime: number;
    };
    processes: {
      devServer: boolean;
      database: boolean;
      backgroundJobs: number;
      cache: boolean;
    };
  } {
    // Mock implementation - would integrate with actual system monitoring
    return {
      cpu: Math.round(Math.random() * 100),
      memory: Math.round(Math.random() * 100),
      disk: Math.round(Math.random() * 100),
      network: {
        apiResponseTime: Math.round(Math.random() * 200 + 50),
        dbLatency: Math.round(Math.random() * 100 + 10),
        uptime: 99.9
      },
      processes: {
        devServer: Math.random() > 0.1,
        database: Math.random() > 0.05,
        backgroundJobs: Math.floor(Math.random() * 5),
        cache: Math.random() > 0.1
      }
    };
  }
}

// Export singleton instance
export const automationEngine = new AutomationEngine();

// Export types
export type {
  ScriptConfig,
  WorkflowConfig,
  WorkflowStep,
  ExecutionResult,
  ExecutionContext
};
