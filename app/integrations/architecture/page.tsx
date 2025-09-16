import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { ArrowLeft, Database, Network, Shield, Zap, GitBranch, Server, Key, FileText, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function IntegrationArchitecturePage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const architectureComponents = [
    {
      title: 'Service Connectors',
      description: 'Standardized connectors for external APIs and services',
      icon: Network,
      status: 'active',
      connectors: 12,
      patterns: [
        'REST API Connector',
        'GraphQL Connector',
        'Database Connector',
        'Message Queue Connector'
      ]
    },
    {
      title: 'Data Flow Patterns',
      description: 'Defined patterns for data transformation and routing',
      icon: GitBranch,
      status: 'active',
      flows: 8,
      patterns: [
        'Request/Response Pattern',
        'Event-Driven Pattern',
        'Batch Processing Pattern',
        'Stream Processing Pattern'
      ]
    },
    {
      title: 'Integration Security',
      description: 'Security layers for authentication, authorization, and encryption',
      icon: Shield,
      status: 'secure',
      policies: 6,
      patterns: [
        'OAuth 2.0 / OpenID Connect',
        'API Key Management',
        'JWT Token Validation',
        'Rate Limiting & Throttling'
      ]
    },
    {
      title: 'Scalability Architecture',
      description: 'Horizontal scaling patterns and load distribution strategies',
      icon: Server,
      status: 'optimized',
      strategies: 4,
      patterns: [
        'Load Balancing',
        'Circuit Breaker Pattern',
        'Retry with Backoff',
        'Connection Pooling'
      ]
    }
  ];

  const integrationLayers = [
    {
      layer: 'Presentation Layer',
      description: 'API Gateway, Request/Response handling, Rate limiting',
      components: ['API Gateway', 'Load Balancer', 'Rate Limiter'],
      status: 'operational'
    },
    {
      layer: 'Service Layer',
      description: 'Business logic orchestration, Service composition',
      components: ['Workflow Engine', 'Service Registry', 'Circuit Breaker'],
      status: 'operational'
    },
    {
      layer: 'Integration Layer',
      description: 'Protocol transformation, Data mapping, Message routing',
      components: ['Message Router', 'Data Transformer', 'Protocol Adapter'],
      status: 'operational'
    },
    {
      layer: 'Connectivity Layer',
      description: 'External service connections, Authentication, Monitoring',
      components: ['Service Connectors', 'Auth Manager', 'Health Monitor'],
      status: 'operational'
    }
  ];

  const securityControls = [
    { control: 'API Authentication', implementation: 'OAuth 2.0 + JWT', status: 'implemented' },
    { control: 'Data Encryption', implementation: 'TLS 1.3 + AES-256', status: 'implemented' },
    { control: 'Access Control', implementation: 'RBAC + API Keys', status: 'implemented' },
    { control: 'Audit Logging', implementation: 'Structured Logging', status: 'implemented' },
    { control: 'Rate Limiting', implementation: 'Token Bucket Algorithm', status: 'implemented' },
    { control: 'Input Validation', implementation: 'Schema Validation', status: 'implemented' }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integration Architecture</h1>
          <p className="text-gray-600">
            Design and manage integration patterns, service connectors, and data flow architecture
          </p>
        </div>

        {/* Architecture Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Architecture Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {architectureComponents.map((component) => {
                const Icon = component.icon;
                return (
                  <div key={component.title} className="text-center">
                    <div className="bg-blue-50 p-3 rounded-lg mb-3 inline-block">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{component.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{component.description}</p>
                    <Badge variant={component.status === 'active' ? 'default' : component.status === 'secure' ? 'secondary' : 'outline'}>
                      {component.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Integration Layers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Integration Layers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrationLayers.map((layer, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{layer.layer}</h3>
                    <Badge variant={layer.status === 'operational' ? 'default' : 'secondary'}>
                      {layer.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{layer.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {layer.components.map((component, compIndex) => (
                      <span key={compIndex} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                        {component}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Architecture Patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {architectureComponents.map((component) => {
            const Icon = component.icon;
            return (
              <Card key={component.title}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon className="mr-2 h-5 w-5" />
                    {component.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {component.patterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{pattern}</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {component.connectors && `${component.connectors} connectors`}
                        {component.flows && `${component.flows} flows`}
                        {component.policies && `${component.policies} policies`}
                        {component.strategies && `${component.strategies} strategies`}
                      </span>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Security Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {securityControls.map((control, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{control.control}</h4>
                    {control.status === 'implemented' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{control.implementation}</p>
                  <Badge variant={control.status === 'implemented' ? 'default' : 'secondary'} className="mt-2">
                    {control.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}