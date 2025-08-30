/**
 * Health Monitoring Dashboard
 * 
 * Comprehensive health monitoring interface displaying:
 * - Health scores for all system components
 * - RED metrics (Rate, Errors, Duration)
 * - Readiness status and dependency health
 * - Real-time monitoring and alerts
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface HealthScore {
  overall: number;
  database: number;
  storage: number;
  auth: number;
  observability: number;
  performance: number;
  security: number;
}

interface REDMetrics {
  rate: {
    requestsPerSecond: number;
    errorsPerSecond: number;
    slowRequestsPerSecond: number;
  };
  errors: {
    totalErrors: number;
    errorRate: number;
    errorTypes: Record<string, number>;
    recentErrors: Array<{
      timestamp: string;
      type: string;
      route: string;
      message: string;
    }>;
  };
  duration: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    slowRequestThreshold: number;
    slowRequestsCount: number;
  };
}

interface ReadinessStatus {
  ready: boolean;
  checks: {
    database: { ready: boolean; message?: string };
    storage: { ready: boolean; message?: string };
    auth: { ready: boolean; message?: string };
    observability: { ready: boolean; message?: string };
    environment: { ready: boolean; message?: string };
  };
  dependencies: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    lastCheck: string;
  }>;
}

interface SLOStatus {
  sloName: string;
  status: 'healthy' | 'warning' | 'breach';
  currentValue: number;
  target: number;
  errorBudgetRemaining: number;
  lastUpdated: string;
  description?: string;
  type?: string;
  businessImpact?: string;
}

interface HealthData {
  ok: boolean;
  timestamp: string;
  environment: string;
  healthScore: HealthScore;
  redMetrics: REDMetrics;
  readiness: ReadinessStatus;
  system: {
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    nodeVersion: string;
  };
  responseTime: number;
}

export default function HealthMonitoringPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [sloData, setSloData] = useState<SLOStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch health data
      const healthResponse = await fetch('/api/health');
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      setHealthData(healthData);
      
      // Fetch SLO data
      try {
        const sloResponse = await fetch('/api/slo');
        if (sloResponse.ok) {
          const sloData = await sloResponse.json();
          if (sloData.slos) {
            setSloData(sloData.slos);
          }
        }
      } catch (sloError) {
        console.warn('Failed to fetch SLO data:', sloError);
        // Don't fail the entire request if SLO data is unavailable
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatusColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };



  const getDependencyStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  if (loading && !healthData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading health data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={fetchHealthData}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>No health data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system health, RED metrics, and readiness status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastRefresh && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchHealthData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getHealthStatusIcon(healthData.healthScore.overall)}
            <span>Overall Health Status</span>
            <Badge variant={healthData.ok ? 'default' : 'destructive'}>
              {healthData.ok ? 'Healthy' : 'Unhealthy'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Environment: {healthData.environment} | Response Time: {healthData.responseTime}ms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Health Score</span>
                <span className={getHealthStatusColor(healthData.healthScore.overall)}>
                  {healthData.healthScore.overall}/100
                </span>
              </div>
              <Progress value={healthData.healthScore.overall} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(healthData.healthScore).map(([key, score]) => (
                key !== 'overall' && (
                  <div key={key} className="text-center">
                    <div className="text-sm font-medium capitalize">{key}</div>
                    <div className={`text-2xl font-bold ${getHealthStatusColor(score)}`}>
                      {score}
                    </div>
                    <Progress value={score} className="h-1 mt-1" />
                  </div>
                )
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different metrics */}
      <Tabs defaultValue="slo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="slo">SLO Status</TabsTrigger>
          <TabsTrigger value="red">RED Metrics</TabsTrigger>
          <TabsTrigger value="readiness">Readiness Status</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        {/* SLO Status Tab */}
        <TabsContent value="slo" className="space-y-4">
          {sloData && sloData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sloData.map((slo) => (
                <Card key={slo.sloName}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{slo.sloName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <Badge variant={
                        slo.status === 'healthy' ? 'default' : 
                        slo.status === 'warning' ? 'secondary' : 
                        'destructive'
                      }>
                        {slo.status}
                      </Badge>
                    </CardTitle>
                    {slo.description && (
                      <CardDescription>{slo.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current Performance</span>
                        <span className={
                          slo.currentValue >= slo.target ? 'text-green-600' :
                          slo.status === 'warning' ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {slo.currentValue.toFixed(2)}% / {slo.target}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(slo.currentValue, 100)} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Error Budget Remaining</span>
                        <span className={
                          slo.errorBudgetRemaining > 50 ? 'text-green-600' :
                          slo.errorBudgetRemaining > 20 ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {slo.errorBudgetRemaining.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={slo.errorBudgetRemaining} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type</span>
                        <p className="font-medium capitalize">{slo.type ?? 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Impact</span>
                        <p className="font-medium capitalize">{slo.businessImpact ?? 'Medium'}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(slo.lastUpdated).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>SLO Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    SLO data is not available. This could indicate that SLO monitoring is not configured or the service is starting up.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* RED Metrics Tab */}
        <TabsContent value="red" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rate Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rate Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Requests/sec</span>
                  <span className="font-mono">{healthData.redMetrics.rate.requestsPerSecond.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Errors/sec</span>
                  <span className="font-mono text-red-600">{healthData.redMetrics.rate.errorsPerSecond.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slow Requests/sec</span>
                  <span className="font-mono text-yellow-600">{healthData.redMetrics.rate.slowRequestsPerSecond.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Error Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Error Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Errors</span>
                  <span className="font-mono">{healthData.redMetrics.errors.totalErrors}</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <span className="font-mono text-red-600">{healthData.redMetrics.errors.errorRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Slow Requests</span>
                  <span className="font-mono">{healthData.redMetrics.duration.slowRequestsCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Duration Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Duration Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Avg Response Time</span>
                  <span className="font-mono">{healthData.redMetrics.duration.averageResponseTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>P95 Response Time</span>
                  <span className="font-mono">{healthData.redMetrics.duration.p95ResponseTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>P99 Response Time</span>
                  <span className="font-mono">{healthData.redMetrics.duration.p99ResponseTime.toFixed(0)}ms</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Types Breakdown */}
          {Object.keys(healthData.redMetrics.errors.errorTypes).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Error Types Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(healthData.redMetrics.errors.errorTypes).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="capitalize">{type}</span>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Readiness Status Tab */}
        <TabsContent value="readiness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Readiness Status</span>
                <Badge variant={healthData.readiness.ready ? 'default' : 'destructive'}>
                  {healthData.readiness.ready ? 'Ready' : 'Not Ready'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Service Checks */}
                <div>
                  <h3 className="font-semibold mb-2">Service Checks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(healthData.readiness.checks).map(([service, check]) => (
                      <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getDependencyStatusIcon(check.ready ? 'healthy' : 'unhealthy')}
                          <span className="capitalize font-medium">{service}</span>
                        </div>
                        <Badge variant={check.ready ? 'default' : 'destructive'}>
                          {check.ready ? 'Ready' : 'Not Ready'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dependencies */}
                <div>
                  <h3 className="font-semibold mb-2">Dependencies</h3>
                  <div className="space-y-2">
                    {healthData.readiness.dependencies.map((dep) => (
                      <div key={dep.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getDependencyStatusIcon(dep.status)}
                          <span className="capitalize font-medium">{dep.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">
                            {dep.responseTime}ms
                          </span>
                          <Badge variant={
                            dep.status === 'healthy' ? 'default' : 
                            dep.status === 'degraded' ? 'secondary' : 'destructive'
                          }>
                            {dep.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Info Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="font-mono">{formatUptime(healthData.system.uptime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Node Version</span>
                  <span className="font-mono">{healthData.system.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment</span>
                  <span className="font-mono">{healthData.environment}</span>
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Heap Used</span>
                  <span className="font-mono">{formatBytes(healthData.system.memory.heapUsed * 1024 * 1024)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Heap Total</span>
                  <span className="font-mono">{formatBytes(healthData.system.memory.heapTotal * 1024 * 1024)}</span>
                </div>
                <div className="flex justify-between">
                  <span>External</span>
                  <span className="font-mono">{formatBytes(healthData.system.memory.external * 1024 * 1024)}</span>
                </div>
                <div className="flex justify-between">
                  <span>RSS</span>
                  <span className="font-mono">{formatBytes(healthData.system.memory.rss * 1024 * 1024)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
