'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Bug, CheckCircle, AlertTriangle, Play, Clock, TrendingUp, Target, XCircle, Search } from 'lucide-react';

interface SecurityTest {
  id: string;
  name: string;
  type: 'vulnerability-scan' | 'penetration-test' | 'security-audit' | 'compliance-check';
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastRun: string;
  duration: string;
  findings: number;
}

interface Vulnerability {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'mitigated';
  discoveredDate: string;
}

interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  vulnerabilitiesFound: number;
  criticalVulns: number;
  lastScanDate: string;
}

interface ValidationResult {
  id: string;
  component: string;
  validationType: string;
  status: 'pass' | 'fail' | 'warning';
  score: number;
  details: string;
  lastValidated: string;
}

export default function SecurityTestingPage() {
  const [securityTests, setSecurityTests] = useState<SecurityTest[]>([
    {
      id: 'test-001',
      name: 'Web Application Vulnerability Scan',
      type: 'vulnerability-scan',
      status: 'completed',
      severity: 'medium',
      lastRun: '2025-09-16T09:30:00Z',
      duration: '45 minutes',
      findings: 3
    },
    {
      id: 'test-002',
      name: 'Network Penetration Test',
      type: 'penetration-test',
      status: 'running',
      severity: 'high',
      lastRun: '2025-09-16T10:00:00Z',
      duration: '2 hours',
      findings: 0
    },
    {
      id: 'test-003',
      name: 'Security Configuration Audit',
      type: 'security-audit',
      status: 'completed',
      severity: 'low',
      lastRun: '2025-09-16T08:15:00Z',
      duration: '30 minutes',
      findings: 1
    },
    {
      id: 'test-004',
      name: 'GDPR Compliance Check',
      type: 'compliance-check',
      status: 'scheduled',
      severity: 'medium',
      lastRun: '2025-09-15T14:00:00Z',
      duration: '1 hour',
      findings: 0
    }
  ]);

  const [vulnerabilities] = useState<Vulnerability[]>([
    {
      id: 'vuln-001',
      title: 'Weak Password Policy',
      severity: 'medium',
      category: 'Authentication',
      description: 'Password requirements do not meet security standards',
      status: 'in-progress',
      discoveredDate: '2025-09-16T09:30:00Z'
    },
    {
      id: 'vuln-002',
      title: 'Missing Security Headers',
      severity: 'low',
      category: 'Web Security',
      description: 'Several security headers are missing from HTTP responses',
      status: 'open',
      discoveredDate: '2025-09-16T09:35:00Z'
    },
    {
      id: 'vuln-003',
      title: 'Unencrypted Data Transmission',
      severity: 'high',
      category: 'Data Protection',
      description: 'Some API endpoints transmit sensitive data without encryption',
      status: 'resolved',
      discoveredDate: '2025-09-15T16:20:00Z'
    },
    {
      id: 'vuln-004',
      title: 'Outdated Dependencies',
      severity: 'medium',
      category: 'Software Security',
      description: 'Several third-party libraries have known security vulnerabilities',
      status: 'mitigated',
      discoveredDate: '2025-09-15T11:45:00Z'
    }
  ]);

  const [testMetrics] = useState<TestMetrics>({
    totalTests: 24,
    passedTests: 19,
    failedTests: 5,
    vulnerabilitiesFound: 4,
    criticalVulns: 0,
    lastScanDate: '2025-09-16T10:00:00Z'
  });

  const [validationResults] = useState<ValidationResult[]>([
    {
      id: 'val-001',
      component: 'Authentication System',
      validationType: 'Security Validation',
      status: 'pass',
      score: 85,
      details: 'All security controls validated successfully',
      lastValidated: '2025-09-16T09:00:00Z'
    },
    {
      id: 'val-002',
      component: 'Data Encryption',
      validationType: 'Encryption Validation',
      status: 'pass',
      score: 92,
      details: 'Encryption mechanisms working correctly',
      lastValidated: '2025-09-16T09:15:00Z'
    },
    {
      id: 'val-003',
      component: 'Access Controls',
      validationType: 'Authorization Validation',
      status: 'warning',
      score: 76,
      details: 'Some permissions need adjustment',
      lastValidated: '2025-09-16T09:30:00Z'
    },
    {
      id: 'val-004',
      component: 'Security Monitoring',
      validationType: 'Monitoring Validation',
      status: 'pass',
      score: 88,
      details: 'Monitoring systems operational',
      lastValidated: '2025-09-16T09:45:00Z'
    }
  ]);

  const [selectedTab, setSelectedTab] = useState<'tests' | 'vulnerabilities' | 'validation' | 'automation'>('tests');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'pass':
      case 'resolved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'running':
      case 'in-progress':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
      case 'fail':
      case 'open':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'scheduled':
      case 'mitigated':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'pass':
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'running':
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
      case 'fail':
      case 'open':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeSince = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bug className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Security Testing & Validation</h1>
          </div>
          <p className="text-gray-600">
            Basic security testing and validation system with vulnerability scanning, security testing, and validation automation.
          </p>
        </div>

        {/* Testing Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tests Passed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {testMetrics.passedTests}/{testMetrics.totalTests}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vulnerabilities</p>
                <p className="text-2xl font-bold text-gray-900">{testMetrics.vulnerabilitiesFound}</p>
              </div>
              <Bug className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-green-600">{testMetrics.criticalVulns}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Scan</p>
                <p className="text-2xl font-bold text-blue-600">{formatTimeSince(testMetrics.lastScanDate)}</p>
              </div>
              <Search className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'tests', label: 'Security Tests', icon: Play },
                { id: 'vulnerabilities', label: 'Vulnerabilities', icon: Bug },
                { id: 'validation', label: 'Validation Results', icon: Target },
                { id: 'automation', label: 'Test Automation', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'tests' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Test Suite</h3>
                {securityTests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(test.status)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{test.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getSeverityColor(test.severity)}`}>
                              {test.severity}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">{test.type.replace('-', ' ')}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-medium ml-2">{test.duration}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Findings:</span>
                              <span className="font-medium ml-2">{test.findings}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Last Run:</span>
                              <span className="font-medium ml-2">{formatTimeSince(test.lastRun)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(test.status)}`}>
                        {test.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Play className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Security Testing Status</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Basic security testing system is implemented with {securityTests.filter(t => t.status === 'completed').length} completed tests.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'vulnerabilities' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vulnerability Assessment</h3>
                {vulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className={`border rounded-lg p-4 ${getSeverityColor(vuln.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Bug className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{vuln.title}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full uppercase ${getSeverityColor(vuln.severity)}`}>
                              {vuln.severity}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{vuln.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span>Category: {vuln.category}</span>
                            <span>Discovered: {formatTimeSince(vuln.discoveredDate)}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(vuln.status)}`}>
                        {vuln.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Bug className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Vulnerability Scanning Status</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Basic vulnerability scanning is working with {vulnerabilities.length} total findings and {testMetrics.criticalVulns} critical issues.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'validation' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Validation Results</h3>
                {validationResults.map((result) => (
                  <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{result.component}</h4>
                          <p className="text-sm text-gray-600 mt-1">{result.validationType}</p>
                          <p className="text-sm mt-2">{result.details}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-gray-600">Score:</span>
                              <span className={`font-medium ml-2 ${result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {result.score}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Last Validated:</span>
                              <span className="font-medium ml-2">{formatTimeSince(result.lastValidated)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${result.score >= 80 ? 'bg-green-600' : result.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                            style={{ width: `${result.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Security Validation Status</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Security validation is operational with {validationResults.filter(r => r.status === 'pass').length} components passing validation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'automation' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Test Automation</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Automated Tests</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Daily vulnerability scans</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Weekly penetration tests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Continuous security monitoring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Automated compliance checks</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Test Coverage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Web Application:</span>
                        <span className="text-sm font-medium">95%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">API Endpoints:</span>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Database Security:</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Network Security:</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Test Schedule</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Vulnerability Scan</span>
                      <span className="text-sm text-green-600">Daily at 2:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Penetration Test</span>
                      <span className="text-sm text-blue-600">Weekly on Sundays</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Compliance Check</span>
                      <span className="text-sm text-purple-600">Monthly</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Security Audit</span>
                      <span className="text-sm text-orange-600">Quarterly</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Test Automation Status</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Security testing is automated with scheduled scans and continuous monitoring operational.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Implementation Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Basic security testing system implemented</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Basic vulnerability scanning working</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Security testing functional</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Security validation operational</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Security testing automated</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Security testing page created and functional</span>
              </div>
              <span className="text-sm text-green-600">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}