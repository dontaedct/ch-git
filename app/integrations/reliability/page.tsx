'use client';

import { useState } from 'react';
import { useBrandStyling } from '@/lib/branding/use-brand-styling';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  Activity,
  Settings,
  Bell,
  Zap,
  Heart,
  Timer,
  Database,
  Network,
  BarChart3,
  AlertCircle,
  PlayCircle
} from 'lucide-react';

interface ReliabilityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

interface ErrorPattern {
  id: string;
  type: string;
  service: string;
  count: number;
  lastOccurrence: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  retryCount: number;
}

interface RetryPolicy {
  id: string;
  name: string;
  service: string;
  enabled: boolean;
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
  successRate: number;
}

interface HealthCheck {
  id: string;
  service: string;
  endpoint: string;
  interval: number;
  timeout: number;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: Date;
  uptime: number;
  responseTime: number;
}

export default function AutomationReliabilityPage() {
  const { getBrandClasses } = useBrandStyling();
  const [activeTab, setActiveTab] = useState('overview');

  const reliabilityMetrics: ReliabilityMetric[] = [
    {
      id: 'uptime',
      name: 'Service Uptime',
      value: 99.7,
      unit: '%',
      target: 99.5,
      status: 'excellent',
      trend: 'stable',
      lastUpdated: new Date()
    },
    {
      id: 'automation-success',
      name: 'Automation Success Rate',
      value: 96.3,
      unit: '%',
      target: 95.0,
      status: 'good',
      trend: 'improving',
      lastUpdated: new Date()
    },
    {
      id: 'mttr',
      name: 'Mean Time to Recovery',
      value: 14.2,
      unit: 'minutes',
      target: 30.0,
      status: 'excellent',
      trend: 'improving',
      lastUpdated: new Date()
    },
    {
      id: 'error-rate',
      name: 'Error Rate',
      value: 2.8,
      unit: '%',
      target: 5.0,
      status: 'good',
      trend: 'stable',
      lastUpdated: new Date()
    },
    {
      id: 'retry-success',
      name: 'Retry Success Rate',
      value: 89.1,
      unit: '%',
      target: 80.0,
      status: 'good',
      trend: 'improving',
      lastUpdated: new Date()
    }
  ];

  const errorPatterns: ErrorPattern[] = [
    {
      id: 'timeout-001',
      type: 'Connection Timeout',
      service: 'Payment Gateway',
      count: 23,
      lastOccurrence: new Date('2025-09-16T13:45:00'),
      severity: 'medium',
      resolved: false,
      retryCount: 3
    },
    {
      id: 'auth-002',
      type: 'Authentication Failed',
      service: 'Email Service',
      count: 8,
      lastOccurrence: new Date('2025-09-16T12:30:00'),
      severity: 'high',
      resolved: true,
      retryCount: 2
    },
    {
      id: 'rate-003',
      type: 'Rate Limit Exceeded',
      service: 'CRM API',
      count: 45,
      lastOccurrence: new Date('2025-09-16T14:15:00'),
      severity: 'low',
      resolved: false,
      retryCount: 5
    },
    {
      id: 'db-004',
      type: 'Database Connection Error',
      service: 'User Database',
      count: 12,
      lastOccurrence: new Date('2025-09-16T11:20:00'),
      severity: 'critical',
      resolved: true,
      retryCount: 1
    }
  ];

  const retryPolicies: RetryPolicy[] = [
    {
      id: 'payment-retry',
      name: 'Payment Processing',
      service: 'Payment Gateway',
      enabled: true,
      maxRetries: 3,
      backoffStrategy: 'exponential',
      initialDelay: 1000,
      maxDelay: 30000,
      successRate: 87.5
    },
    {
      id: 'email-retry',
      name: 'Email Delivery',
      service: 'Email Service',
      enabled: true,
      maxRetries: 5,
      backoffStrategy: 'linear',
      initialDelay: 2000,
      maxDelay: 10000,
      successRate: 92.3
    },
    {
      id: 'api-retry',
      name: 'External API Calls',
      service: 'CRM API',
      enabled: true,
      maxRetries: 4,
      backoffStrategy: 'exponential',
      initialDelay: 500,
      maxDelay: 15000,
      successRate: 89.7
    },
    {
      id: 'db-retry',
      name: 'Database Operations',
      service: 'User Database',
      enabled: false,
      maxRetries: 2,
      backoffStrategy: 'fixed',
      initialDelay: 1500,
      maxDelay: 1500,
      successRate: 0
    }
  ];

  const healthChecks: HealthCheck[] = [
    {
      id: 'payment-health',
      service: 'Payment Gateway',
      endpoint: '/api/health/payment',
      interval: 30,
      timeout: 5000,
      status: 'healthy',
      lastCheck: new Date('2025-09-16T14:20:00'),
      uptime: 99.8,
      responseTime: 245
    },
    {
      id: 'email-health',
      service: 'Email Service',
      endpoint: '/api/health/email',
      interval: 60,
      timeout: 3000,
      status: 'healthy',
      lastCheck: new Date('2025-09-16T14:19:00'),
      uptime: 99.5,
      responseTime: 180
    },
    {
      id: 'crm-health',
      service: 'CRM API',
      endpoint: '/api/health/crm',
      interval: 45,
      timeout: 8000,
      status: 'degraded',
      lastCheck: new Date('2025-09-16T14:18:00'),
      uptime: 97.2,
      responseTime: 1200
    },
    {
      id: 'db-health',
      service: 'User Database',
      endpoint: '/api/health/database',
      interval: 15,
      timeout: 2000,
      status: 'healthy',
      lastCheck: new Date('2025-09-16T14:20:30'),
      uptime: 99.9,
      responseTime: 45
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      excellent: "default",
      good: "default",
      healthy: "default",
      warning: "secondary",
      degraded: "secondary",
      critical: "destructive",
      down: "destructive"
    };
    const colors: Record<string, string> = {
      excellent: "text-green-600",
      good: "text-blue-600",
      healthy: "text-green-600",
      warning: "text-yellow-600",
      degraded: "text-orange-600",
      critical: "text-red-600",
      down: "text-red-600"
    };
    return <Badge variant={variants[status] || "secondary"} className={colors[status]}>{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "secondary",
      medium: "default",
      high: "secondary",
      critical: "destructive"
    };
    const colors: Record<string, string> = {
      low: "text-gray-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      critical: "text-red-600"
    };
    return <Badge variant={variants[severity] || "secondary"} className={colors[severity]}>{severity}</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Heart className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Reliability & Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor automation reliability with error handling, retry mechanisms, and health tracking
          </p>
        </div>
        <Button>
          <Bell className="mr-2 h-4 w-4" />
          Configure Alerts
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">99.7%</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">96.3%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">MTTR</p>
                <p className="text-2xl font-bold">14.2m</p>
              </div>
              <Timer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Errors</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retry Success</p>
                <p className="text-2xl font-bold">89.1%</p>
              </div>
              <RefreshCw className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Reliability Overview</TabsTrigger>
          <TabsTrigger value="errors">Error Monitoring</TabsTrigger>
          <TabsTrigger value="retry">Retry Policies</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reliability Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reliabilityMetrics.map((metric) => (
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
                <CardTitle>System Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthChecks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getHealthIcon(check.status)}
                        <div>
                          <p className="font-medium">{check.service}</p>
                          <p className="text-sm text-muted-foreground">
                            Uptime: {check.uptime}% | Response: {check.responseTime}ms
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reliability Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime Improvement</span>
                    <span className="font-medium text-green-600">+0.3%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`bg-green-500 h-2 rounded-full ${getBrandClasses()}`}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Reduction</span>
                    <span className="font-medium text-green-600">-1.2%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`bg-blue-500 h-2 rounded-full ${getBrandClasses()}`}></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recovery Time Improvement</span>
                    <span className="font-medium text-green-600">-8.3min</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`bg-purple-500 h-2 rounded-full ${getBrandClasses()}`}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Retry Efficiency</span>
                    <span className="font-medium text-green-600">+5.4%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`bg-indigo-500 h-2 rounded-full ${getBrandClasses()}`}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Pattern Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorPatterns.map((error) => (
                  <div key={error.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                          <h3 className="font-medium">{error.type}</h3>
                          <p className="text-sm text-muted-foreground">{error.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(error.severity)}
                        {error.resolved && <Badge variant="outline" className="text-green-600">Resolved</Badge>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Occurrences</p>
                        <p className="font-medium">{error.count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Retry Attempts</p>
                        <p className="font-medium">{error.retryCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Seen</p>
                        <p className="font-medium">{error.lastOccurrence.toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium">{error.resolved ? 'Resolved' : 'Active'}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      {!error.resolved && (
                        <Button size="sm" variant="outline">Mark Resolved</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Retry Policy Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retryPolicies.map((policy) => (
                  <div key={policy.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <RefreshCw className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="font-medium">{policy.name}</h3>
                          <p className="text-sm text-muted-foreground">{policy.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={policy.enabled} />
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Max Retries</p>
                        <p className="font-medium">{policy.maxRetries}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Strategy</p>
                        <p className="font-medium capitalize">{policy.backoffStrategy}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Initial Delay</p>
                        <p className="font-medium">{policy.initialDelay}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Max Delay</p>
                        <p className="font-medium">{policy.maxDelay}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium">{policy.successRate}%</p>
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

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Check Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="service-name">Service Name</Label>
                  <Input id="service-name" placeholder="Enter service name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint">Health Check Endpoint</Label>
                  <Input id="endpoint" placeholder="/api/health" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interval">Check Interval (seconds)</Label>
                    <Input id="interval" type="number" defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (ms)</Label>
                    <Input id="timeout" type="number" defaultValue="5000" />
                  </div>
                </div>

                <Button className="w-full">Add Health Check</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Health Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthChecks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getHealthIcon(check.status)}
                        <div>
                          <p className="font-medium text-sm">{check.service}</p>
                          <p className="text-xs text-muted-foreground">
                            Every {check.interval}s | {check.responseTime}ms
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{check.uptime}%</p>
                        {getStatusBadge(check.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}