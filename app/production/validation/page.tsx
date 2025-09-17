'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  RefreshCw,
  Shield,
  Database,
  Server,
  Globe,
  Zap,
  FileCheck
} from 'lucide-react';

interface ValidationCheck {
  id: string;
  name: string;
  category: 'infrastructure' | 'application' | 'security' | 'performance' | 'data';
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  duration?: number;
  lastRun?: string;
  details?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  automated: boolean;
}

interface DeploymentValidation {
  id: string;
  name: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  status: 'pending' | 'validating' | 'ready' | 'failed';
  startTime?: string;
  endTime?: string;
  overallScore: number;
  checks: ValidationCheck[];
}

const ProductionValidationPage: React.FC = () => {
  const [activeValidation, setActiveValidation] = useState<string>('current-deployment');
  const [runningValidation, setRunningValidation] = useState<boolean>(false);
  const [validationProgress, setValidationProgress] = useState<number>(0);

  const validationSuites: DeploymentValidation[] = [
    {
      id: 'current-deployment',
      name: 'Current Production Deployment',
      environment: 'production',
      version: 'v2.1.4',
      status: 'ready',
      startTime: '2025-09-16T10:30:00Z',
      endTime: '2025-09-16T10:45:00Z',
      overallScore: 94,
      checks: [
        {
          id: 'infra-health',
          name: 'Infrastructure Health Check',
          category: 'infrastructure',
          description: 'Verify all infrastructure components are healthy',
          status: 'passed',
          duration: 120,
          lastRun: '2025-09-16T10:30:00Z',
          details: 'All 12 nodes healthy, load balancer operational',
          severity: 'critical',
          automated: true
        },
        {
          id: 'app-startup',
          name: 'Application Startup Validation',
          category: 'application',
          description: 'Verify application starts correctly and all services are available',
          status: 'passed',
          duration: 90,
          lastRun: '2025-09-16T10:31:30Z',
          details: 'All 8 microservices started successfully',
          severity: 'critical',
          automated: true
        },
        {
          id: 'database-connectivity',
          name: 'Database Connectivity',
          category: 'data',
          description: 'Test database connections and query performance',
          status: 'passed',
          duration: 45,
          lastRun: '2025-09-16T10:32:15Z',
          details: 'Primary and replica databases responding < 50ms',
          severity: 'critical',
          automated: true
        },
        {
          id: 'security-scan',
          name: 'Security Vulnerability Scan',
          category: 'security',
          description: 'Scan for known security vulnerabilities',
          status: 'passed',
          duration: 180,
          lastRun: '2025-09-16T10:33:00Z',
          details: 'No critical or high vulnerabilities found',
          severity: 'high',
          automated: true
        },
        {
          id: 'performance-baseline',
          name: 'Performance Baseline Test',
          category: 'performance',
          description: 'Verify performance meets baseline requirements',
          status: 'warning',
          duration: 240,
          lastRun: '2025-09-16T10:35:00Z',
          details: 'Response time slightly elevated (520ms vs 500ms target)',
          severity: 'medium',
          automated: true
        },
        {
          id: 'api-endpoints',
          name: 'API Endpoint Validation',
          category: 'application',
          description: 'Test all critical API endpoints',
          status: 'passed',
          duration: 60,
          lastRun: '2025-09-16T10:36:00Z',
          details: 'All 24 critical endpoints responding correctly',
          severity: 'high',
          automated: true
        },
        {
          id: 'ssl-certificates',
          name: 'SSL Certificate Validation',
          category: 'security',
          description: 'Verify SSL certificates are valid and not expiring soon',
          status: 'passed',
          duration: 30,
          lastRun: '2025-09-16T10:36:30Z',
          details: 'All certificates valid, earliest expiry in 45 days',
          severity: 'medium',
          automated: true
        },
        {
          id: 'monitoring-alerts',
          name: 'Monitoring & Alerting Check',
          category: 'infrastructure',
          description: 'Verify monitoring systems and alerts are functional',
          status: 'passed',
          duration: 75,
          lastRun: '2025-09-16T10:37:45Z',
          details: 'All monitoring systems operational, test alerts sent',
          severity: 'high',
          automated: true
        }
      ]
    },
    {
      id: 'staging-validation',
      name: 'Staging Environment Validation',
      environment: 'staging',
      version: 'v2.2.0-rc1',
      status: 'validating',
      startTime: '2025-09-16T11:00:00Z',
      overallScore: 87,
      checks: [
        {
          id: 'staging-infra',
          name: 'Staging Infrastructure',
          category: 'infrastructure',
          description: 'Validate staging environment infrastructure',
          status: 'passed',
          duration: 90,
          severity: 'critical',
          automated: true
        },
        {
          id: 'staging-app',
          name: 'Application Deployment',
          category: 'application',
          description: 'Verify new version deploys correctly',
          status: 'running',
          severity: 'critical',
          automated: true
        },
        {
          id: 'staging-data',
          name: 'Data Migration Test',
          category: 'data',
          description: 'Test database migration scripts',
          status: 'pending',
          severity: 'high',
          automated: true
        }
      ]
    }
  ];

  const currentValidation = validationSuites.find(v => v.id === activeValidation);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'infrastructure': return <Server className="h-4 w-4" />;
      case 'application': return <Globe className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const runValidation = async () => {
    setRunningValidation(true);
    setValidationProgress(0);

    // Simulate validation progress
    const interval = setInterval(() => {
      setValidationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunningValidation(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const passedChecks = currentValidation?.checks.filter(c => c.status === 'passed').length || 0;
  const totalChecks = currentValidation?.checks.length || 0;
  const failedChecks = currentValidation?.checks.filter(c => c.status === 'failed').length || 0;
  const warningChecks = currentValidation?.checks.filter(c => c.status === 'warning').length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deployment Validation & Production Readiness</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive validation and testing for production deployments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={runValidation}
            disabled={runningValidation}
            className="flex items-center gap-2"
          >
            {runningValidation ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {runningValidation ? 'Running...' : 'Run Validation'}
          </Button>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Production Ready
          </Badge>
        </div>
      </div>

      {/* Validation Progress */}
      {runningValidation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Validation in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={validationProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Running validation checks... {validationProgress}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {/* Validation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{passedChecks}</p>
                <p className="text-sm text-muted-foreground">Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{warningChecks}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{failedChecks}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileCheck className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{currentValidation?.overallScore}%</p>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Suites */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Validation Suites</h2>
          {validationSuites.map((suite) => (
            <Card
              key={suite.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeValidation === suite.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setActiveValidation(suite.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{suite.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={getStatusColor(suite.status)}
                  >
                    {suite.status}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {suite.environment} • {suite.version}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{suite.checks.length} checks</span>
                  <span>{suite.overallScore}% score</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Validation Details */}
        <div className="lg:col-span-3">
          {currentValidation && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{currentValidation.name}</CardTitle>
                    <CardDescription>
                      {currentValidation.environment} • {currentValidation.version}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(currentValidation.status)}
                  >
                    {currentValidation.status}
                  </Badge>
                </div>
                {currentValidation.startTime && (
                  <div className="text-sm text-muted-foreground">
                    Started: {new Date(currentValidation.startTime).toLocaleString()}
                    {currentValidation.endTime && (
                      <span> • Completed: {new Date(currentValidation.endTime).toLocaleString()}</span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="checks" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="checks">Validation Checks</TabsTrigger>
                    <TabsTrigger value="summary">Summary Report</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                  </TabsList>

                  <TabsContent value="checks" className="space-y-4">
                    <div className="space-y-3">
                      {currentValidation.checks.map((check) => (
                        <div key={check.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(check.status)}
                              {getCategoryIcon(check.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{check.name}</h4>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getSeverityColor(check.severity)} text-white border-0`}
                                >
                                  {check.severity}
                                </Badge>
                                {check.automated && (
                                  <Badge variant="outline" className="text-xs">
                                    Automated
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {check.description}
                              </p>
                              {check.details && (
                                <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                  {check.details}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                {check.duration && <span>Duration: {check.duration}s</span>}
                                {check.lastRun && (
                                  <span>
                                    Last run: {new Date(check.lastRun).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Validation Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Overall Score:</span>
                              <span className="font-semibold">{currentValidation.overallScore}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Checks:</span>
                              <span>{totalChecks}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Passed:</span>
                              <span className="text-green-600">{passedChecks}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Warnings:</span>
                              <span className="text-yellow-600">{warningChecks}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Failed:</span>
                              <span className="text-red-600">{failedChecks}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Production Readiness</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Infrastructure Health: Passed</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Security Scan: Passed</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">Performance: Warning</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Data Integrity: Passed</span>
                            </div>

                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium text-green-800">
                                ✅ Ready for Production Deployment
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                Minor performance warning can be addressed post-deployment
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="config" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Validation Configuration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Critical Checks (Must Pass)</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li>• Infrastructure Health Check</li>
                              <li>• Application Startup Validation</li>
                              <li>• Database Connectivity</li>
                              <li>• Security Vulnerability Scan</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Performance Thresholds</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li>• API Response Time: &lt; 500ms</li>
                              <li>• Database Query Time: &lt; 100ms</li>
                              <li>• Page Load Time: &lt; 2s</li>
                              <li>• Resource Utilization: &lt; 80%</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Rollback Triggers</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li>• Any critical check failure</li>
                              <li>• Error rate &gt; 1%</li>
                              <li>• Performance degradation &gt; 50%</li>
                              <li>• Security vulnerability detected</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionValidationPage;