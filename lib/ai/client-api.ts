/**
 * AI Client API - Safe for client-side usage
 *
 * Provides AI functionality via API calls instead of direct provider imports
 */

import type { AIResult, AIOptions } from './types';

export interface ClientRequirements {
  businessType: string;
  industry: string;
  targetAudience: string;
  features: string[];
  budget: string;
  timeline: string;
  designPreferences: string;
  technicalRequirements: string[];
  integrations: string[];
  customizations: string[];
}

export interface AppGenerationResult {
  success: boolean;
  data?: {
    appName: string;
    description: string;
    selectedTemplate: string;
    estimatedDelivery: string;
    features: string[];
    recommendations: string[];
  };
  error?: string;
}

/**
 * Generate app using AI via API call (client-safe)
 */
export async function generateAppWithAI(
  requirements: ClientRequirements,
  options?: AIOptions
): Promise<AppGenerationResult> {
  try {
    const response = await fetch('/api/ai/generate-app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requirements,
        options
      })
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Run AI task via API call (client-safe)
 */
export async function runAITask(
  taskName: string,
  input: unknown,
  options?: AIOptions
): Promise<AIResult> {
  try {
    const response = await fetch(`/api/ai/tasks/${encodeURIComponent(taskName)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        options
      })
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        provider: 'api',
        timestamp: new Date().toISOString()
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'api',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Template Selection Criteria (client-safe)
 */
export interface TemplateSelectionCriteria {
  businessContext: {
    industry: string;
    businessType: string;
    companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    targetMarket: 'b2b' | 'b2c' | 'b2b2c' | 'marketplace';
  };
  functionalRequirements: {
    primaryUseCase: string;
    requiredFeatures: string[];
    userManagement?: boolean;
    paymentProcessing?: boolean;
    contentManagement?: boolean;
    analytics?: boolean;
    integrations?: string[];
  };
  technicalConstraints: {
    budget: 'basic' | 'standard' | 'premium' | 'enterprise';
    timeline: 'urgent' | '1-week' | '2-weeks' | '1-month' | 'flexible';
    technicalComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
    customizationLevel: 'minimal' | 'moderate' | 'extensive' | 'full';
  };
  successMetrics: {
    expectedUsers: number;
    expectedTraffic: 'low' | 'medium' | 'high' | 'enterprise';
    conversionGoal: 'leads' | 'sales' | 'engagement' | 'information';
    priorityFeatures?: string[];
  };
}

/**
 * Template Intelligence Result
 */
export interface TemplateRecommendation {
  templateId: string;
  templateName: string;
  confidence: number;
  reasoning: string[];
  features: string[];
  estimatedEffort: string;
  customizations: string[];
}

/**
 * Get intelligent template recommendations (client-safe mock)
 */
export async function getIntelligentTemplateRecommendations(
  criteria: TemplateSelectionCriteria
): Promise<TemplateRecommendation[]> {
  // Mock recommendations based on criteria
  const baseRecommendations: TemplateRecommendation[] = [
    {
      templateId: 'business-dashboard',
      templateName: 'Business Dashboard',
      confidence: 0.85,
      reasoning: ['Matches business requirements', 'Analytics focused', 'Scalable architecture'],
      features: ['Dashboard', 'Analytics', 'User Management', 'Reports'],
      estimatedEffort: '3-5 days',
      customizations: ['Branding', 'Custom metrics', 'Role-based access']
    },
    {
      templateId: 'e-commerce-platform',
      templateName: 'E-commerce Platform',
      confidence: 0.72,
      reasoning: ['Supports payment processing', 'User management', 'Content management'],
      features: ['Product catalog', 'Shopping cart', 'Payment integration', 'Order management'],
      estimatedEffort: '5-7 days',
      customizations: ['Payment gateways', 'Shipping options', 'Tax calculations']
    }
  ];

  // Simple scoring based on criteria
  return baseRecommendations.map(rec => ({
    ...rec,
    confidence: rec.confidence * (criteria.technicalConstraints.budget === 'premium' ? 1.1 : 0.9)
  })).sort((a, b) => b.confidence - a.confidence);
}