'use client';

import { useState } from 'react';
// TODO: Re-enable when branding system is implemented
// import { useBrandStyling } from '@/lib/branding/use-brand-styling';

// Temporary stub hook for MVP
const useBrandStyling = () => ({
  getBrandClasses: () => 'w-[87%]'
});
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  Database,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Settings,
  RefreshCw,
  Gauge,
  Network,
  BarChart3,
  Timer,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface CacheConfig {
  id: string;
  name: string;
  type: 'redis' | 'memory' | 'database';
  enabled: boolean;
  ttl: number;
  hitRate: number;
  size: string;
  maxSize: string;
}

interface ConnectionPool {
  id: string;
  service: string;
  type: 'database' | 'api' | 'queue';
  currentConnections: number;
  maxConnections: number;
  utilization: number;
  avgResponseTime: number;
  status: 'healthy' | 'warning' | 'critical';
}

export default function IntegrationPerformancePage() {
  const { getBrandClasses } = useBrandStyling();
  const [activeTab, setActiveTab] = useState('overview');

  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'response-time',
      name: 'Average Response Time',
      value: 2.4,
      unit: 'seconds',
      target: 5.0,
      status: 'good',
      trend: 'down',
      lastUpdated: new Date()
    },
    {
      id: 'throughput',
      name: 'Requests per Second',
      value: 147,
      unit: 'req/s',
      target: 100,
      status: 'good',
      trend: 'up',
      lastUpdated: new Date()
    },
    {
      id: 'error-rate',
      name: 'Error Rate',
      value: 2.1,
      unit: '%',
      target: 5.0,
      status: 'good',
      trend: 'stable',
      lastUpdated: new Date()
    },
    {
      id: 'cpu-usage',
      name: 'CPU Usage',
      value: 68,
      unit: '%',
      target: 80,
      status: 'warning',
      trend: 'up',
      lastUpdated: new Date()
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      value: 74,
      unit: '%',
      target: 85,
      status: 'good',
      trend: 'stable',
      lastUpdated: new Date()
    },
    {
      id: 'cache-hit-rate',
      name: 'Cache Hit Rate',
      value: 87.5,
      unit: '%',
      target: 80,
      status: 'good',
      trend: 'up',
      lastUpdated: new Date()
    }
  ];

  const cacheConfigs: CacheConfig[] = [
    {
      id: 'api-cache',
      name: 'API Response Cache',
      type: 'redis',
      enabled: true,
      ttl: 300,
      hitRate: 89.2,
      size: '2.4 GB',
      maxSize: '5 GB'
    },
    {
      id: 'session-cache',
      name: 'Session Cache',
      type: 'memory',
      enabled: true,
      ttl: 1800,
      hitRate: 94.1,
      size: '512 MB',
      maxSize: '1 GB'
    },
    {
      id: 'query-cache',
      name: 'Database Query Cache',
      type: 'database',
      enabled: true,
      ttl: 600,
      hitRate: 76.8,
      size: '1.8 GB',
      maxSize: '3 GB'
    },
    {
      id: 'static-cache',
      name: 'Static Content Cache',
      type: 'memory',
      enabled: false,
      ttl: 3600,
      hitRate: 0,
      size: '0 MB',
      maxSize: '2 GB'
    }
  ];

  const connectionPools: ConnectionPool[] = [
    {
      id: 'postgres-pool',
      service: 'PostgreSQL Database',
      type: 'database',
      currentConnections: 23,
      maxConnections: 50,
      utilization: 46,
      avgResponseTime: 45,
      status: 'healthy'
    },
    {
      id: 'redis-pool',
      service: 'Redis Cache',
      type: 'database',
      currentConnections: 8,
      maxConnections: 20,
      utilization: 40,
      avgResponseTime: 12,
      status: 'healthy'
    },
    {
      id: 'stripe-api',
      service: 'Stripe API',
      type: 'api',
      currentConnections: 5,
      maxConnections: 25,
      utilization: 20,
      avgResponseTime: 380,
      status: 'healthy'
    },
    {
      id: 'email-service',
      service: 'Email Service',
      type: 'api',
      currentConnections: 12,
      maxConnections: 15,
      utilization: 80,
      avgResponseTime: 250,
      status: 'warning'
    },
    {
      id: 'queue-worker',
      service: 'Background Queue',
      type: 'queue',
      currentConnections: 18,
      maxConnections: 30,
      utilization: 60,
      avgResponseTime: 120,
      status: 'healthy'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      good: "default",
      healthy: "default",
      warning: "secondary",
      critical: "destructive"
    };
    const colors: Record<string, string> = {
      good: "text-green-600",
      healthy: "text-green-600",
      warning: "text-yellow-600",
      critical: "text-red-600"
    };
    return <Badge variant={variants[status] || "secondary"} className={colors[status]}>{status}</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCacheIcon = (type: string) => {
    switch (type) {
      case 'redis':
        return <Database className="h-4 w-4 text-red-500" />;
      case 'memory':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'database':
        return <Database className="h-4 w-4 text-green-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPoolIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'api':
        return <Network className="h-4 w-4" />;
      case 'queue':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Performance Optimization</h1>
          <p className="text-muted-foreground">
            Monitor and optimize integration performance with advanced caching and connection management
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Configure Performance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">2.4s</p>
              </div>
              <Timer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cache Hit Rate</p>
                <p className="text-2xl font-bold">87.5%</p>
              </div>
              <Gauge className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold">147 req/s</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">2.1%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="caching">Caching Strategy</TabsTrigger>
          <TabsTrigger value="connections">Connection Pools</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTrendIcon(metric.trend)}
                        <div>
                          <p className="font-medium">{metric.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Target: {metric.target} {metric.unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{metric.value} {metric.unit}</p>
                        {getStatusBadge(metric.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Response Time Improvement</span>
                    <span className="font-medium text-green-600">-15%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`bg-green-500 h-2 rounded-full ${getBrandClasses()}`}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Throughput Increase</span>
                    <span className="font-medium text-green-600">+23%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`bg-blue-500 h-2 rounded-full ${getBrandClasses()}`}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cache Efficiency</span>
                    <span className="font-medium text-green-600">+12%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`bg-purple-500 h-2 rounded-full ${getBrandClasses()}`}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Reduction</span>
                    <span className="font-medium text-green-600">-8%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`bg-orange-500 h-2 rounded-full ${getBrandClasses()}`}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="caching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cache Configuration & Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cacheConfigs.map((cache) => (
                  <div key={cache.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getCacheIcon(cache.type)}
                        <div>
                          <h3 className="font-medium">{cache.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{cache.type} cache</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={cache.enabled} />
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Hit Rate</p>
                        <p className="font-medium">{cache.hitRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">TTL</p>
                        <p className="font-medium">{cache.ttl}s</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-medium">{cache.size}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Max Size</p>
                        <p className="font-medium">{cache.maxSize}</p>
                      </div>
                    </div>

                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`bg-primary h-2 rounded-full ${getBrandClasses()}`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Pool Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectionPools.map((pool) => (
                  <div key={pool.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getPoolIcon(pool.type)}
                        <div>
                          <h3 className="font-medium">{pool.service}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{pool.type} connection</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(pool.status)}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Active</p>
                        <p className="font-medium">{pool.currentConnections}/{pool.maxConnections}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Utilization</p>
                        <p className="font-medium">{pool.utilization}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Response</p>
                        <p className="font-medium">{pool.avgResponseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{pool.status}</p>
                      </div>
                    </div>

                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          pool.utilization > 80 ? 'bg-red-500' :
                          pool.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        } ${getBrandClasses()}`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="response-target">Max Response Time (seconds)</Label>
                  <Input id="response-target" type="number" defaultValue="5" step="0.1" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="throughput-target">Min Throughput (req/s)</Label>
                  <Input id="throughput-target" type="number" defaultValue="100" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="error-target">Max Error Rate (%)</Label>
                  <Input id="error-target" type="number" defaultValue="5" step="0.1" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cache-target">Min Cache Hit Rate (%)</Label>
                  <Input id="cache-target" type="number" defaultValue="80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-scaling">Auto Scaling</Label>
                  <Switch id="auto-scaling" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="cache-warming">Cache Warming</Label>
                  <Switch id="cache-warming" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="connection-pooling">Connection Pooling</Label>
                  <Switch id="connection-pooling" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="load-balancing">Load Balancing</Label>
                  <Switch id="load-balancing" defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monitoring-interval">Monitoring Interval</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">Apply Optimization Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}