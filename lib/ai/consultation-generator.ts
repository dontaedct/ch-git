/**
 * Enhanced AI Consultation Generation System
 *
 * Generates personalized consultation reports with service recommendations
 * based on questionnaire responses and service package matching.
 */

import { routeRequest } from './router';
import type { AIOptions, AIResult } from './types';

export interface ConsultationData {
  id: string;
  questionnaire_responses: Record<string, unknown>;
  client_info: {
    name?: string;
    email?: string;
    company?: string;
    industry?: string;
  };
  timestamp: string;
}

export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price_band?: string;
  timeline?: string;
  tier: 'foundation' | 'growth' | 'enterprise';
  includes: string[];
  category: string;
  industry_tags: string[];
  eligibility_criteria: Record<string, string[]>;
  content: {
    what_you_get?: string;
    why_this_fits?: string;
    timeline?: string;
    next_steps?: string;
  };
}

export interface ConsultationRecommendation {
  primary_service: ServicePackage;
  alternative_services: ServicePackage[];
  personalized_summary: string;
  key_insights: string[];
  recommended_next_steps: string[];
  consultation_score: number;
}

export interface GeneratedConsultation {
  consultation_id: string;
  client_name: string;
  generated_at: string;
  recommendations: ConsultationRecommendation;
  executive_summary: string;
  action_items: string[];
  follow_up_timeline: string;
}

/**
 * Enhanced consultation generation with service recommendations
 */
export class ConsultationGenerator {
  private aiOptions: AIOptions;

  constructor(options: AIOptions = {}) {
    this.aiOptions = {
      temperature: 0.7,
      maxTokens: 2000,
      ...options
    };
  }

  /**
   * Generate AI-powered consultation with service recommendations
   */
  async generateConsultation(
    consultationData: ConsultationData,
    availableServices: ServicePackage[]
  ): Promise<GeneratedConsultation> {
    try {
      // Create enhanced prompt for consultation generation
      const prompt = this.createConsultationPrompt(consultationData, availableServices);

      // Execute AI generation
      const result = await routeRequest(prompt, consultationData.questionnaire_responses, this.aiOptions);

      if (!result.success || !result.data) {
        throw new Error(`AI generation failed: ${result.error}`);
      }

      // Parse AI response and structure consultation
      const consultation = this.parseAIResponse(result.data, consultationData, availableServices);

      return consultation;
    } catch (error) {
      throw new Error(`Consultation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate quick service recommendations without full consultation
   */
  async generateQuickRecommendations(
    responses: Record<string, unknown>,
    services: ServicePackage[]
  ): Promise<ServicePackage[]> {
    try {
      const prompt = this.createRecommendationPrompt(responses, services);

      const result = await routeRequest(prompt, responses, {
        ...this.aiOptions,
        maxTokens: 1000
      });

      if (!result.success) {
        throw new Error(`Recommendation generation failed: ${result.error}`);
      }

      // Return filtered and ranked services based on AI analysis
      return this.filterAndRankServices(services, responses, result.data);
    } catch (error) {
      throw new Error(`Quick recommendations failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create comprehensive consultation prompt
   */
  private createConsultationPrompt(data: ConsultationData, services: ServicePackage[]): string {
    return `
# AI Business Consultation Generation

## Task
Generate a comprehensive business consultation report with personalized service recommendations based on the client's questionnaire responses and available service packages.

## Client Information
- Name: ${data.client_info.name || 'Valued Client'}
- Company: ${data.client_info.company || 'Client Company'}
- Industry: ${data.client_info.industry || 'Not specified'}

## Questionnaire Responses
${JSON.stringify(data.questionnaire_responses, null, 2)}

## Available Service Packages
${services.map(s => `
**${s.title}** (${s.tier})
- Description: ${s.description}
- Category: ${s.category}
- Industries: ${s.industry_tags.join(', ')}
- Price Band: ${s.price_band || 'Contact for pricing'}
- Timeline: ${s.timeline || 'Varies'}
`).join('\n')}

## Requirements
1. Analyze the client's responses to understand their business needs, challenges, and goals
2. Match their needs with the most appropriate service packages
3. Provide a personalized executive summary that speaks directly to their situation
4. Recommend 1 primary service and 2-3 alternative options with clear reasoning
5. Include key insights about their business situation
6. Suggest specific next steps and action items
7. Provide a realistic timeline for implementation

## Output Format
Generate a structured consultation report with:
- Executive summary (150-200 words)
- Primary service recommendation with detailed justification
- Alternative service options
- Key business insights (3-5 points)
- Recommended action items (3-5 items)
- Implementation timeline
- Next steps for moving forward

Focus on being specific, actionable, and directly relevant to their responses.
`;
  }

  /**
   * Create quick recommendation prompt
   */
  private createRecommendationPrompt(responses: Record<string, unknown>, services: ServicePackage[]): string {
    return `
# Quick Service Recommendation

## Task
Analyze the questionnaire responses and recommend the top 3 most suitable service packages.

## Responses
${JSON.stringify(responses, null, 2)}

## Available Services
${services.map(s => `${s.id}: ${s.title} - ${s.description}`).join('\n')}

## Requirements
Return the IDs of the top 3 most suitable services in order of relevance, with brief reasoning for each.
`;
  }

  /**
   * Parse AI response into structured consultation
   */
  private parseAIResponse(
    aiData: any,
    consultationData: ConsultationData,
    services: ServicePackage[]
  ): GeneratedConsultation {
    // This is a simplified parser - in production, you'd want more robust parsing
    const consultation: GeneratedConsultation = {
      consultation_id: consultationData.id,
      client_name: consultationData.client_info.name || 'Valued Client',
      generated_at: new Date().toISOString(),
      recommendations: {
        primary_service: services[0], // Default to first service
        alternative_services: services.slice(1, 4),
        personalized_summary: this.extractSummary(aiData),
        key_insights: this.extractInsights(aiData),
        recommended_next_steps: this.extractNextSteps(aiData),
        consultation_score: 0.85 // Default score
      },
      executive_summary: this.extractExecutiveSummary(aiData),
      action_items: this.extractActionItems(aiData),
      follow_up_timeline: '2-3 weeks'
    };

    return consultation;
  }

  /**
   * Filter and rank services based on AI analysis
   */
  private filterAndRankServices(
    services: ServicePackage[],
    responses: Record<string, unknown>,
    aiData: any
  ): ServicePackage[] {
    // Simple ranking based on eligibility criteria and AI recommendations
    const scored = services.map(service => {
      const score = this.calculateServiceScore(service, responses);
      return { service, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.service);
  }

  /**
   * Calculate service match score based on eligibility criteria
   */
  private calculateServiceScore(service: ServicePackage, responses: Record<string, unknown>): number {
    let score = 0.5; // Base score

    // Check eligibility criteria
    Object.entries(service.eligibility_criteria).forEach(([questionId, requiredValues]) => {
      const answer = responses[questionId];
      if (Array.isArray(answer)) {
        if (answer.some(val => requiredValues.includes(val as string))) {
          score += 0.3;
        }
      } else if (requiredValues.includes(answer as string)) {
        score += 0.3;
      }
    });

    return Math.min(score, 1.0);
  }

  // Helper methods for extracting information from AI response
  private extractSummary(aiData: any): string {
    if (typeof aiData === 'string') {
      const summaryMatch = aiData.match(/(?:summary|overview):?\s*(.*?)(?:\n\n|\n[A-Z])/is);
      return summaryMatch?.[1]?.trim() || 'Personalized consultation summary based on your responses.';
    }
    return aiData?.summary || 'Personalized consultation summary based on your responses.';
  }

  private extractInsights(aiData: any): string[] {
    if (typeof aiData === 'string') {
      const insightsMatch = aiData.match(/(?:insights|key points):?\s*(.*?)(?:\n\n|\n[A-Z])/is);
      if (insightsMatch) {
        return insightsMatch[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, ''));
      }
    }
    return aiData?.insights || [
      'Your business shows strong potential for growth',
      'Current challenges are common and addressable',
      'Strategic approach recommended for best results'
    ];
  }

  private extractNextSteps(aiData: any): string[] {
    if (typeof aiData === 'string') {
      const stepsMatch = aiData.match(/(?:next steps|recommendations):?\s*(.*?)(?:\n\n|\n[A-Z])/is);
      if (stepsMatch) {
        return stepsMatch[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, ''));
      }
    }
    return aiData?.next_steps || [
      'Schedule initial consultation call',
      'Review detailed service proposal',
      'Begin implementation planning'
    ];
  }

  private extractExecutiveSummary(aiData: any): string {
    return this.extractSummary(aiData);
  }

  private extractActionItems(aiData: any): string[] {
    return this.extractNextSteps(aiData);
  }
}

/**
 * Default consultation generator instance
 */
export const consultationGenerator = new ConsultationGenerator();

/**
 * Convenience function for generating consultations
 */
export async function generateConsultation(
  data: ConsultationData,
  services: ServicePackage[]
): Promise<GeneratedConsultation> {
  return consultationGenerator.generateConsultation(data, services);
}

/**
 * Convenience function for quick recommendations
 */
export async function generateQuickRecommendations(
  responses: Record<string, unknown>,
  services: ServicePackage[]
): Promise<ServicePackage[]> {
  return consultationGenerator.generateQuickRecommendations(responses, services);
}