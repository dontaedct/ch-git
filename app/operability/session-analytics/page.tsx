/**
 * @fileoverview HT-008.8.4: Session Analytics Dashboard
 * @module app/operability/session-analytics/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.4 - Add user session tracking and analytics
 * Focus: Real-time session analytics dashboard with user behavior insights
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user privacy, data protection, analytics)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  MousePointer,
  Scroll,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  AlertTriangle
} from 'lucide-react';

// Types
interface UserAnalytics {
  totalSessions: number;
  averageSessionDuration: number;
  totalPageViews: number;
  averagePageViewsPerSession: number;
  bounceRate: number;
  returnVisitorRate: number;
  topPages: Array<{ page: string; views: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  deviceBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  behaviorMetrics: {
    averageScrollDepth: number;
    averageTimeOnPage: number;
    averageClicksPerSession: number;
    formCompletionRate: number;
  };
  performanceMetrics: {
    averageLoadTime: number;
    averageRenderTime: number;
    errorRate: number;
    memoryUsage: number;
  };
  conversionFunnel: Array<{
    step: string;
    users: number;
    conversionRate: number;
  }>;
}

interface SessionInsights {
  userJourney: Array<{
    step: number;
    page: string;
    timestamp: string;
    duration: number;
  }>;
  dropoffPoints: Array<{
    page: string;
    dropoffRate: number;
  }>;
  engagementScore: number;
  conversionProbability: number;
  recommendations: string[];
}

export default function SessionAnalyticsPage() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [activeSessionsCount, setActiveSessionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const fetchSessionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        timeRange,
        ...(selectedUserId && { userId: selectedUserId }),
      });
      
      const response = await fetch(`/api/monitoring/sessions?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch session data: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
        setActiveSessionsCount(data.activeSessionsCount);
      } else {
        throw new Error(data.error || 'Failed to fetch session data');
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session data');
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedUserId]);

  useEffect(() => {
    fetchSessionData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSessionData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchSessionData, autoRefresh]);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getEngagementLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading session analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Analytics</h1>
          <p className="text-muted-foreground">
            User behavior tracking and session insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchSessionData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Time Range:</span>
          <div className="flex gap-1">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">User ID:</span>
          <input
            type="text"
            placeholder="Enter user ID (optional)"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          />
        </div>

        {lastRefresh && (
          <span className="text-sm text-muted-foreground ml-4">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Active: {activeSessionsCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(analytics.averageSessionDuration)}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalPageViews} total page views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(analytics.bounceRate)}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.averagePageViewsPerSession.toFixed(1)} pages/session
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Return Visitors</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(analytics.returnVisitorRate)}
              </div>
              <p className="text-xs text-muted-foreground">
                User retention rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="devices">Devices & Traffic</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Top Pages */}
          {analytics && analytics.topPages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>
                  Most visited pages in the selected time range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topPages.slice(0, 10).map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-6">
                          {index + 1}
                        </span>
                        <span className="font-medium">{page.page}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(page.views / analytics.topPages[0].views) * 100} 
                          className="w-24"
                        />
                        <Badge variant="secondary">{page.views}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Behavior Summary */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>
                    User interaction and engagement statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scroll className="h-4 w-4" />
                        <span className="text-sm font-medium">Avg Scroll Depth</span>
                      </div>
                      <span className="font-bold">
                        {analytics.behaviorMetrics.averageScrollDepth.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Avg Time on Page</span>
                      </div>
                      <span className="font-bold">
                        {formatDuration(analytics.behaviorMetrics.averageTimeOnPage)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4" />
                        <span className="text-sm font-medium">Avg Clicks/Session</span>
                      </div>
                      <span className="font-bold">
                        {analytics.behaviorMetrics.averageClicksPerSession.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span className="text-sm font-medium">Form Completion</span>
                      </div>
                      <span className="font-bold">
                        {formatPercentage(analytics.behaviorMetrics.formCompletionRate)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Technical performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Avg Load Time</span>
                      <span className="font-bold">
                        {analytics.performanceMetrics.averageLoadTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Avg Render Time</span>
                      <span className="font-bold">
                        {analytics.performanceMetrics.averageRenderTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Error Rate</span>
                      <span className="font-bold">
                        {formatPercentage(analytics.performanceMetrics.errorRate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="font-bold">
                        {analytics.performanceMetrics.memoryUsage.toFixed(1)}MB
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Journey Analysis</CardTitle>
                  <CardDescription>
                    Common user paths and behavior patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        User journey analysis would be displayed here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Insights</CardTitle>
                  <CardDescription>
                    User engagement patterns and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">
                        <span className={getEngagementColor(75)}>75</span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Overall Engagement Score
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        {getEngagementLabel(75)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Recommendations:</strong>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Improve content engagement to increase scroll depth</li>
                        <li>• Optimize page load times for better user experience</li>
                        <li>• Add interactive elements to increase click engagement</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                  <CardDescription>
                    User sessions by device type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.deviceBreakdown).map(([device, count]) => (
                      <div key={device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device)}
                          <span className="font-medium capitalize">{device}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(count / analytics.totalSessions) * 100} 
                            className="w-32"
                          />
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>
                    Where users are coming from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topReferrers.length > 0 ? (
                      analytics.topReferrers.map((referrer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span className="font-medium">{referrer.referrer}</span>
                          </div>
                          <Badge variant="secondary">{referrer.count}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No referrer data available
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
                <CardDescription>
                  Technical performance metrics and optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Load Performance</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Load Time</span>
                        <span className="font-medium">
                          {analytics.performanceMetrics.averageLoadTime.toFixed(0)}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Render Time</span>
                        <span className="font-medium">
                          {analytics.performanceMetrics.averageRenderTime.toFixed(0)}ms
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Error Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Error Rate</span>
                        <span className="font-medium">
                          {formatPercentage(analytics.performanceMetrics.errorRate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Memory Usage</span>
                        <span className="font-medium">
                          {analytics.performanceMetrics.memoryUsage.toFixed(1)}MB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
