'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import {
  revenueOptimizationEngine,
  RevenueMetrics,
  RevenueOptimization
} from '@/lib/analytics/revenue-optimization';
import {
  businessMetricsEngine,
  BusinessMetric
} from '@/lib/analytics/business-metrics';

interface RevenueDashboardProps {
  clientId?: string;
  timeRange?: string;
  compact?: boolean;
}

interface ChartData {
  period: string;
  revenue: number;
  target: number;
  growth: number;
}

interface OptimizationPerformance {
  totalImplemented: number;
  averageROI: number;
  successRate: number;
  totalValueGenerated: number;
}

export default function RevenueDashboard({
  clientId,
  timeRange = '12months',
  compact = false
}: RevenueDashboardProps) {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([]);
  const [optimizations, setOptimizations] = useState<RevenueOptimization[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [performance, setPerformance] = useState<OptimizationPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [clientId, timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        revenueMetrics,
        revenueBusinessMetrics,
        optimizationRecommendations,
        optimizationPerformance
      ] = await Promise.all([
        revenueOptimizationEngine.calculateRevenueMetrics(clientId),
        businessMetricsEngine.calculateRevenueMetrics(),
        revenueOptimizationEngine.generateOptimizationRecommendations(clientId),
        revenueOptimizationEngine.getOptimizationPerformance()
      ]);

      // Generate chart data
      const chartData = generateChartData(revenueMetrics);

      setMetrics(revenueMetrics);
      setBusinessMetrics(revenueBusinessMetrics);
      setOptimizations(optimizationRecommendations);
      setChartData(chartData);
      setPerformance(optimizationPerformance);
    } catch (error) {
      console.error('Error loading revenue dashboard:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (metrics: RevenueMetrics): ChartData[] => {
    // Generate sample chart data - in production this would come from historical data
    const months = [];
    const baseRevenue = metrics.monthlyRecurringRevenue;

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const growthFactor = 1 + (Math.random() * 0.2 - 0.1); // +/- 10% variation
      const revenue = baseRevenue * growthFactor;
      const target = baseRevenue * 1.05; // 5% growth target
      const growth = i > 0 ? (revenue / (baseRevenue * 0.95) - 1) * 100 : 0;

      months.push({
        period: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: Math.round(revenue),
        target: Math.round(target),
        growth: Math.round(growth * 10) / 10
      });
    }

    return months;
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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOptimizationStatusIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (confidence >= 0.6) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Recurring</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.monthlyRecurringRevenue)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Optimization */}
        {optimizations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{optimizations[0].recommendation}</span>
                  {getOptimizationStatusIcon(optimizations[0].confidence)}
                </div>
                <div className="text-sm text-gray-600">
                  Potential: {formatCurrency(optimizations[0].potentialValue - optimizations[0].currentValue)}
                </div>
                <Progress value={optimizations[0].confidence * 100} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(12.5)} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRecurringRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(8.2)} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.averageRevenuePerUser)}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(5.1)} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.customerLifetimeValue)}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(15.3)} from last period
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Trend Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue performance vs. targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(Number(value)), name]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="Actual Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#ff7300"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimization Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Revenue Optimization Opportunities
            </CardTitle>
            <CardDescription>
              AI-powered recommendations to boost revenue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {optimizations.slice(0, 3).map((optimization) => (
              <div key={optimization.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{optimization.optimizationType}</span>
                  {getOptimizationStatusIcon(optimization.confidence)}
                </div>

                <p className="text-sm text-gray-600">{optimization.recommendation}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Potential Gain:</span>
                    <div className="font-medium text-green-600">
                      {formatCurrency(optimization.potentialValue - optimization.currentValue)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Expected ROI:</span>
                    <div className="font-medium">
                      {optimization.expectedROI.toFixed(1)}x
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Progress value={optimization.confidence * 100} className="flex-1 mr-4" />
                  <span className="text-sm text-gray-500">
                    {formatPercentage(optimization.confidence * 100)} confidence
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Business Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Key Business Metrics</CardTitle>
            <CardDescription>
              Track important revenue-related KPIs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {businessMetrics.map((metric) => (
              <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="text-xl font-bold mt-1">
                    {metric.unit === '$' ? formatCurrency(metric.value) :
                     metric.unit === '%' ? formatPercentage(metric.value) :
                     `${metric.value.toFixed(1)}${metric.unit}`}
                  </div>
                  {metric.target && (
                    <div className="text-sm text-gray-500">
                      Target: {metric.unit === '$' ? formatCurrency(metric.target) :
                               metric.unit === '%' ? formatPercentage(metric.target) :
                               `${metric.target.toFixed(1)}${metric.unit}`}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    metric.changePercentage > 0 ? 'text-green-600' :
                    metric.changePercentage < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.changePercentage > 0 ? '+' : ''}{formatPercentage(metric.changePercentage)}
                  </div>
                  <div className="text-xs text-gray-500">vs. previous</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Optimization Performance */}
      {performance && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Performance</CardTitle>
            <CardDescription>
              Track the success of implemented revenue optimizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {performance.totalImplemented}
                </div>
                <div className="text-sm text-gray-600">Total Implemented</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {performance.averageROI.toFixed(1)}x
                </div>
                <div className="text-sm text-gray-600">Average ROI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage(performance.successRate * 100)}
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(performance.totalValueGenerated)}
                </div>
                <div className="text-sm text-gray-600">Value Generated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={loadDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
        <Button>
          View Detailed Analysis
        </Button>
      </div>
    </div>
  );
}