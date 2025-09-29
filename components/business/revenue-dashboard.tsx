'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  BarChart3,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface RevenueMetrics {
  totalRevenue: number;
  projectedRevenue: number;
  monthlyRecurring: number;
  profitMargin: number;
  growthRate: number;
  clientCount: number;
  averageProjectValue: number;
  churnRate: number;
}

interface RevenueBreakdown {
  templates: number;
  customization: number;
  deployment: number;
  maintenance: number;
  consulting: number;
}

interface RevenueGoals {
  monthly: { target: number; current: number; progress: number };
  quarterly: { target: number; current: number; progress: number };
  annual: { target: number; current: number; progress: number };
}

interface ClientMetrics {
  newClients: number;
  retainedClients: number;
  upsoldClients: number;
  averageLifetimeValue: number;
  acquisitionCost: number;
}

export default function RevenueDashboard() {
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [revenueGoals, setRevenueGoals] = useState<RevenueGoals | null>(null);
  const [clientMetrics, setClientMetrics] = useState<ClientMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, [timeframe]);

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual revenue validation API
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data based on timeframe
      const baseMultiplier = timeframe === 'year' ? 12 : timeframe === 'quarter' ? 3 : 1;

      setRevenueMetrics({
        totalRevenue: 45000 * baseMultiplier,
        projectedRevenue: 52000 * baseMultiplier,
        monthlyRecurring: 8500,
        profitMargin: 0.35,
        growthRate: 0.23,
        clientCount: 18,
        averageProjectValue: 7500,
        churnRate: 0.05
      });

      setRevenueBreakdown({
        templates: 15000 * baseMultiplier,
        customization: 18000 * baseMultiplier,
        deployment: 7000 * baseMultiplier,
        maintenance: 3500 * baseMultiplier,
        consulting: 1500 * baseMultiplier
      });

      setRevenueGoals({
        monthly: { target: 50000, current: 45000, progress: 90 },
        quarterly: { target: 150000, current: 135000, progress: 90 },
        annual: { target: 600000, current: 540000, progress: 90 }
      });

      setClientMetrics({
        newClients: 5,
        retainedClients: 16,
        upsoldClients: 3,
        averageLifetimeValue: 25000,
        acquisitionCost: 750
      });

    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (progress: number) => {
    if (progress >= 90) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (progress >= 75) return <ArrowUp className="h-5 w-5 text-blue-500" />;
    if (progress >= 50) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Revenue Validation Dashboard</h2>
          <p className="text-muted-foreground">
            Track revenue performance, goals, and business model validation
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeframe} onValueChange={(value: 'month' | 'quarter' | 'year') => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadRevenueData}>Refresh</Button>
        </div>
      </div>

      {/* Key Revenue Metrics */}
      {revenueMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.totalRevenue)}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{formatPercentage(revenueMetrics.growthRate)} vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(revenueMetrics.profitMargin)}</div>
              <div className="text-xs text-muted-foreground">
                Industry target: 30%+
              </div>
              <Progress value={revenueMetrics.profitMargin * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.monthlyRecurring)}</div>
              <div className="text-xs text-muted-foreground">
                From {revenueMetrics.clientCount} active clients
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Project Value</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.averageProjectValue)}</div>
              <div className="text-xs text-muted-foreground">
                Target: $8,000+
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="goals">Revenue Goals</TabsTrigger>
          <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="clients">Client Metrics</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          {revenueGoals && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Monthly Goal
                    {getStatusIcon(revenueGoals.monthly.progress)}
                  </CardTitle>
                  <CardDescription>Current month performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Target</span>
                      <span className="font-medium">{formatCurrency(revenueGoals.monthly.target)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current</span>
                      <span className={`font-medium ${getProgressColor(revenueGoals.monthly.progress)}`}>
                        {formatCurrency(revenueGoals.monthly.current)}
                      </span>
                    </div>
                    <Progress value={revenueGoals.monthly.progress} className="mt-2" />
                    <div className="text-center text-sm text-muted-foreground">
                      {revenueGoals.monthly.progress}% of goal
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Quarterly Goal
                    {getStatusIcon(revenueGoals.quarterly.progress)}
                  </CardTitle>
                  <CardDescription>Current quarter performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Target</span>
                      <span className="font-medium">{formatCurrency(revenueGoals.quarterly.target)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current</span>
                      <span className={`font-medium ${getProgressColor(revenueGoals.quarterly.progress)}`}>
                        {formatCurrency(revenueGoals.quarterly.current)}
                      </span>
                    </div>
                    <Progress value={revenueGoals.quarterly.progress} className="mt-2" />
                    <div className="text-center text-sm text-muted-foreground">
                      {revenueGoals.quarterly.progress}% of goal
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Annual Goal
                    {getStatusIcon(revenueGoals.annual.progress)}
                  </CardTitle>
                  <CardDescription>Current year performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Target</span>
                      <span className="font-medium">{formatCurrency(revenueGoals.annual.target)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current</span>
                      <span className={`font-medium ${getProgressColor(revenueGoals.annual.progress)}`}>
                        {formatCurrency(revenueGoals.annual.current)}
                      </span>
                    </div>
                    <Progress value={revenueGoals.annual.progress} className="mt-2" />
                    <div className="text-center text-sm text-muted-foreground">
                      {revenueGoals.annual.progress}% of goal
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          {revenueBreakdown && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Service</CardTitle>
                  <CardDescription>Breakdown of revenue sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Templates</span>
                      <span className="font-medium">{formatCurrency(revenueBreakdown.templates)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customization</span>
                      <span className="font-medium">{formatCurrency(revenueBreakdown.customization)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Deployment</span>
                      <span className="font-medium">{formatCurrency(revenueBreakdown.deployment)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Maintenance</span>
                      <span className="font-medium">{formatCurrency(revenueBreakdown.maintenance)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Consulting</span>
                      <span className="font-medium">{formatCurrency(revenueBreakdown.consulting)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Composition</CardTitle>
                  <CardDescription>Percentage breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(revenueBreakdown).map(([service, amount]) => {
                      const total = Object.values(revenueBreakdown).reduce((sum, val) => sum + val, 0);
                      const percentage = (amount / total) * 100;

                      return (
                        <div key={service} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm capitalize">{service}</span>
                            <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          {clientMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">New Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{clientMetrics.newClients}</div>
                  <p className="text-xs text-muted-foreground">This {timeframe}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Client Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{clientMetrics.retainedClients}</div>
                  <p className="text-xs text-muted-foreground">
                    {((clientMetrics.retainedClients / (clientMetrics.retainedClients + clientMetrics.newClients)) * 100).toFixed(1)}% retention rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Lifetime Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(clientMetrics.averageLifetimeValue)}</div>
                  <p className="text-xs text-muted-foreground">Average per client</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Acquisition Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(clientMetrics.acquisitionCost)}</div>
                  <p className="text-xs text-muted-foreground">
                    {(clientMetrics.averageLifetimeValue / clientMetrics.acquisitionCost).toFixed(1)}x LTV/CAC ratio
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>3-Month Projection</CardTitle>
                <CardDescription>Conservative growth estimate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Projected Revenue</span>
                    <span className="font-medium text-green-600">{formatCurrency(156000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Growth Rate</span>
                    <span className="font-medium">+15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Clients</span>
                    <span className="font-medium">8-12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confidence</span>
                    <Badge variant="default">85%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12-Month Projection</CardTitle>
                <CardDescription>Optimistic growth scenario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Projected Revenue</span>
                    <span className="font-medium text-green-600">{formatCurrency(780000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Growth Rate</span>
                    <span className="font-medium">+45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Clients</span>
                    <span className="font-medium">35-50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confidence</span>
                    <Badge variant="secondary">75%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}