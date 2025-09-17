'use client'

import { useState } from 'react'
import { Shield, User, Download, Trash2, Eye, EyeOff, CheckCircle, AlertTriangle, Clock, Settings, FileText, Database, Lock, Globe } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyControls() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedRequest, setSelectedRequest] = useState(null)

  const privacyStats = {
    totalDataSubjects: 1247,
    activeConsents: 1098,
    pendingRequests: 8,
    completedRequests: 342,
    dataExports: 45,
    deletionRequests: 23,
    consentWithdrawals: 12,
    dataPortabilityRequests: 18
  }

  const dataRights = [
    {
      id: 'right-access',
      name: 'Right to Access',
      description: 'Users can request access to their personal data',
      status: 'active',
      framework: 'GDPR',
      implementation: 'Automated data export portal',
      requests: 156,
      avgResponseTime: '2.3 days'
    },
    {
      id: 'right-rectification',
      name: 'Right to Rectification',
      description: 'Users can request correction of inaccurate data',
      status: 'active',
      framework: 'GDPR',
      implementation: 'User profile correction system',
      requests: 89,
      avgResponseTime: '1.8 days'
    },
    {
      id: 'right-erasure',
      name: 'Right to Erasure',
      description: 'Users can request deletion of their data',
      status: 'active',
      framework: 'GDPR',
      implementation: 'Automated deletion workflows',
      requests: 67,
      avgResponseTime: '3.2 days'
    },
    {
      id: 'right-portability',
      name: 'Right to Data Portability',
      description: 'Users can receive their data in a structured format',
      status: 'active',
      framework: 'GDPR',
      implementation: 'JSON/CSV export functionality',
      requests: 34,
      avgResponseTime: '1.5 days'
    },
    {
      id: 'right-object',
      name: 'Right to Object',
      description: 'Users can object to processing of their data',
      status: 'active',
      framework: 'GDPR',
      implementation: 'Processing objection system',
      requests: 12,
      avgResponseTime: '4.1 days'
    },
    {
      id: 'ccpa-know',
      name: 'Right to Know (CCPA)',
      description: 'California consumers can know what data is collected',
      status: 'active',
      framework: 'CCPA',
      implementation: 'Data disclosure interface',
      requests: 78,
      avgResponseTime: '2.7 days'
    }
  ]

  const consentCategories = [
    {
      id: 'marketing',
      name: 'Marketing Communications',
      description: 'Email newsletters and promotional content',
      consented: 856,
      total: 1247,
      percentage: 68.6,
      lastUpdated: '2025-09-16',
      purpose: 'Send promotional emails and product updates'
    },
    {
      id: 'analytics',
      name: 'Analytics & Performance',
      description: 'Website usage analytics and performance monitoring',
      consented: 1125,
      total: 1247,
      percentage: 90.2,
      lastUpdated: '2025-09-15',
      purpose: 'Improve website performance and user experience'
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'Essential website functionality',
      consented: 1247,
      total: 1247,
      percentage: 100,
      lastUpdated: '2025-09-14',
      purpose: 'Enable core website features and functionality'
    },
    {
      id: 'personalization',
      name: 'Personalization',
      description: 'Personalized content and recommendations',
      consented: 743,
      total: 1247,
      percentage: 59.6,
      lastUpdated: '2025-09-13',
      purpose: 'Provide personalized content and recommendations'
    }
  ]

  const privacyRequests = [
    {
      id: 'PR-2025-001',
      type: 'data-access',
      user: 'john.doe@example.com',
      requestDate: '2025-09-15',
      status: 'processing',
      dueDate: '2025-09-18',
      framework: 'GDPR',
      priority: 'normal',
      dataTypes: ['profile', 'activity', 'preferences'],
      assignee: 'Privacy Team'
    },
    {
      id: 'PR-2025-002',
      type: 'data-deletion',
      user: 'jane.smith@example.com',
      requestDate: '2025-09-14',
      status: 'completed',
      dueDate: '2025-09-17',
      framework: 'GDPR',
      priority: 'high',
      dataTypes: ['profile', 'activity', 'communications'],
      assignee: 'Data Protection Officer'
    },
    {
      id: 'PR-2025-003',
      type: 'data-portability',
      user: 'mike.johnson@example.com',
      requestDate: '2025-09-13',
      status: 'pending',
      dueDate: '2025-09-16',
      framework: 'GDPR',
      priority: 'normal',
      dataTypes: ['profile', 'transactions'],
      assignee: 'Technical Team'
    },
    {
      id: 'PR-2025-004',
      type: 'ccpa-disclosure',
      user: 'sarah.wilson@example.com',
      requestDate: '2025-09-12',
      status: 'review',
      dueDate: '2025-09-15',
      framework: 'CCPA',
      priority: 'normal',
      dataTypes: ['profile', 'analytics', 'marketing'],
      assignee: 'Compliance Team'
    }
  ]

  const dataPortability = {
    formats: ['JSON', 'CSV', 'XML', 'PDF'],
    automaticExports: true,
    encryptionEnabled: true,
    retentionPeriod: '30 days',
    downloadLinks: 'Secure temporary links',
    notificationMethod: 'Email notification'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
      case 'review':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
      case 'review':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConsentPercentageColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
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
                <Shield className="w-8 h-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-900">Privacy Controls & Data Rights</h1>
              </div>
              <p className="text-gray-600">
                Comprehensive privacy controls with data subject rights, consent management, and data portability
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-600">Data Subjects</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{privacyStats.totalDataSubjects.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-medium text-gray-600">Active Consents</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{privacyStats.activeConsents.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-medium text-gray-600">Pending Requests</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{privacyStats.pendingRequests}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm font-medium text-gray-600">Completed Requests</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{privacyStats.completedRequests}</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-medium text-gray-600">Data Exports</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{privacyStats.dataExports}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-medium text-gray-600">Deletions</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{privacyStats.deletionRequests}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-600">Withdrawals</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{privacyStats.consentWithdrawals}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-teal-500" />
              <h3 className="text-sm font-medium text-gray-600">Portability</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{privacyStats.dataPortabilityRequests}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('data-rights')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'data-rights'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Data Subject Rights
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'consent'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Consent Management
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'requests'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Privacy Requests
          </button>
          <button
            onClick={() => setActiveTab('portability')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'portability'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Data Portability
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Privacy Controls Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Rights Implementation</h3>
                <div className="space-y-3">
                  {dataRights.slice(0, 4).map((right) => (
                    <div key={right.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{right.name}</h4>
                        <p className="text-sm text-gray-600">{right.requests} requests</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(right.status)}
                        <span className="text-sm text-gray-600">{right.avgResponseTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Consent Overview</h3>
                <div className="space-y-3">
                  {consentCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.consented} of {category.total} users</p>
                      </div>
                      <div className={`text-lg font-bold ${getConsentPercentageColor(category.percentage)}`}>
                        {category.percentage.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Privacy Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Recent Privacy Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {privacyRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          request.type === 'data-access' ? 'bg-blue-100' :
                          request.type === 'data-deletion' ? 'bg-red-100' :
                          request.type === 'data-portability' ? 'bg-green-100' :
                          'bg-purple-100'
                        }`}>
                          {request.type === 'data-access' && <Eye className="w-4 h-4 text-blue-600" />}
                          {request.type === 'data-deletion' && <Trash2 className="w-4 h-4 text-red-600" />}
                          {request.type === 'data-portability' && <Download className="w-4 h-4 text-green-600" />}
                          {request.type === 'ccpa-disclosure' && <Globe className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{request.id}</p>
                          <p className="text-sm text-gray-600">{request.user} • {request.requestDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Rights Tab */}
        {activeTab === 'data-rights' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataRights.map((right) => (
                <div key={right.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{right.name}</h3>
                    {getStatusIcon(right.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{right.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Framework:</span>
                      <span className="font-medium">{right.framework}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requests:</span>
                      <span className="font-medium">{right.requests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Response:</span>
                      <span className="font-medium">{right.avgResponseTime}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">{right.implementation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consent Management Tab */}
        {activeTab === 'consent' && (
          <div className="space-y-6">
            {consentCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-gray-600 mt-1">{category.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getConsentPercentageColor(category.percentage)}`}>
                        {category.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {category.consented} of {category.total}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Purpose</h5>
                      <p className="text-gray-600">{category.purpose}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Last Updated</h5>
                      <p className="text-gray-600">{category.lastUpdated}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Consent Rate</h5>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Manage Consent
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Privacy Requests Tab */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Privacy Requests</h2>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  New Request
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignee
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {privacyRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {request.type.replace('-', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.assignee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Data Portability Tab */}
        {activeTab === 'portability' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Data Portability Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Export Formats</h4>
                  <div className="space-y-2">
                    {dataPortability.formats.map((format) => (
                      <div key={format} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">{format}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Security Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Encryption Enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Secure Download Links</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">30-day Retention</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Process Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">Automatic Exports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700">Email Notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-gray-700">Complete Data Sets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Data Exports</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">Complete Profile Export</p>
                      <p className="text-sm text-gray-600">user@example.com • JSON Format • 2.3 MB</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-gray-900">Activity Data Export</p>
                      <p className="text-sm text-gray-600">client@test.com • CSV Format • Processing...</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Processing
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}