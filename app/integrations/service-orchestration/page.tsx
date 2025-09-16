import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { ArrowLeft, Plus, Settings, Activity, Database, Globe, Shield, Zap, AlertTriangle, CheckCircle, Clock, RefreshCw, Play, Pause, Eye, Edit, Trash2, Search, Filter, GitBranch, Network, Server, Cpu, HardDrive, MemoryStick, Wifi, WifiOff, RotateCcw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function ServiceOrchestrationPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const orchestrationStats = {
    totalServices: 18,
    healthyServices: 15,
    degradedServices: 2,
    failedServices: 1,
    orchestrationUptime: 99.8,
    totalRequests: 12547,
    averageLatency: 145,
    throughput: 850
  };

  const registeredServices = [
    {
      id: 'svc_001',
      name: 'Payment Processing Service',
      type: 'Core Service',
      version: 'v2.1.4',
      status: 'healthy',
      health: 'healthy',
      endpoint: 'https://payments.internal.api/v2',
      instances: 3,
      activeInstances: 3,
      uptime: 99.9,
      lastHealthCheck: '30 seconds ago',
      responseTime: '89ms',
      requestRate: '245/min',
      errorRate: '0.1%',
      dependencies: ['Database Service', 'Cache Service'],
      loadBalancer: 'round_robin',
      failoverStrategy: 'automatic'
    },
    {
      id: 'svc_002',
      name: 'Email Delivery Service',
      type: 'Communication',
      version: 'v1.8.2',
      status: 'healthy',
      health: 'healthy',
      endpoint: 'https://email.internal.api/v1',
      instances: 2,
      activeInstances: 2,
      uptime: 98.7,
      lastHealthCheck: '45 seconds ago',
      responseTime: '156ms',
      requestRate: '89/min',
      errorRate: '0.3%',
      dependencies: ['External SMTP'],
      loadBalancer: 'least_connections',
      failoverStrategy: 'manual'
    },
    {
      id: 'svc_003',
      name: 'User Authentication Service',
      type: 'Security',
      version: 'v3.0.1',
      status: 'degraded',
      health: 'warning',
      endpoint: 'https://auth.internal.api/v3',
      instances: 4,
      activeInstances: 3,
      uptime: 97.2,
      lastHealthCheck: '1 minute ago',
      responseTime: '234ms',
      requestRate: '567/min',
      errorRate: '2.1%',
      dependencies: ['Database Service', 'Redis Cache'],
      loadBalancer: 'weighted_round_robin',
      failoverStrategy: 'automatic'
    },
    {
      id: 'svc_004',
      name: 'File Storage Service',
      type: 'Storage',
      version: 'v1.5.3',
      status: 'failed',
      health: 'critical',
      endpoint: 'https://storage.internal.api/v1',
      instances: 2,
      activeInstances: 0,
      uptime: 45.8,
      lastHealthCheck: '5 minutes ago',
      responseTime: 'timeout',
      requestRate: '0/min',
      errorRate: '100%',
      dependencies: ['AWS S3', 'CDN Service'],
      loadBalancer: 'round_robin',
      failoverStrategy: 'circuit_breaker'
    },
    {
      id: 'svc_005',
      name: 'Analytics Processing Service',
      type: 'Data Processing',
      version: 'v2.3.1',
      status: 'healthy',
      health: 'healthy',
      endpoint: 'https://analytics.internal.api/v2',
      instances: 3,
      activeInstances: 3,
      uptime: 99.5,
      lastHealthCheck: '20 seconds ago',
      responseTime: '67ms',
      requestRate: '178/min',
      errorRate: '0.2%',
      dependencies: ['Data Warehouse', 'Queue Service'],
      loadBalancer: 'ip_hash',
      failoverStrategy: 'automatic'
    }
  ];

  const discoveryMechanisms = [
    {
      mechanism: 'DNS-based Discovery',
      description: 'Service registration via DNS records',
      status: 'active',
      services: 12,
      avgResolutionTime: '15ms',
      cacheHitRate: '94%',
      pros: ['Standard protocol', 'Built-in caching', 'Wide support'],
      cons: ['Limited metadata', 'TTL issues', 'No health checks']
    },
    {
      mechanism: 'Service Registry',
      description: 'Centralized service registration and discovery',
      status: 'active',
      services: 18,
      avgResolutionTime: '8ms',
      cacheHitRate: '98%',
      pros: ['Rich metadata', 'Health checking', 'Real-time updates'],
      cons: ['Single point of failure', 'Additional complexity']
    },
    {
      mechanism: 'API Gateway Discovery',
      description: 'Gateway-based service routing and discovery',
      status: 'active',
      services: 15,
      avgResolutionTime: '12ms',
      cacheHitRate: '96%',
      pros: ['Unified entry point', 'Policy enforcement', 'Rate limiting'],
      cons: ['Potential bottleneck', 'Latency overhead']
    },
    {
      mechanism: 'Kubernetes Service Discovery',
      description: 'Container orchestration-based discovery',
      status: 'planned',
      services: 0,
      avgResolutionTime: 'N/A',
      cacheHitRate: 'N/A',
      pros: ['Native integration', 'Auto-scaling', 'Health checks'],
      cons: ['Platform dependency', 'Learning curve']
    }
  ];

  const healthMonitoring = [
    {
      check: 'HTTP Health Endpoint',
      description: 'Standard HTTP health check endpoint',
      interval: '30 seconds',
      timeout: '5 seconds',
      services: 15,
      successRate: '99.2%',
      enabled: true
    },
    {
      check: 'TCP Port Check',
      description: 'Basic TCP connectivity verification',
      interval: '15 seconds',
      timeout: '3 seconds',
      services: 18,
      successRate: '99.8%',
      enabled: true
    },
    {
      check: 'Deep Health Check',
      description: 'Comprehensive application health verification',
      interval: '2 minutes',
      timeout: '10 seconds',
      services: 12,
      successRate: '97.5%',
      enabled: true
    },
    {
      check: 'Dependency Health Check',
      description: 'Verify health of service dependencies',
      interval: '1 minute',
      timeout: '8 seconds',
      services: 10,
      successRate: '96.8%',
      enabled: true
    }
  ];

  const failoverStrategies = [
    {
      strategy: 'Automatic Failover',
      description: 'Immediate failover to healthy instances',
      triggerCondition: 'Health check failure > 3 consecutive',
      recoveryTime: '< 30 seconds',
      services: 12,
      implementation: 'Circuit breaker pattern with automatic recovery'
    },
    {
      strategy: 'Manual Failover',
      description: 'Human-triggered failover process',
      triggerCondition: 'Manual intervention required',
      recoveryTime: '2-5 minutes',
      services: 4,
      implementation: 'Administrative controls with approval workflow'
    },
    {
      strategy: 'Circuit Breaker',
      description: 'Prevent cascading failures',
      triggerCondition: 'Error rate > 50% for 1 minute',
      recoveryTime: '5-10 minutes',
      services: 8,
      implementation: 'Half-open state testing with gradual recovery'
    },
    {
      strategy: 'Graceful Degradation',
      description: 'Reduced functionality during failures',
      triggerCondition: 'Partial service availability',
      recoveryTime: 'Variable',
      services: 6,
      implementation: 'Feature flags with capability detection'
    }
  ];

  const loadBalancingAlgorithms = [
    {
      algorithm: 'Round Robin',
      description: 'Distribute requests evenly across instances',
      services: 8,
      avgLatency: '145ms',
      throughput: '450 req/min',
      efficiency: '92%'
    },
    {
      algorithm: 'Least Connections',
      description: 'Route to instance with fewest active connections',
      services: 4,
      avgLatency: '125ms',
      throughput: '380 req/min',
      efficiency: '94%'
    },
    {
      algorithm: 'Weighted Round Robin',
      description: 'Round robin with instance capacity weighting',
      services: 3,
      avgLatency: '138ms',
      throughput: '520 req/min',
      efficiency: '96%'
    },
    {
      algorithm: 'IP Hash',
      description: 'Consistent routing based on client IP',
      services: 3,
      avgLatency: '156ms',
      throughput: '340 req/min',
      efficiency: '89%'
    }
  ];

  const orchestrationMetrics = [
    {
      metric: 'Service Availability',
      value: '98.3%',
      change: '+0.5%',
      trend: 'up',
      status: 'good'
    },
    {
      metric: 'Discovery Latency',
      value: '12ms',
      change: '-3ms',
      trend: 'down',
      status: 'excellent'
    },
    {
      metric: 'Failover Time',
      value: '28s',
      change: '-5s',
      trend: 'down',
      status: 'good'
    },
    {
      metric: 'Health Check Success',
      value: '99.1%',
      change: '+0.2%',
      trend: 'up',
      status: 'excellent'
    },
    {
      metric: 'Load Distribution',
      value: '94%',
      change: '+1%',
      trend: 'up',
      status: 'good'
    },
    {
      metric: 'Circuit Breaker Trips',
      value: '3',
      change: '-2',
      trend: 'down',
      status: 'good'
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
              Register Service
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Orchestration & Management</h1>
          <p className="text-gray-600">
            Manage service discovery, health monitoring, load balancing, and failover mechanisms
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orchestrationStats.totalServices}</div>
              <p className="text-xs text-muted-foreground">
                {orchestrationStats.healthyServices} healthy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orchestrationStats.orchestrationUptime}%</div>
              <p className="text-xs text-muted-foreground">
                System availability
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orchestrationStats.throughput}/min</div>
              <p className="text-xs text-muted-foreground">
                Request processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orchestrationStats.averageLatency}ms</div>
              <p className="text-xs text-muted-foreground">
                Response time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Service Registry */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Registered Services
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
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registeredServices.map((service) => (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <Server className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.type} • {service.version}</p>
                        </div>
                        <Badge variant={service.status === 'healthy' ? 'default' : service.status === 'degraded' ? 'secondary' : 'destructive'}>
                          {service.status}
                        </Badge>
                        {service.health === 'healthy' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : service.health === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-mono mb-2">{service.endpoint}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        {service.status === 'failed' ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <Pause className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{service.activeInstances}/{service.instances}</div>
                      <div className="text-xs text-gray-600">Instances</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{service.uptime}%</div>
                      <div className="text-xs text-gray-600">Uptime</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{service.responseTime}</div>
                      <div className="text-xs text-gray-600">Response Time</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{service.requestRate}</div>
                      <div className="text-xs text-gray-600">Request Rate</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{service.errorRate}</div>
                      <div className="text-xs text-gray-600">Error Rate</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{service.loadBalancer}</div>
                      <div className="text-xs text-gray-600">Load Balancer</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Dependencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.dependencies.map((dep, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>Failover: {service.failoverStrategy}</span>
                      <span>Last check: {service.lastHealthCheck}</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      Health Check
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Discovery Mechanisms & Health Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Service Discovery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="mr-2 h-5 w-5" />
                Service Discovery Mechanisms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {discoveryMechanisms.map((mechanism, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{mechanism.mechanism}</h4>
                      <Badge variant={mechanism.status === 'active' ? 'default' : 'secondary'}>
                        {mechanism.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{mechanism.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{mechanism.services}</div>
                        <div className="text-gray-600">Services</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{mechanism.avgResolutionTime}</div>
                        <div className="text-gray-600">Resolution</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{mechanism.cacheHitRate}</div>
                        <div className="text-gray-600">Cache Hit</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-green-600 font-medium">Pros:</span>
                        <ul className="text-gray-600 ml-2">
                          {mechanism.pros.slice(0, 2).map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-orange-600 font-medium">Cons:</span>
                        <ul className="text-gray-600 ml-2">
                          {mechanism.cons.slice(0, 2).map((con, i) => (
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

          {/* Health Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Health Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthMonitoring.map((check, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{check.check}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={check.enabled ? 'default' : 'secondary'}>
                          {check.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${check.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{check.description}</p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium">{check.services}</div>
                        <div className="text-gray-600">Services</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium">{check.interval}</div>
                        <div className="text-gray-600">Interval</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium">{check.timeout}</div>
                        <div className="text-gray-600">Timeout</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium">{check.successRate}</div>
                        <div className="text-gray-600">Success</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Failover Strategies & Load Balancing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Failover Strategies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Failover Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {failoverStrategies.map((strategy, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{strategy.strategy}</h4>
                      <Badge variant="outline">{strategy.services} services</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                    <div className="space-y-2 text-xs">
                      <div><strong>Trigger:</strong> {strategy.triggerCondition}</div>
                      <div><strong>Recovery Time:</strong> {strategy.recoveryTime}</div>
                      <div><strong>Implementation:</strong> {strategy.implementation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Load Balancing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="mr-2 h-5 w-5" />
                Load Balancing Algorithms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadBalancingAlgorithms.map((algo, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{algo.algorithm}</h4>
                      <Badge variant="outline">{algo.services} services</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{algo.description}</p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium">{algo.avgLatency}</div>
                        <div className="text-gray-600">Avg Latency</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium">{algo.throughput}</div>
                        <div className="text-gray-600">Throughput</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium">{algo.efficiency}</div>
                        <div className="text-gray-600">Efficiency</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium text-blue-600">Active</div>
                        <div className="text-gray-600">Status</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orchestration Metrics & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orchestration Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Orchestration Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {orchestrationMetrics.map((metric, index) => (
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
            </CardContent>
          </Card>

          {/* System Health Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5" />
                System Health Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{orchestrationStats.healthyServices}</div>
                    <div className="text-sm text-gray-600">Healthy Services</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{orchestrationStats.degradedServices}</div>
                    <div className="text-sm text-gray-600">Degraded Services</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Service Discovery</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Health Monitoring</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Load Balancing</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failover Mechanisms</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Circuit Breakers</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh System Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}