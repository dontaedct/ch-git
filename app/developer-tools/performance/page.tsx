'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ZapIcon,
  ShieldIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  PlayIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CpuIcon,
  MonitorIcon,
  ActivityIcon,
  LockIcon,
  UnlockIcon,
  BugIcon,
  EyeIcon
} from 'lucide-react';

interface PerformanceMetrics {
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    lastRun: string;
  };
  webVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte
  };
  bundleAnalysis: {
    totalSize: number;
    jsSize: number;
    cssSize: number;
    imageSize: number;
    chunkCount: number;
  };
}

interface SecurityMetrics {
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  securityHeaders: {
    csp: boolean;
    hsts: boolean;
    xFrame: boolean;
    xContent: boolean;
    referrer: boolean;
  };
  authentication: {
    bruteForce: boolean;
    sessionSecurity: boolean;
    passwordPolicies: boolean;
    mfaEnabled: boolean;
  };
  lastScan: string;
}

interface SecurityGate {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  lastCheck: string;
}

export default function PerformanceSecurityPage() {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    lighthouse: {
      performance: 85,
      accessibility: 92,
      bestPractices: 88,
      seo: 94,
      lastRun: '10 minutes ago'
    },
    webVitals: {
      lcp: 2.1,
      fid: 45,
      cls: 0.08,
      fcp: 1.2,
      ttfb: 650
    },
    bundleAnalysis: {
      totalSize: 2.4,
      jsSize: 1.8,
      cssSize: 0.3,
      imageSize: 0.3,
      chunkCount: 12
    }
  });

  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    vulnerabilities: {
      critical: 0,
      high: 0,
      medium: 2,
      low: 5,
      total: 7
    },
    securityHeaders: {
      csp: true,
      hsts: true,
      xFrame: true,
      xContent: true,
      referrer: false
    },
    authentication: {
      bruteForce: true,
      sessionSecurity: true,
      passwordPolicies: true,
      mfaEnabled: false
    },
    lastScan: '2 hours ago'
  });

  const [securityGates, setSecurityGates] = useState<SecurityGate[]>([
    {
      name: 'No Critical Vulnerabilities',
      status: 'passed',
      description: 'Zero critical security vulnerabilities detected',
      severity: 'critical',
      lastCheck: '2 hours ago'
    },
    {
      name: 'Security Headers',
      status: 'warning',
      description: 'Most security headers implemented, referrer policy missing',
      severity: 'medium',
      lastCheck: '2 hours ago'
    },
    {
      name: 'Authentication Security',
      status: 'warning',
      description: 'MFA not enabled for all admin accounts',
      severity: 'high',
      lastCheck: '2 hours ago'
    },
    {
      name: 'Input Validation',
      status: 'passed',
      description: 'All user inputs properly validated and sanitized',
      severity: 'high',
      lastCheck: '2 hours ago'
    },
    {
      name: 'API Security',
      status: 'passed',
      description: 'API endpoints properly secured with authentication',
      severity: 'critical',
      lastCheck: '2 hours ago'
    }
  ]);

  const [isRunning, setIsRunning] = useState({
    performance: false,
    security: false,
    vulnerability: false
  });

  const getPerformanceScore = () => {
    const { lighthouse } = performanceMetrics;
    return Math.round((lighthouse.performance + lighthouse.accessibility + lighthouse.bestPractices + lighthouse.seo) / 4);
  };

  const getWebVitalStatus = (metric: string, value: number) => {
    const thresholds = {
      lcp: { good: 2.5, poor: 4.0 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1.8, poor: 3.0 },
      ttfb: { good: 600, poor: 1500 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusIcon = (status: 'passed' | 'failed' | 'warning') => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSeverityBadge = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;

    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge variant={variants[severity]} className={colors[severity]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getWebVitalColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const runPerformanceTest = () => {
    setIsRunning(prev => ({ ...prev, performance: true }));

    setTimeout(() => {
      setPerformanceMetrics(prev => ({
        ...prev,
        lighthouse: {
          ...prev.lighthouse,
          performance: Math.max(70, Math.min(100, prev.lighthouse.performance + Math.floor(Math.random() * 10 - 5))),
          lastRun: 'Just now'
        }
      }));
      setIsRunning(prev => ({ ...prev, performance: false }));
    }, 8000);
  };

  const runSecurityScan = () => {
    setIsRunning(prev => ({ ...prev, security: true }));

    setTimeout(() => {
      setSecurityMetrics(prev => ({
        ...prev,
        vulnerabilities: {
          ...prev.vulnerabilities,
          medium: Math.max(0, prev.vulnerabilities.medium - 1),
          total: Math.max(5, prev.vulnerabilities.total - 1)
        },
        lastScan: 'Just now'
      }));
      setIsRunning(prev => ({ ...prev, security: false }));
    }, 12000);
  };

  const runVulnerabilityScan = () => {
    setIsRunning(prev => ({ ...prev, vulnerability: true }));

    setTimeout(() => {
      setSecurityMetrics(prev => ({
        ...prev,
        vulnerabilities: {
          ...prev.vulnerabilities,
          low: Math.max(0, prev.vulnerabilities.low - 2),
          total: Math.max(3, prev.vulnerabilities.total - 2)
        },
        lastScan: 'Just now'
      }));
      setIsRunning(prev => ({ ...prev, vulnerability: false }));
    }, 15000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance & Security Testing</h1>
          <p className="text-muted-foreground">
            Automated performance monitoring and security vulnerability scanning
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runVulnerabilityScan}
            disabled={isRunning.vulnerability}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isRunning.vulnerability ? (
              <RefreshCwIcon className="h-4 w-4 animate-spin" />
            ) : (
              <BugIcon className="h-4 w-4" />
            )}
            Vulnerability Scan
          </Button>
          <Button
            onClick={runSecurityScan}
            disabled={isRunning.security}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isRunning.security ? (
              <RefreshCwIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldIcon className="h-4 w-4" />
            )}
            Security Scan
          </Button>
          <Button
            onClick={runPerformanceTest}
            disabled={isRunning.performance}
            className="flex items-center gap-2"
          >
            {isRunning.performance ? (
              <RefreshCwIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ZapIcon className="h-4 w-4" />
            )}
            Performance Test
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getPerformanceScore()}</div>
            <Progress value={getPerformanceScore()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Lighthouse average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityMetrics.vulnerabilities.critical + securityMetrics.vulnerabilities.high === 0 ? (
                <span className="text-green-600">✓ Secure</span>
              ) : (
                <span className="text-red-600">⚠ Issues</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{securityMetrics.vulnerabilities.total} total findings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bundle Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.bundleAnalysis.totalSize}MB</div>
            <p className="text-xs text-muted-foreground">
              JS: {performanceMetrics.bundleAnalysis.jsSize}MB, CSS: {performanceMetrics.bundleAnalysis.cssSize}MB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Core Web Vitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className={`font-semibold ${getWebVitalColor(getWebVitalStatus('lcp', performanceMetrics.webVitals.lcp))}`}>
                LCP: {performanceMetrics.webVitals.lcp}s
              </div>
              <div className={`font-semibold ${getWebVitalColor(getWebVitalStatus('cls', performanceMetrics.webVitals.cls))}`}>
                CLS: {performanceMetrics.webVitals.cls}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ZapIcon className="h-5 w-5" />
                  Lighthouse Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Performance</span>
                      <span className="font-semibold">{performanceMetrics.lighthouse.performance}</span>
                    </div>
                    <Progress value={performanceMetrics.lighthouse.performance} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Accessibility</span>
                      <span className="font-semibold">{performanceMetrics.lighthouse.accessibility}</span>
                    </div>
                    <Progress value={performanceMetrics.lighthouse.accessibility} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Best Practices</span>
                      <span className="font-semibold">{performanceMetrics.lighthouse.bestPractices}</span>
                    </div>
                    <Progress value={performanceMetrics.lighthouse.bestPractices} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>SEO</span>
                      <span className="font-semibold">{performanceMetrics.lighthouse.seo}</span>
                    </div>
                    <Progress value={performanceMetrics.lighthouse.seo} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5" />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Largest Contentful Paint (LCP)</p>
                      <p className="text-xs text-muted-foreground">Loading performance</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getWebVitalColor(getWebVitalStatus('lcp', performanceMetrics.webVitals.lcp))}`}>
                        {performanceMetrics.webVitals.lcp}s
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">First Input Delay (FID)</p>
                      <p className="text-xs text-muted-foreground">Interactivity</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getWebVitalColor(getWebVitalStatus('fid', performanceMetrics.webVitals.fid))}`}>
                        {performanceMetrics.webVitals.fid}ms
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Cumulative Layout Shift (CLS)</p>
                      <p className="text-xs text-muted-foreground">Visual stability</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getWebVitalColor(getWebVitalStatus('cls', performanceMetrics.webVitals.cls))}`}>
                        {performanceMetrics.webVitals.cls}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">First Contentful Paint (FCP)</p>
                      <p className="text-xs text-muted-foreground">Loading speed</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getWebVitalColor(getWebVitalStatus('fcp', performanceMetrics.webVitals.fcp))}`}>
                        {performanceMetrics.webVitals.fcp}s
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldIcon className="h-5 w-5" />
                  Security Gates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityGates.map((gate, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(gate.status)}
                        <div>
                          <div className="font-medium">{gate.name}</div>
                          <p className="text-sm text-muted-foreground">{gate.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getSeverityBadge(gate.severity)}
                        <p className="text-xs text-muted-foreground mt-1">{gate.lastCheck}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LockIcon className="h-5 w-5" />
                  Security Headers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Content Security Policy</span>
                    {securityMetrics.securityHeaders.csp ? (
                      <Badge variant="default">Enabled</Badge>
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>HTTP Strict Transport Security</span>
                    {securityMetrics.securityHeaders.hsts ? (
                      <Badge variant="default">Enabled</Badge>
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>X-Frame-Options</span>
                    {securityMetrics.securityHeaders.xFrame ? (
                      <Badge variant="default">Enabled</Badge>
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>X-Content-Type-Options</span>
                    {securityMetrics.securityHeaders.xContent ? (
                      <Badge variant="default">Enabled</Badge>
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Referrer-Policy</span>
                    {securityMetrics.securityHeaders.referrer ? (
                      <Badge variant="default">Enabled</Badge>
                    ) : (
                      <Badge variant="secondary">Missing</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BugIcon className="h-5 w-5" />
                Vulnerability Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {securityMetrics.vulnerabilities.critical}
                  </div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {securityMetrics.vulnerabilities.high}
                  </div>
                  <p className="text-sm text-muted-foreground">High</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {securityMetrics.vulnerabilities.medium}
                  </div>
                  <p className="text-sm text-muted-foreground">Medium</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {securityMetrics.vulnerabilities.low}
                  </div>
                  <p className="text-sm text-muted-foreground">Low</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 border border-yellow-200 bg-yellow-50 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Outdated Dependencies</p>
                      <p className="text-sm text-muted-foreground">2 packages have known vulnerabilities</p>
                    </div>
                    {getSeverityBadge('medium')}
                  </div>
                </div>
                <div className="p-3 border border-blue-200 bg-blue-50 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Information Disclosure</p>
                      <p className="text-sm text-muted-foreground">Server version headers exposed</p>
                    </div>
                    {getSeverityBadge('low')}
                  </div>
                </div>
                <div className="p-3 border border-blue-200 bg-blue-50 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Missing Rate Limiting</p>
                      <p className="text-sm text-muted-foreground">Some API endpoints lack rate limiting</p>
                    </div>
                    {getSeverityBadge('low')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MonitorIcon className="h-5 w-5" />
                  Performance Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Real User Monitoring</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Synthetic Testing</span>
                    <Badge variant="default">Hourly</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Bundle Analysis</span>
                    <Badge variant="secondary">Weekly</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Core Web Vitals Tracking</span>
                    <Badge variant="default">Real-time</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EyeIcon className="h-5 w-5" />
                  Security Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Vulnerability Scanning</span>
                    <Badge variant="default">Daily</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Dependency Monitoring</span>
                    <Badge variant="default">Continuous</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Headers Check</span>
                    <Badge variant="secondary">Weekly</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Authentication Monitoring</span>
                    <Badge variant="default">Real-time</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CpuIcon className="h-5 w-5" />
                Automated Testing & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Performance Automation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Lighthouse CI</span>
                      <Badge variant="default">On PR</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Bundle size checks</span>
                      <Badge variant="default">On build</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance regression</span>
                      <Badge variant="secondary">Weekly</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Web Vitals alerts</span>
                      <Badge variant="default">Real-time</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Security Automation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Vulnerability scans</span>
                      <Badge variant="default">Daily</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Dependency updates</span>
                      <Badge variant="secondary">Auto PR</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Security gates</span>
                      <Badge variant="default">On deploy</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Incident response</span>
                      <Badge variant="default">Automated</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-700">
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  Last scan: {securityMetrics.lastScan} • Next scheduled: in 4 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}