import { supabaseBrowser as supabase } from '@/lib/supabase/client';

export interface GrowthMetrics {
  revenueGrowthRate: number;
  clientGrowthRate: number;
  averageProjectValue: number;
  marketExpansion: number;
  efficiency: number;
  scalability: number;
}

export interface GrowthOpportunity {
  id: string;
  type: 'market_expansion' | 'service_upsell' | 'process_optimization' | 'new_revenue_stream';
  title: string;
  description: string;
  potentialImpact: number; // Revenue potential
  implementationEffort: 'low' | 'medium' | 'high';
  timeToValue: number; // Days to see results
  confidence: number; // 0-1
  requirements: string[];
  metrics: string[];
  priority: number; // 1-10
}

export interface GrowthPrediction {
  period: string;
  predictedRevenue: number;
  predictedClients: number;
  confidence: number;
  growthFactors: string[];
  risks: string[];
  opportunities: string[];
}

export interface ScalabilityAnalysis {
  currentCapacity: number;
  utilizationRate: number;
  bottlenecks: Array<{
    area: string;
    severity: 'low' | 'medium' | 'high';
    impact: string;
    solution: string;
  }>;
  scalingRecommendations: string[];
  investmentNeeded: number;
}

export class GrowthInsightsEngine {
  async calculateGrowthMetrics(
    timeRange: { start: Date; end: Date } = this.getDefaultTimeRange()
  ): Promise<GrowthMetrics> {
    try {
      const [
        revenueGrowth,
        clientGrowth,
        projectMetrics,
        marketData,
        efficiencyMetrics
      ] = await Promise.all([
        this.calculateRevenueGrowthRate(timeRange),
        this.calculateClientGrowthRate(timeRange),
        this.getProjectMetrics(timeRange),
        this.getMarketExpansionData(),
        this.calculateEfficiencyMetrics(timeRange)
      ]);

      return {
        revenueGrowthRate: revenueGrowth,
        clientGrowthRate: clientGrowth,
        averageProjectValue: projectMetrics.averageValue,
        marketExpansion: marketData.expansionRate,
        efficiency: efficiencyMetrics.overall,
        scalability: await this.calculateScalabilityScore()
      };
    } catch (error) {
      console.error('Error calculating growth metrics:', error);
      throw error;
    }
  }

  async identifyGrowthOpportunities(): Promise<GrowthOpportunity[]> {
    try {
      const [
        marketOpportunities,
        serviceOpportunities,
        processOpportunities,
        revenueOpportunities
      ] = await Promise.all([
        this.identifyMarketExpansionOpportunities(),
        this.identifyServiceUpsellOpportunities(),
        this.identifyProcessOptimizationOpportunities(),
        this.identifyNewRevenueStreamOpportunities()
      ]);

      const allOpportunities = [
        ...marketOpportunities,
        ...serviceOpportunities,
        ...processOpportunities,
        ...revenueOpportunities
      ];

      // Sort by priority and potential impact
      return allOpportunities.sort((a, b) => {
        const aScore = a.priority * a.potentialImpact * a.confidence;
        const bScore = b.priority * b.potentialImpact * b.confidence;
        return bScore - aScore;
      });
    } catch (error) {
      console.error('Error identifying growth opportunities:', error);
      throw error;
    }
  }

  async generateGrowthPredictions(periods: number = 12): Promise<GrowthPrediction[]> {
    try {
      const historicalMetrics = await this.calculateGrowthMetrics();
      const predictions: GrowthPrediction[] = [];

      for (let i = 1; i <= periods; i++) {
        const prediction = await this.predictGrowthForPeriod(i, historicalMetrics);
        predictions.push(prediction);
      }

      return predictions;
    } catch (error) {
      console.error('Error generating growth predictions:', error);
      throw error;
    }
  }

  async analyzeScalability(): Promise<ScalabilityAnalysis> {
    try {
      const [
        capacity,
        utilization,
        bottlenecks,
        recommendations
      ] = await Promise.all([
        this.getCurrentCapacity(),
        this.getUtilizationRate(),
        this.identifyBottlenecks(),
        this.generateScalingRecommendations()
      ]);

      const investmentNeeded = await this.calculateScalingInvestment(bottlenecks);

      return {
        currentCapacity: capacity,
        utilizationRate: utilization,
        bottlenecks,
        scalingRecommendations: recommendations,
        investmentNeeded
      };
    } catch (error) {
      console.error('Error analyzing scalability:', error);
      throw error;
    }
  }

  async getGrowthDriverAnalysis(): Promise<{
    primaryDrivers: Array<{
      driver: string;
      impact: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      recommendation: string;
    }>;
    secondaryDrivers: Array<{
      driver: string;
      impact: number;
      potential: number;
      actionRequired: string;
    }>;
    inhibitors: Array<{
      factor: string;
      impact: number;
      severity: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;
  }> {
    try {
      const metrics = await this.calculateGrowthMetrics();

      const primaryDrivers = [
        {
          driver: 'Client Acquisition',
          impact: metrics.clientGrowthRate,
          trend: this.analyzeTrend(metrics.clientGrowthRate) as 'increasing' | 'decreasing' | 'stable',
          recommendation: metrics.clientGrowthRate > 15
            ? 'Scale acquisition processes to maintain growth'
            : 'Implement targeted marketing campaigns'
        },
        {
          driver: 'Revenue Per Client',
          impact: metrics.averageProjectValue,
          trend: this.analyzeTrend(metrics.averageProjectValue) as 'increasing' | 'decreasing' | 'stable',
          recommendation: metrics.averageProjectValue > 10000
            ? 'Develop premium service offerings'
            : 'Focus on value-based pricing strategies'
        }
      ];

      const secondaryDrivers = [
        {
          driver: 'Operational Efficiency',
          impact: metrics.efficiency,
          potential: 100 - metrics.efficiency,
          actionRequired: metrics.efficiency < 70
            ? 'Implement automation and process improvements'
            : 'Fine-tune existing processes'
        },
        {
          driver: 'Market Expansion',
          impact: metrics.marketExpansion,
          potential: 50, // Assumed market potential
          actionRequired: 'Develop market penetration strategies'
        }
      ];

      const inhibitors = await this.identifyGrowthInhibitors();

      return {
        primaryDrivers,
        secondaryDrivers,
        inhibitors
      };
    } catch (error) {
      console.error('Error getting growth driver analysis:', error);
      throw error;
    }
  }

  async trackOpportunityImplementation(
    opportunityId: string,
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled',
    actualImpact?: number,
    notes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('growth_opportunities_tracking')
        .upsert({
          opportunity_id: opportunityId,
          status,
          actual_impact: actualImpact,
          notes,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking opportunity implementation:', error);
      throw error;
    }
  }

  async generateGrowthStrategy(
    targetGrowthRate: number,
    timeframe: number // months
  ): Promise<{
    strategy: string;
    keyInitiatives: Array<{
      initiative: string;
      impact: number;
      timeline: string;
      resources: string[];
    }>;
    milestones: Array<{
      milestone: string;
      target: number;
      deadline: string;
    }>;
    riskFactors: string[];
    successMetrics: string[];
  }> {
    try {
      const currentMetrics = await this.calculateGrowthMetrics();
      const opportunities = await this.identifyGrowthOpportunities();

      const strategy = this.generateStrategyDescription(targetGrowthRate, currentMetrics);
      const keyInitiatives = this.selectKeyInitiatives(opportunities, targetGrowthRate);
      const milestones = this.generateMilestones(targetGrowthRate, timeframe);
      const riskFactors = this.identifyRiskFactors(targetGrowthRate);
      const successMetrics = this.defineSuccessMetrics(targetGrowthRate);

      return {
        strategy,
        keyInitiatives,
        milestones,
        riskFactors,
        successMetrics
      };
    } catch (error) {
      console.error('Error generating growth strategy:', error);
      throw error;
    }
  }

  private async calculateRevenueGrowthRate(timeRange: { start: Date; end: Date }): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('revenue_data')
        .select('amount, created_at')
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString())
        .order('created_at');

      if (error) throw error;

      const monthlyRevenue = this.groupRevenueByMonth(data || []);
      if (monthlyRevenue.length < 2) return 0;

      const growthRates = [];
      for (let i = 1; i < monthlyRevenue.length; i++) {
        const current = monthlyRevenue[i].revenue;
        const previous = monthlyRevenue[i - 1].revenue;

        if (previous > 0) {
          const growthRate = ((current - previous) / previous) * 100;
          growthRates.push(growthRate);
        }
      }

      return growthRates.length > 0
        ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
        : 0;
    } catch (error) {
      console.error('Error calculating revenue growth rate:', error);
      return 0;
    }
  }

  private async calculateClientGrowthRate(timeRange: { start: Date; end: Date }): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('created_at')
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString())
        .order('created_at');

      if (error) throw error;

      const monthlyClients = this.groupClientsByMonth(data || []);
      if (monthlyClients.length < 2) return 0;

      const growthRates = [];
      for (let i = 1; i < monthlyClients.length; i++) {
        const current = monthlyClients[i].count;
        const previous = monthlyClients[i - 1].count;

        if (previous > 0) {
          const growthRate = ((current - previous) / previous) * 100;
          growthRates.push(growthRate);
        }
      }

      return growthRates.length > 0
        ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
        : 0;
    } catch (error) {
      console.error('Error calculating client growth rate:', error);
      return 0;
    }
  }

  private async getProjectMetrics(timeRange: { start: Date; end: Date }): Promise<{
    averageValue: number;
    completionRate: number;
    averageDeliveryTime: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('value, status, delivery_time')
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      if (error) throw error;

      const projects = data || [];
      const averageValue = projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.value || 0), 0) / projects.length
        : 0;

      const completedProjects = projects.filter(p => p.status === 'completed');
      const completionRate = projects.length > 0 ? completedProjects.length / projects.length : 0;

      const averageDeliveryTime = completedProjects.length > 0
        ? completedProjects.reduce((sum, p) => sum + (p.delivery_time || 0), 0) / completedProjects.length
        : 0;

      return {
        averageValue,
        completionRate,
        averageDeliveryTime
      };
    } catch (error) {
      console.error('Error getting project metrics:', error);
      return { averageValue: 0, completionRate: 0, averageDeliveryTime: 0 };
    }
  }

  private async getMarketExpansionData(): Promise<{ expansionRate: number }> {
    // This would integrate with market research data
    // For now, returning a calculated expansion rate based on client diversity
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('industry, location');

      if (error) throw error;

      const clients = data || [];
      const industries = new Set(clients.map(c => c.industry)).size;
      const locations = new Set(clients.map(c => c.location)).size;

      // Simple expansion rate calculation based on diversity
      const expansionRate = Math.min((industries * 5) + (locations * 3), 100);

      return { expansionRate };
    } catch (error) {
      console.error('Error getting market expansion data:', error);
      return { expansionRate: 25 };
    }
  }

  private async calculateEfficiencyMetrics(timeRange: { start: Date; end: Date }): Promise<{
    overall: number;
    automation: number;
    resource: number;
  }> {
    try {
      // This would integrate with actual efficiency tracking systems
      // For now, calculating based on delivery times and resource utilization

      const projectMetrics = await this.getProjectMetrics(timeRange);

      // Calculate efficiency based on delivery performance
      const targetDeliveryTime = 7; // days
      const deliveryEfficiency = projectMetrics.averageDeliveryTime > 0
        ? Math.max(0, 100 - ((projectMetrics.averageDeliveryTime - targetDeliveryTime) / targetDeliveryTime) * 100)
        : 100;

      const automationLevel = 75; // Placeholder - would come from automation metrics
      const resourceUtilization = 80; // Placeholder - would come from resource tracking

      const overall = (deliveryEfficiency + automationLevel + resourceUtilization) / 3;

      return {
        overall,
        automation: automationLevel,
        resource: resourceUtilization
      };
    } catch (error) {
      console.error('Error calculating efficiency metrics:', error);
      return { overall: 75, automation: 75, resource: 75 };
    }
  }

  private async calculateScalabilityScore(): Promise<number> {
    try {
      // Factors affecting scalability
      const automationLevel = 75; // From efficiency metrics
      const processStandardization = 80; // Placeholder
      const teamScalability = 70; // Placeholder
      const technologyScalability = 85; // Placeholder

      return (automationLevel + processStandardization + teamScalability + technologyScalability) / 4;
    } catch (error) {
      console.error('Error calculating scalability score:', error);
      return 75;
    }
  }

  private async identifyMarketExpansionOpportunities(): Promise<GrowthOpportunity[]> {
    return [
      {
        id: 'market-expansion-1',
        type: 'market_expansion',
        title: 'Enterprise Client Acquisition',
        description: 'Target enterprise clients with higher project values and longer engagements',
        potentialImpact: 150000,
        implementationEffort: 'high',
        timeToValue: 90,
        confidence: 0.7,
        requirements: ['Sales team expansion', 'Enterprise-grade processes', 'Case studies'],
        metrics: ['Enterprise client count', 'Average project value', 'Sales cycle length'],
        priority: 8
      },
      {
        id: 'market-expansion-2',
        type: 'market_expansion',
        title: 'Geographic Expansion',
        description: 'Expand services to new geographic markets',
        potentialImpact: 100000,
        implementationEffort: 'medium',
        timeToValue: 120,
        confidence: 0.6,
        requirements: ['Market research', 'Local partnerships', 'Compliance validation'],
        metrics: ['New market revenue', 'Client acquisition cost', 'Market penetration'],
        priority: 6
      }
    ];
  }

  private async identifyServiceUpsellOpportunities(): Promise<GrowthOpportunity[]> {
    return [
      {
        id: 'service-upsell-1',
        type: 'service_upsell',
        title: 'Premium Support Services',
        description: 'Offer premium support and maintenance packages to existing clients',
        potentialImpact: 75000,
        implementationEffort: 'low',
        timeToValue: 30,
        confidence: 0.85,
        requirements: ['Support team training', 'SLA definitions', 'Pricing strategy'],
        metrics: ['Support package adoption', 'Customer satisfaction', 'Recurring revenue'],
        priority: 9
      },
      {
        id: 'service-upsell-2',
        type: 'service_upsell',
        title: 'Consulting Services',
        description: 'Expand into strategic consulting for digital transformation',
        potentialImpact: 120000,
        implementationEffort: 'medium',
        timeToValue: 60,
        confidence: 0.75,
        requirements: ['Senior consultants', 'Methodology development', 'Thought leadership'],
        metrics: ['Consulting revenue', 'Project margins', 'Client retention'],
        priority: 7
      }
    ];
  }

  private async identifyProcessOptimizationOpportunities(): Promise<GrowthOpportunity[]> {
    return [
      {
        id: 'process-optimization-1',
        type: 'process_optimization',
        title: 'AI-Powered Development Acceleration',
        description: 'Implement AI tools to accelerate development processes by 40%',
        potentialImpact: 200000,
        implementationEffort: 'medium',
        timeToValue: 45,
        confidence: 0.8,
        requirements: ['AI tool integration', 'Team training', 'Process redesign'],
        metrics: ['Development velocity', 'Time to delivery', 'Quality metrics'],
        priority: 10
      },
      {
        id: 'process-optimization-2',
        type: 'process_optimization',
        title: 'Automated Quality Assurance',
        description: 'Implement automated testing and QA processes',
        potentialImpact: 80000,
        implementationEffort: 'medium',
        timeToValue: 60,
        confidence: 0.9,
        requirements: ['Testing infrastructure', 'CI/CD pipeline', 'Quality metrics'],
        metrics: ['Bug reduction rate', 'Testing coverage', 'Release frequency'],
        priority: 8
      }
    ];
  }

  private async identifyNewRevenueStreamOpportunities(): Promise<GrowthOpportunity[]> {
    return [
      {
        id: 'revenue-stream-1',
        type: 'new_revenue_stream',
        title: 'SaaS Product Development',
        description: 'Develop and launch a SaaS product for recurring revenue',
        potentialImpact: 300000,
        implementationEffort: 'high',
        timeToValue: 180,
        confidence: 0.6,
        requirements: ['Product development', 'Marketing strategy', 'Customer support'],
        metrics: ['Monthly recurring revenue', 'Customer acquisition', 'Churn rate'],
        priority: 7
      },
      {
        id: 'revenue-stream-2',
        type: 'new_revenue_stream',
        title: 'Training and Certification Programs',
        description: 'Create training programs and certification courses',
        potentialImpact: 50000,
        implementationEffort: 'low',
        timeToValue: 90,
        confidence: 0.7,
        requirements: ['Curriculum development', 'Platform setup', 'Marketing'],
        metrics: ['Course enrollments', 'Completion rates', 'Revenue per course'],
        priority: 5
      }
    ];
  }

  private async predictGrowthForPeriod(
    periodOffset: number,
    historicalMetrics: GrowthMetrics
  ): Promise<GrowthPrediction> {
    const baseGrowthRate = historicalMetrics.revenueGrowthRate / 100;
    const seasonalFactor = this.getSeasonalFactor(periodOffset);
    const confidenceFactor = Math.max(0.5, 1 - (periodOffset * 0.05));

    // Simple compound growth calculation
    const currentRevenue = 50000; // Base assumption
    const predictedRevenue = currentRevenue * Math.pow(1 + (baseGrowthRate * seasonalFactor), periodOffset);

    const clientGrowthFactor = historicalMetrics.clientGrowthRate / 100;
    const currentClients = 25; // Base assumption
    const predictedClients = Math.round(currentClients * Math.pow(1 + clientGrowthFactor, periodOffset));

    return {
      period: this.getPeriodLabel(periodOffset),
      predictedRevenue,
      predictedClients,
      confidence: confidenceFactor,
      growthFactors: [
        'Historical growth trends',
        'Market conditions',
        'Operational improvements',
        'New service offerings'
      ],
      risks: [
        'Market competition',
        'Economic conditions',
        'Capacity constraints',
        'Technology changes'
      ],
      opportunities: [
        'Market expansion',
        'Service diversification',
        'Process optimization',
        'Strategic partnerships'
      ]
    };
  }

  private async getCurrentCapacity(): Promise<number> {
    // This would calculate current capacity based on team size, utilization, etc.
    return 100; // Placeholder: 100 projects per year capacity
  }

  private async getUtilizationRate(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('status')
        .eq('status', 'active');

      if (error) throw error;

      const activeProjects = (data || []).length;
      const capacity = await this.getCurrentCapacity();

      return capacity > 0 ? (activeProjects / capacity) * 100 : 0;
    } catch (error) {
      console.error('Error getting utilization rate:', error);
      return 75; // Default assumption
    }
  }

  private async identifyBottlenecks(): Promise<ScalabilityAnalysis['bottlenecks']> {
    return [
      {
        area: 'Development Team',
        severity: 'medium',
        impact: 'Limits project throughput and delivery speed',
        solution: 'Hire additional developers and implement better project management'
      },
      {
        area: 'Quality Assurance',
        severity: 'high',
        impact: 'Creates delays in project delivery and affects quality',
        solution: 'Implement automated testing and hire QA specialists'
      },
      {
        area: 'Client Onboarding',
        severity: 'low',
        impact: 'Slows new client acquisition and project start times',
        solution: 'Automate onboarding processes and create self-service options'
      }
    ];
  }

  private async generateScalingRecommendations(): Promise<string[]> {
    return [
      'Implement automated testing and deployment pipelines',
      'Expand development team with senior engineers',
      'Invest in AI-powered development tools',
      'Create standardized project templates and processes',
      'Develop strategic partnerships for capacity expansion',
      'Implement knowledge management systems',
      'Automate client onboarding and project management'
    ];
  }

  private async calculateScalingInvestment(bottlenecks: ScalabilityAnalysis['bottlenecks']): Promise<number> {
    const investmentMap = {
      'Development Team': 200000,
      'Quality Assurance': 100000,
      'Client Onboarding': 50000,
      'Infrastructure': 75000,
      'Sales & Marketing': 150000
    };

    return bottlenecks.reduce((total, bottleneck) => {
      const investment = investmentMap[bottleneck.area as keyof typeof investmentMap] || 50000;
      const multiplier = bottleneck.severity === 'high' ? 1.5 : bottleneck.severity === 'medium' ? 1.2 : 1;
      return total + (investment * multiplier);
    }, 0);
  }

  private async identifyGrowthInhibitors(): Promise<Array<{
    factor: string;
    impact: number;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
  }>> {
    return [
      {
        factor: 'Limited Development Capacity',
        impact: 30,
        severity: 'high',
        mitigation: 'Expand development team and implement automation'
      },
      {
        factor: 'Long Sales Cycles',
        impact: 20,
        severity: 'medium',
        mitigation: 'Improve sales processes and value proposition clarity'
      },
      {
        factor: 'Manual Processes',
        impact: 25,
        severity: 'medium',
        mitigation: 'Implement automation and standardized workflows'
      }
    ];
  }

  private groupRevenueByMonth(data: any[]): Array<{ month: string; revenue: number }> {
    const monthGroups: { [key: string]: number } = {};

    data.forEach(item => {
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthGroups[monthKey] = (monthGroups[monthKey] || 0) + (item.amount || 0);
    });

    return Object.entries(monthGroups)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private groupClientsByMonth(data: any[]): Array<{ month: string; count: number }> {
    const monthGroups: { [key: string]: number } = {};

    data.forEach(item => {
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthGroups[monthKey] = (monthGroups[monthKey] || 0) + 1;
    });

    return Object.entries(monthGroups)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private analyzeTrend(value: number): string {
    if (value > 10) return 'increasing';
    if (value < -5) return 'decreasing';
    return 'stable';
  }

  private getSeasonalFactor(periodOffset: number): number {
    // Simple seasonal adjustment
    const seasonalFactors = [1.0, 0.9, 1.1, 1.2, 1.0, 0.8, 0.7, 0.8, 1.1, 1.2, 1.3, 1.4];
    const currentMonth = new Date().getMonth();
    const targetMonth = (currentMonth + periodOffset) % 12;
    return seasonalFactors[targetMonth];
  }

  private getPeriodLabel(periodOffset: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() + periodOffset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private generateStrategyDescription(targetGrowthRate: number, currentMetrics: GrowthMetrics): string {
    if (targetGrowthRate > 50) {
      return 'Aggressive growth strategy focusing on market expansion, new revenue streams, and significant capacity building';
    } else if (targetGrowthRate > 25) {
      return 'Balanced growth strategy emphasizing operational excellence, service expansion, and selective market penetration';
    } else {
      return 'Steady growth strategy prioritizing profitability, process optimization, and sustainable capacity building';
    }
  }

  private selectKeyInitiatives(
    opportunities: GrowthOpportunity[],
    targetGrowthRate: number
  ): Array<{
    initiative: string;
    impact: number;
    timeline: string;
    resources: string[];
  }> {
    const selectedOpportunities = opportunities
      .filter(opp => opp.priority >= 7)
      .slice(0, targetGrowthRate > 30 ? 5 : 3);

    return selectedOpportunities.map(opp => ({
      initiative: opp.title,
      impact: opp.potentialImpact,
      timeline: `${opp.timeToValue} days`,
      resources: opp.requirements
    }));
  }

  private generateMilestones(targetGrowthRate: number, timeframe: number): Array<{
    milestone: string;
    target: number;
    deadline: string;
  }> {
    const milestones = [];
    const quarterlyGrowth = targetGrowthRate / (timeframe / 3);

    for (let quarter = 1; quarter <= Math.ceil(timeframe / 3); quarter++) {
      const date = new Date();
      date.setMonth(date.getMonth() + (quarter * 3));

      milestones.push({
        milestone: `Q${quarter} Growth Target`,
        target: quarterlyGrowth * quarter,
        deadline: date.toISOString().split('T')[0]
      });
    }

    return milestones;
  }

  private identifyRiskFactors(targetGrowthRate: number): string[] {
    const baseRisks = [
      'Market competition intensification',
      'Economic downturn affecting client budgets',
      'Talent acquisition and retention challenges'
    ];

    if (targetGrowthRate > 30) {
      baseRisks.push(
        'Operational capacity constraints',
        'Quality degradation due to rapid scaling',
        'Cash flow management during expansion'
      );
    }

    return baseRisks;
  }

  private defineSuccessMetrics(targetGrowthRate: number): string[] {
    return [
      `Revenue growth rate of ${targetGrowthRate}%`,
      'Client satisfaction score > 8.5',
      'Project delivery time < 7 days average',
      'Client retention rate > 90%',
      'Operational efficiency > 80%',
      'Team utilization rate 70-85%'
    ];
  }

  private getDefaultTimeRange(): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 12);
    return { start, end };
  }
}

export const growthInsightsEngine = new GrowthInsightsEngine();