'use client'

import { useState } from 'react'
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Globe, Users, Database, Eye, Settings, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function RegulatoryCompliance() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedFramework, setSelectedFramework] = useState('gdpr')

  const complianceFrameworks = {
    gdpr: {
      name: 'General Data Protection Regulation (GDPR)',
      region: 'European Union',
      status: 'compliant',
      score: 100,
      lastAssessment: '2025-09-15',
      nextReview: '2025-12-15',
      description: 'EU regulation for data protection and privacy for all individuals within the EU and EEA',
      requirements: [
        {
          id: 'GDPR-001',
          category: 'Data Processing',
          requirement: 'Lawful Basis for Processing',
          status: 'compliant',
          implementation: 'Consent management system implemented',
          evidence: 'Consent records, processing agreements',
          lastVerified: '2025-09-15'
        },
        {
          id: 'GDPR-002',
          category: 'Data Subject Rights',
          requirement: 'Right to Access',
          status: 'compliant',
          implementation: 'Automated data export functionality',
          evidence: 'Data export logs, user portal',
          lastVerified: '2025-09-14'
        },
        {
          id: 'GDPR-003',
          category: 'Data Subject Rights',
          requirement: 'Right to Erasure',
          status: 'compliant',
          implementation: 'Data deletion workflows implemented',
          evidence: 'Deletion logs, retention policies',
          lastVerified: '2025-09-13'
        },
        {
          id: 'GDPR-004',
          category: 'Security',
          requirement: 'Data Protection by Design',
          status: 'compliant',
          implementation: 'Privacy-first architecture and encryption',
          evidence: 'Security assessments, encryption protocols',
          lastVerified: '2025-09-12'
        },
        {
          id: 'GDPR-005',
          category: 'Breach Notification',
          requirement: '72-hour Breach Notification',
          status: 'compliant',
          implementation: 'Automated incident response system',
          evidence: 'Incident response procedures, notification logs',
          lastVerified: '2025-09-11'
        }
      ]
    },
    ccpa: {
      name: 'California Consumer Privacy Act (CCPA)',
      region: 'California, USA',
      status: 'compliant',
      score: 98,
      lastAssessment: '2025-09-14',
      nextReview: '2025-11-14',
      description: 'California state law that enhances privacy rights and consumer protection',
      requirements: [
        {
          id: 'CCPA-001',
          category: 'Consumer Rights',
          requirement: 'Right to Know',
          status: 'compliant',
          implementation: 'Data inventory and disclosure system',
          evidence: 'Privacy notices, data maps',
          lastVerified: '2025-09-14'
        },
        {
          id: 'CCPA-002',
          category: 'Consumer Rights',
          requirement: 'Right to Delete',
          status: 'compliant',
          implementation: 'Consumer data deletion portal',
          evidence: 'Deletion request logs, verification records',
          lastVerified: '2025-09-13'
        },
        {
          id: 'CCPA-003',
          category: 'Consumer Rights',
          requirement: 'Right to Opt-Out',
          status: 'compliant',
          implementation: 'Do Not Sell opt-out mechanism',
          evidence: 'Opt-out tracking, preference center',
          lastVerified: '2025-09-12'
        },
        {
          id: 'CCPA-004',
          category: 'Data Sales',
          requirement: 'Sale Disclosure Requirements',
          status: 'compliant',
          implementation: 'No personal data sales policy',
          evidence: 'Privacy policy, data sharing agreements',
          lastVerified: '2025-09-11'
        }
      ]
    },
    soc2: {
      name: 'SOC 2 Type II',
      region: 'United States',
      status: 'monitoring',
      score: 95,
      lastAssessment: '2025-09-10',
      nextReview: '2025-10-10',
      description: 'Security, availability, processing integrity, confidentiality, and privacy controls',
      requirements: [
        {
          id: 'SOC2-001',
          category: 'Security',
          requirement: 'Access Controls',
          status: 'compliant',
          implementation: 'Multi-factor authentication and RBAC',
          evidence: 'Access logs, security policies',
          lastVerified: '2025-09-10'
        },
        {
          id: 'SOC2-002',
          category: 'Availability',
          requirement: 'System Monitoring',
          status: 'compliant',
          implementation: '24/7 monitoring and alerting',
          evidence: 'Monitoring logs, uptime reports',
          lastVerified: '2025-09-09'
        },
        {
          id: 'SOC2-003',
          category: 'Processing Integrity',
          requirement: 'Data Processing Controls',
          status: 'review',
          implementation: 'Data validation and error handling',
          evidence: 'Processing logs, validation reports',
          lastVerified: '2025-09-08'
        },
        {
          id: 'SOC2-004',
          category: 'Confidentiality',
          requirement: 'Data Encryption',
          status: 'compliant',
          implementation: 'End-to-end encryption protocols',
          evidence: 'Encryption certificates, key management',
          lastVerified: '2025-09-07'
        }
      ]
    },
    iso27001: {
      name: 'ISO 27001',
      region: 'International',
      status: 'in-progress',
      score: 85,
      lastAssessment: '2025-09-05',
      nextReview: '2025-12-05',
      description: 'International standard for information security management systems',
      requirements: [
        {
          id: 'ISO-001',
          category: 'Information Security Policy',
          requirement: 'Security Policy Framework',
          status: 'compliant',
          implementation: 'Comprehensive security policies',
          evidence: 'Policy documents, approval records',
          lastVerified: '2025-09-05'
        },
        {
          id: 'ISO-002',
          category: 'Risk Management',
          requirement: 'Risk Assessment Process',
          status: 'compliant',
          implementation: 'Regular risk assessments and mitigation',
          evidence: 'Risk registers, assessment reports',
          lastVerified: '2025-09-04'
        },
        {
          id: 'ISO-003',
          category: 'Asset Management',
          requirement: 'Asset Inventory',
          status: 'review',
          implementation: 'Asset tracking and classification',
          evidence: 'Asset registers, classification schemes',
          lastVerified: '2025-09-03'
        }
      ]
    }
  }

  const complianceStats = {
    totalFrameworks: 4,
    compliantFrameworks: 2,
    averageScore: 94.5,
    pendingActions: 3,
    lastAudit: '2025-09-15',
    nextAudit: '2025-10-15'
  }

  const recentActivities = [
    {
      id: 1,
      type: 'assessment',
      framework: 'GDPR',
      action: 'Quarterly compliance assessment completed',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'update',
      framework: 'CCPA',
      action: 'Privacy policy updated for new requirements',
      timestamp: '1 day ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'review',
      framework: 'SOC 2',
      action: 'Processing integrity controls under review',
      timestamp: '2 days ago',
      status: 'in-progress'
    },
    {
      id: 4,
      type: 'audit',
      framework: 'ISO 27001',
      action: 'Asset management review scheduled',
      timestamp: '3 days ago',
      status: 'scheduled'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'monitoring':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'review':
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'monitoring':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'review':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Regulatory Compliance Implementation</h1>
              </div>
              <p className="text-gray-600">
                Comprehensive regulatory compliance management for GDPR, CCPA, SOC 2, and international standards
              </p>
            </div>
            <Link
              href="/security"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Security
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-600">Frameworks</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{complianceStats.totalFrameworks}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-medium text-gray-600">Compliant</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{complianceStats.compliantFrameworks}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm font-medium text-gray-600">Avg Score</h3>
            </div>
            <p className={`text-2xl font-bold ${getScoreColor(complianceStats.averageScore)}`}>
              {complianceStats.averageScore}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{complianceStats.pendingActions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-medium text-gray-600">Last Audit</h3>
            </div>
            <p className="text-sm font-medium text-gray-900">{complianceStats.lastAudit}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-teal-500" />
              <h3 className="text-sm font-medium text-gray-600">Next Audit</h3>
            </div>
            <p className="text-sm font-medium text-gray-900">{complianceStats.nextAudit}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('frameworks')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'frameworks'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Compliance Frameworks
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'assessments'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Assessments
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'actions'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Action Items
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Compliance Frameworks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(complianceFrameworks).map(([key, framework]) => (
                <div key={key} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900">{framework.name.split(' ')[0]}</h3>
                    </div>
                    {getStatusIcon(framework.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Score:</span>
                      <span className={`text-lg font-bold ${getScoreColor(framework.score)}`}>
                        {framework.score}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(framework.status)}`}>
                        {framework.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Last: {framework.lastAssessment}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Recent Compliance Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'assessment' ? 'bg-blue-100' :
                          activity.type === 'update' ? 'bg-green-100' :
                          activity.type === 'review' ? 'bg-yellow-100' :
                          'bg-purple-100'
                        }`}>
                          {activity.type === 'assessment' && <FileText className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'update' && <RefreshCw className="w-4 h-4 text-green-600" />}
                          {activity.type === 'review' && <Eye className="w-4 h-4 text-yellow-600" />}
                          {activity.type === 'audit' && <Shield className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.framework} • {activity.timestamp}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Frameworks Tab */}
        {activeTab === 'frameworks' && (
          <div className="space-y-6">
            {/* Framework Selector */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-wrap gap-2">
                {Object.entries(complianceFrameworks).map(([key, framework]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedFramework(key)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedFramework === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {framework.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Framework Details */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {complianceFrameworks[selectedFramework].name}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {complianceFrameworks[selectedFramework].description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(complianceFrameworks[selectedFramework].score)}`}>
                      {complianceFrameworks[selectedFramework].score}%
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(complianceFrameworks[selectedFramework].status)}
                      <span className="text-sm text-gray-600 capitalize">
                        {complianceFrameworks[selectedFramework].status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {complianceFrameworks[selectedFramework].requirements.map((req) => (
                    <div key={req.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{req.requirement}</h4>
                          <p className="text-sm text-gray-600">{req.category} • {req.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(req.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Implementation</h5>
                          <p className="text-gray-600">{req.implementation}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Evidence</h5>
                          <p className="text-gray-600">{req.evidence}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Last Verified</h5>
                          <p className="text-gray-600">{req.lastVerified}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Compliance Assessments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(complianceFrameworks).map(([key, framework]) => (
                <div key={key} className="p-6 border border-gray-200 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">{framework.name.split(' ')[0]} Assessment</h4>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Score:</span>
                      <span className={`font-medium ${getScoreColor(framework.score)}`}>{framework.score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Assessment:</span>
                      <span className="text-sm text-gray-900">{framework.lastAssessment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Next Review:</span>
                      <span className="text-sm text-gray-900">{framework.nextReview}</span>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Run Assessment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Compliance Action Items</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
            <div className="space-y-4">
              <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">SOC 2 Processing Integrity Review</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Review and update data processing controls for SOC 2 compliance
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Due: 2025-09-20</span>
                      <span>Priority: Medium</span>
                      <span>Assigned: Security Team</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">ISO 27001 Asset Management Update</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Update asset inventory and classification for ISO 27001 compliance
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Due: 2025-09-25</span>
                      <span>Priority: High</span>
                      <span>Assigned: IT Operations</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Quarterly GDPR Compliance Review</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Quarterly review of GDPR compliance status and updates
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Due: 2025-12-15</span>
                      <span>Priority: Low</span>
                      <span>Assigned: Compliance Team</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}