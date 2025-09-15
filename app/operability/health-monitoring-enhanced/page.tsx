/**
 * @fileoverview HT-008.8.7: Enhanced Health Monitoring Dashboard
 * @module app/operability/health-monitoring-enhanced/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.7 - Implement health checks and status monitoring
 * Focus: Enhanced health monitoring dashboard with dependency tracking and uptime monitoring
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production health monitoring, system reliability)
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
  Heart, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Shield,
  Zap,
  Monitor,
  Cpu,
  HardDrive
} from 'lucide-react';

// Types
interface HealthCheckResult {
  service: string;
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: string;
  error?: string;
  metadata: Record<string, any>;
}

interface SystemHealthMetrics {
  uptime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpuUsage: number;
  nodeVersion: string;
  environment: string;
  timestamp: string;
}

interface UptimeStats {
  service: string;
  totalChecks: number;
  successfulChecks: number;
  uptimePercentage: number;
  lastDowntime: string | null;
  averageDowntime: number;
  longestDowntime: number;
}

interface HealthHistoryEntry {
  timestamp: string;
  overallHealth: number;
  serviceHealth: Record<string, HealthCheckResult>;
  systemMetrics: SystemHealthMetrics;
  dependencies: any[];
  alerts: string[];
}

interface HealthTrends {
  trend: 'improving' | 'stable' | 'declining';
  change: number;
  period: string;
}

export default function EnhancedHealthMonitoringPage() {
  const [healthData, setHealthData] = useState<{
    overallHealth: number;
    serviceHealth: Record<string, HealthCheckResult>;
    dependencies: any[];
    systemMetrics: SystemHealthMetrics;
    alerts: string[];
  } | null>(null);
  const [uptimeStats, setUptimeStats] = useState<Record<string, UptimeStats>>({});
  const [healthHistory, setHealthHistory] = useState<HealthHistoryEntry[]>([]);
  const [healthTrends, setHealthTrends] = useState<HealthTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('');

  const fetchHealthData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch comprehensive health data
      const healthResponse = await fetch('/api/monitoring/health?includeHistory=true&includeUptime=true');
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      if (healthData.success) {
        setHealthData(healthData);
        setUptimeStats(healthData.uptimeStats || {});
        setHealthHistory(healthData.healthHistory || []);
        setHealthTrends(healthData.healthTrends || null);
      } else {
        throw new Error(healthData.error || 'Failed to fetch health data');
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServiceHealth = useCallback(async (serviceName: string) => {
    try {
      const response = await fetch(`/api/monitoring/health?service=${serviceName}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the specific service health in the state
          setHealthData(prev => prev ? {
            ...prev,
            serviceHealth: {
              ...prev.serviceHealth,
              [serviceName]: data.health,
            },
          } : null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch service health:', err);
    }
  }, []);

  useEffect(() => {
    fetchHealthData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchHealthData, autoRefresh]);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'storage': return <HardDrive className="h-4 w-4" />;
      case 'auth': return <Shield className="h-4 w-4" />;
      case 'system': return <Server className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
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
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading && !healthData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading health monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Health Monitoring</h1>
          <p className="text-muted-foreground">
            Comprehensive health monitoring with dependency tracking and uptime monitoring
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
          <Button variant="outline" size="sm" onClick={fetchHealthData}>
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
          <span className="text-sm font-medium">Service:</span>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="">All Services</option>
            {healthData && Object.keys(healthData.serviceHealth).map(service => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>
        
        {lastRefresh && (
          <span className="text-sm text-muted-foreground ml-4">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Key Metrics */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={getHealthStatusColor(
                  healthData.overallHealth >= 90 ? 'healthy' : 
                  healthData.overallHealth >= 70 ? 'degraded' : 'unhealthy'
                )}>
                  {healthData.overallHealth}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {healthTrends && (
                  <span className="flex items-center gap-1">
                    {getTrendIcon(healthTrends.trend)}
                    {healthTrends.trend} ({healthTrends.change > 0 ? '+' : ''}{healthTrends.change.toFixed(1)}%)
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(healthData.serviceHealth).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Object.values(healthData.serviceHealth).filter(s => s.healthy).length} healthy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatUptime(healthData.systemMetrics.uptime)}
              </div>
              <p className="text-xs text-muted-foreground">
                System uptime
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthData.systemMetrics.memoryUsage.heapUsed}MB
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((healthData.systemMetrics.memoryUsage.heapUsed / healthData.systemMetrics.memoryUsage.heapTotal) * 100)}% of total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {healthData && healthData.alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">{healthData.alerts.length} health alerts:</div>
            <ul className="list-disc list-inside space-y-1">
              {healthData.alerts.map((alert, index) => (
                <li key={index} className="text-sm">{alert}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="uptime">Uptime</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Service Health Overview */}
          {healthData && (
            <Card>
              <CardHeader>
                <CardTitle>Service Health Overview</CardTitle>
                <CardDescription>
                  Current status of all monitored services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(healthData.serviceHealth).map(([service, health]) => (
                    <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getServiceIcon(service)}
                        {getHealthStatusIcon(health.status)}
                        <div>
                          <span className="font-medium capitalize">{service}</span>
                          <div className="text-sm text-muted-foreground">
                            {formatTimestamp(health.lastCheck)} • {formatDuration(health.responseTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getHealthStatusBadge(health.status)}>
                          {health.status}
                        </Badge>
                        {health.error && (
                          <span className="text-sm text-red-500 max-w-xs truncate">
                            {health.error}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Metrics */}
          {healthData && (
            <Card>
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
                <CardDescription>
                  Current system performance and resource usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-muted-foreground">
                        {healthData.systemMetrics.memoryUsage.heapUsed}MB / {healthData.systemMetrics.memoryUsage.heapTotal}MB
                      </span>
                    </div>
                    <Progress 
                      value={(healthData.systemMetrics.memoryUsage.heapUsed / healthData.systemMetrics.memoryUsage.heapTotal) * 100} 
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Environment</span>
                      <span className="text-sm text-muted-foreground">
                        {healthData.systemMetrics.environment}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Node Version</span>
                      <span className="text-sm text-muted-foreground">
                        {healthData.systemMetrics.nodeVersion}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {healthData && (
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>
                  Detailed information about each service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(healthData.serviceHealth).map(([service, health]) => (
                    <div key={service} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getServiceIcon(service)}
                          <span className="font-medium capitalize">{service}</span>
                          {getHealthStatusIcon(health.status)}
                        </div>
                        <Badge className={getHealthStatusBadge(health.status)}>
                          {health.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">{formatDuration(health.responseTime)}</div>
                          <div className="text-sm text-muted-foreground">Response Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {formatTimestamp(health.lastCheck)}
                          </div>
                          <div className="text-sm text-muted-foreground">Last Check</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {health.healthy ? 'Yes' : 'No'}
                          </div>
                          <div className="text-sm text-muted-foreground">Healthy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {Object.keys(health.metadata).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Metadata</div>
                        </div>
                      </div>
                      
                      {health.error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-sm font-medium text-red-800">Error:</div>
                          <div className="text-sm text-red-700">{health.error}</div>
                        </div>
                      )}
                      
                      {Object.keys(health.metadata).length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">Metadata:</div>
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(health.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="uptime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uptime Statistics</CardTitle>
              <CardDescription>
                Uptime and availability metrics for all services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(uptimeStats).length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No uptime data available</p>
                  </div>
                ) : (
                  Object.entries(uptimeStats).map(([service, stats]) => (
                    <div key={service} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getServiceIcon(service)}
                          <span className="font-medium capitalize">{service}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {stats.uptimePercentage.toFixed(2)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Uptime</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">{stats.totalChecks}</div>
                          <div className="text-sm text-muted-foreground">Total Checks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{stats.successfulChecks}</div>
                          <div className="text-sm text-muted-foreground">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">
                            {stats.totalChecks - stats.successfulChecks}
                          </div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {stats.lastDowntime ? formatTimestamp(stats.lastDowntime) : 'Never'}
                          </div>
                          <div className="text-sm text-muted-foreground">Last Downtime</div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Progress value={stats.uptimePercentage} className="w-full" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {healthData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>
                  Detailed memory usage breakdown
                </CardDescription>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Heap Used</span>
                      <span className="text-sm text-muted-foreground">
                        {healthData.systemMetrics.memoryUsage.heapUsed}MB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Heap Total</span>
                      <span className="text-sm text-muted-foreground">
                        {healthData.systemMetrics.memoryUsage.heapTotal}MB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">External</span>
                      <span className="text-sm text-muted-foreground">
                        {healthData.systemMetrics.memoryUsage.external}MB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">RSS</span>
                      <span className="text-sm text-muted-foreground">
                        {healthData.systemMetrics.memoryUsage.rss}MB
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  System configuration and environment details
                </CardDescription>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Environment</span>
                      <span className="text-sm text-muted-foreground">
                        {healthData.systemMetrics.environment}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Node Version</span>
                      <span className="text-sm text-muted-foreground">
                        {healthData.systemMetrics.nodeVersion}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="text-sm text-muted-foreground">
                        {formatUptime(healthData.systemMetrics.uptime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Update</span>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(healthData.systemMetrics.timestamp)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health History</CardTitle>
              <CardDescription>
                Historical health data and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {healthHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No health history available</p>
                  </div>
                ) : (
                  healthHistory.slice(0, 50).map((entry, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                          <Badge className={
                            entry.overallHealth >= 90 ? 'bg-green-500' :
                            entry.overallHealth >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }>
                            {entry.overallHealth}%
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Object.keys(entry.serviceHealth).length} services
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Services:</span>
                          <span className="ml-1">
                            {Object.values(entry.serviceHealth).filter(s => s.healthy).length}/
                            {Object.keys(entry.serviceHealth).length}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Memory:</span>
                          <span className="ml-1">{entry.systemMetrics.memoryUsage.heapUsed}MB</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Uptime:</span>
                          <span className="ml-1">{formatUptime(entry.systemMetrics.uptime)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Alerts:</span>
                          <span className="ml-1">{entry.alerts.length}</span>
                        </div>
                      </div>
                      
                      {entry.alerts.length > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          {entry.alerts.slice(0, 2).join(', ')}
                          {entry.alerts.length > 2 && ` +${entry.alerts.length - 2} more`}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
