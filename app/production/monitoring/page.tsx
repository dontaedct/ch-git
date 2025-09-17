'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Server, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Cpu, Memory, HardDrive } from 'lucide-react';

interface MonitoringMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
  description: string;
}

interface ApplicationHealth {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  errorRate: number;
  lastChecked: string;
}

interface InfrastructureMetric {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

interface BusinessMetric {
  metric: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  target: number;
}

export default function MonitoringPage() {
  const [monitoringMetrics, setMonitoringMetrics] = useState<MonitoringMetric[]>([
    {
      id: '1',
      name: 'System Response Time',
      value: 245,
      unit: 'ms',
      status: 'healthy',
      threshold: 500,
      description: 'Average response time across all endpoints'
    },
    {
      id: '2',
      name: 'Error Rate',
      value: 0.2,
      unit: '%',
      status: 'healthy',
      threshold: 1.0,
      description: 'Percentage of failed requests'
    },
    {
      id: '3',
      name: 'Throughput',
      value: 1250,
      unit: 'req/min',
      status: 'healthy',
      threshold: 1000,
      description: 'Requests processed per minute'
    },
    {
      id: '4',
      name: 'Memory Usage',
      value: 78,
      unit: '%',
      status: 'warning',
      threshold: 80,
      description: 'Current memory utilization'
    }
  ]);

  const [applicationHealth, setApplicationHealth] = useState<ApplicationHealth[]>([
    {
      service: 'API Gateway',
      status: 'healthy',
      uptime: '99.98%',
      responseTime: 120,
      errorRate: 0.1,
      lastChecked: '2 minutes ago'
    },
    {
      service: 'Database',
      status: 'healthy',
      uptime: '99.95%',
      responseTime: 45,
      errorRate: 0.0,
      lastChecked: '1 minute ago'
    },
    {
      service: 'Cache Layer',
      status: 'warning',
      uptime: '99.87%',
      responseTime: 15,
      errorRate: 0.3,
      lastChecked: '30 seconds ago'
    },
    {
      service: 'Message Queue',
      status: 'healthy',
      uptime: '99.99%',
      responseTime: 8,
      errorRate: 0.0,
      lastChecked: '1 minute ago'
    }
  ]);

  const [infrastructureMetrics, setInfrastructureMetrics] = useState<InfrastructureMetric[]>([
    {
      component: 'Web Server 1',
      status: 'healthy',
      cpuUsage: 45,
      memoryUsage: 67,
      diskUsage: 34,
      networkLatency: 12
    },
    {
      component: 'Web Server 2',
      status: 'healthy',
      cpuUsage: 52,
      memoryUsage: 71,
      diskUsage: 38,
      networkLatency: 15
    },
    {
      component: 'Database Server',
      status: 'warning',
      cpuUsage: 78,
      memoryUsage: 85,
      diskUsage: 67,
      networkLatency: 8
    },
    {
      component: 'Load Balancer',
      status: 'healthy',
      cpuUsage: 23,
      memoryUsage: 34,
      diskUsage: 12,
      networkLatency: 5
    }
  ]);

  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([
    {
      metric: 'Active Users',
      value: 2847,
      unit: 'users',
      trend: 'up',
      change: 12.5,
      target: 3000
    },
    {
      metric: 'Conversion Rate',
      value: 3.4,
      unit: '%',
      trend: 'up',
      change: 0.8,
      target: 4.0
    },
    {
      metric: 'Revenue',
      value: 45780,
      unit: '$',
      trend: 'up',
      change: 8.7,
      target: 50000
    },
    {
      metric: 'Page Load Time',
      value: 1.8,
      unit: 's',
      trend: 'down',
      change: -0.3,
      target: 2.0
    }
  ]);

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setMonitoringMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 10,
        status: metric.value > metric.threshold ? 'warning' : 'healthy'
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const overallSystemStatus = () => {
    const criticalCount = [...applicationHealth, ...infrastructureMetrics].filter(item => item.status === 'critical').length;
    const warningCount = [...applicationHealth, ...infrastructureMetrics].filter(item => item.status === 'warning').length;

    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'healthy';
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of application health, infrastructure, and business metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={getStatusColor(overallSystemStatus())}>
            {getStatusIcon(overallSystemStatus())}
            <span className="ml-2">System {overallSystemStatus().toUpperCase()}</span>
          </Badge>
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </Button>
        </div>
      </div>

      {overallSystemStatus() !== 'healthy' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System health issues detected. Check individual components below for details.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="business">Business Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {monitoringMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getStatusIcon(metric.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(metric.value)}{metric.unit}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                  <div className="mt-2">
                    <Progress
                      value={(metric.value / metric.threshold) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Threshold: {metric.threshold}{metric.unit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health Summary</CardTitle>
              <CardDescription>
                Overall system status and key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {applicationHealth.filter(app => app.status === 'healthy').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Healthy Services</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {[...applicationHealth, ...infrastructureMetrics].filter(item => item.status === 'warning').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {[...applicationHealth, ...infrastructureMetrics].filter(item => item.status === 'critical').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-6">
          <div className="grid gap-4">
            {applicationHealth.map((app, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{app.service}</CardTitle>
                    <Badge className={getStatusColor(app.status)}>
                      {getStatusIcon(app.status)}
                      <span className="ml-2">{app.status.toUpperCase()}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">Uptime</p>
                      <p className="text-2xl font-bold text-green-600">{app.uptime}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className="text-2xl font-bold">{app.responseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Error Rate</p>
                      <p className="text-2xl font-bold">{app.errorRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Checked</p>
                      <p className="text-sm text-muted-foreground">{app.lastChecked}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6">
          <div className="grid gap-4">
            {infrastructureMetrics.map((infra, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{infra.component}</CardTitle>
                    <Badge className={getStatusColor(infra.status)}>
                      {getStatusIcon(infra.status)}
                      <span className="ml-2">{infra.status.toUpperCase()}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Cpu className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">CPU Usage</span>
                      </div>
                      <Progress value={infra.cpuUsage} className="h-2" />
                      <p className="text-sm text-muted-foreground">{infra.cpuUsage}%</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Memory className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Memory Usage</span>
                      </div>
                      <Progress value={infra.memoryUsage} className="h-2" />
                      <p className="text-sm text-muted-foreground">{infra.memoryUsage}%</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <HardDrive className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Disk Usage</span>
                      </div>
                      <Progress value={infra.diskUsage} className="h-2" />
                      <p className="text-sm text-muted-foreground">{infra.diskUsage}%</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Network Latency</span>
                      </div>
                      <p className="text-2xl font-bold">{infra.networkLatency}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {businessMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                  {getTrendIcon(metric.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toLocaleString()}{metric.unit}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-blue-600'}`}>
                      {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '' : ''}{metric.change}%
                    </span>
                    <span className="text-sm text-muted-foreground">vs target</span>
                  </div>
                  <div className="mt-2">
                    <Progress
                      value={(metric.value / metric.target) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {metric.target.toLocaleString()}{metric.unit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}