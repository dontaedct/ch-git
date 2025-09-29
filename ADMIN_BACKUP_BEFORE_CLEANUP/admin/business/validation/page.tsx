'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb
} from 'lucide-react';

interface BusinessHealth {
  overall: {
    healthScore: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    trend: 'improving' | 'stable' | 'declining';
  };
  revenue: {
    score: number;
    status: 'on-track' | 'at-risk' | 'off-track';
    projectedRevenue: number;
    actualRevenue: number;
    profitMargin: number;
  };
  satisfaction: {
    score: number;
    averageNPS: number;
    retentionRate: number;
    status: 'excellent' | 'good' | 'needs-improvement';
  };
  efficiency: {
    score: number;
    automationRate: number;
    deliveryPerformance: number;
    status: 'optimized' | 'good' | 'needs-optimization';
  };
}

interface BusinessInsights {
  keyFindings: string[];
  opportunities: string[];
  risks: string[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: 'revenue' | 'satisfaction' | 'efficiency' | 'strategic';
    description: string;
    expectedImpact: string;
    timeline: string;
  }[];
}

interface GrowthProjection {
  timeframe: '3-month' | '6-month' | '12-month';
  revenue: { projected: number; confidence: number };
  clients: { projected: number; acquisitionRate: number };
  efficiency: { projectedImprovement: number };
}

interface ROIData {
  totalInvestment: number;
  totalReturn: number;
  roiPercentage: number;
  paybackPeriod: number;
}

export default function BusinessValidationPage() {
  const [businessHealth, setBusinessHealth] = useState<BusinessHealth | null>(null);
  const [insights, setInsights] = useState<BusinessInsights | null>(null);
  const [growthProjection, setGrowthProjection] = useState<GrowthProjection | null>(null);
  const [roiData, setROIData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3-month' | '6-month' | '12-month'>('6-month');

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - in real implementation, these would call the business analytics API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - replace with actual API calls
      setBusinessHealth({
        overall: {
          healthScore: 82,
          status: 'good',
          trend: 'improving'
        },
        revenue: {
          score: 85,
          status: 'on-track',
          projectedRevenue: 280000,
          actualRevenue: 165000,
          profitMargin: 0.35
        },
        satisfaction: {
          score: 78,
          averageNPS: 65,
          retentionRate: 92,
          status: 'good'
        },
        efficiency: {
          score: 88,
          automationRate: 75,
          deliveryPerformance: 94,
          status: 'optimized'
        }
      });

      setInsights({
        keyFindings: [
          'Business model is performing well with strong automation and efficiency',
          'Client satisfaction is good but has room for improvement',
          'Revenue growth is on track with strong profit margins'
        ],
        opportunities: [
          'High efficiency enables competitive pricing and faster delivery',
          'Strong automation foundation supports scaling operations',
          'Good client satisfaction provides foundation for premium pricing'
        ],
        risks: [
          'Client satisfaction scores indicate potential retention challenges',
          'Market competition increasing in automated template space'
        ],
        recommendations: [
          {
            priority: 'high',
            category: 'satisfaction',
            description: 'Launch client satisfaction improvement program with enhanced support',
            expectedImpact: 'Increase NPS by 20-30 points',
            timeline: '2-4 months'
          },
          {
            priority: 'medium',
            category: 'revenue',
            description: 'Implement premium service tier for enterprise clients',
            expectedImpact: '25-35% revenue increase',
            timeline: '3-6 months'
          },
          {
            priority: 'medium',
            category: 'strategic',
            description: 'Expand template offerings for specialized industries',
            expectedImpact: '40-60% market expansion',
            timeline: '6-12 months'
          }
        ]
      });

      setGrowthProjection({
        timeframe: selectedTimeframe,
        revenue: { projected: 378000, confidence: 85 },
        clients: { projected: 27, acquisitionRate: 3.5 },
        efficiency: { projectedImprovement: 25 }
      });

      setROIData({
        totalInvestment: 150000,
        totalReturn: 400000,
        roiPercentage: 167,
        paybackPeriod: 8
      });

    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'good':
      case 'on-track':
      case 'optimized':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'warning':
      case 'at-risk':
      case 'needs-improvement':
      case 'needs-optimization':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
      case 'off-track':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Validation Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive business model validation and performance analytics
          </p>
        </div>
        <Button onClick={loadBusinessData}>
          Refresh Data
        </Button>
      </div>

      {/* Business Health Overview */}
      {businessHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
              {getTrendIcon(businessHealth.overall.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businessHealth.overall.healthScore}/100</div>
              <div className="flex items-center space-x-2 mt-2">
                {getStatusIcon(businessHealth.overall.status)}
                <Badge variant={businessHealth.overall.status === 'excellent' ? 'default' : 'secondary'}>
                  {businessHealth.overall.status}
                </Badge>
              </div>
              <Progress value={businessHealth.overall.healthScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Performance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businessHealth.revenue.score}/100</div>
              <div className="flex items-center space-x-2 mt-2">
                {getStatusIcon(businessHealth.revenue.status)}
                <Badge variant={businessHealth.revenue.status === 'on-track' ? 'default' : 'secondary'}>
                  {businessHealth.revenue.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ${businessHealth.revenue.profitMargin * 100}% profit margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Client Satisfaction</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businessHealth.satisfaction.score}/100</div>
              <div className="flex items-center space-x-2 mt-2">
                {getStatusIcon(businessHealth.satisfaction.status)}
                <Badge variant={businessHealth.satisfaction.status === 'excellent' ? 'default' : 'secondary'}>
                  {businessHealth.satisfaction.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                NPS: {businessHealth.satisfaction.averageNPS}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational Efficiency</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businessHealth.efficiency.score}/100</div>
              <div className="flex items-center space-x-2 mt-2">
                {getStatusIcon(businessHealth.efficiency.status)}
                <Badge variant={businessHealth.efficiency.status === 'optimized' ? 'default' : 'secondary'}>
                  {businessHealth.efficiency.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {businessHealth.efficiency.automationRate}% automated
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Business Insights</TabsTrigger>
          <TabsTrigger value="growth">Growth Projections</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Key Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Risk Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.risks.map((risk, index) => (
                      <li key={index} className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          {growthProjection && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Projection</CardTitle>
                  <CardDescription>{selectedTimeframe} forecast</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ${growthProjection.revenue.projected.toLocaleString()}
                  </div>
                  <div className="flex items-center mt-2">
                    <Target className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-sm text-muted-foreground">
                      {growthProjection.revenue.confidence}% confidence
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Growth</CardTitle>
                  <CardDescription>Projected client base</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {growthProjection.clients.projected}
                  </div>
                  <div className="flex items-center mt-2">
                    <Users className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-sm text-muted-foreground">
                      {growthProjection.clients.acquisitionRate} clients/month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Gains</CardTitle>
                  <CardDescription>Operational improvements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    +{growthProjection.efficiency.projectedImprovement}%
                  </div>
                  <div className="flex items-center mt-2">
                    <Zap className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-sm text-muted-foreground">
                      Efficiency improvement
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          {roiData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ROI Overview</CardTitle>
                  <CardDescription>Investment return analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Investment</span>
                        <span className="font-medium">${roiData.totalInvestment.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Return</span>
                        <span className="font-medium text-green-600">${roiData.totalReturn.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">ROI Percentage</span>
                        <span className="font-medium text-green-600">{roiData.roiPercentage}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Payback Period</span>
                        <span className="font-medium">{roiData.paybackPeriod} months</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Breakdown</CardTitle>
                  <CardDescription>ROI by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Automation Systems</span>
                      <Badge variant="default">+180% ROI</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Process Optimization</span>
                      <Badge variant="default">+150% ROI</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Client Satisfaction</span>
                      <Badge variant="default">+200% ROI</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {insights && (
            <div className="space-y-4">
              {insights.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{rec.description}</CardTitle>
                      <Badge variant={getPriorityColor(rec.priority)}>
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <CardDescription>
                      Category: {rec.category} • Timeline: {rec.timeline}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm font-medium">Expected Impact:</span>
                      </div>
                      <span className="text-sm text-green-600">{rec.expectedImpact}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}