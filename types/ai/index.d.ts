/**
 * @fileoverview AI Type Definitions
 * @module types/ai
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-22
 */

// Export all AI-related types
export * from './customization';

// Define common AI types
export interface AIProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'cohere' | 'local';
  endpoint?: string;
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
}

export interface AIGenerationRequest {
  prompt: string;
  context?: Record<string, any>;
  templateType?: string;
  constraints?: {
    maxLength?: number;
    style?: string;
    format?: string;
  };
  provider?: string;
}

export interface AIGenerationResponse {
  id: string;
  content: string;
  metadata: {
    provider: string;
    model: string;
    tokensUsed: number;
    processingTime: number;
    confidence: number;
  };
  suggestions?: string[];
  alternatives?: string[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  pricing: {
    inputTokens: number;
    outputTokens: number;
    currency: string;
  };
  limits: {
    maxTokens: number;
    contextWindow: number;
    rateLimits: {
      requestsPerMinute: number;
      tokensPerMinute: number;
    };
  };
}