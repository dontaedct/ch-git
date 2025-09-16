import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { ArrowLeft, Plus, Settings, Activity, Webhook, Shield, Zap, AlertTriangle, CheckCircle, Clock, RefreshCw, Play, Pause, Eye, Edit, Trash2, Download, Upload, Search, Filter, GitBranch, Database, Bell, MessageSquare, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function WebhookManagementPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const managementStats = {
    totalWebhooks: 15,
    activeWebhooks: 12,
    processingRate: 450,
    failureRate: 1.5,
    averageLatency: 145,
    queueDepth: 8,
    retryAttempts: 23,
    dlqMessages: 5
  };

  const webhookEndpoints = [
    {
      id: 'wh_001',
      name: 'Stripe Payment Webhooks',
      url: 'https://api.example.com/webhooks/stripe',
      method: 'POST',
      status: 'active',
      health: 'healthy',
      created: '2024-01-15',
      lastEvent: '2 minutes ago',
      eventsToday: 234,
      successRate: 99.2,
      avgLatency: '125ms',
      events: ['payment_intent.succeeded', 'charge.failed', 'invoice.paid', 'subscription.updated'],
      authentication: 'signature',
      retryPolicy: 'exponential_backoff',
      timeout: 30000,
      description: 'Handles all Stripe payment-related webhook events'
    },
    {
      id: 'wh_002',
      name: 'GitHub Repository Events',
      url: 'https://api.example.com/webhooks/github',
      method: 'POST',
      status: 'active',
      health: 'healthy',
      created: '2024-02-01',
      lastEvent: '15 minutes ago',
      eventsToday: 67,
      successRate: 98.8,
      avgLatency: '89ms',
      events: ['push', 'pull_request', 'issues', 'release'],
      authentication: 'secret',
      retryPolicy: 'linear',
      timeout: 15000,
      description: 'Processes GitHub repository events and triggers CI/CD workflows'
    },
    {
      id: 'wh_003',
      name: 'SendGrid Email Events',
      url: 'https://api.example.com/webhooks/sendgrid',
      method: 'POST',
      status: 'active',
      health: 'warning',
      created: '2024-01-20',
      lastEvent: '5 minutes ago',
      eventsToday: 156,
      successRate: 96.5,
      avgLatency: '245ms',
      events: ['delivered', 'opened', 'clicked', 'bounced', 'dropped'],
      authentication: 'bearer_token',
      retryPolicy: 'exponential_backoff',
      timeout: 20000,
      description: 'Manages email delivery status and engagement tracking'
    },
    {
      id: 'wh_004',
      name: 'Slack Workspace Events',
      url: 'https://api.example.com/webhooks/slack',
      method: 'POST',
      status: 'paused',
      health: 'offline',
      created: '2024-02-10',
      lastEvent: '2 hours ago',
      eventsToday: 12,
      successRate: 95.0,
      avgLatency: '178ms',
      events: ['message', 'channel_created', 'user_joined', 'app_mention'],
      authentication: 'oauth',
      retryPolicy: 'fixed_delay',
      timeout: 25000,
      description: 'Handles Slack workspace events and notifications'
    }
  ];

  const processingEngines = [
    {
      name: 'Event Ingestion Engine',
      description: 'Receives and validates incoming webhook requests',
      status: 'active',
      throughput: '450 events/min',
      errorRate: '0.5%',
      features: [
        'HTTP request validation',
        'Signature verification',
        'Rate limiting protection',
        'Payload size validation'
      ]
    },
    {
      name: 'Event Processing Engine',
      description: 'Transforms and enriches webhook events',
      status: 'active',
      throughput: '420 events/min',
      errorRate: '1.2%',
      features: [
        'Data transformation',
        'Schema validation',
        'Content enrichment',
        'Format conversion'
      ]
    },
    {
      name: 'Event Routing Engine',
      description: 'Routes events to appropriate handlers',
      status: 'active',
      throughput: '435 events/min',
      errorRate: '0.8%',
      features: [
        'Rule-based routing',
        'Content filtering',
        'Dynamic dispatch',
        'Load balancing'
      ]
    },
    {
      name: 'Event Monitoring Engine',
      description: 'Tracks performance and health metrics',
      status: 'active',
      throughput: '450 events/min',
      errorRate: '0.3%',
      features: [
        'Real-time monitoring',
        'Performance tracking',
        'Alert generation',
        'Log aggregation'
      ]
    }
  ];

  const routingRules = [
    {
      id: 'rule_001',
      name: 'Critical Payment Events',
      condition: 'event.type.startsWith("payment") && event.priority === "high"',
      action: 'route_to_payment_handler',
      destination: 'payment-service',
      priority: 'critical',
      enabled: true,
      matches: 145,
      lastMatch: '2 minutes ago'
    },
    {
      id: 'rule_002',
      name: 'Security Alerts',
      condition: 'event.category === "security" && event.severity >= 8',
      action: 'send_immediate_alert',
      destination: 'security-team',
      priority: 'critical',
      enabled: true,
      matches: 8,
      lastMatch: '1 hour ago'
    },
    {
      id: 'rule_003',
      name: 'User Activity Events',
      condition: 'event.type === "user_action" && event.source === "web"',
      action: 'update_analytics',
      destination: 'analytics-service',
      priority: 'low',
      enabled: true,
      matches: 567,
      lastMatch: '5 minutes ago'
    },
    {
      id: 'rule_004',
      name: 'Email Bounces',
      condition: 'event.type === "bounced" && event.reason === "invalid_email"',
      action: 'update_user_status',
      destination: 'user-service',
      priority: 'medium',
      enabled: false,
      matches: 23,
      lastMatch: '30 minutes ago'
    }
  ];

  const reliabilityFeatures = [
    {
      feature: 'Retry Mechanism',
      description: 'Automatic retry with configurable policies',
      implementation: 'Exponential backoff with jitter',
      metrics: { attempts: 1234, success: 98.2, maxRetries: 5 },
      status: 'active'
    },
    {
      feature: 'Dead Letter Queue',
      description: 'Failed events storage for manual inspection',
      implementation: 'SQS-based DLQ with TTL policies',
      metrics: { messages: 5, processed: 2, retention: 7 },
      status: 'active'
    },
    {
      feature: 'Circuit Breaker',
      description: 'Prevents cascading failures',
      implementation: 'Threshold-based with auto-recovery',
      metrics: { threshold: 10, current: 2, state: 'closed' },
      status: 'active'
    },
    {
      feature: 'Idempotency Check',
      description: 'Prevents duplicate event processing',
      implementation: 'Hash-based deduplication',
      metrics: { duplicates: 12, window: 24, cache: 1000 },
      status: 'active'
    }
  ];

  const monitoringMetrics = [
    {
      metric: 'Processing Rate',
      value: '450/min',
      change: '+5.2%',
      trend: 'up',
      status: 'good'
    },
    {
      metric: 'Success Rate',
      value: '98.5%',
      change: '+0.3%',
      trend: 'up',
      status: 'excellent'
    },
    {
      metric: 'Average Latency',
      value: '145ms',
      change: '-12ms',
      trend: 'down',
      status: 'good'
    },
    {
      metric: 'Queue Depth',
      value: '8',
      change: 'stable',
      trend: 'stable',
      status: 'normal'
    },
    {
      metric: 'Failed Events',
      value: '23',
      change: '-8',
      trend: 'down',
      status: 'good'
    },
    {
      metric: 'DLQ Messages',
      value: '5',
      change: '-2',
      trend: 'down',
      status: 'good'
    }
  ];

  const recentEvents = [
    {
      id: 'evt_001',
      type: 'payment_intent.succeeded',
      source: 'stripe',
      timestamp: '2 minutes ago',
      status: 'processed',
      latency: '125ms',
      retries: 0
    },
    {
      id: 'evt_002',
      type: 'email.delivered',
      source: 'sendgrid',
      timestamp: '3 minutes ago',
      status: 'processed',
      latency: '89ms',
      retries: 0
    },
    {
      id: 'evt_003',
      type: 'push',
      source: 'github',
      timestamp: '5 minutes ago',
      status: 'failed',
      latency: '2.3s',
      retries: 2
    },
    {
      id: 'evt_004',
      type: 'user.signup',
      source: 'auth-service',
      timestamp: '8 minutes ago',
      status: 'processed',
      latency: '67ms',
      retries: 0
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/integrations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Integrations
              </Button>
            </Link>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhook Management System</h1>
          <p className="text-gray-600">
            Manage webhook endpoints, processing engines, routing rules, and reliability mechanisms
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.totalWebhooks}</div>
              <p className="text-xs text-muted-foreground">
                {managementStats.activeWebhooks} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Rate</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.processingRate}/min</div>
              <p className="text-xs text-muted-foreground">
                +5.2% from last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.averageLatency}ms</div>
              <p className="text-xs text-muted-foreground">
                -12ms from last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.failureRate}%</div>
              <p className="text-xs text-muted-foreground">
                -0.3% from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Webhook Endpoints Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Webhook className="mr-2 h-5 w-5" />
                Webhook Endpoints
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhookEndpoints.map((webhook) => (
                <div key={webhook.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                        <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                          {webhook.status}
                        </Badge>
                        {webhook.health === 'healthy' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : webhook.health === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{webhook.description}</p>
                      <p className="text-sm text-gray-500 font-mono">{webhook.url}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        {webhook.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{webhook.eventsToday}</div>
                      <div className="text-xs text-gray-600">Events Today</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{webhook.successRate}%</div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{webhook.avgLatency}</div>
                      <div className="text-xs text-gray-600">Avg Latency</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{webhook.timeout/1000}s</div>
                      <div className="text-xs text-gray-600">Timeout</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{webhook.retryPolicy}</div>
                      <div className="text-xs text-gray-600">Retry Policy</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Supported Events</h4>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>Auth: {webhook.authentication}</span>
                      <span>Created: {webhook.created}</span>
                      <span>Last event: {webhook.lastEvent}</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      Test Webhook
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Processing Engines & Routing Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Processing Engines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Processing Engines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingEngines.map((engine, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{engine.name}</h4>
                      <Badge variant={engine.status === 'active' ? 'default' : 'secondary'}>
                        {engine.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{engine.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{engine.throughput}</div>
                        <div className="text-gray-600">Throughput</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{engine.errorRate}</div>
                        <div className="text-gray-600">Error Rate</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {engine.features.slice(0, 2).map((feature, i) => (
                        <div key={i} className="text-xs text-gray-600 flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Routing Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="mr-2 h-5 w-5" />
                Routing Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routingRules.map((rule) => (
                  <div key={rule.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{rule.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={rule.priority === 'critical' ? 'destructive' : rule.priority === 'medium' ? 'default' : 'secondary'}>
                          {rule.priority}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 font-mono">{rule.condition}</p>
                    <p className="text-xs text-blue-600 mb-2">{rule.action} → {rule.destination}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{rule.matches} matches</span>
                      <span>Last: {rule.lastMatch}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reliability Features & Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Reliability Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Reliability Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reliabilityFeatures.map((feature, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{feature.feature}</h4>
                      <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {Object.entries(feature.metrics).map(([key, value]) => (
                        <div key={key} className="text-center p-2 bg-white rounded border">
                          <div className="font-medium">{value}</div>
                          <div className="text-gray-600 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Monitoring Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {monitoringMetrics.map((metric, index) => (
                  <div key={index} className="text-center p-3 border rounded-lg">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">{metric.metric}</h4>
                    <div className="text-lg font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="flex items-center justify-center space-x-1">
                      {metric.status === 'excellent' ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : metric.status === 'good' ? (
                        <CheckCircle className="h-3 w-3 text-blue-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span className="text-xs text-gray-600">{metric.change}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Events</h4>
                <div className="space-y-2">
                  {recentEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        {event.status === 'processed' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                        <span className="font-mono">{event.type}</span>
                      </div>
                      <div className="text-gray-500">{event.latency}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Management Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="mr-2 h-5 w-5" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full">
                  <Play className="h-4 w-4 mr-1" />
                  Start All Webhooks
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Pause className="h-4 w-4 mr-1" />
                  Pause All Webhooks
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh All Status
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-1" />
                  Export Configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Alert Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>High failure rate (&gt;5%)</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Latency spike (&gt;1s)</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Queue depth (&gt;100)</span>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>DLQ threshold (&gt;50)</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure Alerts
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ingestion Engine</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Processing Engine</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Routing Engine</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monitoring Engine</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dead Letter Queue</span>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Activity className="h-4 w-4 mr-1" />
                  View System Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}