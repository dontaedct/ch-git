'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Bell,
  Shield,
  Zap
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: Array<{
    name: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime: number;
    lastChecked: string;
    error?: string;
  }>;
}

interface PerformanceAnalytics {
  api: {
    totalRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  };
  database: {
    totalQueries: number;
    averageExecutionTime: number;
    p95ExecutionTime: number;
    p99ExecutionTime: number;
    queriesPerMinute: number;
    slowQueries: any[];
  };
  system: {
    averageCPUUsage: number;
    averageMemoryUsage: number;
    maxCPUUsage: number;
    maxMemoryUsage: number;
    systemUptime: number;
  };
  userExperience: {
    totalPageViews: number;
    averageLoadTime: number;
    p95LoadTime: number;
    p99LoadTime: number;
    slowPages: any[];
  };
}

interface ErrorAnalytics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySource: Record<string, number>;
  errorRate: number;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurrence: string;
  }>;
  trends: Array<{
    date: string;
    count: number;
  }>;
}

export default function ProductionMonitoringPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [performanceAnalytics, setPerformanceAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [errorAnalytics, setErrorAnalytics] = useState<ErrorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      setIsLoading(true);

      // Load system health
      const healthResponse = await fetch('/api/monitoring/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData);
      }

      // Load performance analytics
      const performanceResponse = await fetch('/api/monitoring/performance');
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformanceAnalytics(performanceData.analytics);
      }

      // Load error analytics
      const errorResponse = await fetch('/api/monitoring/errors');
      if (errorResponse.ok) {
        const errorData = await errorResponse.json();
        setErrorAnalytics(errorData.analytics);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Production Monitoring
              </h1>
              <p className="text-xl text-muted-foreground">
                Real-time system health, performance, and error tracking
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <Button 
                onClick={loadMonitoringData}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Errors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  {systemHealth && getStatusIcon(systemHealth.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemHealth ? systemHealth.status.toUpperCase() : 'UNKNOWN'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {systemHealth && formatUptime(systemHealth.uptime)} uptime
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceAnalytics?.api.totalRequests.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {performanceAnalytics?.api.requestsPerMinute.toFixed(1) || '0'} req/min
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceAnalytics?.api.errorRate.toFixed(2) || '0.00'}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {errorAnalytics?.totalErrors || '0'} total errors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceAnalytics?.api.averageResponseTime.toFixed(0) || '0'}ms
                  </div>
                  <p className="text-xs text-muted-foreground">
                    P95: {performanceAnalytics?.api.p95ResponseTime.toFixed(0) || '0'}ms
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Service Health Grid */}
            {systemHealth && (
              <Card>
                <CardHeader>
                  <CardTitle>Service Health</CardTitle>
                  <CardDescription>
                    Real-time status of all monitored services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {systemHealth.services.map((service) => (
                      <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(service.status)}
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {service.responseTime}ms
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Metrics */}
            {performanceAnalytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      System Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-muted-foreground">
                        {performanceAnalytics.system.averageCPUUsage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-muted-foreground">
                        {performanceAnalytics.system.averageMemoryUsage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">System Uptime</span>
                      <span className="text-sm text-muted-foreground">
                        {formatUptime(performanceAnalytics.system.systemUptime / 1000)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Database Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Queries</span>
                      <span className="text-sm text-muted-foreground">
                        {performanceAnalytics.database.totalQueries.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Avg Execution Time</span>
                      <span className="text-sm text-muted-foreground">
                        {performanceAnalytics.database.averageExecutionTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Queries/Min</span>
                      <span className="text-sm text-muted-foreground">
                        {performanceAnalytics.database.queriesPerMinute.toFixed(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            {systemHealth ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Health Overview</CardTitle>
                    <CardDescription>
                      Overall system status and service health
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          {systemHealth.status.toUpperCase()}
                        </div>
                        <p className="text-sm text-muted-foreground">Overall Status</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          {formatUptime(systemHealth.uptime)}
                        </div>
                        <p className="text-sm text-muted-foreground">Uptime</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          {systemHealth.version}
                        </div>
                        <p className="text-sm text-muted-foreground">Version</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                    <CardDescription>
                      Detailed status of each monitored service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {systemHealth.services.map((service) => (
                        <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            {getStatusIcon(service.status)}
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Last checked: {new Date(service.lastChecked).toLocaleString()}
                              </p>
                              {service.error && (
                                <p className="text-sm text-red-600 mt-1">{service.error}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(service.status)}>
                              {service.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {service.responseTime}ms
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Health Data</h3>
                    <p className="text-muted-foreground">
                      Health monitoring data is not available.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {performanceAnalytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>API Performance</CardTitle>
                      <CardDescription>
                        Request metrics and response times
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Total Requests</p>
                          <p className="text-2xl font-bold">
                            {performanceAnalytics.api.totalRequests.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Requests/Min</p>
                          <p className="text-2xl font-bold">
                            {performanceAnalytics.api.requestsPerMinute.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Avg Response</p>
                          <p className="text-2xl font-bold">
                            {performanceAnalytics.api.averageResponseTime.toFixed(0)}ms
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">P95 Response</p>
                          <p className="text-2xl font-bold">
                            {performanceAnalytics.api.p95ResponseTime.toFixed(0)}ms
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Experience</CardTitle>
                      <CardDescription>
                        Page load times and user metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Page Views</p>
                          <p className="text-2xl font-bold">
                            {performanceAnalytics.userExperience.totalPageViews.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Avg Load Time</p>
                          <p className="text-2xl font-bold">
                            {performanceAnalytics.userExperience.averageLoadTime.toFixed(0)}ms
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">P95 Load Time</p>
                          <p className="text-2xl font-bold">
                            {performanceAnalytics.userExperience.p95LoadTime.toFixed(0)}ms
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Slow Pages</p>
                          <p className="text-2xl font-bold">
                            {performanceAnalytics.userExperience.slowPages.length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Endpoints</CardTitle>
                    <CardDescription>
                      Most frequently accessed API endpoints
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {performanceAnalytics.api.topEndpoints.slice(0, 10).map((endpoint, index) => (
                        <div key={endpoint.endpoint} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              #{index + 1}
                            </span>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {endpoint.endpoint}
                            </code>
                          </div>
                          <Badge variant="outline">
                            {endpoint.count.toLocaleString()} requests
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Performance Data</h3>
                    <p className="text-muted-foreground">
                      Performance monitoring data is not available.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            {errorAnalytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {errorAnalytics.totalErrors.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {errorAnalytics.errorRate.toFixed(2)}% error rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Error Types</CardTitle>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Object.keys(errorAnalytics.errorsByType).length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unique error types
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Error Sources</CardTitle>
                      <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Object.keys(errorAnalytics.errorsBySource).length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Different sources
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Top Errors</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {errorAnalytics.topErrors.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Most frequent errors
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Errors by Type</CardTitle>
                      <CardDescription>
                        Distribution of errors by type
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(errorAnalytics.errorsByType).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-medium">{type}</span>
                            <Badge variant="outline">
                              {count as number} errors
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Errors by Source</CardTitle>
                      <CardDescription>
                        Distribution of errors by source
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(errorAnalytics.errorsBySource).map(([source, count]) => (
                          <div key={source} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-medium">{source}</span>
                            <Badge variant="outline">
                              {count as number} errors
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Errors</CardTitle>
                    <CardDescription>
                      Most frequently occurring errors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {errorAnalytics.topErrors.slice(0, 10).map((error, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              #{index + 1}
                            </span>
                            <Badge variant="outline">
                              {error.count} occurrences
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">{error.message}</p>
                          <p className="text-xs text-muted-foreground">
                            Last seen: {new Date(error.lastOccurrence).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Error Data</h3>
                    <p className="text-muted-foreground">
                      Error tracking data is not available.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}