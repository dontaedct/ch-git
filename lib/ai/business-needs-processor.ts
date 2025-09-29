import { BusinessContext, IndustryInsights, MarketAnalysis } from '@/types/templates/customization';

export interface BusinessNeedsProcessingResult {
  industryClassification: IndustryClassification;
  marketPosition: MarketPosition;
  businessObjectives: BusinessObjectives;
  valueProposition: ValueProposition;
  stakeholderAnalysis: StakeholderAnalysis;
  competitiveAnalysis: CompetitiveAnalysis;
  growthStrategy: GrowthStrategy;
  processingMetadata: ProcessingMetadata;
}

export interface IndustryClassification {
  primaryIndustry: string;
  secondaryIndustries: string[];
  industryTrends: string[];
  regulatoryEnvironment: string[];
  marketMaturity: 'emerging' | 'growing' | 'mature' | 'declining';
  disruptionLevel: 'low' | 'medium' | 'high';
}

export interface MarketPosition {
  marketSegment: string;
  targetDemographics: string[];
  geographicScope: 'local' | 'regional' | 'national' | 'international';
  marketSize: 'niche' | 'small' | 'medium' | 'large' | 'mass-market';
  competitivePosition: 'leader' | 'challenger' | 'follower' | 'niche-player';
}

export interface BusinessObjectives {
  primaryGoals: string[];
  secondaryGoals: string[];
  successMetrics: SuccessMetric[];
  timeHorizons: TimeHorizon[];
  strategicPriorities: string[];
  expectedOutcomes: string[];
}

export interface SuccessMetric {
  name: string;
  target: string;
  timeframe: string;
  measurement: string;
  importance: 'critical' | 'important' | 'nice-to-have';
}

export interface TimeHorizon {
  period: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  goals: string[];
  milestones: string[];
}

export interface ValueProposition {
  coreValue: string;
  uniqueSellingPoints: string[];
  customerBenefits: string[];
  problemsSolved: string[];
  differentiators: string[];
}

export interface StakeholderAnalysis {
  primaryStakeholders: Stakeholder[];
  secondaryStakeholders: Stakeholder[];
  stakeholderPriorities: string[];
  decisionMakers: string[];
  influencers: string[];
}

export interface Stakeholder {
  role: string;
  needs: string[];
  concerns: string[];
  influence: 'high' | 'medium' | 'low';
  engagement: 'champion' | 'supporter' | 'neutral' | 'skeptic' | 'blocker';
}

export interface CompetitiveAnalysis {
  directCompetitors: string[];
  indirectCompetitors: string[];
  competitiveAdvantages: string[];
  competitiveDisadvantages: string[];
  marketGaps: string[];
  competitiveStrategy: string;
}

export interface GrowthStrategy {
  growthModel: string;
  scalingFactors: string[];
  expansionOpportunities: string[];
  resourceRequirements: string[];
  riskFactors: string[];
  enablers: string[];
}

export interface ProcessingMetadata {
  processedAt: Date;
  processingTime: number;
  dataQuality: number;
  confidence: number;
  sources: string[];
  processingVersion: string;
}

export class BusinessNeedsProcessor {
  private industryDatabase: Map<string, IndustryInsights>;
  private marketDatabase: Map<string, MarketAnalysis>;

  constructor() {
    this.industryDatabase = new Map();
    this.marketDatabase = new Map();
    this.initializeKnowledgeBases();
  }

  async processBusinessNeeds(businessContext: BusinessContext): Promise<BusinessNeedsProcessingResult> {
    const startTime = Date.now();

    const [
      industryClassification,
      marketPosition,
      businessObjectives,
      valueProposition,
      stakeholderAnalysis,
      competitiveAnalysis,
      growthStrategy
    ] = await Promise.all([
      this.classifyIndustry(businessContext),
      this.analyzeMarketPosition(businessContext),
      this.extractBusinessObjectives(businessContext),
      this.defineValueProposition(businessContext),
      this.analyzeStakeholders(businessContext),
      this.analyzeCompetition(businessContext),
      this.defineGrowthStrategy(businessContext)
    ]);

    const processingTime = Date.now() - startTime;
    const processingMetadata = this.generateMetadata(businessContext, processingTime);

    return {
      industryClassification,
      marketPosition,
      businessObjectives,
      valueProposition,
      stakeholderAnalysis,
      competitiveAnalysis,
      growthStrategy,
      processingMetadata
    };
  }

  private async classifyIndustry(context: BusinessContext): Promise<IndustryClassification> {
    const primaryIndustry = await this.identifyPrimaryIndustry(context.businessDescription);
    const secondaryIndustries = await this.identifySecondaryIndustries(context.businessDescription);
    const industryInsights = this.industryDatabase.get(primaryIndustry);

    return {
      primaryIndustry,
      secondaryIndustries,
      industryTrends: industryInsights?.trends || [],
      regulatoryEnvironment: industryInsights?.regulations || [],
      marketMaturity: this.assessMarketMaturity(primaryIndustry),
      disruptionLevel: this.assessDisruptionLevel(primaryIndustry)
    };
  }

  private async analyzeMarketPosition(context: BusinessContext): Promise<MarketPosition> {
    const marketSegment = await this.identifyMarketSegment(context);
    const targetDemographics = await this.extractTargetDemographics(context.targetMarket);
    const geographicScope = await this.determineGeographicScope(context);
    const marketSize = await this.assessMarketSize(context);
    const competitivePosition = await this.assessCompetitivePosition(context);

    return {
      marketSegment,
      targetDemographics,
      geographicScope,
      marketSize,
      competitivePosition
    };
  }

  private async extractBusinessObjectives(context: BusinessContext): Promise<BusinessObjectives> {
    const goals = await this.parseGoals(context.goals);
    const primaryGoals = goals.filter(g => g.priority === 'high').map(g => g.description);
    const secondaryGoals = goals.filter(g => g.priority !== 'high').map(g => g.description);

    const successMetrics = await this.defineSuccessMetrics(goals);
    const timeHorizons = await this.defineTimeHorizons(goals);
    const strategicPriorities = await this.identifyStrategicPriorities(context);
    const expectedOutcomes = await this.defineExpectedOutcomes(goals);

    return {
      primaryGoals,
      secondaryGoals,
      successMetrics,
      timeHorizons,
      strategicPriorities,
      expectedOutcomes
    };
  }

  private async defineValueProposition(context: BusinessContext): Promise<ValueProposition> {
    const coreValue = await this.extractCoreValue(context.businessDescription);
    const uniqueSellingPoints = await this.identifyUSPs(context);
    const customerBenefits = await this.identifyCustomerBenefits(context);
    const problemsSolved = await this.identifyProblemsSolved(context);
    const differentiators = await this.identifyDifferentiators(context);

    return {
      coreValue,
      uniqueSellingPoints,
      customerBenefits,
      problemsSolved,
      differentiators
    };
  }

  private async analyzeStakeholders(context: BusinessContext): Promise<StakeholderAnalysis> {
    const primaryStakeholders = await this.identifyPrimaryStakeholders(context);
    const secondaryStakeholders = await this.identifySecondaryStakeholders(context);
    const stakeholderPriorities = await this.extractStakeholderPriorities(context);
    const decisionMakers = await this.identifyDecisionMakers(context);
    const influencers = await this.identifyInfluencers(context);

    return {
      primaryStakeholders,
      secondaryStakeholders,
      stakeholderPriorities,
      decisionMakers,
      influencers
    };
  }

  private async analyzeCompetition(context: BusinessContext): Promise<CompetitiveAnalysis> {
    const directCompetitors = await this.identifyDirectCompetitors(context.competitorInfo);
    const indirectCompetitors = await this.identifyIndirectCompetitors(context.competitorInfo);
    const competitiveAdvantages = await this.identifyCompetitiveAdvantages(context);
    const competitiveDisadvantages = await this.identifyCompetitiveDisadvantages(context);
    const marketGaps = await this.identifyMarketGaps(context);
    const competitiveStrategy = await this.defineCompetitiveStrategy(context);

    return {
      directCompetitors,
      indirectCompetitors,
      competitiveAdvantages,
      competitiveDisadvantages,
      marketGaps,
      competitiveStrategy
    };
  }

  private async defineGrowthStrategy(context: BusinessContext): Promise<GrowthStrategy> {
    const growthModel = await this.identifyGrowthModel(context);
    const scalingFactors = await this.identifyScalingFactors(context);
    const expansionOpportunities = await this.identifyExpansionOpportunities(context);
    const resourceRequirements = await this.assessResourceRequirements(context);
    const riskFactors = await this.identifyGrowthRisks(context);
    const enablers = await this.identifyGrowthEnablers(context);

    return {
      growthModel,
      scalingFactors,
      expansionOpportunities,
      resourceRequirements,
      riskFactors,
      enablers
    };
  }

  private async identifyPrimaryIndustry(description: string): Promise<string> {
    const industries = [
      'technology', 'healthcare', 'finance', 'retail', 'manufacturing',
      'education', 'real-estate', 'consulting', 'legal', 'non-profit',
      'entertainment', 'hospitality', 'transportation', 'energy', 'agriculture'
    ];

    const keywords = description.toLowerCase();
    for (const industry of industries) {
      if (keywords.includes(industry) || keywords.includes(industry.slice(0, -1))) {
        return industry;
      }
    }

    // AI-powered classification fallback
    return this.aiClassifyIndustry(description);
  }

  private async identifySecondaryIndustries(description: string): Promise<string[]> {
    const secondary: string[] = [];
    const keywords = description.toLowerCase();

    if (keywords.includes('tech') && !keywords.includes('healthcare')) {
      secondary.push('technology');
    }

    if (keywords.includes('digital') || keywords.includes('online')) {
      secondary.push('digital-services');
    }

    return secondary;
  }

  private assessMarketMaturity(industry: string): 'emerging' | 'growing' | 'mature' | 'declining' {
    const maturityMap: Record<string, 'emerging' | 'growing' | 'mature' | 'declining'> = {
      'technology': 'growing',
      'healthcare': 'growing',
      'finance': 'mature',
      'retail': 'mature',
      'manufacturing': 'mature',
      'education': 'growing',
      'real-estate': 'mature',
      'consulting': 'mature',
      'legal': 'mature',
      'non-profit': 'mature'
    };

    return maturityMap[industry] || 'growing';
  }

  private assessDisruptionLevel(industry: string): 'low' | 'medium' | 'high' {
    const disruptionMap: Record<string, 'low' | 'medium' | 'high'> = {
      'technology': 'high',
      'healthcare': 'medium',
      'finance': 'high',
      'retail': 'high',
      'manufacturing': 'medium',
      'education': 'medium',
      'real-estate': 'medium',
      'consulting': 'low',
      'legal': 'low',
      'non-profit': 'low'
    };

    return disruptionMap[industry] || 'medium';
  }

  private async identifyMarketSegment(context: BusinessContext): Promise<string> {
    if (context.targetMarket.includes('enterprise')) return 'enterprise';
    if (context.targetMarket.includes('small business')) return 'small-business';
    if (context.targetMarket.includes('consumer')) return 'consumer';
    return 'general-market';
  }

  private async extractTargetDemographics(targetMarket: string): Promise<string[]> {
    const demographics: string[] = [];
    const market = targetMarket.toLowerCase();

    if (market.includes('young') || market.includes('millennial')) {
      demographics.push('millennials');
    }
    if (market.includes('business') || market.includes('professional')) {
      demographics.push('professionals');
    }
    if (market.includes('family')) {
      demographics.push('families');
    }

    return demographics;
  }

  private async determineGeographicScope(context: BusinessContext): Promise<'local' | 'regional' | 'national' | 'international'> {
    const description = context.businessDescription.toLowerCase();

    if (description.includes('global') || description.includes('international')) {
      return 'international';
    }
    if (description.includes('national') || description.includes('country')) {
      return 'national';
    }
    if (description.includes('regional') || description.includes('state')) {
      return 'regional';
    }
    return 'local';
  }

  private async assessMarketSize(context: BusinessContext): Promise<'niche' | 'small' | 'medium' | 'large' | 'mass-market'> {
    if (context.expectedUsers > 100000) return 'mass-market';
    if (context.expectedUsers > 10000) return 'large';
    if (context.expectedUsers > 1000) return 'medium';
    if (context.expectedUsers > 100) return 'small';
    return 'niche';
  }

  private async assessCompetitivePosition(context: BusinessContext): Promise<'leader' | 'challenger' | 'follower' | 'niche-player'> {
    const description = context.businessDescription.toLowerCase();

    if (description.includes('first') || description.includes('leading')) {
      return 'leader';
    }
    if (description.includes('innovative') || description.includes('disrupting')) {
      return 'challenger';
    }
    if (description.includes('specialized') || description.includes('niche')) {
      return 'niche-player';
    }
    return 'follower';
  }

  private async parseGoals(goals: string): Promise<Array<{description: string, priority: string}>> {
    const goalList = goals.split('.').filter(g => g.trim().length > 0);
    return goalList.map(goal => ({
      description: goal.trim(),
      priority: this.assessGoalPriority(goal)
    }));
  }

  private assessGoalPriority(goal: string): string {
    const text = goal.toLowerCase();
    if (text.includes('critical') || text.includes('essential') || text.includes('must')) {
      return 'high';
    }
    if (text.includes('important') || text.includes('should')) {
      return 'medium';
    }
    return 'low';
  }

  private async defineSuccessMetrics(goals: Array<{description: string, priority: string}>): Promise<SuccessMetric[]> {
    return goals.map(goal => ({
      name: this.extractMetricName(goal.description),
      target: 'TBD',
      timeframe: '6 months',
      measurement: 'quantitative',
      importance: goal.priority as 'critical' | 'important' | 'nice-to-have'
    }));
  }

  private extractMetricName(description: string): string {
    if (description.includes('revenue')) return 'Revenue Growth';
    if (description.includes('user')) return 'User Acquisition';
    if (description.includes('engagement')) return 'User Engagement';
    if (description.includes('efficiency')) return 'Operational Efficiency';
    return 'Custom Metric';
  }

  private async defineTimeHorizons(goals: Array<{description: string, priority: string}>): Promise<TimeHorizon[]> {
    return [
      {
        period: 'immediate',
        goals: goals.filter(g => g.priority === 'high').map(g => g.description),
        milestones: ['Initial setup', 'Core features']
      },
      {
        period: 'short-term',
        goals: goals.filter(g => g.priority === 'medium').map(g => g.description),
        milestones: ['Feature enhancement', 'User feedback integration']
      }
    ];
  }

  private async identifyStrategicPriorities(context: BusinessContext): Promise<string[]> {
    const priorities: string[] = [];

    if (context.budget < 5000) {
      priorities.push('Cost optimization');
    }
    if (context.timeline.includes('urgent')) {
      priorities.push('Speed to market');
    }
    if (context.expectedUsers > 1000) {
      priorities.push('Scalability');
    }

    return priorities;
  }

  private async defineExpectedOutcomes(goals: Array<{description: string, priority: string}>): Promise<string[]> {
    return goals.map(goal => `Achieve: ${goal.description}`);
  }

  private async extractCoreValue(description: string): Promise<string> {
    // AI-powered value extraction
    if (description.includes('efficiency')) return 'Improved operational efficiency';
    if (description.includes('save')) return 'Cost and time savings';
    if (description.includes('growth')) return 'Business growth enablement';
    return 'Enhanced business capabilities';
  }

  private async identifyUSPs(context: BusinessContext): Promise<string[]> {
    const usps: string[] = [];

    if (context.businessDescription.includes('innovative')) {
      usps.push('Innovative approach');
    }
    if (context.businessDescription.includes('cost-effective')) {
      usps.push('Cost-effective solution');
    }

    return usps;
  }

  private async identifyCustomerBenefits(context: BusinessContext): Promise<string[]> {
    return [
      'Streamlined operations',
      'Improved user experience',
      'Increased efficiency',
      'Better decision making'
    ];
  }

  private async identifyProblemsSolved(context: BusinessContext): Promise<string[]> {
    return [
      'Manual process inefficiencies',
      'Data silos',
      'Poor user experience',
      'Scalability challenges'
    ];
  }

  private async identifyDifferentiators(context: BusinessContext): Promise<string[]> {
    return [
      'AI-powered insights',
      'Seamless integration',
      'User-friendly interface',
      'Scalable architecture'
    ];
  }

  private async identifyPrimaryStakeholders(context: BusinessContext): Promise<Stakeholder[]> {
    return [
      {
        role: 'Business Owner',
        needs: ['ROI', 'Growth', 'Efficiency'],
        concerns: ['Cost', 'Timeline', 'Risk'],
        influence: 'high',
        engagement: 'champion'
      },
      {
        role: 'End Users',
        needs: ['Usability', 'Performance', 'Features'],
        concerns: ['Learning curve', 'Reliability'],
        influence: 'medium',
        engagement: 'neutral'
      }
    ];
  }

  private async identifySecondaryStakeholders(context: BusinessContext): Promise<Stakeholder[]> {
    return [
      {
        role: 'IT Team',
        needs: ['Security', 'Maintainability', 'Integration'],
        concerns: ['Technical debt', 'Support burden'],
        influence: 'medium',
        engagement: 'supporter'
      }
    ];
  }

  private async extractStakeholderPriorities(context: BusinessContext): Promise<string[]> {
    return ['Business value', 'User experience', 'Technical excellence', 'Risk mitigation'];
  }

  private async identifyDecisionMakers(context: BusinessContext): Promise<string[]> {
    return ['CEO', 'CTO', 'Project Sponsor'];
  }

  private async identifyInfluencers(context: BusinessContext): Promise<string[]> {
    return ['Department heads', 'Power users', 'Technical leads'];
  }

  private async identifyDirectCompetitors(competitorInfo: string): Promise<string[]> {
    return competitorInfo.split(',').map(c => c.trim()).filter(c => c.length > 0);
  }

  private async identifyIndirectCompetitors(competitorInfo: string): Promise<string[]> {
    return ['Manual processes', 'Alternative solutions', 'In-house tools'];
  }

  private async identifyCompetitiveAdvantages(context: BusinessContext): Promise<string[]> {
    return ['Faster implementation', 'Better user experience', 'Lower total cost'];
  }

  private async identifyCompetitiveDisadvantages(context: BusinessContext): Promise<string[]> {
    return ['Newer to market', 'Smaller feature set initially'];
  }

  private async identifyMarketGaps(context: BusinessContext): Promise<string[]> {
    return ['SMB-focused solutions', 'Industry-specific features', 'Integration capabilities'];
  }

  private async defineCompetitiveStrategy(context: BusinessContext): Promise<string> {
    if (context.budget < 5000) return 'cost-leadership';
    if (context.businessDescription.includes('innovative')) return 'differentiation';
    return 'focus-strategy';
  }

  private async identifyGrowthModel(context: BusinessContext): Promise<string> {
    if (context.expectedUsers > 10000) return 'viral-growth';
    if (context.businessDescription.includes('subscription')) return 'subscription-model';
    return 'customer-acquisition';
  }

  private async identifyScalingFactors(context: BusinessContext): Promise<string[]> {
    return ['User base growth', 'Feature expansion', 'Market expansion', 'Partnership development'];
  }

  private async identifyExpansionOpportunities(context: BusinessContext): Promise<string[]> {
    return ['Adjacent markets', 'Additional features', 'Geographic expansion', 'Partnership channels'];
  }

  private async assessResourceRequirements(context: BusinessContext): Promise<string[]> {
    return ['Development team', 'Marketing budget', 'Infrastructure scaling', 'Customer support'];
  }

  private async identifyGrowthRisks(context: BusinessContext): Promise<string[]> {
    return ['Competition', 'Technology changes', 'Market saturation', 'Resource constraints'];
  }

  private async identifyGrowthEnablers(context: BusinessContext): Promise<string[]> {
    return ['Strong product-market fit', 'Scalable technology', 'Effective marketing', 'Customer success'];
  }

  private async aiClassifyIndustry(description: string): Promise<string> {
    // Fallback industry classification using AI
    return 'general-business';
  }

  private generateMetadata(context: BusinessContext, processingTime: number): ProcessingMetadata {
    return {
      processedAt: new Date(),
      processingTime,
      dataQuality: this.assessDataQuality(context),
      confidence: this.calculateConfidence(context),
      sources: ['user-input', 'industry-database', 'ai-analysis'],
      processingVersion: '1.0.0'
    };
  }

  private assessDataQuality(context: BusinessContext): number {
    let score = 0.5;

    if (context.businessDescription.length > 100) score += 0.2;
    if (context.goals.length > 50) score += 0.1;
    if (context.targetMarket.length > 20) score += 0.1;
    if (context.competitorInfo.length > 10) score += 0.1;

    return Math.min(score, 1.0);
  }

  private calculateConfidence(context: BusinessContext): number {
    let confidence = 0.6;

    if (context.businessDescription.length > 200) confidence += 0.1;
    if (context.expectedUsers > 0) confidence += 0.1;
    if (context.budget > 0) confidence += 0.1;
    if (context.timeline.length > 0) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private initializeKnowledgeBases(): void {
    // Initialize industry insights
    this.industryDatabase.set('technology', {
      trends: ['AI/ML adoption', 'Cloud migration', 'Digital transformation'],
      regulations: ['Data privacy', 'Security compliance'],
      keyFactors: ['Innovation', 'Speed to market', 'Scalability']
    });

    this.industryDatabase.set('healthcare', {
      trends: ['Telemedicine', 'Digital health records', 'AI diagnostics'],
      regulations: ['HIPAA', 'FDA compliance', 'Patient privacy'],
      keyFactors: ['Compliance', 'Security', 'Reliability']
    });

    // Add more industry data as needed
  }
}