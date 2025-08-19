/**
 * AI Module Types - Universal Header Compliant
 * 
 * Centralized type definitions to avoid circular dependencies
 */

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
