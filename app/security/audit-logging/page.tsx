'use client'

import { useState } from 'react'
import { Clock, Search, Filter, Download, Eye, AlertTriangle, CheckCircle, FileText, User, Database, Shield } from 'lucide-react'
import Link from 'next/link'

export default function AuditLogging() {
  const [activeTab, setActiveTab] = useState('logs')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [dateRange, setDateRange] = useState('today')

  const auditLogs = [
    {
      id: 'AL-001',
      timestamp: new Date().toISOString(),
      user: 'admin@agency.com',
      action: 'User Login',
      resource: 'Authentication System',
      status: 'success',
      severity: 'info',
      ipAddress: '192.168.1.100',
      details: 'Successful login attempt',
      compliance: ['GDPR', 'SOC2']
    },
    {
      id: 'AL-002',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      user: 'client@example.com',
      action: 'Data Export',
      resource: 'Client Database',
      status: 'success',
      severity: 'medium',
      ipAddress: '192.168.1.105',
      details: 'Client data exported for compliance report',
      compliance: ['GDPR', 'CCPA']
    },
    {
      id: 'AL-003',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      user: 'system',
      action: 'Security Scan',
      resource: 'Application Infrastructure',
      status: 'completed',
      severity: 'info',
      ipAddress: 'internal',
      details: 'Automated security vulnerability scan completed',
      compliance: ['SOC2', 'ISO27001']
    },
    {
      id: 'AL-004',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      user: 'developer@agency.com',
      action: 'Configuration Change',
      resource: 'Security Settings',
      status: 'success',
      severity: 'high',
      ipAddress: '192.168.1.110',
      details: 'Updated encryption protocols for client data',
      compliance: ['GDPR', 'CCPA', 'SOC2']
    },
    {
      id: 'AL-005',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      user: 'client@test.com',
      action: 'Failed Login',
      resource: 'Authentication System',
      status: 'failed',
      severity: 'warning',
      ipAddress: '203.0.113.45',
      details: 'Multiple failed login attempts detected',
      compliance: ['GDPR', 'SOC2']
    }
  ]

  const complianceMetrics = {
    gdpr: {
      name: 'GDPR Compliance',
      status: 'compliant',
      coverage: '100%',
      lastAudit: '2025-09-15',
      requirements: [
        { name: 'Data Processing Records', status: 'compliant', logs: 245 },
        { name: 'Consent Management', status: 'compliant', logs: 89 },
        { name: 'Data Subject Rights', status: 'compliant', logs: 34 },
        { name: 'Breach Notifications', status: 'compliant', logs: 0 }
      ]
    },
    ccpa: {
      name: 'CCPA Compliance',
      status: 'compliant',
      coverage: '98%',
      lastAudit: '2025-09-14',
      requirements: [
        { name: 'Consumer Rights', status: 'compliant', logs: 156 },
        { name: 'Data Sales Tracking', status: 'compliant', logs: 0 },
        { name: 'Opt-Out Requests', status: 'compliant', logs: 12 },
        { name: 'Disclosure Logs', status: 'compliant', logs: 78 }
      ]
    },
    soc2: {
      name: 'SOC 2 Compliance',
      status: 'monitoring',
      coverage: '95%',
      lastAudit: '2025-09-10',
      requirements: [
        { name: 'Access Controls', status: 'compliant', logs: 567 },
        { name: 'System Monitoring', status: 'compliant', logs: 1234 },
        { name: 'Change Management', status: 'review', logs: 45 },
        { name: 'Incident Response', status: 'compliant', logs: 23 }
      ]
    }
  }

  const auditStats = {
    totalLogs: 15847,
    todayLogs: 234,
    criticalEvents: 3,
    complianceScore: 98,
    retentionPeriod: '7 years',
    lastBackup: '2 hours ago'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'review':
        return <Eye className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'warning':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || log.severity === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-900">Audit Logging & Compliance Tracking</h1>
              </div>
              <p className="text-gray-600">
                Comprehensive audit trails and compliance tracking for security and regulatory requirements
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
              <Database className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-600">Total Logs</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{auditStats.totalLogs.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-medium text-gray-600">Today's Logs</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{auditStats.todayLogs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-medium text-gray-600">Critical Events</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{auditStats.criticalEvents}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm font-medium text-gray-600">Compliance Score</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{auditStats.complianceScore}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-medium text-gray-600">Retention</h3>
            </div>
            <p className="text-lg font-bold text-gray-900">{auditStats.retentionPeriod}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-medium text-gray-600">Last Backup</h3>
            </div>
            <p className="text-sm font-medium text-gray-900">{auditStats.lastBackup}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'logs'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'compliance'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Compliance Tracking
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'reports'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Compliance Reports
          </button>
        </div>

        {/* Audit Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search logs by action, user, or resource..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Severities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                  </select>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Compliance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{log.user}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {log.resource}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="text-sm text-gray-900 capitalize">{log.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            {log.compliance.map((framework) => (
                              <span
                                key={framework}
                                className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                              >
                                {framework}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tracking Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {Object.entries(complianceMetrics).map(([key, framework]) => (
              <div key={key} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{framework.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Coverage: {framework.coverage} | Last Audit: {framework.lastAudit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(framework.status)}
                      <span className="text-sm font-medium text-gray-900 capitalize">{framework.status}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {framework.requirements.map((req, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{req.name}</h4>
                          {getStatusIcon(req.status)}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{req.logs}</p>
                        <p className="text-xs text-gray-600">audit entries</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Compliance Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">GDPR Compliance Report</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive GDPR compliance status with detailed audit trails and data processing records.
                </p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Generate Report
                </button>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">CCPA Compliance Report</h4>
                <p className="text-sm text-gray-600 mb-4">
                  California Consumer Privacy Act compliance report with consumer rights tracking.
                </p>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Generate Report
                </button>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">SOC 2 Audit Report</h4>
                <p className="text-sm text-gray-600 mb-4">
                  SOC 2 Type II compliance audit report with security controls validation.
                </p>
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}