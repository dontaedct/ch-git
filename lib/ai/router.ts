/**
 * AI Router - Universal Header Compliant
 * 
 * Routes AI requests to appropriate providers based on environment/config.
 */

import { AIOptions, AIResult } from './index';
import { createClient as createOpenAIClient } from './providers/openai';
import { MockProvider } from './providers/mock';

export interface AIProvider {
  name: string;
  execute(task: string, input: unknown, options?: AIOptions): Promise<AIResult>;
}

export class OpenAIProviderAdapter implements AIProvider {
  name = "openai";
  private client: ReturnType<typeof createOpenAIClient>;
  
  constructor() {
    this.client = createOpenAIClient();
  }
  
  async execute(task: string, input: unknown, options?: AIOptions): Promise<AIResult> {
    try {
      const result = await this.client.runJSON(
        task,
        { result: 'string' }, // Default schema
        input,
        {
          temperature: options?.temperature,
          maxTokens: options?.maxTokens
        }
      );
      
      return {
        success: result.ok,
        data: result.data,
        error: result.error,
        provider: this.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export class StubProvider implements AIProvider {
  name = "stub";
  
  async execute(_task: string, _input: unknown, _options?: AIOptions): Promise<AIResult> {
    return {
      success: false,
      error: `Provider '${this.name}' not implemented - skeleton only`,
      provider: this.name,
      timestamp: new Date().toISOString()
    };
  }
}

export function getProvider(providerName?: string): AIProvider {
  const provider = providerName || process.env.AI_PROVIDER || 'openai';
  
  // Use mock provider if no OpenAI API key is set
  if (!process.env.OPENAI_API_KEY && provider === 'openai') {
    return new MockProvider();
  }
  
  switch (provider.toLowerCase()) {
    case 'openai':
      return new OpenAIProviderAdapter();
    case 'mock':
      return new MockProvider();
    default:
      return new StubProvider();
  }
}

export async function routeRequest(task: string, input: unknown, options?: AIOptions): Promise<AIResult> {
  // Extract actual task name from prompt (remove "Execute task: " prefix if present)
  const actualTaskName = task.replace(/^Execute task:\s*/, '');
  
  const provider = getProvider(options?.provider);
  
  // For mock provider, pass the actual task name
  if (provider.name === 'mock') {
    return provider.execute(actualTaskName, input, options);
  }
  
  return provider.execute(task, input, options);
}
