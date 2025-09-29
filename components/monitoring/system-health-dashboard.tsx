/**
 * @fileoverview System Health Dashboard - Phase 7.2
 * Comprehensive system monitoring dashboard with real-time metrics
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Activity, Server, Database, Globe, Zap, AlertTriangle, CheckCircle,
  XCircle, Clock, Cpu, HardDrive, Wifi, RefreshCw, TrendingUp, TrendingDown
} from 'lucide-react';

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  api: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
    errorRate: number;
    requestsPerSecond: number;
  };
  database: {
    status: 'healthy' | 'warning' | 'critical';
    queryTime: number;
    connectionPool: number;
    activeConnections: number;
  };
  cdn: {
    status: 'healthy' | 'warning' | 'critical';
    cacheHitRate: number;
    avgLoadTime: number;
    bandwidthUsed: number;
  };
  system: {
    status: 'healthy' | 'warning' | 'critical';
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    uptime: number;
  };
}

interface PerformanceMetrics {
  timestamp: Date;
  api: {
    responseTime: number;
    statusCode: number;
    endpoint: string;
  };
  database: {
    queryTime: number;
    queryType: string;
  };
  cdn: {
    loadTime: number;
    cacheHit: boolean;
  };
  system: {
    memoryUsage: number;
    cpuUsage: number;
  };
}

export function SystemHealthDashboard({ className }: { className?: string }) {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Generate mock system health data
  const generateMockHealth = (): SystemHealth => {
    const getRandomStatus = () => {
      const rand = Math.random();
      if (rand > 0.9) return 'critical';
      if (rand > 0.7) return 'warning';
      return 'healthy';
    };

    const apiStatus = getRandomStatus();
    const dbStatus = getRandomStatus();
    const cdnStatus = getRandomStatus();
    const sysStatus = getRandomStatus();

    const overallStatus = [apiStatus, dbStatus, cdnStatus, sysStatus].includes('critical') 
      ? 'critical' 
      : [apiStatus, dbStatus, cdnStatus, sysStatus].includes('warning') 
        ? 'warning' 
        : 'healthy';

    return {
      overall: overallStatus,
      api: {
        status: apiStatus,
        responseTime: Math.floor(Math.random() * 500) + 50,
        errorRate: Math.random() * 5,
        requestsPerSecond: Math.floor(Math.random() * 100) + 10
      },
      database: {
        status: dbStatus,
        queryTime: Math.floor(Math.random() * 200) + 10,
        connectionPool: Math.floor(Math.random() * 100),
        activeConnections: Math.floor(Math.random() * 50) + 5
      },
      cdn: {
        status: cdnStatus,
        cacheHitRate: Math.random() * 20 + 80,
        avgLoadTime: Math.floor(Math.random() * 1000) + 100,
        bandwidthUsed: Math.floor(Math.random() * 1000) + 100
      },
      system: {
        status: sysStatus,
        memoryUsage: Math.random() * 30 + 40,
        cpuUsage: Math.random() * 40 + 20,
        diskUsage: Math.random() * 20 + 60,
        uptime: Math.floor(Math.random() * 86400) + 3600
      }
    };
  };

  // Generate mock metrics data
  const generateMockMetrics = (): PerformanceMetrics[] => {
    const now = new Date();
    return Array.from({ length: 24 }, (_, i) => {
      const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      return {
        timestamp,
        api: {
          responseTime: Math.floor(Math.random() * 300) + 50,
          statusCode: Math.random() > 0.95 ? 500 : 200,
          endpoint: '/api/analytics'
        },
        database: {
          queryTime: Math.floor(Math.random() * 100) + 10,
          queryType: 'SELECT'
        },
        cdn: {
          loadTime: Math.floor(Math.random() * 500) + 100,
          cacheHit: Math.random() > 0.2
        },
        system: {
          memoryUsage: Math.random() * 20 + 50,
          cpuUsage: Math.random() * 30 + 30
        }
      };
    });
  };

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setSystemHealth(generateMockHealth());
        setMetrics(generateMockMetrics());
        setLastUpdate(new Date());
        setIsLoading(false);
      }, 1000);
    };

    loadData();
    
    // Update every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
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
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!systemHealth) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load system health data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <p className="text-gray-600">Real-time system monitoring and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status Card */}
      <Card className={cn(
        "border-l-4",
        systemHealth.overall === 'healthy' ? "border-green-500" :
        systemHealth.overall === 'warning' ? "border-yellow-500" :
        "border-red-500"
      )}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(systemHealth.overall)}
              <div>
                <h3 className="text-lg font-semibold">Overall System Status</h3>
                <p className="text-sm text-gray-600">
                  {systemHealth.overall === 'healthy' && 'All systems operational'}
                  {systemHealth.overall === 'warning' && 'Some systems experiencing issues'}
                  {systemHealth.overall === 'critical' && 'Critical system issues detected'}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(systemHealth.overall)}>
              {systemHealth.overall.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* System Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* API Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Server</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(systemHealth.api.status)}
                <span className="text-2xl font-bold">{systemHealth.api.responseTime}ms</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Error Rate: {systemHealth.api.errorRate.toFixed(1)}%</div>
                <div>Requests/sec: {systemHealth.api.requestsPerSecond}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Database Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(systemHealth.database.status)}
                <span className="text-2xl font-bold">{systemHealth.database.queryTime}ms</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Pool Usage: {systemHealth.database.connectionPool}%</div>
                <div>Active: {systemHealth.database.activeConnections}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CDN Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CDN</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(systemHealth.cdn.status)}
                <span className="text-2xl font-bold">{systemHealth.cdn.avgLoadTime}ms</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Cache Hit: {systemHealth.cdn.cacheHitRate.toFixed(1)}%</div>
                <div>Bandwidth: {formatBytes(systemHealth.cdn.bandwidthUsed)}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(systemHealth.system.status)}
                <span className="text-2xl font-bold">{systemHealth.system.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Memory: {systemHealth.system.memoryUsage.toFixed(1)}%</div>
                <div>Uptime: {formatUptime(systemHealth.system.uptime)}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Response Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  API Response Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Response Time</span>
                    <span className="text-lg font-bold">{systemHealth.api.responseTime}ms</span>
                  </div>
                  <Progress value={Math.min((systemHealth.api.responseTime / 1000) * 100, 100)} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-lg font-bold">{systemHealth.api.errorRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.api.errorRate * 20} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Requests per Second</span>
                    <span className="text-lg font-bold">{systemHealth.api.requestsPerSecond}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Query Time</span>
                    <span className="text-lg font-bold">{systemHealth.database.queryTime}ms</span>
                  </div>
                  <Progress value={Math.min((systemHealth.database.queryTime / 500) * 100, 100)} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Connection Pool</span>
                    <span className="text-lg font-bold">{systemHealth.database.connectionPool}%</span>
                  </div>
                  <Progress value={systemHealth.database.connectionPool} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Connections</span>
                    <span className="text-lg font-bold">{systemHealth.database.activeConnections}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-lg font-bold">{systemHealth.system.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.system.cpuUsage} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-lg font-bold">{systemHealth.system.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.system.memoryUsage} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className="text-lg font-bold">{systemHealth.system.diskUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.system.diskUsage} />
                </div>
              </CardContent>
            </Card>

            {/* CDN Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  CDN Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Load Time</span>
                    <span className="text-lg font-bold">{systemHealth.cdn.avgLoadTime}ms</span>
                  </div>
                  <Progress value={Math.min((systemHealth.cdn.avgLoadTime / 2000) * 100, 100)} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cache Hit Rate</span>
                    <span className="text-lg font-bold">{systemHealth.cdn.cacheHitRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.cdn.cacheHitRate} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Bandwidth Used</span>
                    <span className="text-lg font-bold">{formatBytes(systemHealth.cdn.bandwidthUsed)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemHealth.overall === 'healthy' ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-green-600 font-medium">No active alerts</p>
                    <p className="text-sm text-gray-500">All systems are operating normally</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {systemHealth.api.status !== 'healthy' && (
                      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-medium text-red-800">API Performance Issue</p>
                          <p className="text-sm text-red-600">
                            Response time: {systemHealth.api.responseTime}ms (threshold: 1000ms)
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {systemHealth.database.status !== 'healthy' && (
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="font-medium text-yellow-800">Database Performance Warning</p>
                          <p className="text-sm text-yellow-600">
                            Query time: {systemHealth.database.queryTime}ms (threshold: 500ms)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SystemHealthDashboard;
