import { BudgetConstraints, CostOptimization, BudgetFlexibility } from '@/types/templates/customization';

export interface BudgetAnalysisResult {
  budgetBreakdown: BudgetBreakdown;
  costOptimizations: CostOptimization[];
  budgetRisks: BudgetRisk[];
  flexibilityAssessment: FlexibilityAssessment;
  valueEngineering: ValueEngineering;
  pricingStrategy: PricingStrategy;
  financialProjections: FinancialProjections;
  analysisMetadata: AnalysisMetadata;
}

export interface BudgetBreakdown {
  totalBudget: number;
  development: BudgetAllocation;
  customization: BudgetAllocation;
  deployment: BudgetAllocation;
  testing: BudgetAllocation;
  projectManagement: BudgetAllocation;
  contingency: BudgetAllocation;
  maintenance: BudgetAllocation;
}

export interface BudgetAllocation {
  amount: number;
  percentage: number;
  rationale: string;
  flexibility: 'fixed' | 'flexible' | 'negotiable';
  criticalityLevel: 'essential' | 'important' | 'optional';
}

export interface BudgetRisk {
  riskType: 'scope-creep' | 'timeline-extension' | 'technology-complexity' | 'integration-challenges' | 'resource-availability';
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  description: string;
  mitigation: string;
  costImpact: number;
}

export interface FlexibilityAssessment {
  overallFlexibility: 'rigid' | 'moderate' | 'flexible' | 'highly-flexible';
  flexibilityFactors: FlexibilityFactor[];
  adjustmentOptions: AdjustmentOption[];
  negotiationPoints: NegotiationPoint[];
}

export interface FlexibilityFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface AdjustmentOption {
  option: string;
  budgetImpact: number;
  scopeImpact: string;
  timelineImpact: string;
  feasibility: 'high' | 'medium' | 'low';
}

export interface NegotiationPoint {
  aspect: string;
  currentValue: string;
  proposedValue: string;
  budgetSavings: number;
  tradeOffs: string[];
}

export interface ValueEngineering {
  valueOpportunities: ValueOpportunity[];
  costReductions: CostReduction[];
  featurePrioritization: FeaturePriority[];
  alternativeApproaches: AlternativeApproach[];
}

export interface ValueOpportunity {
  opportunity: string;
  valueIncrease: number;
  implementationCost: number;
  roi: number;
  timeToValue: string;
}

export interface CostReduction {
  area: string;
  currentCost: number;
  reducedCost: number;
  savings: number;
  riskLevel: 'low' | 'medium' | 'high';
  qualityImpact: string;
}

export interface FeaturePriority {
  feature: string;
  businessValue: number;
  implementationCost: number;
  priority: 'must-have' | 'should-have' | 'could-have' | 'wont-have';
  dependencies: string[];
}

export interface AlternativeApproach {
  approach: string;
  costDifference: number;
  timelineDifference: string;
  qualityDifference: string;
  riskDifference: string;
  suitability: number;
}

export interface PricingStrategy {
  recommendedModel: 'fixed-price' | 'time-and-materials' | 'milestone-based' | 'hybrid';
  pricingJustification: string;
  paymentStructure: PaymentMilestone[];
  contractTerms: ContractTerm[];
}

export interface PaymentMilestone {
  milestone: string;
  percentage: number;
  amount: number;
  deliverables: string[];
  criteria: string[];
}

export interface ContractTerm {
  term: string;
  rationale: string;
  budgetProtection: string;
  flexibilityProvision: string;
}

export interface FinancialProjections {
  projectCosts: ProjectCost[];
  cashFlowProjection: CashFlow[];
  riskScenarios: RiskScenario[];
  returnOnInvestment: ROIAnalysis;
}

export interface ProjectCost {
  phase: string;
  estimatedCost: number;
  confidence: number;
  varianceRange: [number, number];
  costDrivers: string[];
}

export interface CashFlow {
  period: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeFlow: number;
}

export interface RiskScenario {
  scenario: 'best-case' | 'expected' | 'worst-case';
  probability: number;
  totalCost: number;
  costVariance: number;
  timelineImpact: string;
}

export interface ROIAnalysis {
  totalInvestment: number;
  projectedBenefits: number;
  paybackPeriod: string;
  roi: number;
  netPresentValue: number;
}

export interface AnalysisMetadata {
  analyzedAt: Date;
  analysisVersion: string;
  confidenceLevel: number;
  dataQuality: number;
  assumptionsMade: string[];
  limitationsNoted: string[];
}

export class BudgetConstraintsAnalyzer {
  private industryBenchmarks: Map<string, IndustryBenchmark>;
  private costModels: Map<string, CostModel>;

  constructor() {
    this.industryBenchmarks = new Map();
    this.costModels = new Map();
    this.initializeBenchmarks();
  }

  async analyzeBudgetConstraints(constraints: BudgetConstraints): Promise<BudgetAnalysisResult> {
    const [
      budgetBreakdown,
      costOptimizations,
      budgetRisks,
      flexibilityAssessment,
      valueEngineering,
      pricingStrategy,
      financialProjections
    ] = await Promise.all([
      this.generateBudgetBreakdown(constraints),
      this.identifyCostOptimizations(constraints),
      this.assessBudgetRisks(constraints),
      this.assessFlexibility(constraints),
      this.performValueEngineering(constraints),
      this.developPricingStrategy(constraints),
      this.generateFinancialProjections(constraints)
    ]);

    const analysisMetadata = this.generateAnalysisMetadata(constraints);

    return {
      budgetBreakdown,
      costOptimizations,
      budgetRisks,
      flexibilityAssessment,
      valueEngineering,
      pricingStrategy,
      financialProjections,
      analysisMetadata
    };
  }

  private async generateBudgetBreakdown(constraints: BudgetConstraints): Promise<BudgetBreakdown> {
    const totalBudget = constraints.totalBudget;
    const complexity = this.assessProjectComplexity(constraints);
    const breakdown = this.getBaseBreakdown(complexity);

    return {
      totalBudget,
      development: {
        amount: totalBudget * breakdown.development,
        percentage: breakdown.development * 100,
        rationale: 'Core development work including frontend, backend, and database',
        flexibility: 'flexible',
        criticalityLevel: 'essential'
      },
      customization: {
        amount: totalBudget * breakdown.customization,
        percentage: breakdown.customization * 100,
        rationale: 'Client-specific customizations and branding',
        flexibility: 'negotiable',
        criticalityLevel: 'important'
      },
      deployment: {
        amount: totalBudget * breakdown.deployment,
        percentage: breakdown.deployment * 100,
        rationale: 'Infrastructure setup and production deployment',
        flexibility: 'fixed',
        criticalityLevel: 'essential'
      },
      testing: {
        amount: totalBudget * breakdown.testing,
        percentage: breakdown.testing * 100,
        rationale: 'Quality assurance and testing procedures',
        flexibility: 'moderate',
        criticalityLevel: 'essential'
      },
      projectManagement: {
        amount: totalBudget * breakdown.projectManagement,
        percentage: breakdown.projectManagement * 100,
        rationale: 'Project coordination and communication',
        flexibility: 'flexible',
        criticalityLevel: 'important'
      },
      contingency: {
        amount: totalBudget * breakdown.contingency,
        percentage: breakdown.contingency * 100,
        rationale: 'Risk buffer for unexpected requirements',
        flexibility: 'flexible',
        criticalityLevel: 'important'
      },
      maintenance: {
        amount: totalBudget * breakdown.maintenance,
        percentage: breakdown.maintenance * 100,
        rationale: 'Initial support and maintenance period',
        flexibility: 'negotiable',
        criticalityLevel: 'optional'
      }
    };
  }

  private async identifyCostOptimizations(constraints: BudgetConstraints): Promise<CostOptimization[]> {
    const optimizations: CostOptimization[] = [];

    // Template-based optimization
    if (constraints.allowTemplateUsage !== false) {
      optimizations.push({
        type: 'template-usage',
        description: 'Utilize pre-built templates to reduce development time',
        potentialSavings: constraints.totalBudget * 0.3,
        implementationComplexity: 'low',
        qualityImpact: 'minimal',
        timelineImpact: 'significant-reduction'
      });
    }

    // Phased implementation
    if (constraints.timeline === 'flexible') {
      optimizations.push({
        type: 'phased-implementation',
        description: 'Implement core features first, add enhancements later',
        potentialSavings: constraints.totalBudget * 0.2,
        implementationComplexity: 'medium',
        qualityImpact: 'none',
        timelineImpact: 'initial-reduction'
      });
    }

    // Feature simplification
    if (constraints.featurePriority === 'flexible') {
      optimizations.push({
        type: 'feature-simplification',
        description: 'Simplify complex features while maintaining core functionality',
        potentialSavings: constraints.totalBudget * 0.15,
        implementationComplexity: 'low',
        qualityImpact: 'minimal',
        timelineImpact: 'moderate-reduction'
      });
    }

    // Technology stack optimization
    optimizations.push({
      type: 'technology-optimization',
      description: 'Use proven, cost-effective technology stack',
      potentialSavings: constraints.totalBudget * 0.1,
      implementationComplexity: 'low',
      qualityImpact: 'positive',
      timelineImpact: 'slight-reduction'
    });

    return optimizations;
  }

  private async assessBudgetRisks(constraints: BudgetConstraints): Promise<BudgetRisk[]> {
    const risks: BudgetRisk[] = [];

    // Scope creep risk
    if (constraints.scopeStability === 'uncertain') {
      risks.push({
        riskType: 'scope-creep',
        impact: 'high',
        probability: 0.7,
        description: 'Additional features may be requested during development',
        mitigation: 'Clear scope documentation and change control process',
        costImpact: constraints.totalBudget * 0.25
      });
    }

    // Timeline extension risk
    if (constraints.timeline === 'aggressive') {
      risks.push({
        riskType: 'timeline-extension',
        impact: 'medium',
        probability: 0.6,
        description: 'Aggressive timeline may require additional resources',
        mitigation: 'Realistic timeline planning and resource allocation',
        costImpact: constraints.totalBudget * 0.15
      });
    }

    // Technology complexity risk
    if (constraints.technicalComplexity === 'high') {
      risks.push({
        riskType: 'technology-complexity',
        impact: 'high',
        probability: 0.5,
        description: 'Complex technical requirements may require specialized expertise',
        mitigation: 'Early technical validation and expert consultation',
        costImpact: constraints.totalBudget * 0.2
      });
    }

    // Integration challenges
    if (constraints.integrationRequirements && constraints.integrationRequirements.length > 2) {
      risks.push({
        riskType: 'integration-challenges',
        impact: 'medium',
        probability: 0.4,
        description: 'Multiple integrations may present unexpected challenges',
        mitigation: 'Integration testing and early validation',
        costImpact: constraints.totalBudget * 0.1
      });
    }

    return risks;
  }

  private async assessFlexibility(constraints: BudgetConstraints): Promise<FlexibilityAssessment> {
    const flexibilityFactors: FlexibilityFactor[] = [
      {
        factor: 'Budget buffer',
        impact: constraints.budgetBuffer > 0.1 ? 'positive' : 'negative',
        weight: 0.3,
        description: 'Available contingency budget for adjustments'
      },
      {
        factor: 'Timeline flexibility',
        impact: constraints.timeline === 'flexible' ? 'positive' : 'negative',
        weight: 0.25,
        description: 'Ability to adjust timeline for cost optimization'
      },
      {
        factor: 'Feature prioritization',
        impact: constraints.featurePriority === 'flexible' ? 'positive' : 'negative',
        weight: 0.25,
        description: 'Flexibility in feature scope and complexity'
      },
      {
        factor: 'Technology choices',
        impact: constraints.technologyConstraints ? 'negative' : 'positive',
        weight: 0.2,
        description: 'Freedom in technology stack selection'
      }
    ];

    const overallFlexibility = this.calculateOverallFlexibility(flexibilityFactors);

    const adjustmentOptions: AdjustmentOption[] = [
      {
        option: 'Reduce feature complexity',
        budgetImpact: -constraints.totalBudget * 0.15,
        scopeImpact: 'Simplified features with core functionality',
        timelineImpact: '2-3 weeks reduction',
        feasibility: 'high'
      },
      {
        option: 'Phased delivery',
        budgetImpact: -constraints.totalBudget * 0.1,
        scopeImpact: 'Initial MVP with planned enhancements',
        timelineImpact: 'Faster initial delivery',
        feasibility: 'high'
      },
      {
        option: 'Template-based approach',
        budgetImpact: -constraints.totalBudget * 0.25,
        scopeImpact: 'Standard patterns with customization',
        timelineImpact: '3-4 weeks reduction',
        feasibility: 'medium'
      }
    ];

    const negotiationPoints: NegotiationPoint[] = [
      {
        aspect: 'Maintenance period',
        currentValue: '6 months included',
        proposedValue: '3 months included',
        budgetSavings: constraints.totalBudget * 0.05,
        tradeOffs: ['Shorter support period', 'Additional maintenance contracts available']
      },
      {
        aspect: 'Customization depth',
        currentValue: 'Full custom design',
        proposedValue: 'Template with customization',
        budgetSavings: constraints.totalBudget * 0.2,
        tradeOffs: ['Faster delivery', 'Some design constraints']
      }
    ];

    return {
      overallFlexibility,
      flexibilityFactors,
      adjustmentOptions,
      negotiationPoints
    };
  }

  private async performValueEngineering(constraints: BudgetConstraints): Promise<ValueEngineering> {
    const valueOpportunities: ValueOpportunity[] = [
      {
        opportunity: 'AI-powered automation',
        valueIncrease: constraints.totalBudget * 0.4,
        implementationCost: constraints.totalBudget * 0.1,
        roi: 3.0,
        timeToValue: '3-6 months'
      },
      {
        opportunity: 'Mobile responsiveness',
        valueIncrease: constraints.totalBudget * 0.25,
        implementationCost: constraints.totalBudget * 0.08,
        roi: 2.1,
        timeToValue: '1-2 months'
      }
    ];

    const costReductions: CostReduction[] = [
      {
        area: 'Development time',
        currentCost: constraints.totalBudget * 0.5,
        reducedCost: constraints.totalBudget * 0.35,
        savings: constraints.totalBudget * 0.15,
        riskLevel: 'low',
        qualityImpact: 'No impact with template approach'
      }
    ];

    const featurePrioritization: FeaturePriority[] = [
      {
        feature: 'User authentication',
        businessValue: 10,
        implementationCost: constraints.totalBudget * 0.1,
        priority: 'must-have',
        dependencies: []
      },
      {
        feature: 'Dashboard analytics',
        businessValue: 8,
        implementationCost: constraints.totalBudget * 0.15,
        priority: 'should-have',
        dependencies: ['User authentication']
      },
      {
        feature: 'Advanced reporting',
        businessValue: 6,
        implementationCost: constraints.totalBudget * 0.2,
        priority: 'could-have',
        dependencies: ['Dashboard analytics']
      }
    ];

    const alternativeApproaches: AlternativeApproach[] = [
      {
        approach: 'Low-code platform',
        costDifference: -constraints.totalBudget * 0.3,
        timelineDifference: '40% faster',
        qualityDifference: 'Comparable',
        riskDifference: 'Lower technical risk',
        suitability: 0.8
      },
      {
        approach: 'Hybrid template approach',
        costDifference: -constraints.totalBudget * 0.2,
        timelineDifference: '30% faster',
        qualityDifference: 'Slightly standardized',
        riskDifference: 'Lower risk',
        suitability: 0.9
      }
    ];

    return {
      valueOpportunities,
      costReductions,
      featurePrioritization,
      alternativeApproaches
    };
  }

  private async developPricingStrategy(constraints: BudgetConstraints): Promise<PricingStrategy> {
    const recommendedModel = this.determineOptimalPricingModel(constraints);

    const paymentStructure: PaymentMilestone[] = [
      {
        milestone: 'Project kickoff',
        percentage: 25,
        amount: constraints.totalBudget * 0.25,
        deliverables: ['Project plan', 'Technical specification'],
        criteria: ['Signed contract', 'Initial requirements approved']
      },
      {
        milestone: 'Development milestone 1',
        percentage: 35,
        amount: constraints.totalBudget * 0.35,
        deliverables: ['Core functionality', 'Basic UI'],
        criteria: ['Core features functional', 'Client approval received']
      },
      {
        milestone: 'Development milestone 2',
        percentage: 25,
        amount: constraints.totalBudget * 0.25,
        deliverables: ['Full feature set', 'Testing complete'],
        criteria: ['All features implemented', 'Testing passed']
      },
      {
        milestone: 'Project completion',
        percentage: 15,
        amount: constraints.totalBudget * 0.15,
        deliverables: ['Production deployment', 'Documentation'],
        criteria: ['Live deployment', 'Client sign-off']
      }
    ];

    const contractTerms: ContractTerm[] = [
      {
        term: 'Scope protection',
        rationale: 'Prevent scope creep',
        budgetProtection: 'Change requests require approval and pricing',
        flexibilityProvision: 'Minor adjustments included'
      },
      {
        term: 'Timeline flexibility',
        rationale: 'Account for dependencies',
        budgetProtection: 'No penalties for client-caused delays',
        flexibilityProvision: 'Reasonable timeline adjustments allowed'
      }
    ];

    return {
      recommendedModel,
      pricingJustification: this.generatePricingJustification(recommendedModel, constraints),
      paymentStructure,
      contractTerms
    };
  }

  private async generateFinancialProjections(constraints: BudgetConstraints): Promise<FinancialProjections> {
    const projectCosts: ProjectCost[] = [
      {
        phase: 'Planning & Design',
        estimatedCost: constraints.totalBudget * 0.15,
        confidence: 0.9,
        varianceRange: [constraints.totalBudget * 0.12, constraints.totalBudget * 0.18],
        costDrivers: ['Requirements complexity', 'Design iterations']
      },
      {
        phase: 'Development',
        estimatedCost: constraints.totalBudget * 0.55,
        confidence: 0.8,
        varianceRange: [constraints.totalBudget * 0.45, constraints.totalBudget * 0.65],
        costDrivers: ['Technical complexity', 'Integration challenges']
      },
      {
        phase: 'Testing & Deployment',
        estimatedCost: constraints.totalBudget * 0.2,
        confidence: 0.85,
        varianceRange: [constraints.totalBudget * 0.18, constraints.totalBudget * 0.25],
        costDrivers: ['Testing scope', 'Deployment complexity']
      },
      {
        phase: 'Support & Maintenance',
        estimatedCost: constraints.totalBudget * 0.1,
        confidence: 0.95,
        varianceRange: [constraints.totalBudget * 0.08, constraints.totalBudget * 0.12],
        costDrivers: ['Support duration', 'Issue complexity']
      }
    ];

    const cashFlowProjection: CashFlow[] = this.generateCashFlowProjection(constraints);

    const riskScenarios: RiskScenario[] = [
      {
        scenario: 'best-case',
        probability: 0.2,
        totalCost: constraints.totalBudget * 0.85,
        costVariance: -15,
        timelineImpact: '2 weeks early'
      },
      {
        scenario: 'expected',
        probability: 0.6,
        totalCost: constraints.totalBudget,
        costVariance: 0,
        timelineImpact: 'On schedule'
      },
      {
        scenario: 'worst-case',
        probability: 0.2,
        totalCost: constraints.totalBudget * 1.3,
        costVariance: 30,
        timelineImpact: '4 weeks delay'
      }
    ];

    const returnOnInvestment: ROIAnalysis = {
      totalInvestment: constraints.totalBudget,
      projectedBenefits: constraints.totalBudget * 2.5,
      paybackPeriod: '12-18 months',
      roi: 1.5,
      netPresentValue: constraints.totalBudget * 0.8
    };

    return {
      projectCosts,
      cashFlowProjection,
      riskScenarios,
      returnOnInvestment
    };
  }

  private assessProjectComplexity(constraints: BudgetConstraints): 'low' | 'medium' | 'high' {
    let complexityScore = 0;

    if (constraints.technicalComplexity === 'high') complexityScore += 3;
    if (constraints.integrationRequirements && constraints.integrationRequirements.length > 2) complexityScore += 2;
    if (constraints.timeline === 'aggressive') complexityScore += 2;
    if (constraints.totalBudget > 50000) complexityScore += 1;

    if (complexityScore >= 6) return 'high';
    if (complexityScore >= 3) return 'medium';
    return 'low';
  }

  private getBaseBreakdown(complexity: 'low' | 'medium' | 'high'): Record<string, number> {
    const breakdowns = {
      low: {
        development: 0.45,
        customization: 0.25,
        deployment: 0.08,
        testing: 0.08,
        projectManagement: 0.06,
        contingency: 0.05,
        maintenance: 0.03
      },
      medium: {
        development: 0.50,
        customization: 0.20,
        deployment: 0.10,
        testing: 0.10,
        projectManagement: 0.05,
        contingency: 0.10,
        maintenance: 0.05
      },
      high: {
        development: 0.45,
        customization: 0.20,
        deployment: 0.08,
        testing: 0.12,
        projectManagement: 0.08,
        contingency: 0.15,
        maintenance: 0.02
      }
    };

    return breakdowns[complexity];
  }

  private calculateOverallFlexibility(factors: FlexibilityFactor[]): 'rigid' | 'moderate' | 'flexible' | 'highly-flexible' {
    const weightedScore = factors.reduce((sum, factor) => {
      const impactValue = factor.impact === 'positive' ? 1 : factor.impact === 'negative' ? -1 : 0;
      return sum + (impactValue * factor.weight);
    }, 0);

    if (weightedScore >= 0.6) return 'highly-flexible';
    if (weightedScore >= 0.2) return 'flexible';
    if (weightedScore >= -0.2) return 'moderate';
    return 'rigid';
  }

  private determineOptimalPricingModel(constraints: BudgetConstraints): 'fixed-price' | 'time-and-materials' | 'milestone-based' | 'hybrid' {
    if (constraints.scopeStability === 'well-defined') return 'fixed-price';
    if (constraints.scopeStability === 'uncertain') return 'time-and-materials';
    return 'milestone-based';
  }

  private generatePricingJustification(model: string, constraints: BudgetConstraints): string {
    const justifications = {
      'fixed-price': 'Well-defined scope allows for accurate fixed pricing with predictable costs',
      'time-and-materials': 'Uncertain scope requires flexible pricing to accommodate changes',
      'milestone-based': 'Structured approach with clear deliverables and payment schedule',
      'hybrid': 'Combination approach balancing predictability with flexibility'
    };

    return justifications[model] || 'Optimal pricing model based on project characteristics';
  }

  private generateCashFlowProjection(constraints: BudgetConstraints): CashFlow[] {
    const monthlyBudget = constraints.totalBudget / 6; // Assuming 6-month project

    return Array.from({ length: 6 }, (_, i) => ({
      period: `Month ${i + 1}`,
      inflow: 0, // Client payments based on milestones
      outflow: monthlyBudget,
      netFlow: -monthlyBudget,
      cumulativeFlow: -(monthlyBudget * (i + 1))
    }));
  }

  private generateAnalysisMetadata(constraints: BudgetConstraints): AnalysisMetadata {
    return {
      analyzedAt: new Date(),
      analysisVersion: '1.0.0',
      confidenceLevel: 0.85,
      dataQuality: this.assessDataQuality(constraints),
      assumptionsMade: [
        'Standard industry practices applied',
        'No major technical obstacles',
        'Client availability for feedback'
      ],
      limitationsNoted: [
        'Estimates based on provided information',
        'Market conditions may affect costs',
        'Technical discoveries may impact budget'
      ]
    };
  }

  private assessDataQuality(constraints: BudgetConstraints): number {
    let quality = 0.5;

    if (constraints.totalBudget > 0) quality += 0.2;
    if (constraints.technicalComplexity) quality += 0.1;
    if (constraints.timeline) quality += 0.1;
    if (constraints.scopeStability) quality += 0.1;

    return Math.min(quality, 1.0);
  }

  private initializeBenchmarks(): void {
    // Initialize industry benchmarks for cost analysis
    this.industryBenchmarks.set('technology', {
      averageCostPerFeature: 5000,
      developmentHourlyRate: 150,
      complexityMultipliers: { low: 0.8, medium: 1.0, high: 1.5 }
    });

    this.industryBenchmarks.set('healthcare', {
      averageCostPerFeature: 7000,
      developmentHourlyRate: 180,
      complexityMultipliers: { low: 1.0, medium: 1.3, high: 2.0 }
    });

    // Initialize cost models
    this.costModels.set('mvp', {
      baseMultiplier: 0.6,
      featureComplexity: 'low',
      timelineAdjustment: 0.8
    });

    this.costModels.set('enterprise', {
      baseMultiplier: 1.5,
      featureComplexity: 'high',
      timelineAdjustment: 1.2
    });
  }
}

interface IndustryBenchmark {
  averageCostPerFeature: number;
  developmentHourlyRate: number;
  complexityMultipliers: Record<string, number>;
}

interface CostModel {
  baseMultiplier: number;
  featureComplexity: string;
  timelineAdjustment: number;
}