'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Download,
  RefreshCw,
  Zap,
  Globe,
  Settings
} from 'lucide-react';

interface BusinessMetrics {
  revenue: {
    total: number;
    monthly: number;
    quarterly: number;
    yearly: number;
    growth: {
      monthOverMonth: number;
      quarterOverQuarter: number;
      yearOverYear: number;
    };
  };
  clients: {
    total: number;
    active: number;
    churned: number;
    newAcquisitions: number;
    retention: {
      monthly: number;
      quarterly: number;
      yearly: number;
    };
  };
  operations: {
    deliveryTime: {
      average: number;
      median: number;
      percentile95: number;
    };
    resourceUtilization: number;
    automationLevel: number;
    qualityScore: number;
  };
  profitability: {
    grossMargin: number;
    netMargin: number;
    costPerClient: number;
    lifeTimeValue: number;
    paybackPeriod: number;
  };
}

interface ExecutiveDashboard {
  summary: {
    totalRevenue: number;
    monthlyGrowth: number;
    activeClients: number;
    retentionRate: number;
    deliveryTime: number;
    profitMargin: number;
  };
  keyInsights: string[];
  alerts: Array<{
    type: 'warning' | 'critical' | 'info';
    message: string;
    priority: string;
  }>;
  recommendations: string[];
  kpis: Record<string, number>;
  trends: {
    revenue: {
      trend: string;
      confidence: number;
      seasonality: string;
    };
    clients: {
      acquisition: string;
      retention: string;
      satisfaction: string;
    };
    operations: {
      efficiency: string;
      automation: string;
      quality: string;
    };
  };
}

interface BusinessDashboardProps {
  className?: string;
  timeRange?: string;
  refreshInterval?: number;
}

export default function BusinessDashboard({
  className = '',
  timeRange = '30d',
  refreshInterval = 300000 // 5 minutes
}: BusinessDashboardProps) {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [executiveDashboard, setExecutiveDashboard] = useState<ExecutiveDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadBusinessMetrics();
    const interval = setInterval(loadBusinessMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [timeRange, refreshInterval]);

  const loadBusinessMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMetrics: BusinessMetrics = {
        revenue: {
          total: 2450000,
          monthly: 204167,
          quarterly: 612500,
          yearly: 2450000,
          growth: {
            monthOverMonth: 8.5,
            quarterOverQuarter: 12.3,
            yearOverYear: 25.7
          }
        },
        clients: {
          total: 85,
          active: 78,
          churned: 7,
          newAcquisitions: 12,
          retention: {
            monthly: 94.2,
            quarterly: 89.5,
            yearly: 85.8
          }
        },
        operations: {
          deliveryTime: {
            average: 5.2,
            median: 4.8,
            percentile95: 6.9
          },
          resourceUtilization: 87.3,
          automationLevel: 78.5,
          qualityScore: 92.1
        },
        profitability: {
          grossMargin: 68.5,
          netMargin: 23.2,
          costPerClient: 2850,
          lifeTimeValue: 85000,
          paybackPeriod: 3.2
        }
      };

      const mockExecutiveDashboard: ExecutiveDashboard = {
        summary: {
          totalRevenue: 2450000,
          monthlyGrowth: 8.5,
          activeClients: 78,
          retentionRate: 94.2,
          deliveryTime: 5.2,
          profitMargin: 68.5
        },
        keyInsights: [
          'Revenue growth of 8.5% month-over-month exceeds industry average',
          'Client retention rate of 94.2% indicates strong satisfaction',
          'Average delivery time of 5.2 days beats 7-day target',
          '2 clients at high risk of churn require immediate attention',
          'Automation level of 78.5% driving operational efficiency gains'
        ],
        alerts: [
          {
            type: 'warning',
            message: '2 clients showing declining engagement metrics',
            priority: 'medium'
          },
          {
            type: 'info',
            message: 'Q4 revenue target 87% achieved with 1 month remaining',
            priority: 'low'
          }
        ],
        recommendations: [
          'Focus on enterprise market expansion given current success metrics',
          'Invest in AI customization to maintain competitive advantage',
          'Implement proactive churn prevention for high-risk clients',
          'Explore international market opportunities in EU and APAC'
        ],
        kpis: {
          'Monthly Recurring Revenue': 204167,
          'Customer Acquisition Cost': 2850,
          'Customer Lifetime Value': 85000,
          'Churn Rate': 5.8,
          'Gross Margin': 68.5,
          'Net Promoter Score': 8.5
        },
        trends: {
          revenue: {
            trend: 'increasing',
            confidence: 0.92,
            seasonality: 'Q4 peak performance'
          },
          clients: {
            acquisition: 'accelerating',
            retention: 'stable',
            satisfaction: 'improving'
          },
          operations: {
            efficiency: 'improving',
            automation: 'increasing',
            quality: 'maintained'
          }
        }
      };

      setMetrics(mockMetrics);
      setExecutiveDashboard(mockExecutiveDashboard);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load business metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'accelerating':
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'accelerating':
      case 'improving':
        return 'text-green-600';
      case 'decreasing':
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  if (loading && !metrics) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading business intelligence dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Error loading business metrics: {error}</span>
            </div>
            <Button onClick={loadBusinessMetrics} className="mt-4" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics || !executiveDashboard) {
    return (
      <div className={`p-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">No business metrics available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Business Intelligence Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive business metrics and strategic insights
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadBusinessMetrics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Total Revenue</p>
                <p className="text-lg font-bold">{formatCurrency(executiveDashboard.summary.totalRevenue)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                +{formatPercentage(executiveDashboard.summary.monthlyGrowth)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Active Clients</p>
                <p className="text-lg font-bold">{executiveDashboard.summary.activeClients}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {formatPercentage(executiveDashboard.summary.retentionRate)} retention
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Delivery Time</p>
                <p className="text-lg font-bold">{executiveDashboard.summary.deliveryTime} days</p>
              </div>
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                Under target
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Profit Margin</p>
                <p className="text-lg font-bold">{formatPercentage(executiveDashboard.summary.profitMargin)}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Gross margin
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Automation</p>
                <p className="text-lg font-bold">{formatPercentage(metrics.operations.automationLevel)}</p>
              </div>
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="mt-2">
              <Progress value={metrics.operations.automationLevel} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Quality Score</p>
                <p className="text-lg font-bold">{metrics.operations.qualityScore}/100</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="mt-2">
              <Progress value={metrics.operations.qualityScore} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Primary business metrics and KPIs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(executiveDashboard.kpis).map(([kpi, value]) => (
                    <div key={kpi} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{kpi}</span>
                      <span className="text-sm font-semibold">
                        {kpi.includes('Revenue') || kpi.includes('Cost') || kpi.includes('Value') ?
                          formatCurrency(value) :
                          kpi.includes('Rate') || kpi.includes('Margin') ?
                            formatPercentage(value) :
                            value.toFixed(1)
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Trends</CardTitle>
                <CardDescription>Current trend analysis across key areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Revenue Growth</span>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(executiveDashboard.trends.revenue.trend)}
                        <span className={`text-sm font-medium ${getTrendColor(executiveDashboard.trends.revenue.trend)}`}>
                          {executiveDashboard.trends.revenue.trend}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Client Acquisition</span>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(executiveDashboard.trends.clients.acquisition)}
                        <span className={`text-sm font-medium ${getTrendColor(executiveDashboard.trends.clients.acquisition)}`}>
                          {executiveDashboard.trends.clients.acquisition}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Operational Efficiency</span>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(executiveDashboard.trends.operations.efficiency)}
                        <span className={`text-sm font-medium ${getTrendColor(executiveDashboard.trends.operations.efficiency)}`}>
                          {executiveDashboard.trends.operations.efficiency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth Trend</CardTitle>
                <CardDescription>Monthly revenue progression</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Revenue trend visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Distribution</CardTitle>
                <CardDescription>Client segmentation and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Client distribution chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Current period revenue analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Revenue</span>
                    <span className="font-semibold">{formatCurrency(metrics.revenue.monthly)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quarterly Revenue</span>
                    <span className="font-semibold">{formatCurrency(metrics.revenue.quarterly)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Yearly Revenue</span>
                    <span className="font-semibold">{formatCurrency(metrics.revenue.yearly)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Revenue</span>
                      <span className="text-lg font-bold">{formatCurrency(metrics.revenue.total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Revenue growth analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Month over Month</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      +{formatPercentage(metrics.revenue.growth.monthOverMonth)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quarter over Quarter</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      +{formatPercentage(metrics.revenue.growth.quarterOverQuarter)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Year over Year</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      +{formatPercentage(metrics.revenue.growth.yearOverYear)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profitability</CardTitle>
                <CardDescription>Profit margins and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gross Margin</span>
                    <span className="font-semibold">{formatPercentage(metrics.profitability.grossMargin)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Net Margin</span>
                    <span className="font-semibold">{formatPercentage(metrics.profitability.netMargin)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cost per Client</span>
                    <span className="font-semibold">{formatCurrency(metrics.profitability.costPerClient)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lifetime Value</span>
                    <span className="font-semibold">{formatCurrency(metrics.profitability.lifeTimeValue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Metrics</CardTitle>
                <CardDescription>Current client portfolio status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="font-medium">Total Clients</span>
                    <span className="text-2xl font-bold text-blue-600">{metrics.clients.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="font-medium">Active Clients</span>
                    <span className="text-2xl font-bold text-green-600">{metrics.clients.active}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                    <span className="font-medium">New Acquisitions</span>
                    <span className="text-2xl font-bold text-purple-600">{metrics.clients.newAcquisitions}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                    <span className="font-medium">Churned Clients</span>
                    <span className="text-2xl font-bold text-red-600">{metrics.clients.churned}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Rates</CardTitle>
                <CardDescription>Client retention across different periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Monthly Retention</span>
                      <span className="text-sm font-semibold">{formatPercentage(metrics.clients.retention.monthly)}</span>
                    </div>
                    <Progress value={metrics.clients.retention.monthly} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Quarterly Retention</span>
                      <span className="text-sm font-semibold">{formatPercentage(metrics.clients.retention.quarterly)}</span>
                    </div>
                    <Progress value={metrics.clients.retention.quarterly} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Yearly Retention</span>
                      <span className="text-sm font-semibold">{formatPercentage(metrics.clients.retention.yearly)}</span>
                    </div>
                    <Progress value={metrics.clients.retention.yearly} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
                <CardDescription>Project delivery time metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Delivery Time</span>
                    <Badge variant={metrics.operations.deliveryTime.average <= 7 ? "default" : "secondary"}>
                      {metrics.operations.deliveryTime.average} days
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Median Delivery Time</span>
                    <Badge variant="outline">
                      {metrics.operations.deliveryTime.median} days
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">95th Percentile</span>
                    <Badge variant="outline">
                      {metrics.operations.deliveryTime.percentile95} days
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operational Efficiency</CardTitle>
                <CardDescription>Resource utilization and automation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Resource Utilization</span>
                      <span className="text-sm font-semibold">{formatPercentage(metrics.operations.resourceUtilization)}</span>
                    </div>
                    <Progress value={metrics.operations.resourceUtilization} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Automation Level</span>
                      <span className="text-sm font-semibold">{formatPercentage(metrics.operations.automationLevel)}</span>
                    </div>
                    <Progress value={metrics.operations.automationLevel} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Quality Score</span>
                      <span className="text-sm font-semibold">{metrics.operations.qualityScore}/100</span>
                    </div>
                    <Progress value={metrics.operations.qualityScore} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Business Insights</CardTitle>
                <CardDescription>AI-generated insights from data analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {executiveDashboard.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strategic Recommendations</CardTitle>
                <CardDescription>Actionable recommendations for growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {executiveDashboard.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded">
                      <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>System Alerts & Notifications</CardTitle>
                <CardDescription>Important alerts requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {executiveDashboard.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-2 p-3 rounded ${
                        alert.type === 'warning' ? 'bg-yellow-50' :
                        alert.type === 'critical' ? 'bg-red-50' : 'bg-blue-50'
                      }`}
                    >
                      <AlertTriangle
                        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          alert.type === 'warning' ? 'text-yellow-600' :
                          alert.type === 'critical' ? 'text-red-600' : 'text-blue-600'
                        }`}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{alert.message}</span>
                        <div className="mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              alert.priority === 'high' ? 'border-red-300 text-red-700' :
                              alert.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-blue-300 text-blue-700'
                            }`}
                          >
                            {alert.priority} priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}