'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Users, Server, Clock, AlertTriangle, CheckCircle, Download, RefreshCw, Calendar, Filter } from 'lucide-react';

interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  timestamp?: string;
  requests?: number;
  errors?: number;
  responseTime?: number;
}

interface SystemHealth {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastUpdate: string;
}

interface PerformanceMetric {
  metric: string;
  current: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export default function DashboardsPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetric[]>([
    {
      id: '1',
      title: 'Total Requests',
      value: '847,392',
      change: 12.5,
      trend: 'up',
      icon: <Activity className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      id: '2',
      title: 'Active Users',
      value: '2,847',
      change: 8.3,
      trend: 'up',
      icon: <Users className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      id: '3',
      title: 'System Uptime',
      value: '99.98%',
      change: 0.02,
      trend: 'stable',
      icon: <Server className="h-4 w-4" />,
      color: 'text-emerald-600'
    },
    {
      id: '4',
      title: 'Avg Response Time',
      value: '245ms',
      change: -12.1,
      trend: 'down',
      icon: <Clock className="h-4 w-4" />,
      color: 'text-orange-600'
    }
  ]);

  const [performanceData, setPerformanceData] = useState<ChartData[]>([
    { name: '00:00', requests: 1200, errors: 12, responseTime: 250 },
    { name: '04:00', requests: 890, errors: 8, responseTime: 230 },
    { name: '08:00', requests: 2100, errors: 25, responseTime: 280 },
    { name: '12:00', requests: 3200, errors: 45, responseTime: 320 },
    { name: '16:00', requests: 2800, errors: 32, responseTime: 290 },
    { name: '20:00', requests: 1900, errors: 18, responseTime: 260 }
  ]);

  const [errorDistribution, setErrorDistribution] = useState<ChartData[]>([
    { name: '4xx Errors', value: 68, color: '#fbbf24' },
    { name: '5xx Errors', value: 32, color: '#ef4444' },
    { name: 'Timeouts', value: 15, color: '#f97316' },
    { name: 'Network', value: 8, color: '#8b5cf6' }
  ]);

  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([
    {
      component: 'API Gateway',
      status: 'healthy',
      uptime: 99.98,
      lastUpdate: '2 minutes ago'
    },
    {
      component: 'Database Cluster',
      status: 'healthy',
      uptime: 99.95,
      lastUpdate: '1 minute ago'
    },
    {
      component: 'Cache Layer',
      status: 'warning',
      uptime: 99.87,
      lastUpdate: '30 seconds ago'
    },
    {
      component: 'Message Queue',
      status: 'healthy',
      uptime: 99.99,
      lastUpdate: '1 minute ago'
    },
    {
      component: 'CDN',
      status: 'healthy',
      uptime: 99.97,
      lastUpdate: '3 minutes ago'
    }
  ]);

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      metric: 'Response Time',
      current: 245,
      target: 300,
      unit: 'ms',
      status: 'good'
    },
    {
      metric: 'Error Rate',
      current: 0.32,
      target: 1.0,
      unit: '%',
      status: 'good'
    },
    {
      metric: 'Throughput',
      current: 1250,
      target: 1000,
      unit: 'req/min',
      status: 'good'
    },
    {
      metric: 'CPU Usage',
      current: 78,
      target: 80,
      unit: '%',
      status: 'warning'
    },
    {
      metric: 'Memory Usage',
      current: 85,
      target: 90,
      unit: '%',
      status: 'warning'
    },
    {
      metric: 'Disk I/O',
      current: 45,
      target: 70,
      unit: '%',
      status: 'good'
    }
  ]);

  const [trafficData, setTrafficData] = useState<ChartData[]>([
    { name: 'Jan', value: 65000 },
    { name: 'Feb', value: 72000 },
    { name: 'Mar', value: 78000 },
    { name: 'Apr', value: 85000 },
    { name: 'May', value: 92000 },
    { name: 'Jun', value: 98000 },
    { name: 'Jul', value: 105000 },
    { name: 'Aug', value: 112000 },
    { name: 'Sep', value: 118000 },
    { name: 'Oct', value: 125000 },
    { name: 'Nov', value: 132000 },
    { name: 'Dec', value: 140000 }
  ]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdated(new Date());
        // Simulate real-time data updates
        setDashboardMetrics(prev => prev.map(metric => ({
          ...metric,
          value: metric.id === '1' ? `${Math.floor(Math.random() * 100000 + 800000).toLocaleString()}` : metric.value,
          change: metric.change + (Math.random() - 0.5) * 2
        })));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Activity className="h-4 w-4 text-blue-600" />;
  };

  const exportReport = () => {
    // Simulate report export
    console.log('Exporting operational report...');
  };

  const refreshData = () => {
    setLastUpdated(new Date());
    // Simulate data refresh
  };

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981'];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operational Dashboards</h1>
          <p className="text-muted-foreground">
            Real-time operational insights, performance analytics, and system reporting
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportReport}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        <div className="flex items-center space-x-2">
          <span>Auto-refresh:</span>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "On" : "Off"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {getTrendIcon(metric.trend, metric.change)}
                    <span className={metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-blue-600'}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                    <span>vs last period</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Health Status</CardTitle>
                <CardDescription>Current status of all system components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemHealth.map((system, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(system.status)}
                        <div>
                          <p className="font-medium">{system.component}</p>
                          <p className="text-sm text-muted-foreground">{system.uptime}% uptime</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(system.status)}>
                          {system.status.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{system.lastUpdate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators and targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.slice(0, 4).map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <span className="text-sm">
                          {metric.current}{metric.unit} / {metric.target}{metric.unit}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={(metric.current / metric.target) * 100}
                          className="flex-1 h-2"
                        />
                        {getStatusIcon(metric.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Volume & Response Time</CardTitle>
              <CardDescription>Real-time system performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="requests"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>System performance metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Distribution</CardTitle>
                <CardDescription>Breakdown of different error types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={errorDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {errorDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{metric.metric}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.current}{metric.unit}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">
                      Target: {metric.target}{metric.unit}
                    </span>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status.toUpperCase()}
                    </Badge>
                  </div>
                  <Progress
                    value={Math.min((metric.current / metric.target) * 100, 100)}
                    className="mt-2 h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Analytics</CardTitle>
              <CardDescription>Monthly traffic trends and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usage Patterns</CardTitle>
                <CardDescription>Hourly request patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="requests"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Trends</CardTitle>
                <CardDescription>Error rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="errors"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operational Reports</CardTitle>
              <CardDescription>Generate and export operational reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-4">
                  <h4 className="font-medium">Performance Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive performance analysis including response times, throughput, and error rates
                  </p>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">System Health Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Detailed system health analysis including uptime, incidents, and component status
                  </p>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Usage Analytics Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Traffic patterns, user behavior, and usage trends analysis
                  </p>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Weekly Performance Report', date: '2024-01-15', type: 'Performance', size: '2.4 MB' },
                  { name: 'Monthly System Health', date: '2024-01-01', type: 'Health', size: '1.8 MB' },
                  { name: 'Q4 Usage Analytics', date: '2023-12-31', type: 'Analytics', size: '5.2 MB' }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.type} • {report.date} • {report.size}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}