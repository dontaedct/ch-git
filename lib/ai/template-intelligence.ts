/**
 * @fileoverview Smart Template Selection System - HT-031.1.1
 * @module lib/ai/template-intelligence
 * @author HT-031.1.1 - AI-Powered Enhancement & Intelligent Automation
 * @version 1.0.0
 *
 * HT-031.1.1: AI-Powered App Generation & Template Intelligence
 *
 * Intelligent template selection system that uses machine learning algorithms
 * and AI analysis to automatically select the most appropriate template
 * based on client requirements, business context, and historical success data.
 */

import { z } from 'zod';
import { run } from './index';

/**
 * Template Selection Criteria Schema
 */
export const TemplateSelectionCriteriaSchema = z.object({
  businessContext: z.object({
    industry: z.string(),
    businessType: z.string(),
    companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
    targetMarket: z.enum(['b2b', 'b2c', 'b2b2c', 'marketplace']),
  }),
  functionalRequirements: z.object({
    primaryUseCase: z.string(),
    requiredFeatures: z.array(z.string()),
    userManagement: z.boolean().default(false),
    paymentProcessing: z.boolean().default(false),
    contentManagement: z.boolean().default(false),
    analytics: z.boolean().default(true),
    integrations: z.array(z.string()).default([]),
  }),
  technicalConstraints: z.object({
    budget: z.enum(['basic', 'standard', 'premium', 'enterprise']),
    timeline: z.enum(['urgent', '1-week', '2-weeks', '1-month', 'flexible']),
    technicalComplexity: z.enum(['simple', 'moderate', 'complex', 'enterprise']),
    customizationLevel: z.enum(['minimal', 'moderate', 'extensive', 'full']),
  }),
  successMetrics: z.object({
    expectedUsers: z.number().min(1),
    expectedTraffic: z.enum(['low', 'medium', 'high', 'enterprise']),
    conversionGoal: z.enum(['leads', 'sales', 'engagement', 'information']),
    priorityFeatures: z.array(z.string()).default([]),
  }),
});

export type TemplateSelectionCriteria = z.infer<typeof TemplateSelectionCriteriaSchema>;

/**
 * Template Intelligence Analysis Result
 */
export const TemplateIntelligenceResultSchema = z.object({
  recommendedTemplates: z.array(z.object({
    templateId: z.string(),
    score: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    estimatedSetupTime: z.string(),
    complexityRating: z.number().min(1).max(10),
    successProbability: z.number().min(0).max(1),
  })),
  alternativeOptions: z.array(z.object({
    templateId: z.string(),
    score: z.number().min(0).max(100),
    reasoning: z.string(),
    whenToUse: z.string(),
  })),
  customizationRecommendations: z.object({
    requiredModifications: z.array(z.string()),
    optionalEnhancements: z.array(z.string()),
    integrationSuggestions: z.array(z.string()),
  }),
  riskAssessment: z.object({
    technicalRisks: z.array(z.string()),
    timelineRisks: z.array(z.string()),
    budgetRisks: z.array(z.string()),
    mitigationStrategies: z.array(z.string()),
  }),
  optimizationSuggestions: z.array(z.string()),
});

export type TemplateIntelligenceResult = z.infer<typeof TemplateIntelligenceResultSchema>;

/**
 * Template Performance Data
 */
export interface TemplatePerformanceData {
  templateId: string;
  successRate: number;
  averageSetupTime: number;
  userSatisfaction: number;
  commonIssues: string[];
  popularCustomizations: string[];
  industryFit: Record<string, number>; // Industry -> fit score
}

/**
 * Template Intelligence Engine
 */
export class TemplateIntelligenceEngine {
  private performanceData: Map<string, TemplatePerformanceData> = new Map();
  private aiEnabled: boolean = false;

  constructor() {
    this.aiEnabled = process.env.AI_ENABLED === 'true' || process.env.NEXT_PUBLIC_AI_ENABLED === 'true';
    this.initializePerformanceData();
  }

  /**
   * Analyze criteria and recommend optimal templates
   */
  async analyzeTemplateSelection(criteria: TemplateSelectionCriteria): Promise<TemplateIntelligenceResult> {
    if (!this.aiEnabled) {
      return this.getFallbackAnalysis(criteria);
    }

    try {
      const prompt = this.buildIntelligencePrompt(criteria);
      
      const result = await run('spec_writer', {
        project_name: 'Template Intelligence Analysis',
        requirements: this.formatCriteriaForAI(criteria),
        target_audience: 'development-team',
        technical_constraints: this.extractTechnicalConstraints(criteria),
        existing_systems: criteria.functionalRequirements.integrations,
        timeline: criteria.technicalConstraints.timeline,
        stakeholders: ['client', 'development-team', 'end-users']
      });

      if (result.success && result.data) {
        return this.parseIntelligenceResult(result.data, criteria);
      } else {
        console.warn('AI template intelligence failed, falling back to rule-based analysis:', result.error);
        return this.getFallbackAnalysis(criteria);
      }
    } catch (error) {
      console.error('Error in template intelligence analysis:', error);
      return this.getFallbackAnalysis(criteria);
    }
  }

  /**
   * Score template against criteria using ML algorithms
   */
  scoreTemplate(
    templateId: string,
    criteria: TemplateSelectionCriteria
  ): {
    score: number;
    confidence: number;
    reasoning: string;
    factors: Record<string, number>;
  } {
    const template = this.getTemplateData(templateId);
    if (!template) {
      return {
        score: 0,
        confidence: 0,
        reasoning: 'Template not found',
        factors: {},
      };
    }

    const factors: Record<string, number> = {};
    let totalScore = 0;
    let weightSum = 0;

    // Industry fit scoring (weight: 30%)
    const industryWeight = 0.3;
    const industryScore = this.scoreIndustryFit(template, criteria.businessContext.industry);
    factors.industryFit = industryScore;
    totalScore += industryScore * industryWeight;
    weightSum += industryWeight;

    // Feature alignment scoring (weight: 25%)
    const featureWeight = 0.25;
    const featureScore = this.scoreFeatureAlignment(template, criteria.functionalRequirements);
    factors.featureAlignment = featureScore;
    totalScore += featureScore * featureWeight;
    weightSum += featureWeight;

    // Complexity matching (weight: 20%)
    const complexityWeight = 0.2;
    const complexityScore = this.scoreComplexityMatch(template, criteria.technicalConstraints);
    factors.complexityMatch = complexityScore;
    totalScore += complexityScore * complexityWeight;
    weightSum += complexityWeight;

    // Performance prediction (weight: 15%)
    const performanceWeight = 0.15;
    const performanceScore = this.scorePerformancePrediction(template, criteria);
    factors.performancePrediction = performanceScore;
    totalScore += performanceScore * performanceWeight;
    weightSum += performanceWeight;

    // Timeline compatibility (weight: 10%)
    const timelineWeight = 0.1;
    const timelineScore = this.scoreTimelineCompatibility(template, criteria.technicalConstraints.timeline);
    factors.timelineCompatibility = timelineScore;
    totalScore += timelineScore * timelineWeight;
    weightSum += timelineWeight;

    const finalScore = weightSum > 0 ? totalScore / weightSum : 0;
    const confidence = this.calculateConfidence(factors, criteria);

    return {
      score: Math.round(finalScore),
      confidence,
      reasoning: this.generateReasoning(template, factors, criteria),
      factors,
    };
  }

  /**
   * Get template performance insights
   */
  getTemplateInsights(templateId: string): {
    performance: TemplatePerformanceData | null;
    recommendations: string[];
    bestUseCases: string[];
    commonChallenges: string[];
  } {
    const performance = this.performanceData.get(templateId);
    if (!performance) {
      return {
        performance: null,
        recommendations: [],
        bestUseCases: [],
        commonChallenges: [],
      };
    }

    return {
      performance,
      recommendations: this.generateTemplateRecommendations(templateId, performance),
      bestUseCases: this.getBestUseCases(templateId),
      commonChallenges: performance.commonIssues,
    };
  }

  /**
   * Predict setup success probability
   */
  predictSetupSuccess(
    templateId: string,
    criteria: TemplateSelectionCriteria
  ): {
    probability: number;
    factors: string[];
    recommendations: string[];
  } {
    const template = this.getTemplateData(templateId);
    if (!template) {
      return {
        probability: 0,
        factors: ['Template not found'],
        recommendations: ['Select a valid template'],
      };
    }

    const factors: string[] = [];
    let probability = 0.5; // Base probability

    // Adjust based on performance data
    if (template.successRate > 0.8) {
      probability += 0.2;
      factors.push('High historical success rate');
    } else if (template.successRate < 0.6) {
      probability -= 0.2;
      factors.push('Lower historical success rate');
    }

    // Adjust based on complexity match
    const complexityMatch = this.scoreComplexityMatch(template, criteria.technicalConstraints);
    if (complexityMatch > 80) {
      probability += 0.15;
      factors.push('Good complexity match');
    } else if (complexityMatch < 50) {
      probability -= 0.15;
      factors.push('Poor complexity match');
    }

    // Adjust based on timeline
    if (criteria.technicalConstraints.timeline === 'urgent' && template.averageSetupTime > 4) {
      probability -= 0.1;
      factors.push('Timeline may be too aggressive');
    }

    // Adjust based on budget
    if (criteria.technicalConstraints.budget === 'basic' && template.complexityRating > 7) {
      probability -= 0.1;
      factors.push('Budget may be insufficient for complexity');
    }

    const recommendations = this.generateSuccessRecommendations(probability, factors);

    return {
      probability: Math.max(0, Math.min(1, probability)),
      factors,
      recommendations,
    };
  }

  /**
   * Build AI intelligence prompt
   */
  private buildIntelligencePrompt(criteria: TemplateSelectionCriteria): string {
    return `
Analyze the following client requirements and provide intelligent template recommendations:

Business Context:
- Industry: ${criteria.businessContext.industry}
- Business Type: ${criteria.businessContext.businessType}
- Company Size: ${criteria.businessContext.companySize}
- Target Market: ${criteria.businessContext.targetMarket}

Functional Requirements:
- Primary Use Case: ${criteria.functionalRequirements.primaryUseCase}
- Required Features: ${criteria.functionalRequirements.requiredFeatures.join(', ')}
- User Management: ${criteria.functionalRequirements.userManagement}
- Payment Processing: ${criteria.functionalRequirements.paymentProcessing}
- Integrations: ${criteria.functionalRequirements.integrations.join(', ')}

Technical Constraints:
- Budget: ${criteria.technicalConstraints.budget}
- Timeline: ${criteria.technicalConstraints.timeline}
- Complexity: ${criteria.technicalConstraints.technicalComplexity}
- Customization: ${criteria.technicalConstraints.customizationLevel}

Success Metrics:
- Expected Users: ${criteria.successMetrics.expectedUsers}
- Traffic Level: ${criteria.successMetrics.expectedTraffic}
- Conversion Goal: ${criteria.successMetrics.conversionGoal}

Please provide detailed analysis with template recommendations, scoring, and optimization suggestions.
    `.trim();
  }

  /**
   * Format criteria for AI processing
   */
  private formatCriteriaForAI(criteria: TemplateSelectionCriteria): string {
    return `
Business: ${criteria.businessContext.businessType} in ${criteria.businessContext.industry}
Size: ${criteria.businessContext.companySize} (${criteria.businessContext.targetMarket})
Use Case: ${criteria.functionalRequirements.primaryUseCase}
Features: ${criteria.functionalRequirements.requiredFeatures.join(', ')}
Budget: ${criteria.technicalConstraints.budget}
Timeline: ${criteria.technicalConstraints.timeline}
Complexity: ${criteria.technicalConstraints.technicalComplexity}
Users: ${criteria.successMetrics.expectedUsers}
Goal: ${criteria.successMetrics.conversionGoal}
    `.trim();
  }

  /**
   * Extract technical constraints
   */
  private extractTechnicalConstraints(criteria: TemplateSelectionCriteria): string[] {
    const constraints: string[] = [];
    
    constraints.push(`Budget: ${criteria.technicalConstraints.budget}`);
    constraints.push(`Timeline: ${criteria.technicalConstraints.timeline}`);
    constraints.push(`Complexity: ${criteria.technicalConstraints.technicalComplexity}`);
    
    if (criteria.functionalRequirements.userManagement) {
      constraints.push('User management required');
    }
    if (criteria.functionalRequirements.paymentProcessing) {
      constraints.push('Payment processing required');
    }
    if (criteria.functionalRequirements.contentManagement) {
      constraints.push('Content management required');
    }
    
    return constraints;
  }

  /**
   * Parse AI intelligence result
   */
  private parseIntelligenceResult(aiData: any, criteria: TemplateSelectionCriteria): TemplateIntelligenceResult {
    // Extract recommendations from AI response
    const technicalSpec = aiData.technical_spec || '';
    const recommendedTemplates = this.extractTemplateRecommendations(technicalSpec);
    
    return {
      recommendedTemplates: recommendedTemplates.map((template, index) => ({
        templateId: template.id,
        score: Math.max(60, 100 - index * 10), // Decreasing scores
        confidence: Math.max(0.6, 0.9 - index * 0.1),
        reasoning: `AI recommendation based on ${criteria.businessContext.industry} industry analysis`,
        pros: this.generateTemplatePros(template.id, criteria),
        cons: this.generateTemplateCons(template.id, criteria),
        estimatedSetupTime: this.getEstimatedSetupTime(template.id),
        complexityRating: this.getComplexityRating(template.id),
        successProbability: this.calculateSuccessProbability(template.id, criteria),
      })),
      alternativeOptions: this.generateAlternativeOptions(criteria),
      customizationRecommendations: {
        requiredModifications: this.getRequiredModifications(criteria),
        optionalEnhancements: this.getOptionalEnhancements(criteria),
        integrationSuggestions: criteria.functionalRequirements.integrations,
      },
      riskAssessment: {
        technicalRisks: this.assessTechnicalRisks(criteria),
        timelineRisks: this.assessTimelineRisks(criteria),
        budgetRisks: this.assessBudgetRisks(criteria),
        mitigationStrategies: this.generateMitigationStrategies(criteria),
      },
      optimizationSuggestions: this.generateOptimizationSuggestions(criteria),
    };
  }

  /**
   * Score industry fit
   */
  private scoreIndustryFit(template: any, industry: string): number {
    const performance = this.performanceData.get(template.id);
    if (!performance) return 50; // Default score
    
    const industryFit = performance.industryFit[industry.toLowerCase()];
    return industryFit ? Math.round(industryFit * 100) : 50;
  }

  /**
   * Score feature alignment
   */
  private scoreFeatureAlignment(template: any, requirements: any): number {
    const templateFeatures = template.features || [];
    const requiredFeatures = requirements.requiredFeatures || [];
    
    let matches = 0;
    requiredFeatures.forEach((feature: string) => {
      if (templateFeatures.some((tf: string) => 
        tf.toLowerCase().includes(feature.toLowerCase())
      )) {
        matches++;
      }
    });
    
    return requiredFeatures.length > 0 ? (matches / requiredFeatures.length) * 100 : 50;
  }

  /**
   * Score complexity match
   */
  private scoreComplexityMatch(template: any, constraints: any): number {
    const templateComplexity = template.complexity || 5;
    const requiredComplexity = constraints.technicalComplexity;
    
    const complexityMap: Record<string, number> = {
      'simple': 3,
      'moderate': 5,
      'complex': 7,
      'enterprise': 9,
    };
    
    const requiredLevel = complexityMap[requiredComplexity] || 5;
    const diff = Math.abs(templateComplexity - requiredLevel);
    
    return Math.max(0, 100 - diff * 10);
  }

  /**
   * Score performance prediction
   */
  private scorePerformancePrediction(template: any, criteria: any): number {
    const performance = this.performanceData.get(template.id);
    if (!performance) return 50;
    
    let score = performance.successRate * 100;
    
    // Adjust based on expected traffic
    const trafficAdjustment: Record<string, number> = {
      'low': 0,
      'medium': -5,
      'high': -10,
      'enterprise': -15,
    };
    
    score += trafficAdjustment[criteria.successMetrics.expectedTraffic] || 0;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Score timeline compatibility
   */
  private scoreTimelineCompatibility(template: any, timeline: string): number {
    const setupTime = template.setupTime || '2-4 hours';
    const timelineMap: Record<string, number> = {
      'urgent': 20, // Very restrictive
      '1-week': 60,
      '2-weeks': 80,
      '1-month': 95,
      'flexible': 100,
    };
    
    return timelineMap[timeline] || 70;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(factors: Record<string, number>, criteria: any): number {
    const factorValues = Object.values(factors);
    const averageScore = factorValues.reduce((sum, score) => sum + score, 0) / factorValues.length;
    
    // Higher confidence for more specific criteria
    let specificity = 0.5;
    if (criteria.functionalRequirements.requiredFeatures.length > 3) specificity += 0.2;
    if (criteria.technicalConstraints.budget !== 'basic') specificity += 0.1;
    if (criteria.successMetrics.expectedUsers > 100) specificity += 0.2;
    
    return Math.min(1, (averageScore / 100) * specificity);
  }

  /**
   * Generate reasoning for template selection
   */
  private generateReasoning(template: any, factors: Record<string, number>, criteria: any): string {
    const topFactors = Object.entries(factors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);
    
    const reasons = topFactors.map(([factor, score]) => {
      switch (factor) {
        case 'industryFit':
          return `Strong industry alignment (${score}%)`;
        case 'featureAlignment':
          return `Good feature match (${score}%)`;
        case 'complexityMatch':
          return `Appropriate complexity level (${score}%)`;
        case 'performancePrediction':
          return `High success probability (${score}%)`;
        case 'timelineCompatibility':
          return `Timeline compatible (${score}%)`;
        default:
          return `${factor} score: ${score}%`;
      }
    });
    
    return `Selected ${template.name} based on ${reasons.join(' and ')}`;
  }

  /**
   * Fallback analysis when AI is not available
   */
  private getFallbackAnalysis(criteria: TemplateSelectionCriteria): TemplateIntelligenceResult {
    const templates = this.getAllTemplates();
    const scoredTemplates = templates.map(template => {
      const score = this.scoreTemplate(template.id, criteria);
      return {
        templateId: template.id,
        score: score.score,
        confidence: score.confidence,
        reasoning: score.reasoning,
        pros: this.generateTemplatePros(template.id, criteria),
        cons: this.generateTemplateCons(template.id, criteria),
        estimatedSetupTime: this.getEstimatedSetupTime(template.id),
        complexityRating: this.getComplexityRating(template.id),
        successProbability: this.calculateSuccessProbability(template.id, criteria),
      };
    }).sort((a, b) => b.score - a.score);

    return {
      recommendedTemplates: scoredTemplates.slice(0, 3),
      alternativeOptions: scoredTemplates.slice(3, 6).map(t => ({
        templateId: t.templateId,
        score: t.score,
        reasoning: t.reasoning,
        whenToUse: `Alternative option with ${t.score}% match`,
      })),
      customizationRecommendations: {
        requiredModifications: this.getRequiredModifications(criteria),
        optionalEnhancements: this.getOptionalEnhancements(criteria),
        integrationSuggestions: criteria.functionalRequirements.integrations,
      },
      riskAssessment: {
        technicalRisks: this.assessTechnicalRisks(criteria),
        timelineRisks: this.assessTimelineRisks(criteria),
        budgetRisks: this.assessBudgetRisks(criteria),
        mitigationStrategies: this.generateMitigationStrategies(criteria),
      },
      optimizationSuggestions: this.generateOptimizationSuggestions(criteria),
    };
  }

  /**
   * Initialize performance data (mock data for now)
   */
  private initializePerformanceData(): void {
    const mockData: TemplatePerformanceData[] = [
      {
        templateId: 'consultation-mvp',
        successRate: 0.85,
        averageSetupTime: 3,
        userSatisfaction: 0.9,
        commonIssues: ['Calendar integration complexity', 'Email notification setup'],
        popularCustomizations: ['Brand colors', 'Custom forms', 'Payment integration'],
        industryFit: {
          'consulting': 0.95,
          'coaching': 0.9,
          'therapy': 0.85,
          'professional-services': 0.8,
        },
      },
      {
        templateId: 'lead-form-pdf',
        successRate: 0.92,
        averageSetupTime: 2,
        userSatisfaction: 0.88,
        commonIssues: ['PDF template customization', 'Email delivery setup'],
        popularCustomizations: ['Form fields', 'PDF styling', 'Automation rules'],
        industryFit: {
          'lead-generation': 0.95,
          'marketing': 0.9,
          'sales': 0.85,
          'services': 0.8,
        },
      },
      // Add more template data as needed
    ];

    mockData.forEach(data => {
      this.performanceData.set(data.templateId, data);
    });
  }

  /**
   * Get template data (placeholder - would come from actual template system)
   */
  private getTemplateData(templateId: string): any {
    // This would integrate with the actual template system
    const mockTemplates: Record<string, any> = {
      'consultation-mvp': {
        id: 'consultation-mvp',
        name: 'Consultation MVP',
        features: ['booking', 'scheduling', 'client-management'],
        complexity: 6,
        setupTime: '2-4 hours',
      },
      'lead-form-pdf': {
        id: 'lead-form-pdf',
        name: 'Lead Form + PDF Receipt',
        features: ['lead-forms', 'pdf-generation', 'email-automation'],
        complexity: 5,
        setupTime: '1-3 hours',
      },
      // Add more templates
    };

    return mockTemplates[templateId];
  }

  /**
   * Get all available templates
   */
  private getAllTemplates(): any[] {
    return Object.values(this.getTemplateData('') || {});
  }

  /**
   * Generate template pros
   */
  private generateTemplatePros(templateId: string, criteria: any): string[] {
    const pros: string[] = [];
    
    switch (templateId) {
      case 'consultation-mvp':
        pros.push('Professional consultation management');
        pros.push('Built-in scheduling system');
        pros.push('Client management features');
        break;
      case 'lead-form-pdf':
        pros.push('Automated lead capture');
        pros.push('PDF document generation');
        pros.push('Email automation');
        break;
      default:
        pros.push('Comprehensive feature set');
        pros.push('Easy to customize');
    }
    
    return pros;
  }

  /**
   * Generate template cons
   */
  private generateTemplateCons(templateId: string, criteria: any): string[] {
    const cons: string[] = [];
    
    switch (templateId) {
      case 'consultation-mvp':
        cons.push('Requires calendar integration setup');
        cons.push('May be complex for simple use cases');
        break;
      case 'lead-form-pdf':
        cons.push('Limited to lead generation use cases');
        cons.push('PDF customization can be complex');
        break;
      default:
        cons.push('May require technical expertise');
    }
    
    return cons;
  }

  /**
   * Get estimated setup time
   */
  private getEstimatedSetupTime(templateId: string): string {
    const template = this.getTemplateData(templateId);
    return template?.setupTime || '2-4 hours';
  }

  /**
   * Get complexity rating
   */
  private getComplexityRating(templateId: string): number {
    const template = this.getTemplateData(templateId);
    return template?.complexity || 5;
  }

  /**
   * Calculate success probability
   */
  private calculateSuccessProbability(templateId: string, criteria: any): number {
    const performance = this.performanceData.get(templateId);
    if (!performance) return 0.7; // Default probability
    
    let probability = performance.successRate;
    
    // Adjust based on criteria
    if (criteria.technicalConstraints.timeline === 'urgent') {
      probability -= 0.1;
    }
    if (criteria.technicalConstraints.budget === 'basic') {
      probability -= 0.05;
    }
    
    return Math.max(0.3, Math.min(1, probability));
  }

  /**
   * Extract template recommendations from AI response
   */
  private extractTemplateRecommendations(spec: string): any[] {
    // This would parse the AI response to extract template recommendations
    // For now, return mock data
    return [
      { id: 'consultation-mvp', name: 'Consultation MVP' },
      { id: 'lead-form-pdf', name: 'Lead Form + PDF Receipt' },
    ];
  }

  /**
   * Generate alternative options
   */
  private generateAlternativeOptions(criteria: any): any[] {
    return [
      {
        templateId: 'consultation-booking',
        score: 75,
        reasoning: 'Good alternative for booking-focused applications',
        whenToUse: 'When calendar integration is the primary requirement',
      },
    ];
  }

  /**
   * Get required modifications
   */
  private getRequiredModifications(criteria: any): string[] {
    const modifications: string[] = [];
    
    if (criteria.functionalRequirements.paymentProcessing) {
      modifications.push('Payment integration setup');
    }
    if (criteria.functionalRequirements.userManagement) {
      modifications.push('User authentication system');
    }
    
    return modifications;
  }

  /**
   * Get optional enhancements
   */
  private getOptionalEnhancements(criteria: any): string[] {
    return [
      'Advanced analytics dashboard',
      'Custom branding integration',
      'Additional form fields',
      'Enhanced email templates',
    ];
  }

  /**
   * Assess technical risks
   */
  private assessTechnicalRisks(criteria: any): string[] {
    const risks: string[] = [];
    
    if (criteria.technicalConstraints.complexity === 'enterprise') {
      risks.push('High technical complexity may require additional expertise');
    }
    if (criteria.functionalRequirements.integrations.length > 3) {
      risks.push('Multiple integrations may increase complexity');
    }
    
    return risks;
  }

  /**
   * Assess timeline risks
   */
  private assessTimelineRisks(criteria: any): string[] {
    const risks: string[] = [];
    
    if (criteria.technicalConstraints.timeline === 'urgent') {
      risks.push('Aggressive timeline may impact quality');
    }
    
    return risks;
  }

  /**
   * Assess budget risks
   */
  private assessBudgetRisks(criteria: any): string[] {
    const risks: string[] = [];
    
    if (criteria.technicalConstraints.budget === 'basic') {
      risks.push('Limited budget may restrict customization options');
    }
    
    return risks;
  }

  /**
   * Generate mitigation strategies
   */
  private generateMitigationStrategies(criteria: any): string[] {
    return [
      'Start with core features and iterate',
      'Use proven templates to reduce development risk',
      'Implement comprehensive testing before deployment',
    ];
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(criteria: any): string[] {
    return [
      'Consider phased rollout for complex features',
      'Implement analytics from day one',
      'Plan for scalability from the beginning',
    ];
  }

  /**
   * Generate template recommendations
   */
  private generateTemplateRecommendations(templateId: string, performance: TemplatePerformanceData): string[] {
    return [
      `Success rate: ${Math.round(performance.successRate * 100)}%`,
      `Average setup time: ${performance.averageSetupTime} hours`,
      `User satisfaction: ${Math.round(performance.userSatisfaction * 100)}%`,
    ];
  }

  /**
   * Get best use cases for template
   */
  private getBestUseCases(templateId: string): string[] {
    const useCases: Record<string, string[]> = {
      'consultation-mvp': [
        'Professional consultation services',
        'Coaching and mentoring programs',
        'Therapy and counseling services',
      ],
      'lead-form-pdf': [
        'Lead generation campaigns',
        'Document delivery systems',
        'Automated follow-up processes',
      ],
    };

    return useCases[templateId] || ['General business applications'];
  }

  /**
   * Generate success recommendations
   */
  private generateSuccessRecommendations(probability: number, factors: string[]): string[] {
    const recommendations: string[] = [];
    
    if (probability < 0.6) {
      recommendations.push('Consider adjusting requirements or timeline');
      recommendations.push('Plan for additional technical support');
    }
    
    if (factors.includes('Poor complexity match')) {
      recommendations.push('Consider a simpler template or extended timeline');
    }
    
    if (factors.includes('Timeline may be too aggressive')) {
      recommendations.push('Consider reducing initial feature scope');
    }
    
    return recommendations;
  }
}

/**
 * Global Template Intelligence Engine instance
 */
export const templateIntelligence = new TemplateIntelligenceEngine();

/**
 * Utility function to get intelligent template recommendations
 */
export async function getIntelligentTemplateRecommendations(criteria: TemplateSelectionCriteria) {
  const analysis = await templateIntelligence.analyzeTemplateSelection(criteria);
  const insights = analysis.recommendedTemplates.map(template => 
    templateIntelligence.getTemplateInsights(template.templateId)
  );
  
  return {
    analysis,
    insights,
    bestMatch: analysis.recommendedTemplates[0],
  };
}
