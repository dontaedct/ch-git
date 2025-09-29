/**
 * Dynamic Consultation Report Generation System
 *
 * Advanced report generation with personalized recommendations,
 * AI-enhanced content, and professional formatting for consultation reports.
 */

import type { ServicePackage, GeneratedConsultation, ConsultationData } from '@/lib/ai/consultation-generator';
import type { ServiceMatch, MatchingResult } from '@/lib/consultation/service-matcher';

export interface ReportTheme {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  logo_url?: string;
  brand_name?: string;
}

export interface ReportCustomization {
  theme: ReportTheme;
  include_branding: boolean;
  show_pricing: boolean;
  show_timeline: boolean;
  show_implementation_steps: boolean;
  include_case_studies: boolean;
  add_company_details: boolean;
  custom_footer?: string;
  watermark?: string;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
  required: boolean;
  template?: string;
}

export interface ConsultationReport {
  id: string;
  title: string;
  subtitle?: string;
  client_info: {
    name: string;
    company?: string;
    email?: string;
    industry?: string;
    generated_date: string;
  };
  executive_summary: string;
  sections: ReportSection[];
  recommendations: {
    primary: ServicePackage;
    alternatives: ServicePackage[];
    reasoning: string[];
  };
  implementation_roadmap: {
    phase_1: string[];
    phase_2: string[];
    phase_3: string[];
    timeline: string;
  };
  next_steps: string[];
  appendices?: {
    methodology: string;
    assumptions: string;
    disclaimers: string;
  };
  customization: ReportCustomization;
  metadata: {
    generated_by: string;
    template_version: string;
    consultation_score: number;
    estimated_read_time: number;
  };
}

/**
 * Dynamic consultation report generator with AI enhancement
 */
export class ConsultationReportGenerator {
  private defaultThemes: ReportTheme[] = [
    {
      id: 'professional',
      name: 'Professional Blue',
      primary_color: '#1e40af',
      secondary_color: '#3b82f6',
      accent_color: '#60a5fa',
      font_family: 'Inter, sans-serif'
    },
    {
      id: 'executive',
      name: 'Executive Gray',
      primary_color: '#374151',
      secondary_color: '#6b7280',
      accent_color: '#9ca3af',
      font_family: 'Inter, sans-serif'
    },
    {
      id: 'modern',
      name: 'Modern Green',
      primary_color: '#059669',
      secondary_color: '#10b981',
      accent_color: '#34d399',
      font_family: 'Inter, sans-serif'
    }
  ];

  /**
   * Generate comprehensive consultation report
   */
  async generateReport(
    consultation: GeneratedConsultation,
    matchingResult: MatchingResult,
    customization?: Partial<ReportCustomization>
  ): Promise<ConsultationReport> {
    const theme = customization?.theme || this.defaultThemes[0];
    const reportCustomization: ReportCustomization = {
      theme,
      include_branding: true,
      show_pricing: true,
      show_timeline: true,
      show_implementation_steps: true,
      include_case_studies: false,
      add_company_details: true,
      ...customization
    };

    const sections = this.generateReportSections(consultation, matchingResult);
    const roadmap = this.generateImplementationRoadmap(consultation.recommendations.primary_service);

    const report: ConsultationReport = {
      id: `report_${consultation.consultation_id}`,
      title: 'Business Consultation Report',
      subtitle: `Personalized Recommendations for ${consultation.client_name}`,
      client_info: {
        name: consultation.client_name,
        company: consultation.client_name, // Assuming client name is company for now
        generated_date: consultation.generated_at
      },
      executive_summary: consultation.executive_summary,
      sections,
      recommendations: {
        primary: consultation.recommendations.primary_service,
        alternatives: consultation.recommendations.alternative_services,
        reasoning: consultation.recommendations.key_insights
      },
      implementation_roadmap: roadmap,
      next_steps: consultation.action_items,
      appendices: this.generateAppendices(),
      customization: reportCustomization,
      metadata: {
        generated_by: 'AI Consultation Engine v2.0',
        template_version: '2.1.0',
        consultation_score: consultation.recommendations.consultation_score,
        estimated_read_time: this.estimateReadTime(sections)
      }
    };

    return report;
  }

  /**
   * Generate report from matching result only
   */
  async generateQuickReport(
    clientData: ConsultationData,
    matchingResult: MatchingResult,
    customization?: Partial<ReportCustomization>
  ): Promise<ConsultationReport> {
    const theme = customization?.theme || this.defaultThemes[0];
    const reportCustomization: ReportCustomization = {
      theme,
      include_branding: true,
      show_pricing: true,
      show_timeline: true,
      show_implementation_steps: true,
      include_case_studies: false,
      add_company_details: true,
      ...customization
    };

    const primaryMatch = matchingResult.primary_matches[0];
    const alternativeMatches = matchingResult.alternative_matches.slice(0, 3);

    const executiveSummary = this.generateExecutiveSummary(clientData, primaryMatch);
    const sections = this.generateQuickReportSections(clientData, matchingResult);
    const roadmap = this.generateImplementationRoadmap(primaryMatch.service);

    const report: ConsultationReport = {
      id: `quick_report_${clientData.id}`,
      title: 'Service Recommendation Report',
      subtitle: `Tailored Solutions for ${clientData.client_info.name || 'Your Business'}`,
      client_info: {
        name: clientData.client_info.name || 'Valued Client',
        company: clientData.client_info.company,
        email: clientData.client_info.email,
        industry: clientData.client_info.industry,
        generated_date: new Date().toISOString()
      },
      executive_summary: executiveSummary,
      sections,
      recommendations: {
        primary: primaryMatch.service,
        alternatives: alternativeMatches.map(m => m.service),
        reasoning: primaryMatch.match_reasons
      },
      implementation_roadmap: roadmap,
      next_steps: this.generateNextSteps(primaryMatch.service),
      appendices: this.generateAppendices(),
      customization: reportCustomization,
      metadata: {
        generated_by: 'AI Consultation Engine v2.0',
        template_version: '2.1.0',
        consultation_score: primaryMatch.match_score,
        estimated_read_time: this.estimateReadTime(sections)
      }
    };

    return report;
  }

  /**
   * Generate standard report sections
   */
  private generateReportSections(
    consultation: GeneratedConsultation,
    matchingResult: MatchingResult
  ): ReportSection[] {
    const sections: ReportSection[] = [
      {
        id: 'business_analysis',
        title: 'Business Analysis',
        content: this.generateBusinessAnalysis(consultation),
        order: 1,
        required: true
      },
      {
        id: 'key_insights',
        title: 'Key Insights',
        content: this.formatInsights(consultation.recommendations.key_insights),
        order: 2,
        required: true
      },
      {
        id: 'service_recommendations',
        title: 'Service Recommendations',
        content: this.generateServiceRecommendationsContent(consultation.recommendations),
        order: 3,
        required: true
      },
      {
        id: 'implementation_approach',
        title: 'Implementation Approach',
        content: this.generateImplementationContent(consultation.recommendations.primary_service),
        order: 4,
        required: true
      },
      {
        id: 'expected_outcomes',
        title: 'Expected Outcomes',
        content: this.generateOutcomesContent(consultation.recommendations.primary_service),
        order: 5,
        required: false
      }
    ];

    return sections;
  }

  /**
   * Generate quick report sections
   */
  private generateQuickReportSections(
    clientData: ConsultationData,
    matchingResult: MatchingResult
  ): ReportSection[] {
    const primaryMatch = matchingResult.primary_matches[0];

    const sections: ReportSection[] = [
      {
        id: 'assessment_summary',
        title: 'Assessment Summary',
        content: this.generateAssessmentSummary(clientData),
        order: 1,
        required: true
      },
      {
        id: 'matching_analysis',
        title: 'Service Matching Analysis',
        content: this.generateMatchingAnalysis(matchingResult),
        order: 2,
        required: true
      },
      {
        id: 'primary_recommendation',
        title: 'Primary Recommendation',
        content: this.generatePrimaryRecommendationContent(primaryMatch),
        order: 3,
        required: true
      },
      {
        id: 'alternative_options',
        title: 'Alternative Options',
        content: this.generateAlternativeOptionsContent(matchingResult.alternative_matches),
        order: 4,
        required: false
      }
    ];

    return sections;
  }

  /**
   * Generate executive summary for quick reports
   */
  private generateExecutiveSummary(clientData: ConsultationData, primaryMatch: ServiceMatch): string {
    const businessType = clientData.questionnaire_responses['business-type'] || 'business';
    const goals = clientData.questionnaire_responses['primary-goals'] || 'growth objectives';
    const confidence = Math.round(primaryMatch.match_score * 100);

    return `Based on your assessment responses, we've identified ${primaryMatch.service.title} as the optimal solution for your ${businessType}. This recommendation has a ${confidence}% compatibility score based on your specific needs and objectives. Our analysis indicates that this service package aligns closely with your ${goals} and offers the best pathway to achieving your desired outcomes.`;
  }

  /**
   * Generate business analysis content
   */
  private generateBusinessAnalysis(consultation: GeneratedConsultation): string {
    return `Our comprehensive analysis reveals several key factors influencing your business trajectory. ${consultation.recommendations.personalized_summary} The assessment indicates strong potential for growth through strategic service implementation, with particular emphasis on addressing current operational challenges while building sustainable competitive advantages.`;
  }

  /**
   * Format insights into readable content
   */
  private formatInsights(insights: string[]): string {
    return insights.map((insight, index) => `**${index + 1}. ${insight}**`).join('\n\n') +
           '\n\nThese insights form the foundation of our service recommendations and implementation strategy.';
  }

  /**
   * Generate service recommendations content
   */
  private generateServiceRecommendationsContent(recommendations: any): string {
    const primary = recommendations.primary_service;
    const reasoning = recommendations.reasoning.join(' ');

    return `**Primary Recommendation: ${primary.title}**\n\n${primary.description}\n\n**Why This Service Fits:**\n${reasoning}\n\n**Key Benefits:**\n${primary.includes.map((item: string) => `• ${item}`).join('\n')}\n\n**Investment Level:** ${primary.price_band || 'Contact for pricing'}\n**Timeline:** ${primary.timeline || 'Varies based on scope'}`;
  }

  /**
   * Generate implementation content
   */
  private generateImplementationContent(service: ServicePackage): string {
    return `Implementation of ${service.title} follows a structured approach designed to minimize disruption while maximizing impact. ${service.content.timeline || 'The timeline is tailored to your specific needs and operational constraints.'} ${service.content.next_steps || 'We begin with a comprehensive discovery phase to ensure all requirements are captured accurately.'}`;
  }

  /**
   * Generate expected outcomes content
   */
  private generateOutcomesContent(service: ServicePackage): string {
    return `${service.content.what_you_get || 'This service delivers measurable improvements across key business metrics.'} Clients typically see initial results within the first 30-60 days, with full benefits realized over the complete engagement timeline. Success metrics are established during the planning phase to ensure clear measurement of progress and achievement of objectives.`;
  }

  /**
   * Generate assessment summary
   */
  private generateAssessmentSummary(clientData: ConsultationData): string {
    const responses = clientData.questionnaire_responses;
    const businessType = responses['business-type'] || 'organization';
    const size = responses['company-size'] || 'growing business';
    const goals = responses['primary-goals'] || 'operational excellence';

    return `Assessment Overview: ${size} ${businessType} focused on ${goals}. The evaluation reveals specific opportunities for strategic improvement and growth acceleration through targeted service implementation.`;
  }

  /**
   * Generate matching analysis content
   */
  private generateMatchingAnalysis(matchingResult: MatchingResult): string {
    const totalEvaluated = matchingResult.total_services_evaluated;
    const primaryMatches = matchingResult.primary_matches.length;
    const confidence = Math.round(matchingResult.matching_confidence * 100);

    return `Our intelligent matching system evaluated ${totalEvaluated} service options, identifying ${primaryMatches} high-confidence matches with ${confidence}% overall matching accuracy. The analysis considered multiple factors including business size, industry, objectives, timeline, and budget constraints to ensure optimal service alignment.`;
  }

  /**
   * Generate primary recommendation content
   */
  private generatePrimaryRecommendationContent(primaryMatch: ServiceMatch): string {
    const service = primaryMatch.service;
    const score = Math.round(primaryMatch.match_score * 100);
    const reasons = primaryMatch.match_reasons.join('. ');

    return `**${service.title}** (${score}% Match)\n\n${service.description}\n\n**Match Reasoning:** ${reasons}\n\n**Service Tier:** ${service.tier.charAt(0).toUpperCase() + service.tier.slice(1)}\n**Estimated Timeline:** ${service.timeline || 'Customized to your needs'}`;
  }

  /**
   * Generate alternative options content
   */
  private generateAlternativeOptionsContent(alternatives: ServiceMatch[]): string {
    if (alternatives.length === 0) {
      return 'No suitable alternative options identified based on your current requirements.';
    }

    return alternatives.map(match => {
      const score = Math.round(match.match_score * 100);
      return `**${match.service.title}** (${score}% Match)\n${match.service.description}`;
    }).join('\n\n');
  }

  /**
   * Generate implementation roadmap
   */
  private generateImplementationRoadmap(service: ServicePackage): {
    phase_1: string[];
    phase_2: string[];
    phase_3: string[];
    timeline: string;
  } {
    return {
      phase_1: [
        'Initial consultation and requirements gathering',
        'Stakeholder alignment and project planning',
        'Resource allocation and team assignments'
      ],
      phase_2: [
        'Core implementation and system deployment',
        'Team training and knowledge transfer',
        'Progress monitoring and adjustments'
      ],
      phase_3: [
        'Performance optimization and fine-tuning',
        'Results measurement and reporting',
        'Ongoing support and maintenance planning'
      ],
      timeline: service.timeline || '8-12 weeks with milestone-based delivery'
    };
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(service: ServicePackage): string[] {
    return [
      service.content.next_steps || 'Schedule initial consultation to discuss requirements',
      'Review detailed proposal and service agreement',
      'Plan implementation timeline and resource allocation',
      'Begin engagement with project kickoff meeting'
    ];
  }

  /**
   * Generate appendices
   */
  private generateAppendices() {
    return {
      methodology: 'Our consultation methodology combines AI-powered analysis with expert human insight to deliver accurate, actionable recommendations tailored to your specific business context.',
      assumptions: 'Recommendations are based on information provided during the assessment process. Actual results may vary based on implementation approach, market conditions, and organizational factors.',
      disclaimers: 'This consultation report is provided for informational purposes and represents professional recommendations based on current assessment data. Final decisions should consider additional factors specific to your business situation.'
    };
  }

  /**
   * Estimate reading time based on content length
   */
  private estimateReadTime(sections: ReportSection[]): number {
    const totalWords = sections.reduce((acc, section) => {
      return acc + section.content.split(' ').length + section.title.split(' ').length;
    }, 0);

    // Assume 200 words per minute reading speed
    return Math.ceil(totalWords / 200);
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): ReportTheme[] {
    return [...this.defaultThemes];
  }

  /**
   * Create custom theme
   */
  createCustomTheme(themeData: Omit<ReportTheme, 'id'>): ReportTheme {
    return {
      id: `custom_${Date.now()}`,
      ...themeData
    };
  }
}

/**
 * Default report generator instance
 */
export const consultationReportGenerator = new ConsultationReportGenerator();

/**
 * Convenience functions for report generation
 */
export const reportGenerator = {
  generate: (consultation: GeneratedConsultation, matchingResult: MatchingResult, customization?: Partial<ReportCustomization>) =>
    consultationReportGenerator.generateReport(consultation, matchingResult, customization),

  generateQuick: (clientData: ConsultationData, matchingResult: MatchingResult, customization?: Partial<ReportCustomization>) =>
    consultationReportGenerator.generateQuickReport(clientData, matchingResult, customization),

  getThemes: () => consultationReportGenerator.getAvailableThemes(),

  createTheme: (themeData: Omit<ReportTheme, 'id'>) =>
    consultationReportGenerator.createCustomTheme(themeData)
};