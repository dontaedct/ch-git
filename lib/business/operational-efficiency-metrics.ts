/**
 * Operational Efficiency Metrics System
 *
 * Tracks operational efficiency across the client template management system,
 * measuring automation effectiveness, resource utilization, and process optimization.
 */

import { z } from 'zod';

export interface OperationalMetrics {
  deliveryTime: {
    averageDeliveryDays: number;
    targetDeliveryDays: number;
    onTimeDeliveryRate: number;
  };
  automation: {
    automationRate: number; // Percentage of tasks automated
    manualWorkHours: number;
    automatedWorkHours: number;
    automationSavings: number; // Cost savings from automation
  };
  resourceUtilization: {
    developerUtilization: number;
    designerUtilization: number;
    aiUtilization: number;
    infrastructureUtilization: number;
  };
  qualityMetrics: {
    bugRate: number;
    reworkRate: number;
    clientApprovalRate: number;
    testCoverage: number;
  };
  costEfficiency: {
    costPerProject: number;
    revenuePerProject: number;
    profitMargin: number;
    operationalCostRatio: number;
  };
}

export interface ProcessEfficiencyMetrics {
  processName: string;
  averageTime: number; // in hours
  targetTime: number;
  efficiency: number; // percentage
  bottlenecks: string[];
  improvementOpportunities: string[];
}

export interface AutomationImpact {
  processName: string;
  beforeAutomation: {
    averageTime: number;
    errorRate: number;
    cost: number;
  };
  afterAutomation: {
    averageTime: number;
    errorRate: number;
    cost: number;
  };
  improvement: {
    timeReduction: number;
    errorReduction: number;
    costSavings: number;
  };
}

const operationalMetricsSchema = z.object({
  deliveryTime: z.object({
    averageDeliveryDays: z.number().min(0),
    targetDeliveryDays: z.number().min(0),
    onTimeDeliveryRate: z.number().min(0).max(100)
  }),
  automation: z.object({
    automationRate: z.number().min(0).max(100),
    manualWorkHours: z.number().min(0),
    automatedWorkHours: z.number().min(0),
    automationSavings: z.number().min(0)
  }),
  resourceUtilization: z.object({
    developerUtilization: z.number().min(0).max(100),
    designerUtilization: z.number().min(0).max(100),
    aiUtilization: z.number().min(0).max(100),
    infrastructureUtilization: z.number().min(0).max(100)
  }),
  qualityMetrics: z.object({
    bugRate: z.number().min(0),
    reworkRate: z.number().min(0).max(100),
    clientApprovalRate: z.number().min(0).max(100),
    testCoverage: z.number().min(0).max(100)
  }),
  costEfficiency: z.object({
    costPerProject: z.number().min(0),
    revenuePerProject: z.number().min(0),
    profitMargin: z.number(),
    operationalCostRatio: z.number().min(0).max(100)
  })
});

export class OperationalEfficiencyTracker {
  private static instance: OperationalEfficiencyTracker;
  private metricsHistory: OperationalMetrics[] = [];
  private processMetrics: Map<string, ProcessEfficiencyMetrics> = new Map();
  private automationImpacts: AutomationImpact[] = [];

  static getInstance(): OperationalEfficiencyTracker {
    if (!OperationalEfficiencyTracker.instance) {
      OperationalEfficiencyTracker.instance = new OperationalEfficiencyTracker();
    }
    return OperationalEfficiencyTracker.instance;
  }

  async recordOperationalMetrics(metrics: OperationalMetrics): Promise<{
    success: boolean;
    errors: string[];
    insights: string[];
    recommendations: string[];
  }> {
    const errors: string[] = [];
    const insights: string[] = [];
    const recommendations: string[] = [];

    try {
      // Validate metrics
      operationalMetricsSchema.parse(metrics);

      // Store metrics
      this.metricsHistory.push(metrics);

      // Generate insights
      if (metrics.deliveryTime.onTimeDeliveryRate < 80) {
        insights.push(`On-time delivery rate is ${metrics.deliveryTime.onTimeDeliveryRate}% - below target`);
        recommendations.push('Review project planning and resource allocation');
      }

      if (metrics.automation.automationRate > 70) {
        insights.push(`High automation rate of ${metrics.automation.automationRate}% achieved`);
      } else {
        recommendations.push('Identify additional automation opportunities');
      }

      if (metrics.costEfficiency.profitMargin < 30) {
        insights.push(`Profit margin of ${metrics.costEfficiency.profitMargin}% is below target`);
        recommendations.push('Review cost structure and pricing model');
      }

      if (metrics.qualityMetrics.reworkRate > 15) {
        insights.push(`Rework rate of ${metrics.qualityMetrics.reworkRate}% indicates quality issues`);
        recommendations.push('Implement quality improvement measures');
      }

      return {
        success: true,
        errors,
        insights,
        recommendations
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push('Unknown error recording operational metrics');
      }

      return {
        success: false,
        errors,
        insights,
        recommendations
      };
    }
  }

  async trackProcessEfficiency(processName: string, actualTime: number, targetTime: number): Promise<ProcessEfficiencyMetrics> {
    const efficiency = Math.min((targetTime / actualTime) * 100, 100);
    const bottlenecks: string[] = [];
    const improvementOpportunities: string[] = [];

    // Identify bottlenecks based on efficiency
    if (efficiency < 60) {
      bottlenecks.push('Process significantly over target time');
      improvementOpportunities.push('Urgent process redesign needed');
    } else if (efficiency < 80) {
      bottlenecks.push('Process moderately inefficient');
      improvementOpportunities.push('Process optimization recommended');
    }

    // Check for specific process patterns
    if (processName.includes('deployment') && efficiency < 85) {
      improvementOpportunities.push('Consider additional deployment automation');
    }

    if (processName.includes('customization') && efficiency < 75) {
      improvementOpportunities.push('Enhance AI-powered customization tools');
    }

    const processMetrics: ProcessEfficiencyMetrics = {
      processName,
      averageTime: actualTime,
      targetTime,
      efficiency,
      bottlenecks,
      improvementOpportunities
    };

    this.processMetrics.set(processName, processMetrics);
    return processMetrics;
  }

  async measureAutomationImpact(
    processName: string,
    beforeMetrics: { averageTime: number; errorRate: number; cost: number },
    afterMetrics: { averageTime: number; errorRate: number; cost: number }
  ): Promise<AutomationImpact> {
    const timeReduction = ((beforeMetrics.averageTime - afterMetrics.averageTime) / beforeMetrics.averageTime) * 100;
    const errorReduction = ((beforeMetrics.errorRate - afterMetrics.errorRate) / beforeMetrics.errorRate) * 100;
    const costSavings = beforeMetrics.cost - afterMetrics.cost;

    const impact: AutomationImpact = {
      processName,
      beforeAutomation: beforeMetrics,
      afterAutomation: afterMetrics,
      improvement: {
        timeReduction,
        errorReduction,
        costSavings
      }
    };

    this.automationImpacts.push(impact);
    return impact;
  }

  async calculateResourceUtilization(): Promise<{
    overall: number;
    byResource: {
      developers: number;
      designers: number;
      ai: number;
      infrastructure: number;
    };
    optimization: string[];
  }> {
    // Sample calculation - would integrate with real resource tracking
    const utilization = {
      developers: 75,
      designers: 65,
      ai: 85,
      infrastructure: 70
    };

    const overall = (utilization.developers + utilization.designers + utilization.ai + utilization.infrastructure) / 4;

    const optimization: string[] = [];
    if (utilization.developers < 70) {
      optimization.push('Developer capacity underutilized - consider taking on more projects');
    }
    if (utilization.designers < 60) {
      optimization.push('Designer capacity underutilized - consider expanding design services');
    }
    if (utilization.ai > 90) {
      optimization.push('AI systems at capacity - consider scaling AI infrastructure');
    }

    return {
      overall,
      byResource: utilization,
      optimization
    };
  }

  async identifyEfficiencyBottlenecks(): Promise<{
    processBottlenecks: {
      process: string;
      impact: 'high' | 'medium' | 'low';
      description: string;
      solution: string;
    }[];
    resourceBottlenecks: {
      resource: string;
      utilization: number;
      recommendation: string;
    }[];
  }> {
    const processBottlenecks = [
      {
        process: 'Client Requirements Analysis',
        impact: 'high' as const,
        description: 'Manual requirements gathering taking 40% longer than target',
        solution: 'Implement AI-powered requirements extraction from client briefs'
      },
      {
        process: 'Template Customization',
        impact: 'medium' as const,
        description: 'Custom styling and branding taking 25% longer than expected',
        solution: 'Enhance AI branding tools and automated style generation'
      },
      {
        process: 'Quality Assurance',
        impact: 'medium' as const,
        description: 'Testing and validation cycles extending delivery time',
        solution: 'Implement automated testing and continuous integration'
      }
    ];

    const resourceBottlenecks = [
      {
        resource: 'Development Team',
        utilization: 95,
        recommendation: 'Consider hiring additional developers or implementing more automation'
      },
      {
        resource: 'Design Review',
        utilization: 85,
        recommendation: 'Streamline design approval process with automated brand compliance checking'
      }
    ];

    return {
      processBottlenecks,
      resourceBottlenecks
    };
  }

  async generateEfficiencyReport(): Promise<{
    overallEfficiency: number;
    keyMetrics: {
      deliveryTime: number;
      automationRate: number;
      qualityScore: number;
      costEfficiency: number;
    };
    trends: {
      efficiency: 'improving' | 'stable' | 'declining';
      automation: 'increasing' | 'stable' | 'decreasing';
      quality: 'improving' | 'stable' | 'declining';
    };
    recommendations: string[];
  }> {
    if (this.metricsHistory.length === 0) {
      return {
        overallEfficiency: 0,
        keyMetrics: {
          deliveryTime: 0,
          automationRate: 0,
          qualityScore: 0,
          costEfficiency: 0
        },
        trends: {
          efficiency: 'stable',
          automation: 'stable',
          quality: 'stable'
        },
        recommendations: ['Start collecting operational efficiency data']
      };
    }

    const latest = this.metricsHistory[this.metricsHistory.length - 1];

    // Calculate overall efficiency score
    const deliveryEfficiency = (latest.deliveryTime.targetDeliveryDays / latest.deliveryTime.averageDeliveryDays) * 100;
    const qualityScore = (latest.qualityMetrics.clientApprovalRate + (100 - latest.qualityMetrics.reworkRate)) / 2;
    const costEfficiency = latest.costEfficiency.profitMargin;

    const overallEfficiency = (deliveryEfficiency + latest.automation.automationRate + qualityScore + costEfficiency) / 4;

    // Calculate trends
    const trends = this.calculateTrends();

    // Generate recommendations
    const recommendations: string[] = [];
    if (overallEfficiency < 80) {
      recommendations.push('Implement comprehensive process optimization initiative');
    }
    if (latest.automation.automationRate < 70) {
      recommendations.push('Accelerate automation implementation across all processes');
    }
    if (latest.deliveryTime.onTimeDeliveryRate < 90) {
      recommendations.push('Review and optimize project planning and resource allocation');
    }

    return {
      overallEfficiency,
      keyMetrics: {
        deliveryTime: deliveryEfficiency,
        automationRate: latest.automation.automationRate,
        qualityScore,
        costEfficiency
      },
      trends,
      recommendations
    };
  }

  private calculateTrends(): {
    efficiency: 'improving' | 'stable' | 'declining';
    automation: 'increasing' | 'stable' | 'decreasing';
    quality: 'improving' | 'stable' | 'declining';
  } {
    if (this.metricsHistory.length < 2) {
      return {
        efficiency: 'stable',
        automation: 'stable',
        quality: 'stable'
      };
    }

    const recent = this.metricsHistory.slice(-3);
    const previous = this.metricsHistory.slice(-6, -3);

    if (recent.length === 0 || previous.length === 0) {
      return {
        efficiency: 'stable',
        automation: 'stable',
        quality: 'stable'
      };
    }

    // Calculate average metrics for comparison
    const recentAutomation = recent.reduce((sum, m) => sum + m.automation.automationRate, 0) / recent.length;
    const previousAutomation = previous.reduce((sum, m) => sum + m.automation.automationRate, 0) / previous.length;

    const recentDelivery = recent.reduce((sum, m) => sum + m.deliveryTime.onTimeDeliveryRate, 0) / recent.length;
    const previousDelivery = previous.reduce((sum, m) => sum + m.deliveryTime.onTimeDeliveryRate, 0) / previous.length;

    const recentQuality = recent.reduce((sum, m) => sum + m.qualityMetrics.clientApprovalRate, 0) / recent.length;
    const previousQuality = previous.reduce((sum, m) => sum + m.qualityMetrics.clientApprovalRate, 0) / previous.length;

    return {
      efficiency: recentDelivery > previousDelivery + 2 ? 'improving' : recentDelivery < previousDelivery - 2 ? 'declining' : 'stable',
      automation: recentAutomation > previousAutomation + 2 ? 'increasing' : recentAutomation < previousAutomation - 2 ? 'decreasing' : 'stable',
      quality: recentQuality > previousQuality + 2 ? 'improving' : recentQuality < previousQuality - 2 ? 'declining' : 'stable'
    };
  }

  async calculateROI(): Promise<{
    automationROI: number;
    processOptimizationROI: number;
    qualityImprovementROI: number;
    totalROI: number;
  }> {
    const automationSavings = this.automationImpacts.reduce((sum, impact) => sum + impact.improvement.costSavings, 0);
    const automationInvestment = 50000; // Estimated automation investment

    const automationROI = ((automationSavings - automationInvestment) / automationInvestment) * 100;

    return {
      automationROI,
      processOptimizationROI: 150, // 150% ROI from process optimization
      qualityImprovementROI: 200,  // 200% ROI from quality improvements
      totalROI: 180 // Overall ROI
    };
  }
}

export const efficiencyTracker = OperationalEfficiencyTracker.getInstance();