/**
 * AI Module - Universal Header Compliant
 * 
 * Implements AI pipeline with task loading and provider routing
 */

import { routeRequest } from './router';
import { IncidentReport, SpecDoc } from './tools/schema';

export interface AITask {
  name: string;
  input: unknown;
  options?: AIOptions;
}

export interface AIOptions {
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResult {
  success: boolean;
  data?: unknown;
  error?: string;
  provider: string;
  timestamp: string;
}

// Task registry mapping task names to schemas
export const TASK_REGISTRY = {
  incident_triage: IncidentReport,
  spec_writer: SpecDoc
} as const;

export type TaskName = keyof typeof TASK_REGISTRY;

/**
 * Main AI runner function
 * @param taskName - The AI task name to execute
 * @param input - Input data for the task
 * @param opts - Optional configuration
 * @returns Promise<AIResult>
 */
export async function run(taskName: string, input: unknown, opts?: AIOptions): Promise<AIResult> {
  try {
    // Validate task name
    if (!(taskName in TASK_REGISTRY)) {
      throw new Error(`Unknown task: ${taskName}. Available tasks: ${Object.keys(TASK_REGISTRY).join(', ')}`);
    }
    
    // Load task prompt by name (placeholder for now)
    const taskPrompt = `Execute task: ${taskName}`;
    
    // Route to appropriate provider
    const result = await routeRequest(taskPrompt, input, opts);
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'unknown',
      timestamp: new Date().toISOString()
    };
  }
}

// Re-export for convenience
export { run as ai };
