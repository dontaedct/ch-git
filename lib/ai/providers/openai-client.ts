/**
 * OpenAI Provider - Client-Safe Version
 *
 * Client-compatible version without Node.js specific imports
 */

import { retry } from '@/lib/ai/tools/retry';

// Safety guard: only import OpenAI if available
let OpenAI: any = null;
try {
  OpenAI = require('openai');
} catch {
  // OpenAI SDK not available - will use mock provider
}

export interface JSONMode {
  runJSON<T>(
    systemPrompt: string,
    schema: Record<string, any>,
    userInput: unknown,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<{
    ok: boolean;
    data?: T;
    error?: string;
  }>;
}

export function createClient(): JSONMode | null {
  // Return null if OpenAI is not available or no API key
  if (!OpenAI || !process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    return {
      async runJSON<T>(
        systemPrompt: string,
        schema: Record<string, any>,
        userInput: unknown,
        options?: {
          temperature?: number;
          maxTokens?: number;
        }
      ): Promise<{ ok: boolean; data?: T; error?: string }> {
        return retry(async () => {
          try {
            const completion = await client.chat.completions.create({
              model: 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: typeof userInput === 'string' ? userInput : JSON.stringify(userInput) }
              ],
              temperature: options?.temperature ?? 0.1,
              max_tokens: options?.maxTokens ?? 1000,
              response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
              return { ok: false, error: 'No response from OpenAI' };
            }

            try {
              const data = JSON.parse(content);
              return { ok: true, data };
            } catch (parseError) {
              return { ok: false, error: `Invalid JSON response: ${parseError}` };
            }
          } catch (error) {
            return {
              ok: false,
              error: error instanceof Error ? error.message : 'Unknown OpenAI error'
            };
          }
        });
      }
    };
  } catch (error) {
    console.error('Failed to create OpenAI client:', error);
    return null;
  }
}