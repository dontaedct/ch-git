/**
 * @fileoverview Questionnaire to PDF Pipeline
 * Integrates questionnaire responses with PDF generation system
 * HT-029.3.2 Implementation
 */

export interface QuestionnaireResponse {
  questionId: string;
  value: string | string[];
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ClientData {
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    company: string;
    role: string;
  };
  responses: QuestionnaireResponse[];
  submittedAt: Date;
  sessionId: string;
}

export interface ProcessedAssessment {
  businessProfile: {
    stage: string;
    size: string;
    revenue: string;
    industry?: string;
  };
  objectives: {
    primaryGoal: string;
    timeline: string;
    budget: string;
    challenges: string[];
  };
  assessment: {
    score: number;
    strengths: string[];
    opportunities: string[];
    threats: string[];
    recommendations: Recommendation[];
  };
  nextSteps: NextStep[];
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  timeline: string;
  expectedROI: string;
  category: string;
}

export interface NextStep {
  step: string;
  description: string;
  deadline: string;
  priority: number;
}

export interface PDFGenerationRequest {
  templateId: string;
  clientData: ClientData;
  assessment: ProcessedAssessment;
  customization?: {
    branding?: {
      logo?: string;
      colors?: {
        primary: string;
        secondary: string;
      };
    };
    sections?: string[];
    format?: 'A4' | 'Letter';
  };
  delivery?: {
    email?: boolean;
    webhook?: string;
    storage?: 'local' | 'cloud' | 'both';
  };
}

export interface PDFGenerationResult {
  success: boolean;
  pdfUrl?: string;
  filename?: string;
  metadata: {
    generatedAt: Date;
    templateUsed: string;
    pageCount: number;
    fileSize: number;
  };
  error?: string;
}

/**
 * Main pipeline class for processing questionnaire responses into PDF reports
 */
export class QuestionnairePDFPipeline {
  private static instance: QuestionnairePDFPipeline;

  public static getInstance(): QuestionnairePDFPipeline {
    if (!QuestionnairePDFPipeline.instance) {
      QuestionnairePDFPipeline.instance = new QuestionnairePDFPipeline();
    }
    return QuestionnairePDFPipeline.instance;
  }

  /**
   * Process questionnaire responses into structured assessment data
   */
  public processQuestionnaireResponses(clientData: ClientData): ProcessedAssessment {
    const responses = this.mapResponsesToObject(clientData.responses);

    const businessProfile = this.extractBusinessProfile(responses);
    const objectives = this.extractObjectives(responses);
    const assessment = this.generateAssessment(responses, businessProfile, objectives);
    const nextSteps = this.generateNextSteps(assessment);

    return {
      businessProfile,
      objectives,
      assessment,
      nextSteps
    };
  }

  /**
   * Generate PDF from processed assessment data
   */
  public async generatePDF(request: PDFGenerationRequest): Promise<PDFGenerationResult> {
    try {
      // Process the questionnaire responses
      const assessment = this.processQuestionnaireResponses(request.clientData);

      // Prepare PDF template data
      const templateData = this.prepareTemplateData(request.clientData, assessment);

      // Generate PDF (simulate PDF generation)
      const result = await this.simulatePDFGeneration(request, templateData);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          generatedAt: new Date(),
          templateUsed: request.templateId,
          pageCount: 0,
          fileSize: 0
        }
      };
    }
  }

  /**
   * Map array of responses to object for easier access
   */
  private mapResponsesToObject(responses: QuestionnaireResponse[]): Record<string, string | string[]> {
    const mapped: Record<string, string | string[]> = {};
    responses.forEach(response => {
      mapped[response.questionId] = response.value;
    });
    return mapped;
  }

  /**
   * Extract business profile information from responses
   */
  private extractBusinessProfile(responses: Record<string, string | string[]>): ProcessedAssessment['businessProfile'] {
    return {
      stage: this.getStringValue(responses['business-stage']) || 'Not specified',
      size: this.getStringValue(responses['business-size']) || 'Not specified',
      revenue: this.getStringValue(responses['business-revenue']) || 'Not specified',
      industry: this.getStringValue(responses['business-industry']) || 'Technology'
    };
  }

  /**
   * Extract objectives and goals from responses
   */
  private extractObjectives(responses: Record<string, string | string[]>): ProcessedAssessment['objectives'] {
    const challenges = this.getArrayValue(responses['challenges']) || [];

    return {
      primaryGoal: this.getStringValue(responses['primary-goal']) || 'Business growth',
      timeline: this.getStringValue(responses['timeline']) || 'Short term',
      budget: this.getStringValue(responses['budget']) || 'Not specified',
      challenges: Array.isArray(challenges) ? challenges : [challenges].filter(Boolean)
    };
  }

  /**
   * Generate business assessment and recommendations
   */
  private generateAssessment(
    responses: Record<string, string | string[]>,
    businessProfile: ProcessedAssessment['businessProfile'],
    objectives: ProcessedAssessment['objectives']
  ): ProcessedAssessment['assessment'] {
    // Calculate business score based on responses
    const score = this.calculateBusinessScore(responses, businessProfile);

    // Generate SWOT analysis
    const { strengths, opportunities, threats } = this.generateSWOTAnalysis(businessProfile, objectives);

    // Generate recommendations
    const recommendations = this.generateRecommendations(businessProfile, objectives, score);

    return {
      score,
      strengths,
      opportunities,
      threats,
      recommendations
    };
  }

  /**
   * Calculate business score based on responses and profile
   */
  private calculateBusinessScore(
    responses: Record<string, string | string[]>,
    profile: ProcessedAssessment['businessProfile']
  ): number {
    let score = 50; // Base score

    // Stage scoring
    const stageScores = { 'startup': 10, 'growth': 20, 'established': 25, 'enterprise': 30 };
    score += stageScores[profile.stage as keyof typeof stageScores] || 10;

    // Revenue scoring
    const revenueScores = {
      'pre-revenue': 5,
      '<100k': 10,
      '100k-500k': 15,
      '500k-1m': 20,
      '1m-5m': 25,
      '5m+': 30
    };
    score += revenueScores[profile.revenue as keyof typeof revenueScores] || 5;

    // Adjust based on goals and challenges
    const primaryGoal = this.getStringValue(responses['primary-goal']);
    if (primaryGoal === 'revenue') score += 5;
    if (primaryGoal === 'efficiency') score += 3;

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Generate SWOT analysis based on business profile and objectives
   */
  private generateSWOTAnalysis(
    profile: ProcessedAssessment['businessProfile'],
    objectives: ProcessedAssessment['objectives']
  ) {
    const strengths = [
      'Established business operations',
      'Clear growth objectives',
      'Committed leadership team'
    ];

    const opportunities = [
      'Market expansion potential',
      'Process optimization opportunities',
      'Technology adoption benefits',
      'Strategic partnership possibilities'
    ];

    const threats = [
      'Increasing market competition',
      'Economic uncertainty',
      'Technology disruption risks'
    ];

    // Customize based on business stage
    if (profile.stage === 'startup') {
      strengths.push('Agility and innovation focus');
      opportunities.push('First-mover advantage potential');
      threats.push('Limited resources and funding challenges');
    } else if (profile.stage === 'established') {
      strengths.push('Market presence and customer base');
      opportunities.push('Operational efficiency improvements');
      threats.push('Market saturation risks');
    }

    return { strengths, opportunities, threats };
  }

  /**
   * Generate tailored recommendations based on assessment
   */
  private generateRecommendations(
    profile: ProcessedAssessment['businessProfile'],
    objectives: ProcessedAssessment['objectives'],
    score: number
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Lead generation recommendation
    if (objectives.challenges.includes('leads') || objectives.primaryGoal === 'revenue') {
      recommendations.push({
        title: 'Implement Advanced Lead Generation System',
        description: 'Deploy multi-channel lead generation strategy with automated nurturing and conversion optimization.',
        priority: 'high',
        impact: 'high',
        effort: 'medium',
        timeline: '4-6 weeks',
        expectedROI: '300-500%',
        category: 'Sales & Marketing'
      });
    }

    // Process optimization
    if (objectives.challenges.includes('operations') || score < 70) {
      recommendations.push({
        title: 'Operational Process Optimization',
        description: 'Streamline core business processes and implement automation to improve efficiency and reduce costs.',
        priority: 'medium',
        impact: 'medium',
        effort: 'low',
        timeline: '2-3 weeks',
        expectedROI: '150-250%',
        category: 'Operations'
      });
    }

    // Technology upgrade
    if (profile.stage === 'established' || objectives.challenges.includes('technology')) {
      recommendations.push({
        title: 'Technology Infrastructure Upgrade',
        description: 'Modernize technology stack and implement digital tools to enhance productivity and competitiveness.',
        priority: 'medium',
        impact: 'high',
        effort: 'high',
        timeline: '8-12 weeks',
        expectedROI: '200-400%',
        category: 'Technology'
      });
    }

    // Team development
    if (objectives.challenges.includes('team') || profile.size === '11-50') {
      recommendations.push({
        title: 'Team Development & Training Program',
        description: 'Implement structured training and development programs to enhance team capabilities and retention.',
        priority: 'low',
        impact: 'medium',
        effort: 'medium',
        timeline: '6-8 weeks',
        expectedROI: '100-200%',
        category: 'Human Resources'
      });
    }

    return recommendations;
  }

  /**
   * Generate next steps based on assessment
   */
  private generateNextSteps(assessment: ProcessedAssessment['assessment']): NextStep[] {
    const nextSteps: NextStep[] = [
      {
        step: 'Strategy Review Session',
        description: 'Schedule detailed discussion of recommendations and implementation priorities',
        deadline: 'Within 3 business days',
        priority: 1
      },
      {
        step: 'Quick Wins Implementation',
        description: 'Begin immediate implementation of high-impact, low-effort improvements',
        deadline: 'Within 1 week',
        priority: 2
      }
    ];

    // Add specific next steps based on high-priority recommendations
    const highPriorityRecs = assessment.recommendations.filter(rec => rec.priority === 'high');

    highPriorityRecs.forEach((rec, index) => {
      nextSteps.push({
        step: `${rec.category} Implementation`,
        description: `Begin implementation of ${rec.title.toLowerCase()}`,
        deadline: `Within ${2 + index} weeks`,
        priority: 3 + index
      });
    });

    return nextSteps;
  }

  /**
   * Prepare template data for PDF generation
   */
  private prepareTemplateData(clientData: ClientData, assessment: ProcessedAssessment): Record<string, any> {
    return {
      // Client information
      clientName: clientData.contactInfo.name,
      clientEmail: clientData.contactInfo.email,
      companyName: clientData.contactInfo.company,
      clientRole: clientData.contactInfo.role,

      // Assessment data
      businessScore: assessment.assessment.score,
      businessStage: assessment.businessProfile.stage,
      revenueRange: assessment.businessProfile.revenue,
      companySize: assessment.businessProfile.size,

      // SWOT analysis
      strengths: assessment.assessment.strengths,
      opportunities: assessment.assessment.opportunities,
      threats: assessment.assessment.threats,

      // Recommendations
      recommendations: assessment.assessment.recommendations,
      highPriorityRecommendations: assessment.assessment.recommendations.filter(r => r.priority === 'high'),

      // Next steps
      nextSteps: assessment.nextSteps,

      // Metadata
      generatedDate: new Date().toLocaleDateString(),
      consultantName: 'Business Solutions Team',

      // Calculated metrics
      expectedROI: this.calculateAverageROI(assessment.assessment.recommendations),
      implementationTimeline: this.calculateImplementationTimeline(assessment.assessment.recommendations),
      totalRecommendations: assessment.assessment.recommendations.length
    };
  }

  /**
   * Simulate PDF generation (in real implementation, this would call actual PDF library)
   */
  private async simulatePDFGeneration(
    request: PDFGenerationRequest,
    templateData: Record<string, any>
  ): Promise<PDFGenerationResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const filename = `consultation-report-${templateData.companyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;

    return {
      success: true,
      pdfUrl: `/generated-pdfs/${filename}`,
      filename,
      metadata: {
        generatedAt: new Date(),
        templateUsed: request.templateId,
        pageCount: 12,
        fileSize: 1024 * 1024 * 2.5 // 2.5MB
      }
    };
  }

  /**
   * Helper methods
   */
  private getStringValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0];
    return value;
  }

  private getArrayValue(value: string | string[] | undefined): string[] | undefined {
    if (typeof value === 'string') return [value];
    return value;
  }

  private calculateAverageROI(recommendations: Recommendation[]): string {
    const roiValues = recommendations.map(rec => {
      const match = rec.expectedROI.match(/(\d+)-(\d+)%/);
      if (match) {
        return (parseInt(match[1]) + parseInt(match[2])) / 2;
      }
      return 0;
    });

    const average = roiValues.reduce((sum, val) => sum + val, 0) / roiValues.length;
    return `${Math.round(average)}%`;
  }

  private calculateImplementationTimeline(recommendations: Recommendation[]): string {
    const timelines = recommendations.map(rec => {
      const match = rec.timeline.match(/(\d+)-(\d+)\s+weeks/);
      if (match) {
        return (parseInt(match[1]) + parseInt(match[2])) / 2;
      }
      return 4; // Default to 4 weeks
    });

    const average = timelines.reduce((sum, val) => sum + val, 0) / timelines.length;
    return `${Math.round(average)} weeks`;
  }
}

// Export singleton instance
export const questionnairePDFPipeline = QuestionnairePDFPipeline.getInstance();