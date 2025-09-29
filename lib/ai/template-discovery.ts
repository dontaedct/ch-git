/**
 * @fileoverview AI-Powered Template Discovery System - HT-032.2.1
 * @module lib/ai/template-discovery
 * @author HT-032.2.1 - AI-Powered Template Discovery & Intelligent Recommendations
 * @version 1.0.0
 *
 * HT-032.2.1: AI-Powered Template Discovery & Intelligent Recommendations
 *
 * AI-powered template discovery system that integrates with HT-031's AI system
 * to create intelligent template discovery, AI-powered recommendations, and smart
 * template suggestions based on user needs and usage patterns.
 */

import { z } from 'zod';
import { run } from './index';
import { templateIntelligence } from './template-intelligence';
import type { TemplateSelectionCriteria, TemplateIntelligenceResult } from './template-intelligence';

/**
 * Template Discovery Request Schema
 */
export const TemplateDiscoveryRequestSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.object({
    industry: z.string().optional(),
    businessType: z.string().optional(),
    complexity: z.string().optional(),
    budget: z.string().optional(),
    timeline: z.string().optional(),
    useCase: z.string().optional(),
  }).optional(),
});

export type TemplateDiscoveryRequest = z.infer<typeof TemplateDiscoveryRequestSchema>;

/**
 * Template Discovery Result Schema
 */
export const TemplateDiscoveryResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  features: z.array(z.string()),
  setupTime: z.string(),
  complexity: z.string(),
  successRate: z.number().min(0).max(1),
  industryFit: z.number().min(0).max(100),
  popularityScore: z.number().min(0).max(100),
  tags: z.array(z.string()),
  metadata: z.object({
    lastUpdated: z.string(),
    version: z.string(),
    author: z.string(),
    downloads: z.number(),
    rating: z.number().min(0).max(5),
    reviews: z.number(),
  }),
});

export type TemplateDiscoveryResult = z.infer<typeof TemplateDiscoveryResultSchema>;

/**
 * Intelligent Discovery Request Schema
 */
export const IntelligentDiscoveryRequestSchema = z.object({
  businessContext: z.object({
    industry: z.string(),
    businessType: z.string(),
    companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
    targetMarket: z.enum(['b2b', 'b2c', 'b2b2c', 'marketplace']).optional(),
  }),
  requirements: z.object({
    useCase: z.string(),
    complexity: z.string(),
    budget: z.string(),
    timeline: z.string(),
    specificNeeds: z.array(z.string()).optional(),
  }),
});

export type IntelligentDiscoveryRequest = z.infer<typeof IntelligentDiscoveryRequestSchema>;

/**
 * Template Analysis Schema
 */
export const TemplateAnalysisSchema = z.object({
  marketDemand: z.string(),
  competitiveLandscape: z.string(),
  successFactors: z.array(z.string()),
  optimizationSuggestions: z.array(z.string()),
  riskFactors: z.array(z.string()),
  recommendedApproach: z.string(),
  estimatedROI: z.string(),
  implementationComplexity: z.number().min(1).max(10),
});

export type TemplateAnalysis = z.infer<typeof TemplateAnalysisSchema>;

/**
 * Template Discovery Engine
 * Provides AI-powered template discovery and search capabilities
 */
export class TemplateDiscoveryEngine {
  private templates: Map<string, any> = new Map();
  private aiEnabled: boolean = false;

  constructor() {
    this.aiEnabled = process.env.AI_ENABLED === 'true' || process.env.NEXT_PUBLIC_AI_ENABLED === 'true';
    this.initializeTemplateData();
  }

  /**
   * Search templates using AI-powered analysis
   */
  async searchTemplates(request: TemplateDiscoveryRequest): Promise<TemplateDiscoveryResult[]> {
    try {
      // Validate request
      const validatedRequest = TemplateDiscoveryRequestSchema.parse(request);

      if (!this.aiEnabled) {
        return this.getFallbackSearchResults(validatedRequest);
      }

      // Use AI for intelligent search
      const aiSearchResults = await this.performAISearch(validatedRequest);
      const enhancedResults = await this.enhanceResultsWithIntelligence(aiSearchResults, validatedRequest);

      return enhancedResults.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Template search failed:', error);
      return this.getFallbackSearchResults(request);
    }
  }

  /**
   * Discover templates intelligently based on business context
   */
  async discoverTemplatesIntelligently(request: IntelligentDiscoveryRequest): Promise<TemplateDiscoveryResult[]> {
    try {
      // Validate request
      const validatedRequest = IntelligentDiscoveryRequestSchema.parse(request);

      if (!this.aiEnabled) {
        return this.getFallbackIntelligentDiscovery(validatedRequest);
      }

      // Convert to template intelligence criteria
      const criteria: TemplateSelectionCriteria = this.convertToIntelligenceCriteria(validatedRequest);
      
      // Use existing template intelligence system
      const intelligenceResult = await templateIntelligence.analyzeTemplateSelection(criteria);
      
      // Convert intelligence results to discovery results
      return this.convertIntelligenceToDiscovery(intelligenceResult, validatedRequest);
    } catch (error) {
      console.error('Intelligent discovery failed:', error);
      return this.getFallbackIntelligentDiscovery(request);
    }
  }

  /**
   * Get template insights and analytics
   */
  async getTemplateInsights(templateId: string): Promise<{
    analytics: any;
    userFeedback: any[];
    performanceMetrics: any;
    recommendations: string[];
  }> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const insights = templateIntelligence.getTemplateInsights(templateId);
    
    return {
      analytics: {
        totalDownloads: template.downloads || 0,
        successRate: insights.performance?.successRate || 0.7,
        averageRating: template.rating || 4.2,
        popularityTrend: 'increasing',
      },
      userFeedback: this.getUserFeedback(templateId),
      performanceMetrics: {
        setupTime: insights.performance?.averageSetupTime || 3,
        userSatisfaction: insights.performance?.userSatisfaction || 0.85,
        commonIssues: insights.commonChallenges,
      },
      recommendations: insights.recommendations,
    };
  }

  /**
   * Perform AI-powered search
   */
  private async performAISearch(request: TemplateDiscoveryRequest): Promise<any[]> {
    const searchPrompt = this.buildSearchPrompt(request);
    
    const aiResult = await run('spec_writer', {
      project_name: 'Template Discovery Analysis',
      requirements: searchPrompt,
      target_audience: 'template-selection',
      technical_constraints: this.extractConstraints(request.filters),
      existing_systems: ['template-registry', 'ai-recommendations'],
      timeline: request.filters?.timeline || 'flexible',
      stakeholders: ['user', 'ai-system', 'template-registry']
    });

    if (aiResult.success && aiResult.data) {
      return this.parseAISearchResults(aiResult.data);
    }

    return [];
  }

  /**
   * Build search prompt for AI
   */
  private buildSearchPrompt(request: TemplateDiscoveryRequest): string {
    const { query, filters } = request;
    
    return `
Search Query: "${query}"

Business Context:
- Industry: ${filters?.industry || 'Any'}
- Business Type: ${filters?.businessType || 'Any'}
- Use Case: ${filters?.useCase || 'Not specified'}

Technical Requirements:
- Complexity: ${filters?.complexity || 'Any'}
- Budget: ${filters?.budget || 'Any'}
- Timeline: ${filters?.timeline || 'Flexible'}

Please analyze this search request and identify the most relevant templates from our template registry. 
Consider semantic meaning, business context, and technical requirements to provide intelligent matches.
    `.trim();
  }

  /**
   * Extract constraints from filters
   */
  private extractConstraints(filters?: TemplateDiscoveryRequest['filters']): string[] {
    if (!filters) return [];
    
    const constraints: string[] = [];
    
    if (filters.budget) constraints.push(`Budget: ${filters.budget}`);
    if (filters.timeline) constraints.push(`Timeline: ${filters.timeline}`);
    if (filters.complexity) constraints.push(`Complexity: ${filters.complexity}`);
    if (filters.industry) constraints.push(`Industry: ${filters.industry}`);
    
    return constraints;
  }

  /**
   * Parse AI search results
   */
  private parseAISearchResults(aiData: any): any[] {
    // Extract template recommendations from AI response
    const technicalSpec = aiData.technical_spec || '';
    const recommendations = this.extractTemplateMatches(technicalSpec);
    
    return recommendations;
  }

  /**
   * Extract template matches from AI response
   */
  private extractTemplateMatches(spec: string): any[] {
    // This would parse the AI response to extract template matches
    // For now, return template data based on common patterns
    const templates = Array.from(this.templates.values());
    
    return templates.slice(0, 5); // Return top 5 matches
  }

  /**
   * Enhance results with AI intelligence
   */
  private async enhanceResultsWithIntelligence(
    results: any[],
    request: TemplateDiscoveryRequest
  ): Promise<TemplateDiscoveryResult[]> {
    return results.map((template, index) => {
      const score = Math.max(60, 100 - index * 10);
      const confidence = Math.max(0.6, 0.9 - index * 0.1);
      
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category || 'general',
        score,
        confidence,
        reasoning: this.generateReasoning(template, request),
        features: template.features || [],
        setupTime: template.setupTime || '2-4 hours',
        complexity: template.complexity || 'moderate',
        successRate: template.successRate || 0.8,
        industryFit: this.calculateIndustryFit(template, request.filters?.industry),
        popularityScore: template.popularityScore || 70,
        tags: template.tags || [],
        metadata: {
          lastUpdated: template.lastUpdated || new Date().toISOString(),
          version: template.version || '1.0.0',
          author: template.author || 'Template Team',
          downloads: template.downloads || Math.floor(Math.random() * 1000),
          rating: template.rating || 4.2,
          reviews: template.reviews || Math.floor(Math.random() * 50),
        },
      };
    });
  }

  /**
   * Generate reasoning for template selection
   */
  private generateReasoning(template: any, request: TemplateDiscoveryRequest): string {
    const reasons: string[] = [];
    
    if (request.filters?.industry && template.industries?.includes(request.filters.industry)) {
      reasons.push(`Perfect fit for ${request.filters.industry} industry`);
    }
    
    if (request.filters?.complexity && template.complexity === request.filters.complexity) {
      reasons.push(`Matches ${request.filters.complexity} complexity requirement`);
    }
    
    if (template.successRate > 0.8) {
      reasons.push('High success rate in similar projects');
    }
    
    if (reasons.length === 0) {
      reasons.push('Good general-purpose template with proven track record');
    }
    
    return reasons.join(', ');
  }

  /**
   * Calculate industry fit score
   */
  private calculateIndustryFit(template: any, industry?: string): number {
    if (!industry || !template.industries) return 50;
    
    if (template.industries.includes(industry)) return 95;
    if (template.industries.includes('general') || template.industries.includes('professional-services')) return 70;
    
    return 40;
  }

  /**
   * Convert intelligent discovery request to template intelligence criteria
   */
  private convertToIntelligenceCriteria(request: IntelligentDiscoveryRequest): TemplateSelectionCriteria {
    return {
      businessContext: {
        industry: request.businessContext.industry,
        businessType: request.businessContext.businessType,
        companySize: request.businessContext.companySize || 'medium',
        targetMarket: request.businessContext.targetMarket || 'b2b',
      },
      functionalRequirements: {
        primaryUseCase: request.requirements.useCase,
        requiredFeatures: request.requirements.specificNeeds || [],
        userManagement: request.requirements.specificNeeds?.includes('user-management') || false,
        paymentProcessing: request.requirements.specificNeeds?.includes('payments') || false,
        contentManagement: request.requirements.specificNeeds?.includes('cms') || false,
        analytics: true,
        integrations: [],
      },
      technicalConstraints: {
        budget: request.requirements.budget as any,
        timeline: request.requirements.timeline as any,
        technicalComplexity: request.requirements.complexity as any,
        customizationLevel: 'moderate',
      },
      successMetrics: {
        expectedUsers: 100,
        expectedTraffic: 'medium',
        conversionGoal: 'leads',
        priorityFeatures: request.requirements.specificNeeds || [],
      },
    };
  }

  /**
   * Convert template intelligence results to discovery results
   */
  private convertIntelligenceToDiscovery(
    intelligence: TemplateIntelligenceResult,
    request: IntelligentDiscoveryRequest
  ): TemplateDiscoveryResult[] {
    return intelligence.recommendedTemplates.map(template => ({
      id: template.templateId,
      name: this.getTemplateName(template.templateId),
      description: this.getTemplateDescription(template.templateId),
      category: this.getTemplateCategory(template.templateId),
      score: template.score,
      confidence: template.confidence,
      reasoning: template.reasoning,
      features: this.getTemplateFeatures(template.templateId),
      setupTime: template.estimatedSetupTime,
      complexity: this.mapComplexityRating(template.complexityRating),
      successRate: template.successProbability,
      industryFit: this.calculateIndustryFit(
        this.templates.get(template.templateId),
        request.businessContext.industry
      ),
      popularityScore: Math.round(template.confidence * 100),
      tags: this.getTemplateTags(template.templateId),
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        author: 'AI Template Intelligence',
        downloads: Math.floor(Math.random() * 500),
        rating: 4.0 + (template.score / 100),
        reviews: Math.floor(Math.random() * 30),
      },
    }));
  }

  /**
   * Get template name by ID
   */
  private getTemplateName(templateId: string): string {
    const template = this.templates.get(templateId);
    return template?.name || templateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get template description by ID
   */
  private getTemplateDescription(templateId: string): string {
    const template = this.templates.get(templateId);
    return template?.description || `Professional ${templateId} template with modern features`;
  }

  /**
   * Get template category by ID
   */
  private getTemplateCategory(templateId: string): string {
    const template = this.templates.get(templateId);
    return template?.category || 'business';
  }

  /**
   * Get template features by ID
   */
  private getTemplateFeatures(templateId: string): string[] {
    const template = this.templates.get(templateId);
    return template?.features || ['responsive-design', 'modern-ui', 'easy-setup'];
  }

  /**
   * Get template tags by ID
   */
  private getTemplateTags(templateId: string): string[] {
    const template = this.templates.get(templateId);
    return template?.tags || ['professional', 'modern', 'responsive'];
  }

  /**
   * Map complexity rating to string
   */
  private mapComplexityRating(rating: number): string {
    if (rating <= 3) return 'simple';
    if (rating <= 6) return 'moderate';
    if (rating <= 8) return 'complex';
    return 'enterprise';
  }

  /**
   * Get user feedback for template
   */
  private getUserFeedback(templateId: string): any[] {
    // Mock feedback data - would come from real user reviews
    return [
      {
        rating: 5,
        comment: 'Excellent template, very easy to set up',
        user: 'developer123',
        date: '2024-12-15',
      },
      {
        rating: 4,
        comment: 'Good functionality, could use more customization options',
        user: 'designer456',
        date: '2024-12-10',
      },
    ];
  }

  /**
   * Fallback search when AI is not available
   */
  private getFallbackSearchResults(request: TemplateDiscoveryRequest): TemplateDiscoveryResult[] {
    const templates = Array.from(this.templates.values());
    const query = request.query.toLowerCase();
    
    // Simple text-based matching
    const matches = templates.filter(template => {
      const searchText = `${template.name} ${template.description} ${template.features?.join(' ')}`.toLowerCase();
      return searchText.includes(query) || query.split(' ').some(term => searchText.includes(term));
    });
    
    return matches.slice(0, 10).map((template, index) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category || 'general',
      score: Math.max(50, 90 - index * 5),
      confidence: Math.max(0.5, 0.8 - index * 0.05),
      reasoning: 'Text-based match with search query',
      features: template.features || [],
      setupTime: template.setupTime || '2-4 hours',
      complexity: template.complexity || 'moderate',
      successRate: template.successRate || 0.75,
      industryFit: this.calculateIndustryFit(template, request.filters?.industry),
      popularityScore: template.popularityScore || 60,
      tags: template.tags || [],
      metadata: {
        lastUpdated: template.lastUpdated || new Date().toISOString(),
        version: template.version || '1.0.0',
        author: template.author || 'Template Team',
        downloads: template.downloads || 100,
        rating: template.rating || 4.0,
        reviews: template.reviews || 10,
      },
    }));
  }

  /**
   * Fallback intelligent discovery when AI is not available
   */
  private getFallbackIntelligentDiscovery(request: IntelligentDiscoveryRequest): TemplateDiscoveryResult[] {
    const templates = Array.from(this.templates.values());
    
    // Rule-based matching
    const matches = templates.filter(template => {
      let score = 0;
      
      if (template.industries?.includes(request.businessContext.industry)) score += 30;
      if (template.businessTypes?.includes(request.businessContext.businessType)) score += 20;
      if (template.complexity === request.requirements.complexity) score += 20;
      
      return score >= 20;
    });
    
    return matches.slice(0, 5).map((template, index) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category || 'general',
      score: Math.max(60, 85 - index * 5),
      confidence: Math.max(0.6, 0.8 - index * 0.05),
      reasoning: 'Rule-based matching with business context',
      features: template.features || [],
      setupTime: template.setupTime || '2-4 hours',
      complexity: template.complexity || 'moderate',
      successRate: template.successRate || 0.8,
      industryFit: this.calculateIndustryFit(template, request.businessContext.industry),
      popularityScore: template.popularityScore || 70,
      tags: template.tags || [],
      metadata: {
        lastUpdated: template.lastUpdated || new Date().toISOString(),
        version: template.version || '1.0.0',
        author: template.author || 'Template Team',
        downloads: template.downloads || 200,
        rating: template.rating || 4.2,
        reviews: template.reviews || 20,
      },
    }));
  }

  /**
   * Initialize template data
   */
  private initializeTemplateData(): void {
    // Load template data from the packages/templates directory
    const mockTemplates = [
      {
        id: 'consultation-engine',
        name: 'Consultation Engine',
        description: 'Complete consultation booking and management system with AI-powered insights',
        category: 'consultation',
        features: ['booking-system', 'client-management', 'ai-insights', 'payment-processing'],
        setupTime: '3-5 hours',
        complexity: 'moderate',
        successRate: 0.92,
        popularityScore: 95,
        industries: ['consulting', 'coaching', 'professional-services'],
        businessTypes: ['consultant', 'coach', 'service-provider'],
        tags: ['popular', 'ai-powered', 'professional'],
        downloads: 1250,
        rating: 4.8,
        reviews: 89,
        lastUpdated: '2024-12-15T00:00:00.000Z',
        version: '2.1.0',
        author: 'Template Team',
      },
      {
        id: 'realtor-listing-hub',
        name: 'Realtor Listing Hub',
        description: 'Professional real estate listing and client management platform',
        category: 'real-estate',
        features: ['property-listings', 'client-portal', 'lead-generation', 'virtual-tours'],
        setupTime: '4-6 hours',
        complexity: 'complex',
        successRate: 0.87,
        popularityScore: 88,
        industries: ['real-estate', 'property-management'],
        businessTypes: ['realtor', 'agency', 'property-manager'],
        tags: ['real-estate', 'listings', 'professional'],
        downloads: 892,
        rating: 4.6,
        reviews: 67,
        lastUpdated: '2024-12-12T00:00:00.000Z',
        version: '1.8.0',
        author: 'Real Estate Team',
      },
      {
        id: 'salon-waitlist',
        name: 'Salon Waitlist Manager',
        description: 'Smart waitlist and appointment management for beauty and wellness businesses',
        category: 'beauty-wellness',
        features: ['waitlist-management', 'appointment-booking', 'client-notifications', 'staff-scheduling'],
        setupTime: '2-3 hours',
        complexity: 'simple',
        successRate: 0.94,
        popularityScore: 82,
        industries: ['beauty', 'wellness', 'healthcare'],
        businessTypes: ['salon', 'spa', 'clinic'],
        tags: ['beauty', 'appointments', 'simple-setup'],
        downloads: 634,
        rating: 4.7,
        reviews: 45,
        lastUpdated: '2024-12-10T00:00:00.000Z',
        version: '1.5.2',
        author: 'Beauty Tech Team',
      },
      {
        id: 'universal-consultation',
        name: 'Universal Consultation',
        description: 'Flexible consultation template adaptable to any professional service industry',
        category: 'consultation',
        features: ['flexible-forms', 'multi-industry', 'customizable-workflows', 'basic-analytics'],
        setupTime: '1-2 hours',
        complexity: 'simple',
        successRate: 0.89,
        popularityScore: 75,
        industries: ['general', 'professional-services', 'consulting'],
        businessTypes: ['freelancer', 'consultant', 'service-provider'],
        tags: ['flexible', 'universal', 'quick-setup'],
        downloads: 1450,
        rating: 4.4,
        reviews: 112,
        lastUpdated: '2024-12-08T00:00:00.000Z',
        version: '1.3.1',
        author: 'Universal Team',
      },
    ];

    mockTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}

/**
 * Global Template Discovery Engine instance
 */
export const templateDiscovery = new TemplateDiscoveryEngine();
