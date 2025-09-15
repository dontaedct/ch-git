/**
 * @fileoverview Analytics Dashboard Components
 * @module components/analytics
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Target, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  Calendar,
  Activity
} from 'lucide-react';
import { TaskAnalytics, VelocityMetrics, BurndownData, ProductivityInsights } from '@/lib/analytics/types';

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('last30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [taskAnalytics, setTaskAnalytics] = useState<TaskAnalytics | null>(null);
  const [velocityMetrics, setVelocityMetrics] = useState<VelocityMetrics | null>(null);
  const [productivityInsights, setProductivityInsights] = useState<ProductivityInsights | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [tasksRes, velocityRes, insightsRes] = await Promise.all([
        fetch(`/api/analytics/tasks?type=${timeRange}`),
        fetch('/api/analytics/velocity'),
        fetch(`/api/analytics/insights?type=${timeRange}`)
      ]);

      if (!tasksRes.ok || !velocityRes.ok || !insightsRes.ok) {
        throw new Error('Failed to load analytics data');
      }

      const [tasksData, velocityData, insightsData] = await Promise.all([
        tasksRes.json(),
        velocityRes.json(),
        insightsRes.json()
      ]);

      setTaskAnalytics(tasksData.data);
      setVelocityMetrics(velocityData.data);
      setProductivityInsights(insightsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    // Implementation for exporting analytics data
    console.log(`Exporting analytics as ${format}`);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track team performance and project progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {taskAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskAnalytics.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {taskAnalytics.completedTasks} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((taskAnalytics.completedTasks / taskAnalytics.totalTasks) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {taskAnalytics.pendingTasks} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {taskAnalytics.averageCompletionTime.toFixed(1)}d
              </div>
              <p className="text-xs text-muted-foreground">
                Time to complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {taskAnalytics.overdueTasks}
              </div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="velocity">Velocity</TabsTrigger>
          <TabsTrigger value="burndown">Burndown</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Status</CardTitle>
                <CardDescription>Current task distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taskAnalytics && Object.entries(taskAnalytics.tasksByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'completed' ? 'bg-green-500' :
                          status === 'in_progress' ? 'bg-blue-500' :
                          status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{count}</span>
                        <Progress 
                          value={(count / taskAnalytics.totalTasks) * 100} 
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Task distribution by assignee</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taskAnalytics && Object.entries(taskAnalytics.tasksByAssignee).map(([assignee, count]) => (
                    <div key={assignee} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{assignee === 'unassigned' ? 'Unassigned' : assignee}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{count}</span>
                        <Progress 
                          value={(count / taskAnalytics.totalTasks) * 100} 
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="velocity" className="space-y-6">
          {velocityMetrics && (
            <>
              {/* Current Sprint */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Sprint</CardTitle>
                  <CardDescription>Sprint progress and velocity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {velocityMetrics.currentSprint.completedPoints}
                      </div>
                      <p className="text-sm text-muted-foreground">Points Completed</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-600">
                        {velocityMetrics.currentSprint.remainingPoints}
                      </div>
                      <p className="text-sm text-muted-foreground">Points Remaining</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {velocityMetrics.currentSprint.daysRemaining}
                      </div>
                      <p className="text-sm text-muted-foreground">Days Remaining</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Sprint Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((velocityMetrics.currentSprint.completedPoints / velocityMetrics.currentSprint.plannedPoints) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(velocityMetrics.currentSprint.completedPoints / velocityMetrics.currentSprint.plannedPoints) * 100} 
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Velocity Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Velocity Trend</CardTitle>
                  <CardDescription>
                    <div className="flex items-center space-x-2">
                      <span>Current trend:</span>
                      <Badge variant={
                        velocityMetrics.velocityTrend === 'increasing' ? 'default' :
                        velocityMetrics.velocityTrend === 'stable' ? 'secondary' : 'destructive'
                      }>
                        {velocityMetrics.velocityTrend === 'increasing' && <TrendingUp className="h-3 w-3 mr-1" />}
                        {velocityMetrics.velocityTrend === 'decreasing' && <TrendingDown className="h-3 w-3 mr-1" />}
                        {velocityMetrics.velocityTrend}
                      </Badge>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {velocityMetrics.historicalVelocity.map((sprint, index) => (
                      <div key={sprint.sprint} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{sprint.sprint}</div>
                          <div className="text-sm text-muted-foreground">
                            {sprint.startDate.toLocaleDateString()} - {sprint.endDate.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{sprint.velocity} points</div>
                          <div className="text-sm text-muted-foreground">
                            {sprint.completedPoints}/{sprint.plannedPoints}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="burndown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Burndown Chart</CardTitle>
              <CardDescription>Track sprint progress against ideal burndown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Burndown chart will be rendered here</p>
                  <p className="text-sm text-gray-400">Chart implementation pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {productivityInsights && (
            <>
              {/* Bottlenecks */}
              <Card>
                <CardHeader>
                  <CardTitle>Bottlenecks</CardTitle>
                  <CardDescription>Issues affecting team productivity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productivityInsights.bottlenecks.map((bottleneck, index) => (
                      <Alert key={index} variant={bottleneck.impact === 'high' ? 'destructive' : 'default'}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium">{bottleneck.description}</div>
                          <div className="text-sm mt-1">{bottleneck.recommendation}</div>
                          <Badge variant="outline" className="mt-2">
                            {bottleneck.impact} impact
                          </Badge>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Actionable insights to improve productivity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productivityInsights.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{rec.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">{rec.description}</div>
                            <div className="text-sm text-muted-foreground mt-2">{rec.impact}</div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant={
                              rec.priority === 'high' ? 'destructive' :
                              rec.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {rec.priority} priority
                            </Badge>
                            <Badge variant="outline">
                              {rec.effort} effort
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
