import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Key, Shield, AlertTriangle, CheckCircle, Globe, Database, Mail, CreditCard, Cloud, MessageSquare, Search, Settings, Activity, ArrowUpRight, Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function ExternalServicesPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const integrationPatterns = [
    {
      title: 'REST API Integration',
      description: 'Standard HTTP REST API connections with JSON/XML data exchange',
      icon: Globe,
      complexity: 'Simple',
      features: [
        'HTTP Methods (GET, POST, PUT, DELETE)',
        'JSON/XML Data Serialization',
        'Query Parameters & Headers',
        'Response Status Handling'
      ]
    },
    {
      title: 'GraphQL Integration',
      description: 'Modern GraphQL API connections with schema-based queries',
      icon: Database,
      complexity: 'Medium',
      features: [
        'Schema Introspection',
        'Query & Mutation Operations',
        'Subscription Support',
        'Type-safe Operations'
      ]
    },
    {
      title: 'Webhook Integration',
      description: 'Real-time event-driven integration via HTTP webhooks',
      icon: Zap,
      complexity: 'Medium',
      features: [
        'Event-driven Architecture',
        'Signature Verification',
        'Retry Mechanisms',
        'Payload Validation'
      ]
    },
    {
      title: 'Database Integration',
      description: 'Direct database connections and data synchronization',
      icon: Database,
      complexity: 'Advanced',
      features: [
        'Connection Pooling',
        'Query Optimization',
        'Transaction Management',
        'Data Synchronization'
      ]
    }
  ];

  const authenticationMethods = [
    {
      method: 'API Key Authentication',
      description: 'Simple API key-based authentication for service access',
      security: 'Basic',
      implementation: 'Header or Query Parameter',
      useCase: 'Simple services, internal APIs'
    },
    {
      method: 'OAuth 2.0 / OpenID Connect',
      description: 'Industry-standard OAuth flow with token-based access',
      security: 'High',
      implementation: 'Authorization Code Flow',
      useCase: 'Third-party services, user consent'
    },
    {
      method: 'JWT Token Authentication',
      description: 'JSON Web Token-based stateless authentication',
      security: 'High',
      implementation: 'Bearer Token in Headers',
      useCase: 'Microservices, distributed systems'
    },
    {
      method: 'Mutual TLS (mTLS)',
      description: 'Certificate-based mutual authentication',
      security: 'Very High',
      implementation: 'Client & Server Certificates',
      useCase: 'High-security environments'
    }
  ];

  const connectedServices = [
    {
      name: 'Stripe Payment Gateway',
      type: 'Payment Processing',
      icon: CreditCard,
      status: 'connected',
      health: 'healthy',
      lastSync: '2 minutes ago',
      authMethod: 'API Key'
    },
    {
      name: 'SendGrid Email Service',
      type: 'Email Delivery',
      icon: Mail,
      status: 'connected',
      health: 'healthy',
      lastSync: '5 minutes ago',
      authMethod: 'API Key'
    },
    {
      name: 'AWS S3 Storage',
      type: 'File Storage',
      icon: Cloud,
      status: 'connected',
      health: 'warning',
      lastSync: '15 minutes ago',
      authMethod: 'IAM Role'
    },
    {
      name: 'Slack Notifications',
      type: 'Team Communication',
      icon: MessageSquare,
      status: 'connected',
      health: 'healthy',
      lastSync: '1 minute ago',
      authMethod: 'OAuth 2.0'
    },
    {
      name: 'Google Analytics',
      type: 'Analytics',
      icon: Search,
      status: 'configured',
      health: 'pending',
      lastSync: 'Never',
      authMethod: 'OAuth 2.0'
    }
  ];

  const errorHandlingStrategies = [
    {
      strategy: 'Exponential Backoff',
      description: 'Progressively increase delay between retry attempts',
      pattern: 'Retry with increasing intervals: 1s, 2s, 4s, 8s...',
      bestFor: 'Rate-limited APIs, temporary failures'
    },
    {
      strategy: 'Circuit Breaker',
      description: 'Prevent cascading failures by stopping requests to failing services',
      pattern: 'Open circuit after threshold, half-open for testing',
      bestFor: 'Protecting downstream services, system stability'
    },
    {
      strategy: 'Bulkhead Pattern',
      description: 'Isolate resources to prevent total system failure',
      pattern: 'Separate connection pools and thread pools',
      bestFor: 'Multi-tenant systems, resource isolation'
    },
    {
      strategy: 'Timeout Management',
      description: 'Set appropriate timeouts to prevent hanging requests',
      pattern: 'Connection, read, and total request timeouts',
      bestFor: 'Unresponsive services, performance optimization'
    }
  ];

  const serviceDiscoveryPatterns = [
    { pattern: 'Static Configuration', description: 'Hardcoded service endpoints', pros: ['Simple', 'Predictable'], cons: ['Not scalable', 'Manual updates'] },
    { pattern: 'DNS-based Discovery', description: 'Use DNS for service resolution', pros: ['Standard protocol', 'Cacheable'], cons: ['Limited metadata', 'TTL issues'] },
    { pattern: 'Service Registry', description: 'Centralized service registration', pros: ['Dynamic updates', 'Health checking'], cons: ['Single point of failure', 'Complexity'] },
    { pattern: 'API Gateway', description: 'Centralized routing and discovery', pros: ['Unified entry point', 'Policy enforcement'], cons: ['Potential bottleneck', 'Latency overhead'] }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/integrations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Integrations
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">External Service Integration</h1>
          <p className="text-gray-600">
            Manage external APIs, authentication methods, and service integration patterns
          </p>
        </div>

        {/* Integration Patterns Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ExternalLink className="mr-2 h-5 w-5" />
              Integration Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {integrationPatterns.map((pattern) => {
                const Icon = pattern.icon;
                return (
                  <div key={pattern.title} className="text-center">
                    <div className="bg-green-50 p-3 rounded-lg mb-3 inline-block">
                      <Icon className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{pattern.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                    <Badge variant={pattern.complexity === 'Simple' ? 'default' : pattern.complexity === 'Medium' ? 'secondary' : 'outline'}>
                      {pattern.complexity}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Connected Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Connected Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connectedServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <Icon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {service.health === 'healthy' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : service.health === 'warning' ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <Badge variant={service.status === 'connected' ? 'default' : 'secondary'}>
                            {service.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Last sync: {service.lastSync}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {service.authMethod}
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Authentication Methods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              Authentication Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authenticationMethods.map((auth, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{auth.method}</h3>
                    <Badge variant={auth.security === 'Very High' ? 'default' : auth.security === 'High' ? 'secondary' : 'outline'}>
                      {auth.security} Security
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{auth.description}</p>
                  <div className="space-y-2 text-sm">
                    <div><strong>Implementation:</strong> {auth.implementation}</div>
                    <div><strong>Best for:</strong> {auth.useCase}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration Patterns & Error Handling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Error Handling Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorHandlingStrategies.map((strategy, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-medium text-gray-900 mb-1">{strategy.strategy}</h4>
                    <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div><strong>Pattern:</strong> {strategy.pattern}</div>
                      <div><strong>Best for:</strong> {strategy.bestFor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Service Discovery Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceDiscoveryPatterns.map((pattern, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">{pattern.pattern}</h4>
                    <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-green-600 font-medium">Pros:</span>
                        <ul className="text-gray-600 ml-2">
                          {pattern.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-orange-600 font-medium">Cons:</span>
                        <ul className="text-gray-600 ml-2">
                          {pattern.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Pattern Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrationPatterns.slice(0, 2).map((pattern) => {
            const Icon = pattern.icon;
            return (
              <Card key={pattern.title}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon className="mr-2 h-5 w-5" />
                    {pattern.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pattern.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{feature}</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure Integration
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}