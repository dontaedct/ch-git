/**
 * OpenAI Provider - Universal Header Compliant
 * 
 * Implements OpenAI client with strict JSON output support
 */

import { retry } from '../tools/retry';
import { readFileSync } from 'fs';
import { join } from 'path';

// Safety guard: only import OpenAI if available
let OpenAI: any = null;
try {
  OpenAI = require('openai');
} catch (error) {
  console.warn('OpenAI SDK not available, provider will use mock mode');
}

export interface OpenAIConfig {
  apiKey?: string;
  organization?: string;
  baseURL?: string;
  timeout?: number;
}

export interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIProvider {
  private client: any;
  private config: OpenAIConfig;
  private universalHeader: string | null = null;
  
  constructor(config: OpenAIConfig = {}) {
    this.config = config;
    
    // Safety check: ensure OpenAI SDK is available
    if (!OpenAI) {
      throw new Error('OpenAI SDK not available. Install with: npm install openai');
    }
    
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      organization: config.organization,
      baseURL: config.baseURL,
      timeout: config.timeout || 60000,
    });
  }
  
  // Lazy load the universal header only when needed
  private getUniversalHeader(): string {
    if (this.universalHeader === null) {
      try {
        const universalHeaderPath = join(process.cwd(), 'lib/ai/prompts/system/universal_header.md');
        this.universalHeader = readFileSync(universalHeaderPath, 'utf-8');
      } catch (error) {
        console.warn('Failed to load universal header, using fallback:', error);
        this.universalHeader = '# Universal Header Rules\n\nFollow project conventions and safety guidelines.';
      }
    }
    return this.universalHeader;
  }
  
  async chat(request: OpenAIRequest): Promise<OpenAIResponse> {
    const response = await this.client.chat.completions.create({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      response_format: request.response_format,
    });
    
    return response as unknown as OpenAIResponse;
  }
  
  async runJSON(
    taskPrompt: string, 
    schema: Record<string, unknown>, 
    input: unknown, 
    opts?: { temperature?: number; maxTokens?: number }
  ): Promise<{ ok: boolean; data?: unknown; error?: string; trace?: string }> {
    try {
      // Load universal header system message
      const universalHeader = this.getUniversalHeader();
      
      const systemMessage = `${universalHeader}\n\nYou must respond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`;
      
      const userMessage = `Task: ${taskPrompt}\n\nInput: ${JSON.stringify(input, null, 2)}`;
      
      const response = await this.chat({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: opts?.temperature ?? Number(process.env.AI_TEMPERATURE) ?? 0.2,
        max_tokens: opts?.maxTokens ?? Number(process.env.AI_MAX_TOKENS) ?? 4000,
        response_format: { type: 'json_object' }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response');
      }
      
      // Parse JSON with retry logic
      const parsed = await retry(
        async () => {
          try {
            return JSON.parse(content);
          } catch (e) {
            throw new Error(`Invalid JSON: ${content}`);
          }
        },
        { maxAttempts: 2, baseDelay: 1000 }
      );
      
      return { ok: true, data: parsed };
      
    } catch (error) {
      return { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        trace: error instanceof Error ? error.stack || 'No stack trace' : 'Unknown error type'
      };
    }
  }
}

export function createClient(config?: OpenAIConfig): OpenAIProvider {
  return new OpenAIProvider(config);
}
