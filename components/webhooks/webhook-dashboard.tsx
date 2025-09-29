/**
 * Webhook Management Dashboard
 * 
 * Comprehensive dashboard for managing webhooks, viewing analytics,
 * testing endpoints, and browsing the marketplace.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Globe, 
  Settings, 
  TestTube, 
  TrendingUp,
  Zap,
  ExternalLink,
  Copy,
  Play,
  Pause,
  Trash2,
  Plus
} from 'lucide-react';

interface WebhookMetrics {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  totalRetries: number;
  averageRetries: number;
}

interface WebhookEventStats {
  eventType: string;
  totalDeliveries: number;
  successRate: number;
  averageResponseTime: number;
  mostCommonError?: string;
}

interface WebhookEndpointStats {
  endpoint: string;
  totalDeliveries: number;
  successRate: number;
  averageResponseTime: number;
  mostCommonError?: string;
  lastSuccess?: string;
  lastFailure?: string;
}

interface WebhookTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  tags: string[];
  verified: boolean;
  usageCount: number;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface WebhookTestResult {
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  error?: string;
  duration: number;
  requestDetails: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
  };
}

export function WebhookDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<WebhookMetrics | null>(null);
  const [eventStats, setEventStats] = useState<WebhookEventStats[]>([]);
  const [endpointStats, setEndpointStats] = useState<WebhookEndpointStats[]>([]);
  const [templates, setTemplates] = useState<WebhookTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<WebhookTestResult | null>(null);
  const [testing, setTesting] = useState(false);

  // Test webhook form state
  const [testForm, setTestForm] = useState({
    url: '',
    secret: '',
    payload: '{"test": "data"}',
    signatureHeader: 'X-Hub-Signature-256',
    signaturePrefix: 'sha256=',
    method: 'POST' as const
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics data
      const analyticsResponse = await fetch('/api/webhooks/analytics');
      const analyticsData = await analyticsResponse.json();
      
      if (analyticsData.ok) {
        setMetrics(analyticsData.data.metrics);
        setEventStats(analyticsData.data.eventStats);
        setEndpointStats(analyticsData.data.endpointStats);
      }

      // Load marketplace data
      const marketplaceResponse = await fetch('/api/webhooks/marketplace');
      const marketplaceData = await marketplaceResponse.json();
      
      if (marketplaceData.ok) {
        setTemplates(marketplaceData.data.templates);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testForm),
      });

      const result = await response.json();
      
      if (result.ok) {
        setTestResult(result.data);
      } else {
        setTestResult({
          success: false,
          error: result.error || 'Test failed',
          duration: 0,
          requestDetails: {
            url: testForm.url,
            method: testForm.method,
            headers: {},
            body: testForm.payload
          }
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: 0,
        requestDetails: {
          url: testForm.url,
          method: testForm.method,
          headers: {},
          body: testForm.payload
        }
      });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhook Management</h1>
          <p className="text-muted-foreground">
            Monitor, test, and manage your webhook integrations
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {metrics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalDeliveries.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.successfulDeliveries} successful, {metrics.failedDeliveries} failed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average over last 7 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
                  <p className="text-xs text-muted-foreground">
                    P95: {metrics.p95ResponseTime}ms, P99: {metrics.p99ResponseTime}ms
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Retries</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalRetries}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg {metrics.averageRetries.toFixed(1)} per delivery
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Event Types</CardTitle>
                <CardDescription>Performance by event type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventStats.slice(0, 5).map((stat) => (
                    <div key={stat.eventType} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{stat.eventType}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {stat.totalDeliveries} deliveries
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {stat.successRate.toFixed(1)}%
                        </span>
                        {stat.successRate >= 95 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : stat.successRate >= 80 ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endpoint Performance</CardTitle>
                <CardDescription>Status of your webhook endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpointStats.slice(0, 5).map((stat) => (
                    <div key={stat.endpoint} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{stat.endpoint}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {stat.successRate.toFixed(1)}%
                        </span>
                        {stat.lastSuccess && (
                          <span className="text-xs text-muted-foreground">
                            Last: {new Date(stat.lastSuccess).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Analytics</CardTitle>
              <CardDescription>Detailed analytics and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Advanced analytics features are available. Use the API endpoints to get detailed metrics,
                  time series data, and error analysis.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Test Webhook</CardTitle>
                <CardDescription>Test your webhook endpoints with custom payloads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-url">Webhook URL</Label>
                  <Input
                    id="test-url"
                    placeholder="https://example.com/webhook"
                    value={testForm.url}
                    onChange={(e) => setTestForm({ ...testForm, url: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-secret">Secret Key</Label>
                  <Input
                    id="test-secret"
                    type="password"
                    placeholder="Your webhook secret"
                    value={testForm.secret}
                    onChange={(e) => setTestForm({ ...testForm, secret: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="signature-header">Signature Header</Label>
                    <Input
                      id="signature-header"
                      value={testForm.signatureHeader}
                      onChange={(e) => setTestForm({ ...testForm, signatureHeader: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signature-prefix">Signature Prefix</Label>
                    <Input
                      id="signature-prefix"
                      value={testForm.signaturePrefix}
                      onChange={(e) => setTestForm({ ...testForm, signaturePrefix: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-payload">Payload (JSON)</Label>
                  <Textarea
                    id="test-payload"
                    rows={6}
                    value={testForm.payload}
                    onChange={(e) => setTestForm({ ...testForm, payload: e.target.value })}
                  />
                </div>

                <Button 
                  onClick={testWebhook} 
                  disabled={testing || !testForm.url || !testForm.secret}
                  className="w-full"
                >
                  {testing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Webhook
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Results from your webhook test</CardDescription>
              </CardHeader>
              <CardContent>
                {testResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {testResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium">
                          {testResult.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {testResult.duration}ms
                      </span>
                    </div>

                    {testResult.statusCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status Code:</span>
                        <Badge variant={testResult.statusCode < 400 ? 'default' : 'destructive'}>
                          {testResult.statusCode}
                        </Badge>
                      </div>
                    )}

                    {testResult.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{testResult.error}</AlertDescription>
                      </Alert>
                    )}

                    {testResult.responseBody && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Response Body</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(testResult.responseBody || '')}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                          {testResult.responseBody}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Run a test to see results here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Templates</CardTitle>
              <CardDescription>Browse and use pre-built webhook templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </div>
                        {template.verified && (
                          <Badge variant="secondary" className="ml-2">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Provider:</span>
                          <Badge variant="outline">{template.provider}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="capitalize">{template.category}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Usage:</span>
                          <span>{template.usageCount.toLocaleString()}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <span>by {template.author.name}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
