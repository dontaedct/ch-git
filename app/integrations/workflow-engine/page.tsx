import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { ArrowLeft, Workflow, Play, Pause, Settings, Zap, GitBranch, Clock, BarChart3, CheckCircle, AlertCircle, Activity, Cpu, Database, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function WorkflowEngineArchitecturePage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const engineComponents = [
    {
      title: 'Workflow Definition Engine',
      description: 'Visual workflow builder with drag-and-drop interface and validation',
      icon: GitBranch,
      status: 'active',
      features: [
        'Visual Workflow Designer',
        'Node-based Flow Editor',
        'Workflow Validation',
        'Template Library'
      ]
    },
    {
      title: 'Execution Engine',
      description: 'High-performance workflow execution with parallel processing',
      icon: Cpu,
      status: 'optimized',
      features: [
        'Parallel Task Execution',
        'State Management',
        'Error Handling',
        'Retry Mechanisms'
      ]
    },
    {
      title: 'Orchestration Layer',
      description: 'Advanced orchestration with dependency management and scheduling',
      icon: Zap,
      status: 'active',
      features: [
        'Task Dependency Resolution',
        'Dynamic Scheduling',
        'Resource Allocation',
        'Load Balancing'
      ]
    },
    {
      title: 'Monitoring & Analytics',
      description: 'Real-time workflow monitoring with performance analytics',
      icon: BarChart3,
      status: 'active',
      features: [
        'Real-time Monitoring',
        'Performance Metrics',
        'Execution History',
        'Alert Management'
      ]
    }
  ];

  const workflowPatterns = [
    {
      pattern: 'Sequential Workflow',
      description: 'Linear execution of tasks in defined order',
      useCase: 'Document processing, data validation',
      complexity: 'Simple'
    },
    {
      pattern: 'Parallel Workflow',
      description: 'Concurrent execution of independent tasks',
      useCase: 'Batch processing, multi-service calls',
      complexity: 'Medium'
    },
    {
      pattern: 'Conditional Workflow',
      description: 'Dynamic routing based on conditions and rules',
      useCase: 'Approval processes, business logic',
      complexity: 'Medium'
    },
    {
      pattern: 'Event-Driven Workflow',
      description: 'Triggered by external events and webhooks',
      useCase: 'Real-time responses, notifications',
      complexity: 'Advanced'
    }
  ];

  const executionStrategies = [
    {
      strategy: 'Immediate Execution',
      description: 'Execute workflow immediately upon trigger',
      pros: ['Low latency', 'Real-time processing'],
      cons: ['Resource intensive', 'No queuing']
    },
    {
      strategy: 'Queued Execution',
      description: 'Queue workflows for controlled execution',
      pros: ['Resource management', 'Scalable'],
      cons: ['Higher latency', 'Queue overhead']
    },
    {
      strategy: 'Scheduled Execution',
      description: 'Execute workflows at specified times',
      pros: ['Predictable load', 'Batch processing'],
      cons: ['Not real-time', 'Schedule dependency']
    },
    {
      strategy: 'Event-Based Execution',
      description: 'Execute based on external events',
      pros: ['Responsive', 'Efficient'],
      cons: ['Event dependency', 'Complex routing']
    }
  ];

  const optimizationFeatures = [
    { feature: 'Connection Pooling', implementation: 'Database & API connections', status: 'implemented' },
    { feature: 'Task Caching', implementation: 'Result caching for repeated tasks', status: 'implemented' },
    { feature: 'Parallel Processing', implementation: 'Multi-threaded task execution', status: 'implemented' },
    { feature: 'Resource Throttling', implementation: 'Dynamic resource allocation', status: 'planned' },
    { feature: 'Smart Retry Logic', implementation: 'Exponential backoff with jitter', status: 'implemented' },
    { feature: 'Circuit Breaker', implementation: 'Fault tolerance for external calls', status: 'implemented' }
  ];

  const monitoringMetrics = [
    { metric: 'Execution Time', value: '2.3s avg', trend: 'down', status: 'good' },
    { metric: 'Success Rate', value: '98.5%', trend: 'up', status: 'excellent' },
    { metric: 'Error Rate', value: '1.5%', trend: 'down', status: 'good' },
    { metric: 'Throughput', value: '450/min', trend: 'up', status: 'good' },
    { metric: 'Queue Depth', value: '12', trend: 'stable', status: 'normal' },
    { metric: 'Resource Usage', value: '65%', trend: 'stable', status: 'normal' }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Engine Architecture</h1>
          <p className="text-gray-600">
            Design and manage workflow automation, orchestration, and execution optimization
          </p>
        </div>

        {/* Engine Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Workflow className="mr-2 h-5 w-5" />
              Workflow Engine Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {engineComponents.map((component) => {
                const Icon = component.icon;
                return (
                  <div key={component.title} className="text-center">
                    <div className="bg-purple-50 p-3 rounded-lg mb-3 inline-block">
                      <Icon className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{component.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{component.description}</p>
                    <Badge variant={component.status === 'active' ? 'default' : component.status === 'optimized' ? 'secondary' : 'outline'}>
                      {component.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Patterns */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Workflow Execution Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workflowPatterns.map((pattern, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{pattern.pattern}</h3>
                    <Badge variant={pattern.complexity === 'Simple' ? 'default' : pattern.complexity === 'Medium' ? 'secondary' : 'outline'}>
                      {pattern.complexity}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{pattern.description}</p>
                  <p className="text-sm text-gray-500">
                    <strong>Use Cases:</strong> {pattern.useCase}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Execution Strategies & Optimization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="mr-2 h-5 w-5" />
                Execution Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executionStrategies.map((strategy, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900 mb-1">{strategy.strategy}</h4>
                    <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-green-600 font-medium">Pros:</span>
                        <ul className="text-gray-600 ml-2">
                          {strategy.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-orange-600 font-medium">Cons:</span>
                        <ul className="text-gray-600 ml-2">
                          {strategy.cons.map((con, i) => (
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {optimizationFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.feature}</h4>
                      <p className="text-sm text-gray-600">{feature.implementation}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {feature.status === 'implemented' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <Badge variant={feature.status === 'implemented' ? 'default' : 'secondary'}>
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engine Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {engineComponents.map((component) => {
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
                    {component.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{feature}</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure Component
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Monitoring Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Workflow Engine Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {monitoringMetrics.map((metric, index) => (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{metric.metric}</h4>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                  <div className="flex items-center justify-center space-x-1">
                    {metric.status === 'excellent' ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : metric.status === 'good' ? (
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                    )}
                    <span className="text-xs text-gray-600">{metric.trend}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Analytics
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}