/**
 * Mock AI Provider - Universal Header Compliant
 * 
 * Deterministic mock responses for offline evaluation
 */

import { AIOptions, AIResult } from '../index';

export interface MockTaskResponse {
  ok: boolean;
  data: unknown;
  error?: string;
}

/**
 * Mock provider that produces deterministic responses
 * Used when OPENAI_API_KEY is not set
 */
export async function runJSON(
  taskName: string, 
  schema: { parse: (data: unknown) => unknown },
  input: unknown
): Promise<MockTaskResponse> {
  try {
    // Deterministic mock responses based on task name
    let mockData: unknown;
    
    switch (taskName) {
      case 'incident_triage':
        mockData = {
          severity: 'medium',
          category: 'performance',
          summary: 'Mock incident response for evaluation',
          recommendations: ['Mock recommendation 1', 'Mock recommendation 2'],
          nextSteps: 'Mock next steps for incident resolution'
        };
        break;
        
      case 'spec_writer':
        mockData = {
          title: 'Mock Specification Document',
          overview: 'Mock overview for evaluation purposes',
          requirements: ['Mock requirement 1', 'Mock requirement 2'],
          technicalDetails: 'Mock technical implementation details',
          timeline: 'Mock project timeline'
        };
        break;
        
      default:
        mockData = {
          message: `Mock response for task: ${taskName}`,
          input: input,
          timestamp: new Date().toISOString()
        };
    }
    
    // Validate against schema
    const validatedData = schema.parse(mockData);
    
    return {
      ok: true,
      data: validatedData
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : 'Schema validation failed'
    };
  }
}

export class MockProvider {
  name = "mock";
  
  async execute(task: string, input: unknown, options?: AIOptions): Promise<AIResult> {
    const result = await runJSON(task, { parse: (data) => data }, input);
    
    return {
      success: result.ok,
      data: result.data,
      error: result.error,
      provider: this.name,
      timestamp: new Date().toISOString()
    };
  }
}
