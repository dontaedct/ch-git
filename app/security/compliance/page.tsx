'use client'

import { useState } from 'react'
import { Shield, FileText, CheckCircle, AlertTriangle, Clock, Users, Database, Settings, Eye, Download, Globe, Lock } from 'lucide-react'
import Link from 'next/link'

export default function ComplianceFramework() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedFramework, setSelectedFramework] = useState('gdpr')

  const regulatoryFrameworks = {
    'gdpr': {
      title: 'General Data Protection Regulation (GDPR)',
      region: 'European Union',
      status: 'compliant',
      coverage: '100%',
      lastAudit: '2024-08-15',
      nextReview: '2024-12-15',
      requirements: [
        'Data Protection Impact Assessments (DPIA)',
        'Right to be forgotten implementation',
        'Data portability mechanisms',
        'Consent management systems',
        'Breach notification procedures (72 hours)',
        'Data Protection Officer (DPO) designation',
        'Privacy by design implementation',
        'Cross-border transfer safeguards'
      ],
      penalties: 'Up to €20M or 4% of annual revenue',
      dataTypes: ['Personal data', 'Sensitive personal data', 'Biometric data']
    },
    'ccpa': {
      title: 'California Consumer Privacy Act (CCPA)',
      region: 'California, USA',
      status: 'compliant',
      coverage: '98%',
      lastAudit: '2024-07-20',
      nextReview: '2024-11-20',
      requirements: [
        'Consumer right to know about data collection',
        'Right to delete personal information',
        'Right to opt-out of sale of personal information',
        'Non-discrimination for exercising privacy rights',
        'Privacy policy disclosure requirements',
        'Designated methods for submitting requests',
        'Identity verification procedures',
        'Response time requirements (45 days)'
      ],
      penalties: 'Up to $7,500 per violation',
      dataTypes: ['Personal information', 'Commercial information', 'Biometric identifiers']
    },
    'soc2': {
      title: 'SOC 2 Type II',
      region: 'United States',
      status: 'in-progress',
      coverage: '85%',
      lastAudit: '2024-06-01',
      nextReview: '2024-12-01',
      requirements: [
        'Security principle implementation',
        'Availability controls and monitoring',
        'Processing integrity safeguards',
        'Confidentiality protection measures',
        'Privacy controls for personal information',
        'Continuous monitoring systems',
        'Incident response procedures',
        'Regular penetration testing'
      ],
      penalties: 'Loss of certification and business trust',
      dataTypes: ['Customer data', 'System information', 'Financial records']
    },
    'iso27001': {
      title: 'ISO 27001 Information Security',
      region: 'International',
      status: 'planned',
      coverage: '65%',
      lastAudit: 'N/A',
      nextReview: '2025-03-01',
      requirements: [
        'Information Security Management System (ISMS)',
        'Risk assessment and treatment',
        'Security controls implementation (Annex A)',
        'Management commitment and leadership',
        'Competence and awareness programs',
        'Internal audit processes',
        'Management review procedures',
        'Continual improvement mechanisms'
      ],
      penalties: 'Loss of certification',
      dataTypes: ['All information assets', 'Intellectual property', 'Business information']
    }
  }

  const auditRequirements = {
    'internal-audits': {
      title: 'Internal Audits',
      frequency: 'Quarterly',
      scope: 'All security controls and compliance measures',
      responsible: 'Internal Audit Team',
      deliverables: [
        'Audit planning and scope definition',
        'Control testing and evaluation',
        'Findings and recommendations report',
        'Management response tracking',
        'Follow-up verification testing'
      ]
    },
    'external-audits': {
      title: 'External Audits',
      frequency: 'Annually',
      scope: 'Third-party compliance validation',
      responsible: 'External Audit Firm',
      deliverables: [
        'Independent compliance assessment',
        'SOC 2 Type II examination',
        'Penetration testing reports',
        'Compliance certification letters',
        'Remediation roadmaps'
      ]
    },
    'continuous-monitoring': {
      title: 'Continuous Monitoring',
      frequency: 'Real-time',
      scope: 'Automated compliance monitoring',
      responsible: 'Security Operations Center',
      deliverables: [
        'Real-time compliance dashboards',
        'Automated alert generation',
        'Policy violation tracking',
        'Compliance metrics reporting',
        'Trend analysis and insights'
      ]
    }
  }

  const complianceMetrics = {
    overallScore: '96%',
    activeFrameworks: '4',
    pendingActions: '12',
    lastAssessment: '2 weeks ago',
    nextAudit: '6 weeks',
    riskLevel: 'Low'
  }

  const complianceMonitoring = {
    'policy-enforcement': {
      title: 'Policy Enforcement',
      description: 'Automated policy compliance monitoring',
      status: 'active',
      coverage: [
        'Data retention policy compliance',
        'Access control policy adherence',
        'Data classification enforcement',
        'Privacy policy implementation',
        'Security policy violations'
      ]
    },
    'regulatory-tracking': {
      title: 'Regulatory Tracking',
      description: 'Monitoring regulatory changes and updates',
      status: 'active',
      coverage: [
        'GDPR regulation updates',
        'CCPA amendment tracking',
        'SOC 2 framework changes',
        'Industry standard updates',
        'Regional compliance requirements'
      ]
    },
    'compliance-reporting': {
      title: 'Compliance Reporting',
      description: 'Automated compliance status reporting',
      status: 'active',
      coverage: [
        'Executive compliance dashboards',
        'Regulatory filing automation',
        'Audit trail generation',
        'Compliance metrics tracking',
        'Stakeholder communication'
      ]
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-100'
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-100'
      case 'planned':
        return 'text-blue-600 bg-blue-100'
      case 'non-compliant':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'planned':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/security" className="text-blue-600 hover:text-blue-800">
              <Shield className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Compliance Framework Design</h1>
          </div>
          <p className="text-gray-600">
            Comprehensive regulatory compliance framework with audit requirements and monitoring
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Framework Overview', icon: Shield },
                { id: 'regulatory', label: 'Regulatory Requirements', icon: FileText },
                { id: 'audits', label: 'Audit Requirements', icon: Eye },
                { id: 'monitoring', label: 'Compliance Monitoring', icon: Settings },
                { id: 'reporting', label: 'Reporting & Documentation', icon: Download }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Compliance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(complianceMetrics).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Framework Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulatory Framework Status</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(regulatoryFrameworks).map(([key, framework]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{framework.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(framework.status)}`}>
                            {framework.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Region:</span>
                            <p className="font-medium">{framework.region}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Coverage:</span>
                            <p className="font-medium">{framework.coverage}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Audit:</span>
                            <p className="font-medium">{framework.lastAudit}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Next Review:</span>
                            <p className="font-medium">{framework.nextReview}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'regulatory' && (
              <div className="space-y-6">
                {/* Framework Selector */}
                <div className="flex gap-4 flex-wrap">
                  {Object.entries(regulatoryFrameworks).map(([frameworkId, framework]) => (
                    <button
                      key={frameworkId}
                      onClick={() => setSelectedFramework(frameworkId)}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedFramework === frameworkId
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {framework.title}
                    </button>
                  ))}
                </div>

                {/* Selected Framework Details */}
                {selectedFramework && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Framework Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <Globe className="w-6 h-6 text-blue-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {regulatoryFrameworks[selectedFramework].title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(regulatoryFrameworks[selectedFramework].status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(regulatoryFrameworks[selectedFramework].status)}`}>
                                {regulatoryFrameworks[selectedFramework].status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-gray-600">Region:</span>
                            <p className="font-medium">{regulatoryFrameworks[selectedFramework].region}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Coverage:</span>
                            <p className="font-medium">{regulatoryFrameworks[selectedFramework].coverage}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Penalties:</span>
                            <p className="font-medium text-red-600">{regulatoryFrameworks[selectedFramework].penalties}</p>
                          </div>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Key Requirements:</h4>
                        <ul className="space-y-2">
                          {regulatoryFrameworks[selectedFramework].requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Data Types */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Protected Data Types:</h4>
                        <div className="space-y-2">
                          {regulatoryFrameworks[selectedFramework].dataTypes.map((dataType, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">{dataType}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'audits' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Audit Requirements</h3>
                <div className="space-y-6">
                  {Object.entries(auditRequirements).map(([key, audit]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Audit Info */}
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-900">{audit.title}</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Frequency:</span>
                              <p className="font-medium">{audit.frequency}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Responsible:</span>
                              <p className="font-medium">{audit.responsible}</p>
                            </div>
                          </div>
                        </div>

                        {/* Scope */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Scope:</h5>
                          <p className="text-sm text-gray-600">{audit.scope}</p>
                        </div>

                        {/* Deliverables */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Deliverables:</h5>
                          <ul className="space-y-1">
                            {audit.deliverables.map((deliverable, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                <span>{deliverable}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Compliance Monitoring</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {Object.entries(complianceMonitoring).map(([key, monitor]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Settings className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{monitor.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(monitor.status)}
                            <span className="text-sm text-gray-600">{monitor.status}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{monitor.description}</p>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Coverage:</h5>
                        <ul className="space-y-1">
                          {monitor.coverage.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reporting' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Reporting & Documentation</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Download className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Compliance Reports</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Executive compliance dashboards</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Regulatory filing automation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Audit trail documentation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Compliance metrics tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Incident response reporting</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Documentation Management</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Policy and procedure documentation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Training material management</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Version control and approval workflows</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Document retention scheduling</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Compliance evidence collection</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Stakeholder Communication</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Board of directors reporting</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Regulatory authority communications</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Customer privacy notifications</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Partner compliance agreements</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Public transparency reports</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Evidence Management</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Control testing evidence</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Compliance assessment records</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Training completion tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Risk assessment documentation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Vendor compliance validation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}