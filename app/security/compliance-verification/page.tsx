'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileSearch,
  Scale,
  Eye,
  Clock,
  Download,
  RefreshCw,
  AlertTriangle,
  Lock
} from 'lucide-react';

interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'pending';
  coverage: number;
  lastAudit: string;
  requirements: number;
  completed: number;
}

interface AuditFinding {
  id: string;
  framework: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'open' | 'resolved' | 'mitigated';
  remediation: string;
  dueDate: string;
  assignee: string;
}

interface ComplianceMetric {
  name: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export default function ComplianceVerificationPage() {
  const [auditProgress, setAuditProgress] = useState(0);
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([
    {
      id: 'gdpr',
      name: 'GDPR',
      version: '2018',
      status: 'compliant',
      coverage: 100,
      lastAudit: new Date().toISOString(),
      requirements: 47,
      completed: 47
    },
    {
      id: 'ccpa',
      name: 'CCPA',
      version: '2023',
      status: 'compliant',
      coverage: 98,
      lastAudit: new Date().toISOString(),
      requirements: 32,
      completed: 31
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      version: '2022',
      status: 'partial',
      coverage: 85,
      lastAudit: new Date(Date.now() - 86400000).toISOString(),
      requirements: 114,
      completed: 97
    },
    {
      id: 'sox',
      name: 'SOX',
      version: '2002',
      status: 'compliant',
      coverage: 100,
      lastAudit: new Date().toISOString(),
      requirements: 24,
      completed: 24
    }
  ]);

  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([
    {
      id: 'finding-001',
      framework: 'ISO 27001',
      severity: 'medium',
      title: 'Incomplete Access Review Documentation',
      description: 'Some access review documentation is missing for privileged accounts',
      status: 'open',
      remediation: 'Complete quarterly access review documentation for all privileged accounts',
      dueDate: '2025-09-30',
      assignee: 'Security Team'
    },
    {
      id: 'finding-002',
      framework: 'CCPA',
      severity: 'low',
      title: 'Privacy Policy Update Required',
      description: 'Privacy policy needs minor updates to reflect latest data processing activities',
      status: 'resolved',
      remediation: 'Updated privacy policy with current data processing information',
      dueDate: '2025-09-20',
      assignee: 'Legal Team'
    }
  ]);

  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([
    {
      name: 'Data Subject Rights Response Time',
      value: '< 72 hours',
      status: 'good',
      description: 'Average time to respond to data subject requests'
    },
    {
      name: 'Data Breach Notification',
      value: '< 72 hours',
      status: 'good',
      description: 'Time to notify authorities of data breaches'
    },
    {
      name: 'Privacy Impact Assessments',
      value: '100% completed',
      status: 'good',
      description: 'PIAs completed for all high-risk processing'
    },
    {
      name: 'Consent Management',
      value: '99.8% valid',
      status: 'good',
      description: 'Percentage of valid user consents'
    },
    {
      name: 'Data Retention Compliance',
      value: '98% compliant',
      status: 'good',
      description: 'Data retention policy compliance rate'
    },
    {
      name: 'Security Training Completion',
      value: '100% staff',
      status: 'good',
      description: 'Staff completion of mandatory security training'
    }
  ]);

  useEffect(() => {
    setAuditProgress(92);
  }, []);

  const runComplianceAudit = () => {
    setIsRunningAudit(true);
    setAuditProgress(0);

    const interval = setInterval(() => {
      setAuditProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunningAudit(false);
          return 100;
        }
        return prev + 8;
      });
    }, 400);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'non-compliant':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'non-compliant':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const overallCompliance = Math.round(
    frameworks.reduce((acc, fw) => acc + fw.coverage, 0) / frameworks.length
  );

  const openFindings = auditFindings.filter(f => f.status === 'open').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Scale className="h-8 w-8 text-blue-600" />
              Compliance Verification & Audit
            </h1>
            <p className="text-gray-600 mt-2">
              Regulatory compliance monitoring and audit management dashboard
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button
              onClick={runComplianceAudit}
              disabled={isRunningAudit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunningAudit ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Audit
                </>
              ) : (
                <>
                  <FileSearch className="h-4 w-4 mr-2" />
                  Run Compliance Audit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Overall Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overallCompliance}%</div>
              <p className="text-xs text-gray-500 mt-1">Across all frameworks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Frameworks Monitored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{frameworks.length}</div>
              <p className="text-xs text-gray-500 mt-1">Active compliance frameworks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Open Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{openFindings}</div>
              <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Last Full Audit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">Today</div>
              <p className="text-xs text-gray-500 mt-1">Comprehensive review</p>
            </CardContent>
          </Card>
        </div>

        {/* Audit Progress */}
        {isRunningAudit && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Compliance Audit in Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={auditProgress} className="w-full" />
              <p className="text-sm text-gray-500 mt-2">
                Auditing compliance frameworks and regulatory requirements... {auditProgress}% complete
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="frameworks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="frameworks">Compliance Frameworks</TabsTrigger>
            <TabsTrigger value="findings">Audit Findings</TabsTrigger>
            <TabsTrigger value="metrics">Compliance Metrics</TabsTrigger>
            <TabsTrigger value="verification">Verification Status</TabsTrigger>
          </TabsList>

          <TabsContent value="frameworks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Regulatory Compliance Frameworks
                </CardTitle>
                <CardDescription>
                  Status and coverage of monitored compliance frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frameworks.map((framework) => (
                    <div key={framework.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(framework.status)}
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {framework.name} ({framework.version})
                            </h3>
                            <p className="text-sm text-gray-500">
                              {framework.completed}/{framework.requirements} requirements completed
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(framework.status)}>
                          {framework.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Coverage</span>
                          <span>{framework.coverage}%</span>
                        </div>
                        <Progress value={framework.coverage} className="w-full" />
                      </div>
                      <p className="text-xs text-gray-400">
                        Last audit: {new Date(framework.lastAudit).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="findings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Audit Findings & Remediation
                </CardTitle>
                <CardDescription>
                  Issues identified during compliance audits and their resolution status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditFindings.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Active Findings
                    </h3>
                    <p className="text-gray-500">
                      All audit findings have been resolved or mitigated
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auditFindings.map((finding) => (
                      <div key={finding.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{finding.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getSeverityColor(finding.severity)}>
                              {finding.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className={
                              finding.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              finding.status === 'mitigated' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {finding.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">
                            <strong>Framework:</strong> {finding.framework}
                          </p>
                          <p className="text-gray-600">
                            <strong>Description:</strong> {finding.description}
                          </p>
                          <p className="text-gray-600">
                            <strong>Remediation:</strong> {finding.remediation}
                          </p>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Assignee: {finding.assignee}</span>
                            <span>Due: {new Date(finding.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Compliance Performance Metrics
                </CardTitle>
                <CardDescription>
                  Key performance indicators for regulatory compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {complianceMetrics.map((metric, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{metric.name}</h3>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className={`text-2xl font-bold mb-1 ${getMetricStatusColor(metric.status)}`}>
                        {metric.value}
                      </div>
                      <p className="text-sm text-gray-500">{metric.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Compliance Verification Status
                </CardTitle>
                <CardDescription>
                  Overall compliance verification and certification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                      <p className="text-sm text-gray-600">Regulatory Compliance</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                      <p className="text-sm text-gray-600">Audit Trail Coverage</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">24h</div>
                      <p className="text-sm text-gray-600">Avg. Response Time</p>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium text-green-800">Compliance Verification Complete</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Basic compliance verification and audit processes have been successfully completed.
                      All regulatory requirements are being met with appropriate monitoring and controls in place.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Data Protection Compliance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">GDPR</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">CCPA</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Data Subject Rights</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Security Compliance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Access Controls</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Audit Logging</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Incident Response</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}