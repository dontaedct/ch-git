/**
 * Service Package Matching Logic
 *
 * Intelligent matching of client needs with available service packages
 * based on questionnaire responses, business criteria, and ML scoring.
 */

import type { ServicePackage } from '@/lib/ai/consultation-generator';

export interface MatchingCriteria {
  business_type?: string[];
  company_size?: string[];
  industry?: string[];
  budget_range?: string[];
  timeline?: string[];
  primary_goals?: string[];
  complexity_level?: string[];
}

export interface ServiceMatch {
  service: ServicePackage;
  match_score: number;
  match_reasons: string[];
  confidence_level: 'high' | 'medium' | 'low';
  recommendation_type: 'primary' | 'alternative' | 'consider';
}

export interface MatchingResult {
  primary_matches: ServiceMatch[];
  alternative_matches: ServiceMatch[];
  all_matches: ServiceMatch[];
  total_services_evaluated: number;
  matching_confidence: number;
}

/**
 * Service package matching engine with intelligent scoring
 */
export class ServiceMatcher {
  private readonly scoreWeights = {
    business_type: 0.25,
    company_size: 0.20,
    industry: 0.15,
    budget_range: 0.15,
    timeline: 0.10,
    primary_goals: 0.10,
    complexity_level: 0.05
  };

  /**
   * Find best matching services for client needs
   */
  findMatches(
    responses: Record<string, unknown>,
    availableServices: ServicePackage[],
    maxResults: number = 5
  ): MatchingResult {
    const matches = availableServices.map(service =>
      this.evaluateServiceMatch(service, responses)
    );

    // Sort by match score descending
    matches.sort((a, b) => b.match_score - a.match_score);

    // Categorize matches
    const primaryMatches = matches.filter(m => m.match_score >= 0.7 && m.confidence_level === 'high');
    const alternativeMatches = matches.filter(m => m.match_score >= 0.5 && m.match_score < 0.7);

    // Calculate overall matching confidence
    const avgScore = matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length;
    const matchingConfidence = Math.min(avgScore * 1.2, 1.0); // Boost slightly for confidence

    return {
      primary_matches: primaryMatches.slice(0, Math.min(3, maxResults)),
      alternative_matches: alternativeMatches.slice(0, Math.min(maxResults - primaryMatches.length, 5)),
      all_matches: matches.slice(0, maxResults),
      total_services_evaluated: availableServices.length,
      matching_confidence
    };
  }

  /**
   * Evaluate how well a service matches client needs
   */
  private evaluateServiceMatch(service: ServicePackage, responses: Record<string, unknown>): ServiceMatch {
    const scores: Record<string, number> = {};
    const reasons: string[] = [];

    // Evaluate each criteria
    Object.entries(this.scoreWeights).forEach(([criteria, weight]) => {
      const score = this.evaluateCriteria(criteria, service, responses, reasons);
      scores[criteria] = score * weight;
    });

    // Calculate total weighted score
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    // Determine confidence level
    const confidenceLevel = this.determineConfidenceLevel(totalScore, scores);

    // Determine recommendation type
    const recommendationType = this.determineRecommendationType(totalScore, confidenceLevel);

    return {
      service,
      match_score: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
      match_reasons: reasons,
      confidence_level: confidenceLevel,
      recommendation_type: recommendationType
    };
  }

  /**
   * Evaluate specific criteria against service package
   */
  private evaluateCriteria(
    criteria: string,
    service: ServicePackage,
    responses: Record<string, unknown>,
    reasons: string[]
  ): number {
    const clientValue = responses[criteria.replace('_', '-')] || responses[criteria];

    switch (criteria) {
      case 'business_type':
        return this.evaluateBusinessType(service, clientValue, reasons);

      case 'company_size':
        return this.evaluateCompanySize(service, clientValue, reasons);

      case 'industry':
        return this.evaluateIndustry(service, clientValue, reasons);

      case 'budget_range':
        return this.evaluateBudget(service, clientValue, reasons);

      case 'timeline':
        return this.evaluateTimeline(service, clientValue, reasons);

      case 'primary_goals':
        return this.evaluateGoals(service, clientValue, reasons);

      case 'complexity_level':
        return this.evaluateComplexity(service, clientValue, reasons);

      default:
        return 0.5; // Neutral score for unknown criteria
    }
  }

  /**
   * Evaluate business type match
   */
  private evaluateBusinessType(service: ServicePackage, clientValue: unknown, reasons: string[]): number {
    if (!clientValue) return 0.5;

    const clientBusinessType = String(clientValue).toLowerCase();
    const serviceIndustries = service.industry_tags.map(tag => tag.toLowerCase());

    // Direct industry match
    if (serviceIndustries.some(industry => industry.includes(clientBusinessType))) {
      reasons.push(`Service specializes in ${clientBusinessType} businesses`);
      return 1.0;
    }

    // Partial match for related industries
    const relatedMatches = this.findRelatedIndustries(clientBusinessType, serviceIndustries);
    if (relatedMatches.length > 0) {
      reasons.push(`Service experience with related industries: ${relatedMatches.join(', ')}`);
      return 0.7;
    }

    // Universal services
    if (serviceIndustries.includes('universal') || serviceIndustries.includes('all')) {
      reasons.push('Service suitable for all business types');
      return 0.6;
    }

    return 0.3;
  }

  /**
   * Evaluate company size compatibility
   */
  private evaluateCompanySize(service: ServicePackage, clientValue: unknown, reasons: string[]): number {
    if (!clientValue) return 0.5;

    const clientSize = String(clientValue).toLowerCase();
    const serviceTier = service.tier;

    // Map company sizes to service tiers
    const sizeToTierMap: Record<string, string[]> = {
      'startup': ['foundation'],
      'small': ['foundation', 'growth'],
      'medium': ['growth', 'enterprise'],
      'large': ['enterprise'],
      'enterprise': ['enterprise']
    };

    const compatibleTiers = sizeToTierMap[clientSize] || ['foundation', 'growth', 'enterprise'];

    if (compatibleTiers.includes(serviceTier)) {
      reasons.push(`Service tier (${serviceTier}) matches company size (${clientSize})`);
      return 1.0;
    }

    // Partial compatibility
    if (serviceTier === 'growth') {
      reasons.push('Growth tier service offers good scalability');
      return 0.7;
    }

    return 0.4;
  }

  /**
   * Evaluate industry alignment
   */
  private evaluateIndustry(service: ServicePackage, clientValue: unknown, reasons: string[]): number {
    if (!clientValue) return 0.5;

    const clientIndustry = String(clientValue).toLowerCase();
    const serviceIndustries = service.industry_tags.map(tag => tag.toLowerCase());

    if (serviceIndustries.includes(clientIndustry)) {
      reasons.push(`Direct industry match: ${clientIndustry}`);
      return 1.0;
    }

    const relatedIndustries = this.findRelatedIndustries(clientIndustry, serviceIndustries);
    if (relatedIndustries.length > 0) {
      reasons.push(`Related industry experience: ${relatedIndustries.join(', ')}`);
      return 0.8;
    }

    if (serviceIndustries.includes('universal') || serviceIndustries.includes('cross-industry')) {
      reasons.push('Cross-industry service suitable for your sector');
      return 0.6;
    }

    return 0.3;
  }

  /**
   * Evaluate budget compatibility
   */
  private evaluateBudget(service: ServicePackage, clientValue: unknown, reasons: string[]): number {
    if (!clientValue || !service.price_band) return 0.5;

    const clientBudget = String(clientValue).toLowerCase();
    const servicePricing = service.price_band.toLowerCase();

    // Simple budget matching logic
    const budgetCompatibility: Record<string, string[]> = {
      'low': ['$', '$$', 'starter', 'basic'],
      'medium': ['$$', '$$$', 'professional', 'standard'],
      'high': ['$$$', '$$$$', 'premium', 'enterprise'],
      'enterprise': ['$$$$', 'enterprise', 'custom']
    };

    const compatiblePricing = budgetCompatibility[clientBudget] || [];

    if (compatiblePricing.some(price => servicePricing.includes(price))) {
      reasons.push(`Service pricing aligns with ${clientBudget} budget`);
      return 1.0;
    }

    return 0.4;
  }

  /**
   * Evaluate timeline compatibility
   */
  private evaluateTimeline(service: ServicePackage, clientValue: unknown, reasons: string[]): number {
    if (!clientValue || !service.timeline) return 0.5;

    const clientTimeline = String(clientValue).toLowerCase();
    const serviceTimeline = service.timeline.toLowerCase();

    // Timeline compatibility logic
    if (clientTimeline.includes('immediate') || clientTimeline.includes('urgent')) {
      if (serviceTimeline.includes('week') || serviceTimeline.includes('fast')) {
        reasons.push('Service offers rapid implementation');
        return 1.0;
      }
      return 0.3;
    }

    if (clientTimeline.includes('month')) {
      if (serviceTimeline.includes('month') || serviceTimeline.includes('week')) {
        reasons.push('Service timeline matches your requirements');
        return 1.0;
      }
      return 0.7;
    }

    return 0.6; // Default compatibility
  }

  /**
   * Evaluate goal alignment
   */
  private evaluateGoals(service: ServicePackage, clientValue: unknown, reasons: string[]): number {
    if (!clientValue) return 0.5;

    const clientGoals = Array.isArray(clientValue) ? clientValue : [clientValue];
    const serviceDescription = service.description.toLowerCase();
    const serviceIncludes = service.includes.join(' ').toLowerCase();

    let matchCount = 0;
    const matchedGoals: string[] = [];

    clientGoals.forEach(goal => {
      const goalStr = String(goal).toLowerCase();
      if (serviceDescription.includes(goalStr) || serviceIncludes.includes(goalStr)) {
        matchCount++;
        matchedGoals.push(goalStr);
      }
    });

    if (matchCount > 0) {
      reasons.push(`Service addresses your goals: ${matchedGoals.join(', ')}`);
      return Math.min(matchCount / clientGoals.length * 1.2, 1.0);
    }

    return 0.4;
  }

  /**
   * Evaluate complexity alignment
   */
  private evaluateComplexity(service: ServicePackage, clientValue: unknown, reasons: string[]): number {
    if (!clientValue) return 0.5;

    const clientComplexity = String(clientValue).toLowerCase();
    const serviceTier = service.tier;

    const complexityToTier: Record<string, string[]> = {
      'simple': ['foundation'],
      'moderate': ['foundation', 'growth'],
      'complex': ['growth', 'enterprise'],
      'very complex': ['enterprise']
    };

    const compatibleTiers = complexityToTier[clientComplexity] || ['foundation', 'growth'];

    if (compatibleTiers.includes(serviceTier)) {
      reasons.push(`Service complexity level matches your needs`);
      return 1.0;
    }

    return 0.5;
  }

  /**
   * Find related industries for partial matching
   */
  private findRelatedIndustries(clientIndustry: string, serviceIndustries: string[]): string[] {
    const industryRelations: Record<string, string[]> = {
      'technology': ['software', 'saas', 'tech', 'digital'],
      'healthcare': ['medical', 'pharma', 'health'],
      'finance': ['fintech', 'banking', 'investment'],
      'retail': ['ecommerce', 'commerce', 'sales'],
      'manufacturing': ['industrial', 'production']
    };

    const related = industryRelations[clientIndustry] || [];
    return serviceIndustries.filter(service =>
      related.some(rel => service.includes(rel))
    );
  }

  /**
   * Determine confidence level based on score and criteria coverage
   */
  private determineConfidenceLevel(totalScore: number, scores: Record<string, number>): 'high' | 'medium' | 'low' {
    const criteriaWithGoodScores = Object.values(scores).filter(score => score > 0.1).length;
    const criteriaPercentage = criteriaWithGoodScores / Object.keys(scores).length;

    if (totalScore >= 0.7 && criteriaPercentage >= 0.6) {
      return 'high';
    } else if (totalScore >= 0.5 && criteriaPercentage >= 0.4) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Determine recommendation type based on score and confidence
   */
  private determineRecommendationType(
    score: number,
    confidence: 'high' | 'medium' | 'low'
  ): 'primary' | 'alternative' | 'consider' {
    if (score >= 0.7 && confidence === 'high') {
      return 'primary';
    } else if (score >= 0.5) {
      return 'alternative';
    } else {
      return 'consider';
    }
  }
}

/**
 * Default service matcher instance
 */
export const serviceMatcher = new ServiceMatcher();

/**
 * Convenience function for finding service matches
 */
export function findServiceMatches(
  responses: Record<string, unknown>,
  services: ServicePackage[],
  maxResults?: number
): MatchingResult {
  return serviceMatcher.findMatches(responses, services, maxResults);
}