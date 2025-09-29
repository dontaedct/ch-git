'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Database,
  Globe,
  Server,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Settings,
  Refresh,
  Download,
  Filter,
  Eye,
  Cpu,
  HardDrive,
  Network,
  MemoryStick
} from 'lucide-react';

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskIO: number;
  networkLatency: number;
  cacheHitRate: number;
  activeUsers: number;
  timestamp: Date;
}

interface ServerInstance {
  id: string;
  name: string;
  region: string;
  status: 'healthy' | 'unhealthy' | 'warning';
  cpu: number;
  memory: number;
  connections: number;
  responseTime: number;
  load: number;
}

interface OptimizationSuggestion {
  id: string;
  category: 'performance' | 'scalability' | 'cost' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  estimatedImprovement: string;
  effort: 'low' | 'medium' | 'high';
  actions: string[];
}

export default function PerformanceMonitoringDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 245,
    throughput: 1250,
    errorRate: 0.3,
    cpuUsage: 68,
    memoryUsage: 72,
    diskIO: 45,
    networkLatency: 32,
    cacheHitRate: 89.5,
    activeUsers: 1840,
    timestamp: new Date()
  });

  const [instances, setInstances] = useState<ServerInstance[]>([
    {
      id: 'app-server-1',
      name: 'App Server 1',
      region: 'us-east-1',
      status: 'healthy',
      cpu: 65,
      memory: 70,
      connections: 450,
      responseTime: 230,
      load: 0.68
    },
    {
      id: 'app-server-2',
      name: 'App Server 2',
      region: 'us-east-1',
      status: 'healthy',
      cpu: 71,
      memory: 74,
      connections: 520,
      responseTime: 260,
      load: 0.73
    },
    {
      id: 'app-server-3',
      name: 'App Server 3',
      region: 'us-west-2',
      status: 'warning',
      cpu: 85,
      memory: 88,
      connections: 680,
      responseTime: 380,
      load: 0.87
    },
    {
      id: 'cache-server-1',
      name: 'Cache Server 1',
      region: 'us-east-1',
      status: 'healthy',
      cpu: 45,
      memory: 55,
      connections: 200,
      responseTime: 15,
      load: 0.50
    }
  ]);

  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([
    {
      id: 'cache-optimization',
      category: 'performance',
      severity: 'medium',
      title: 'Improve Cache Hit Rate',
      description: 'Cache hit rate of 89.5% can be improved to 95%+ with better cache key strategies',
      estimatedImprovement: '15% response time reduction',
      effort: 'medium',
      actions: [
        'Implement intelligent cache warming',
        'Optimize cache key patterns',
        'Add multi-level caching'
      ]
    },
    {
      id: 'server-scaling',
      category: 'scalability',
      severity: 'high',
      title: 'Scale High-Load Server',
      description: 'App Server 3 is operating at 87% capacity and may need additional resources',
      estimatedImprovement: '30% capacity increase',
      effort: 'low',
      actions: [
        'Add horizontal scaling instance',
        'Implement load balancing',
        'Monitor resource utilization'
      ]
    },
    {
      id: 'response-optimization',
      category: 'performance',
      severity: 'medium',
      title: 'Optimize API Response Times',
      description: 'Average response time of 245ms can be improved with database query optimization',
      estimatedImprovement: '25% response time reduction',
      effort: 'high',
      actions: [
        'Add database indexes',
        'Optimize slow queries',
        'Implement connection pooling'
      ]
    },
    {
      id: 'cost-optimization',
      category: 'cost',
      severity: 'low',
      title: 'Right-size Underutilized Resources',
      description: 'Cache Server 1 is only at 50% utilization and could be downsized',
      estimatedImprovement: '20% cost reduction',
      effort: 'low',
      actions: [
        'Analyze historical usage patterns',
        'Implement auto-scaling policies',
        'Consider reserved instances'
      ]
    }
  ]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.max(50, prev.responseTime + (Math.random() - 0.5) * 20),
        throughput: Math.max(800, prev.throughput + (Math.random() - 0.5) * 100),
        errorRate: Math.max(0, Math.min(2, prev.errorRate + (Math.random() - 0.5) * 0.2)),
        cpuUsage: Math.max(30, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.max(40, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 3)),
        cacheHitRate: Math.max(80, Math.min(98, prev.cacheHitRate + (Math.random() - 0.5) * 2)),
        activeUsers: Math.max(1000, prev.activeUsers + Math.floor((Math.random() - 0.5) * 100)),
        timestamp: new Date()
      }));

      // Update instance metrics
      setInstances(prev => prev.map(instance => ({
        ...instance,
        cpu: Math.max(20, Math.min(95, instance.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(95, instance.memory + (Math.random() - 0.5) * 8)),
        connections: Math.max(50, instance.connections + Math.floor((Math.random() - 0.5) * 50)),
        responseTime: Math.max(10, instance.responseTime + (Math.random() - 0.5) * 30),
        load: Math.max(0.1, Math.min(1.0, instance.load + (Math.random() - 0.5) * 0.1))
      })));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'unhealthy': return AlertTriangle;
      default: return Minus;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return Zap;
      case 'scalability': return TrendingUp;
      case 'cost': return BarChart3;
      case 'security': return AlertTriangle;
      default: return Settings;
    }
  };

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous * 1.05) return TrendingUp;
    if (current < previous * 0.95) return TrendingDown;
    return Minus;
  };

  const optimizeMetric = async (metric: string) => {
    console.log(`Optimizing ${metric}...`);
    // Simulate optimization
    await new Promise(resolve => setTimeout(resolve, 2000));

    setMetrics(prev => {
      const optimized = { ...prev };
      switch (metric) {
        case 'responseTime':
          optimized.responseTime *= 0.8;
          break;
        case 'cacheHitRate':
          optimized.cacheHitRate = Math.min(98, optimized.cacheHitRate + 5);
          break;
        case 'cpuUsage':
          optimized.cpuUsage *= 0.9;
          break;
        case 'memoryUsage':
          optimized.memoryUsage *= 0.85;
          break;
      }
      return optimized;
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Performance Monitoring Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time performance monitoring and optimization insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Activity className="w-4 h-4 mr-2" />
            Live Monitoring
          </Badge>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.responseTime, { good: 200, warning: 500 })}`}>
              {Math.round(metrics.responseTime)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Target: &lt;200ms
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={Math.min(100, (metrics.responseTime / 500) * 100)} className="flex-1 h-2" />
              <Button size="sm" variant="outline" onClick={() => optimizeMetric('responseTime')}>
                Optimize
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.throughput.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Requests per second
            </p>
            <div className="mt-2">
              <Progress value={Math.min(100, (metrics.throughput / 2000) * 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(100 - metrics.cacheHitRate, { good: 10, warning: 20 })}`}>
              {metrics.cacheHitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Target: &gt;95%
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={metrics.cacheHitRate} className="flex-1 h-2" />
              <Button size="sm" variant="outline" onClick={() => optimizeMetric('cacheHitRate')}>
                Optimize
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.errorRate, { good: 0.5, warning: 1.0 })}`}>
              {metrics.errorRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Target: &lt;0.1%
            </p>
            <div className="mt-2">
              <Progress value={Math.min(100, (metrics.errorRate / 2) * 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Performance
                </CardTitle>
                <CardDescription>
                  Real-time system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      CPU Usage
                    </span>
                    <span className="font-medium">{metrics.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.cpuUsage} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <MemoryStick className="w-4 h-4" />
                      Memory Usage
                    </span>
                    <span className="font-medium">{metrics.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.memoryUsage} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Disk I/O
                    </span>
                    <span className="font-medium">{metrics.diskIO.toFixed(1)} MB/s</span>
                  </div>
                  <Progress value={(metrics.diskIO / 100) * 100} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Network className="w-4 h-4" />
                      Network Latency
                    </span>
                    <span className="font-medium">{metrics.networkLatency}ms</span>
                  </div>
                  <Progress value={(metrics.networkLatency / 100) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Activity
                </CardTitle>
                <CardDescription>
                  Current user activity and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {metrics.activeUsers.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Active Users</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-semibold">96.2%</div>
                      <p className="text-xs text-gray-600">User Satisfaction</p>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">18.5min</div>
                      <p className="text-xs text-gray-600">Avg Session</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Peak Hour Load</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="servers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {instances.map((instance) => {
              const StatusIcon = getStatusIcon(instance.status);
              return (
                <Card key={instance.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Server className="w-5 h-5" />
                        {instance.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-5 h-5 ${getStatusColor(instance.status)}`} />
                        <Badge variant="secondary">{instance.region}</Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Load: {instance.load.toFixed(2)} | Connections: {instance.connections}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">CPU</div>
                        <div className="font-medium">{instance.cpu.toFixed(1)}%</div>
                        <Progress value={instance.cpu} className="h-1 mt-1" />
                      </div>
                      <div>
                        <div className="text-gray-600">Memory</div>
                        <div className="font-medium">{instance.memory.toFixed(1)}%</div>
                        <Progress value={instance.memory} className="h-1 mt-1" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium">{instance.responseTime.toFixed(0)}ms</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  CPU Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getMetricColor(metrics.cpuUsage, { good: 60, warning: 80 })}`}>
                    {metrics.cpuUsage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Average CPU Usage</p>
                </div>

                <Progress value={metrics.cpuUsage} className="h-3" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Peak Usage</span>
                    <span className="font-medium">89%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Idle Time</span>
                    <span className="font-medium">32%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Optimization Score</span>
                    <span className="font-medium text-green-600">Good</span>
                  </div>
                </div>

                <Button className="w-full" onClick={() => optimizeMetric('cpuUsage')}>
                  Optimize CPU Usage
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="w-5 h-5" />
                  Memory Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getMetricColor(metrics.memoryUsage, { good: 70, warning: 85 })}`}>
                    {metrics.memoryUsage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Memory Usage</p>
                </div>

                <Progress value={metrics.memoryUsage} className="h-3" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cache Memory</span>
                    <span className="font-medium">2.4GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Buffer Memory</span>
                    <span className="font-medium">1.8GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Leaks</span>
                    <span className="font-medium text-green-600">None</span>
                  </div>
                </div>

                <Button className="w-full" onClick={() => optimizeMetric('memoryUsage')}>
                  Optimize Memory
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getMetricColor(100 - metrics.cacheHitRate, { good: 5, warning: 15 })}`}>
                    {metrics.cacheHitRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Cache Hit Rate</p>
                </div>

                <Progress value={metrics.cacheHitRate} className="h-3" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cache Size</span>
                    <span className="font-medium">512MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Eviction Rate</span>
                    <span className="font-medium">2.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response</span>
                    <span className="font-medium">15ms</span>
                  </div>
                </div>

                <Button className="w-full" onClick={() => optimizeMetric('cacheHitRate')}>
                  Optimize Cache
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {suggestions.map((suggestion) => {
              const CategoryIcon = getCategoryIcon(suggestion.category);
              return (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="w-5 h-5" />
                        <div>
                          <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                          <CardDescription>{suggestion.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(suggestion.severity)}>
                        {suggestion.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Estimated Improvement</div>
                        <div className="font-medium text-green-600">{suggestion.estimatedImprovement}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Implementation Effort</div>
                        <div className="font-medium capitalize">{suggestion.effort}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Recommended Actions:</div>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {suggestion.actions.map((action, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Apply Optimization
                      </Button>
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Active Alerts & Notifications
              </CardTitle>
              <CardDescription>
                Current system alerts and performance warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instances
                  .filter(instance => instance.status !== 'healthy')
                  .map((instance) => (
                    <div key={instance.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${getStatusColor(instance.status)}`} />
                        <div>
                          <div className="font-medium">{instance.name}</div>
                          <div className="text-sm text-gray-600">
                            High resource utilization: CPU {instance.cpu}%, Memory {instance.memory}%
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Investigate
                        </Button>
                        <Button size="sm">
                          Scale
                        </Button>
                      </div>
                    </div>
                  ))}

                {metrics.responseTime > 300 && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="font-medium">High Response Time</div>
                        <div className="text-sm text-gray-600">
                          Average response time of {Math.round(metrics.responseTime)}ms exceeds target
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => optimizeMetric('responseTime')}>
                      Optimize
                    </Button>
                  </div>
                )}

                {metrics.cacheHitRate < 90 && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Cache Hit Rate Below Target</div>
                        <div className="text-sm text-gray-600">
                          Current hit rate of {metrics.cacheHitRate.toFixed(1)}% is below 95% target
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => optimizeMetric('cacheHitRate')}>
                      Optimize
                    </Button>
                  </div>
                )}

                {metrics.errorRate > 0.5 && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium">Elevated Error Rate</div>
                        <div className="text-sm text-gray-600">
                          Error rate of {metrics.errorRate.toFixed(2)}% exceeds acceptable threshold
                        </div>
                      </div>
                    </div>
                    <Button size="sm">
                      Investigate
                    </Button>
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