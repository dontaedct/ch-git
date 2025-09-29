'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Shield,
  Zap,
  Database,
  Globe,
  Activity,
  FileText,
  Settings,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

interface TestSuite {
  id: string;
  name: string;
  category: 'integration' | 'performance' | 'security' | 'functionality' | 'e2e';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  testsTotal: number;
  testsPassed: number;
  testsFailed: number;
  duration: number;
  coverage: number;
  lastRun: Date;
}

interface ValidationMetrics {
  overallHealth: number;
  testCoverage: number;
  performanceScore: number;
  securityScore: number;
  integrationHealth: number;
  codeQuality: number;
}

interface TestResult {
  id: string;
  suiteName: string;
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  duration: number;
  error?: string;
  details?: string;
}

export default function PlatformValidator() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: 'integration-tests',
      name: 'Platform Integration Tests',
      category: 'integration',
      status: 'passed',
      testsTotal: 45,
      testsPassed: 44,
      testsFailed: 1,
      duration: 2340,
      coverage: 96.8,
      lastRun: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: 'feature-validation',
      name: 'Feature Validation Tests',
      category: 'functionality',
      status: 'passed',
      testsTotal: 78,
      testsPassed: 76,
      testsFailed: 2,
      duration: 4120,
      coverage: 94.2,
      lastRun: new Date(Date.now() - 1800000) // 30 minutes ago
    },
    {
      id: 'performance-tests',
      name: 'Performance Testing Suite',
      category: 'performance',
      status: 'passed',
      testsTotal: 32,
      testsPassed: 31,
      testsFailed: 1,
      duration: 8750,
      coverage: 89.5,
      lastRun: new Date(Date.now() - 7200000) // 2 hours ago
    },
    {
      id: 'security-tests',
      name: 'Security Validation Tests',
      category: 'security',
      status: 'passed',
      testsTotal: 28,
      testsPassed: 28,
      testsFailed: 0,
      duration: 1890,
      coverage: 98.5,
      lastRun: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: 'e2e-tests',
      name: 'End-to-End Platform Tests',
      category: 'e2e',
      status: 'warning',
      testsTotal: 15,
      testsPassed: 14,
      testsFailed: 0,
      duration: 12500,
      coverage: 85.3,
      lastRun: new Date(Date.now() - 5400000) // 1.5 hours ago
    }
  ]);

  const [metrics, setMetrics] = useState<ValidationMetrics>({
    overallHealth: 95.2,
    testCoverage: 94.7,
    performanceScore: 92.1,
    securityScore: 98.5,
    integrationHealth: 96.8,
    codeQuality: 93.4
  });

  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [autoRun, setAutoRun] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const [recentResults, setRecentResults] = useState<TestResult[]>([
    {
      id: '1',
      suiteName: 'Integration Tests',
      testName: 'Module Bridge Communication',
      status: 'passed',
      duration: 45,
      details: 'Cross-module communication working correctly'
    },
    {
      id: '2',
      suiteName: 'Feature Validation',
      testName: 'AI App Generation Performance',
      status: 'passed',
      duration: 28500,
      details: 'Generated app in 28.5 seconds - within target'
    },
    {
      id: '3',
      suiteName: 'Performance Tests',
      testName: 'Form Rendering Performance',
      status: 'failed',
      duration: 120,
      error: 'Form rendering exceeded 100ms threshold',
      details: 'Complex form with 20 fields took 120ms to render'
    },
    {
      id: '4',
      suiteName: 'Security Tests',
      testName: 'Authentication Flow Security',
      status: 'passed',
      duration: 250,
      details: 'All security checks passed, MFA working correctly'
    },
    {
      id: '5',
      suiteName: 'E2E Tests',
      testName: 'Complete App Creation Workflow',
      status: 'warning',
      duration: 45000,
      details: 'Workflow completed but took longer than expected'
    }
  ]);

  const runTestSuite = async (suiteId: string) => {
    setIsRunning(true);
    setSelectedSuite(suiteId);

    // Simulate test execution
    const suite = testSuites.find(s => s.id === suiteId);
    if (suite) {
      // Update status to running
      setTestSuites(prev => prev.map(s =>
        s.id === suiteId ? { ...s, status: 'running' as const } : s
      ));

      // Simulate test duration
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update with results
      const passed = suite.testsTotal - Math.floor(Math.random() * 3);
      const failed = suite.testsTotal - passed;

      setTestSuites(prev => prev.map(s =>
        s.id === suiteId ? {
          ...s,
          status: failed === 0 ? 'passed' as const : failed < 3 ? 'warning' as const : 'failed' as const,
          testsPassed: passed,
          testsFailed: failed,
          lastRun: new Date(),
          duration: Math.random() * 5000 + 1000
        } : s
      ));

      // Update metrics
      const newCoverage = Math.random() * 5 + 92;
      setMetrics(prev => ({
        ...prev,
        testCoverage: newCoverage,
        overallHealth: (newCoverage + prev.performanceScore + prev.securityScore) / 3
      }));
    }

    setIsRunning(false);
    setSelectedSuite(null);
  };

  const runAllTests = async () => {
    setIsRunning(true);

    for (const suite of testSuites) {
      await runTestSuite(suite.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between suites
    }

    setIsRunning(false);
  };

  const getCategoryIcon = (category: TestSuite['category']) => {
    switch (category) {
      case 'integration': return Database;
      case 'performance': return Zap;
      case 'security': return Shield;
      case 'functionality': return Settings;
      case 'e2e': return Globe;
      default: return FileText;
    }
  };

  const getStatusIcon = (status: TestSuite['status']) => {
    switch (status) {
      case 'passed': return CheckCircle;
      case 'failed': return XCircle;
      case 'warning': return AlertTriangle;
      case 'running': return Activity;
      default: return Clock;
    }
  };

  const getStatusColor = (status: TestSuite['status']) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Platform Validator
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive testing suite and quality assurance dashboard
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-run">Auto Run</Label>
            <Switch
              id="auto-run"
              checked={autoRun}
              onCheckedChange={setAutoRun}
            />
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Activity className="w-4 h-4 mr-2" />
            Health: {metrics.overallHealth.toFixed(1)}%
          </Badge>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(metrics.overallHealth)}`}>
              {metrics.overallHealth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Platform health score
            </p>
            <Progress value={metrics.overallHealth} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(metrics.testCoverage)}`}>
              {metrics.testCoverage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Code coverage across platform
            </p>
            <Progress value={metrics.testCoverage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(metrics.securityScore)}`}>
              {metrics.securityScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Security validation score
            </p>
            <Progress value={metrics.securityScore} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Test Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Test Control Panel
          </CardTitle>
          <CardDescription>
            Run individual test suites or execute comprehensive platform validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run All Tests
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="suites" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Recent Results</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testSuites.map((suite) => {
              const IconComponent = getCategoryIcon(suite.category);
              const StatusIcon = getStatusIcon(suite.status);
              const isCurrentlyRunning = isRunning && selectedSuite === suite.id;

              return (
                <Card key={suite.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <IconComponent className="w-5 h-5" />
                        {suite.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-5 h-5 ${getStatusColor(suite.status)} ${isCurrentlyRunning ? 'animate-spin' : ''}`} />
                        <Badge variant="secondary" className="capitalize">
                          {suite.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Tests</div>
                        <div className="font-medium">{suite.testsTotal}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Coverage</div>
                        <div className="font-medium">{suite.coverage.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Passed</div>
                        <div className="font-medium text-green-600">{suite.testsPassed}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Failed</div>
                        <div className="font-medium text-red-600">{suite.testsFailed}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span className="font-medium">
                          {((suite.testsPassed / suite.testsTotal) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={(suite.testsPassed / suite.testsTotal) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Last run: {formatDuration(Date.now() - suite.lastRun.getTime())} ago</span>
                      <span>Duration: {formatDuration(suite.duration)}</span>
                    </div>

                    <Button
                      onClick={() => runTestSuite(suite.id)}
                      disabled={isRunning}
                      className="w-full"
                      variant="outline"
                    >
                      {isCurrentlyRunning ? (
                        <>
                          <Activity className="w-4 h-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Suite
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Test Results
              </CardTitle>
              <CardDescription>
                Latest test execution results and performance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentResults.map((result) => {
                  const StatusIcon = getStatusIcon(result.status);
                  return (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`w-5 h-5 ${getStatusColor(result.status)}`} />
                        <div>
                          <div className="font-medium">{result.testName}</div>
                          <div className="text-sm text-gray-600">{result.suiteName}</div>
                          {showDetails && result.details && (
                            <div className="text-sm text-gray-500 mt-1">{result.details}</div>
                          )}
                          {showDetails && result.error && (
                            <div className="text-sm text-red-600 mt-1">{result.error}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatDuration(result.duration)}</div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            result.status === 'passed' ? 'border-green-200 text-green-700' :
                            result.status === 'failed' ? 'border-red-200 text-red-700' :
                            'border-yellow-200 text-yellow-700'
                          }`}
                        >
                          {result.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Performance Score</span>
                    <span className="font-medium">{metrics.performanceScore.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.performanceScore} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span>Integration Health</span>
                    <span className="font-medium">{metrics.integrationHealth.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.integrationHealth} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span>Code Quality</span>
                    <span className="font-medium">{metrics.codeQuality.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.codeQuality} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Critical Issues</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">3</div>
                    <div className="text-sm text-gray-600">Warnings</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>OWASP Compliance</span>
                    <span className="font-medium text-green-600">100%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Data Privacy (GDPR)</span>
                    <span className="font-medium text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Access Control</span>
                    <span className="font-medium text-green-600">100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Test Reports & Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive testing reports and trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Test Execution Trends</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tests Run (24h)</span>
                      <span className="font-medium">847</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-medium text-green-600">96.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Duration</span>
                      <span className="font-medium">4.2s</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Quality Gates</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Code Coverage</span>
                      <span className="font-medium text-green-600">✓ Passed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Scan</span>
                      <span className="font-medium text-green-600">✓ Passed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance</span>
                      <span className="font-medium text-green-600">✓ Passed</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Recommendations</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Increase integration test coverage</div>
                    <div>• Optimize form rendering performance</div>
                    <div>• Add more edge case scenarios</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}