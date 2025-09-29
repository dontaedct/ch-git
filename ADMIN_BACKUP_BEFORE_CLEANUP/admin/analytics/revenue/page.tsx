'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Calendar,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  revenueOptimizationEngine,
  RevenueMetrics,
  RevenueOptimization,
  RevenueForecasting
} from '@/lib/analytics/revenue-optimization';
import {
  businessMetricsEngine,
  BusinessMetric
} from '@/lib/analytics/business-metrics';
import {
  clientValueTracker,
  ClientValueInsights
} from '@/lib/analytics/client-value-tracking';
import {
  growthInsightsEngine,
  GrowthOpportunity,
  GrowthPrediction
} from '@/lib/analytics/growth-insights';

interface RevenueOptimizationDashboardState {
  revenueMetrics: RevenueMetrics | null;
  businessMetrics: BusinessMetric[];
  optimizations: RevenueOptimization[];
  forecasting: RevenueForecasting[];
  clientInsights: ClientValueInsights | null;
  growthOpportunities: GrowthOpportunity[];
  growthPredictions: GrowthPrediction[];
  loading: boolean;
  error: string | null;
  selectedTimeRange: string;
  selectedClient: string;
}

export default function RevenueOptimizationPage() {
  const [state, setState] = useState<RevenueOptimizationDashboardState>({
    revenueMetrics: null,
    businessMetrics: [],
    optimizations: [],
    forecasting: [],
    clientInsights: null,
    growthOpportunities: [],
    growthPredictions: [],
    loading: true,
    error: null,
    selectedTimeRange: '12months',
    selectedClient: 'all'
  });

  useEffect(() => {
    loadDashboardData();
  }, [state.selectedTimeRange, state.selectedClient]);

  const loadDashboardData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [
        revenueMetrics,
        businessMetrics,
        optimizations,
        forecasting,
        clientInsights,
        growthOpportunities,
        growthPredictions
      ] = await Promise.all([
        revenueOptimizationEngine.calculateRevenueMetrics(
          state.selectedClient !== 'all' ? state.selectedClient : undefined
        ),
        businessMetricsEngine.calculateRevenueMetrics(),
        revenueOptimizationEngine.generateOptimizationRecommendations(
          state.selectedClient !== 'all' ? state.selectedClient : undefined
        ),
        revenueOptimizationEngine.generateRevenueForecasting(
          state.selectedClient !== 'all' ? state.selectedClient : undefined
        ),
        clientValueTracker.getClientValueInsights(),
        growthInsightsEngine.identifyGrowthOpportunities(),
        growthInsightsEngine.generateGrowthPredictions()
      ]);

      setState(prev => ({
        ...prev,
        revenueMetrics,
        businessMetrics,
        optimizations,
        forecasting,
        clientInsights,
        growthOpportunities,
        growthPredictions,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
        loading: false
      }));
    }
  };

  const handleOptimizationImplementation = async (optimizationId: string) => {
    try {
      await revenueOptimizationEngine.trackOptimizationImplementation(
        optimizationId,
        'implementing'
      );
      await loadDashboardData();
    } catch (error) {
      console.error('Error implementing optimization:', error);
    }
  };

  const exportReport = async () => {
    try {
      const report = await businessMetricsEngine.generateMetricsReport(
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        new Date()
      );

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-optimization-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
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

  const getOptimizationTypeIcon = (type: RevenueOptimization['optimizationType']) => {
    switch (type) {
      case 'pricing':
        return <DollarSign className="h-4 w-4" />;
      case 'upsell':
        return <TrendingUp className="h-4 w-4" />;
      case 'retention':
        return <Users className="h-4 w-4" />;
      case 'expansion':
        return <Target className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getImplementationEffortBadge = (effort: 'low' | 'medium' | 'high') => {
    const variants = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge variant="outline" className={variants[effort]}>
        {effort} effort
      </Badge>
    );
  };

  if (state.loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Optimization Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Analyze revenue performance and identify optimization opportunities
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={state.selectedTimeRange} onValueChange={(value) =>
            setState(prev => ({ ...prev, selectedTimeRange: value }))
          }>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="24months">Last 24 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {state.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Overview */}
      {state.revenueMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(state.revenueMetrics.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(12.5)} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(state.revenueMetrics.monthlyRecurringRevenue)}
              </div>
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
              <div className="text-2xl font-bold">
                {formatCurrency(state.revenueMetrics.averageRevenuePerUser)}
              </div>
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
              <div className="text-2xl font-bold">
                {formatCurrency(state.revenueMetrics.customerLifetimeValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(15.3)} from last period
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="optimizations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="client-insights">Client Insights</TabsTrigger>
          <TabsTrigger value="growth-opportunities">Growth Opportunities</TabsTrigger>
        </TabsList>

        {/* Revenue Optimizations Tab */}
        <TabsContent value="optimizations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimization Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Optimization Recommendations
                </CardTitle>
                <CardDescription>
                  AI-powered recommendations to improve revenue performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.optimizations.map((optimization) => (
                  <div key={optimization.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getOptimizationTypeIcon(optimization.optimizationType)}
                        <span className="font-medium capitalize">
                          {optimization.optimizationType}
                        </span>
                      </div>
                      {getImplementationEffortBadge(optimization.implementationEffort)}
                    </div>

                    <p className="text-sm text-gray-600">
                      {optimization.recommendation}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Current Value:</span>
                        <div className="font-medium">
                          {formatCurrency(optimization.currentValue)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Potential Value:</span>
                        <div className="font-medium text-green-600">
                          {formatCurrency(optimization.potentialValue)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-500">Expected ROI:</span>
                        <span className="font-medium ml-1">
                          {optimization.expectedROI.toFixed(1)}x
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Time to Implement:</span>
                        <span className="font-medium ml-1">
                          {optimization.timeToImplement} days
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Progress value={optimization.confidence * 100} className="flex-1 mr-4" />
                      <Button
                        size="sm"
                        onClick={() => handleOptimizationImplementation(optimization.id)}
                      >
                        Implement
                      </Button>
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
                  Track important business performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.businessMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{metric.name}</span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="text-2xl font-bold mt-1">
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
                      <div className="text-xs text-gray-500">
                        vs. previous period
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Revenue Forecasting
              </CardTitle>
              <CardDescription>
                AI-powered revenue predictions for the next 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.forecasting.slice(0, 6).map((forecast, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{forecast.period}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {formatPercentage(forecast.confidence * 100)} confidence
                        </Badge>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(forecast.forecastedRevenue)}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div className="mb-1">
                        <strong>Key Factors:</strong> {forecast.factors.join(', ')}
                      </div>
                      <div>
                        <strong>Assumptions:</strong> {forecast.assumptions.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Insights Tab */}
        <TabsContent value="client-insights" className="space-y-6">
          {state.clientInsights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Clients */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Clients</CardTitle>
                  <CardDescription>
                    Highest value clients by revenue and engagement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {state.clientInsights.topClients.slice(0, 5).map((client) => (
                    <div key={client.clientId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{client.clientName}</span>
                        <Badge className={`${
                          client.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                          client.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                          client.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {client.tier}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Total Revenue:</span>
                          <div className="font-medium">
                            {formatCurrency(client.totalRevenue)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Value Score:</span>
                          <div className="font-medium">
                            {client.valueScore.toFixed(1)}/100
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* At-Risk Clients */}
              <Card>
                <CardHeader>
                  <CardTitle>At-Risk Clients</CardTitle>
                  <CardDescription>
                    Clients requiring immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {state.clientInsights.atRiskClients.slice(0, 5).map((client) => (
                    <div key={client.clientId} className="p-3 border rounded-lg border-red-200 bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{client.clientName}</span>
                        <Badge variant="destructive">
                          {client.riskLevel} risk
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Retention Probability:</span>
                          <div className="font-medium">
                            {formatPercentage(client.retentionProbability * 100)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Revenue:</span>
                          <div className="font-medium">
                            {formatCurrency(client.totalRevenue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Growth Opportunities Tab */}
        <TabsContent value="growth-opportunities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
                <CardDescription>
                  Strategic opportunities for business expansion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.growthOpportunities.slice(0, 5).map((opportunity) => (
                  <div key={opportunity.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{opportunity.title}</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        Priority {opportunity.priority}/10
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600">
                      {opportunity.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Potential Impact:</span>
                        <div className="font-medium">
                          {formatCurrency(opportunity.potentialImpact)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Time to Value:</span>
                        <div className="font-medium">
                          {opportunity.timeToValue} days
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {getImplementationEffortBadge(opportunity.implementationEffort)}
                      <div className="text-sm">
                        <span className="text-gray-500">Confidence:</span>
                        <span className="font-medium ml-1">
                          {formatPercentage(opportunity.confidence * 100)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Growth Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Predictions</CardTitle>
                <CardDescription>
                  Predicted growth trajectory for next 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.growthPredictions.slice(0, 6).map((prediction) => (
                  <div key={prediction.period} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{prediction.period}</span>
                      <Badge variant="outline">
                        {formatPercentage(prediction.confidence * 100)} confidence
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Predicted Revenue:</span>
                        <div className="font-medium text-green-600">
                          {formatCurrency(prediction.predictedRevenue)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Predicted Clients:</span>
                        <div className="font-medium">
                          {prediction.predictedClients}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}