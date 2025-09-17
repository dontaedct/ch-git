'use client'

import { useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Bell, Download, Settings, Eye, Shield, FileText, BarChart3, PieChart } from 'lucide-react'
import Link from 'next/link'

export default function ComplianceMonitoring() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [timeRange, setTimeRange] = useState('7d')
  const [alertFilter, setAlertFilter] = useState('all')

  const complianceMetrics = {
    overall: {
      score: 97.8,
      trend: 'up',
      change: '+2.3%',
      status: 'excellent'
    },
    frameworks: {
      gdpr: { score: 100, status: 'compliant', trend: 'stable' },
      ccpa: { score: 98, status: 'compliant', trend: 'up' },
      soc2: { score: 95, status: 'monitoring', trend: 'up' },
      iso27001: { score: 88, status: 'review', trend: 'down' }
    },
    alerts: {
      critical: 0,
      high: 2,
      medium: 5,
      low: 12,
      total: 19
    },
    performance: {
      auditResponseTime: '2.1 hours',
      complianceChecks: 1847,
      automatedReports: 156,
      manualReviews: 23
    }
  }

  const monitoringAlerts = [
    {
      id: 'AL-2025-045',
      severity: 'high',
      type: 'Data Retention',
      title: 'Data retention period exceeded for archived records',
      framework: 'GDPR',
      timestamp: '2025-09-16T14:30:00Z',
      status: 'active',
      impact: 'medium',
      assignee: 'Data Protection Officer',
      description: 'Archived user records have exceeded the 7-year retention period'
    },
    {
      id: 'AL-2025-046',
      severity: 'medium',
      type: 'Consent Management',
      title: 'Consent renewal required for marketing emails',
      framework: 'GDPR',
      timestamp: '2025-09-16T12:15:00Z',
      status: 'acknowledged',
      impact: 'low',
      assignee: 'Marketing Team',
      description: 'Consent for 145 users expires within 30 days'
    },
    {
      id: 'AL-2025-047',
      severity: 'high',
      type: 'Access Control',
      title: 'Privileged access review overdue',
      framework: 'SOC 2',
      timestamp: '2025-09-16T09:45:00Z',
      status: 'pending',
      impact: 'high',
      assignee: 'Security Team',
      description: 'Quarterly privileged access review is 5 days overdue'
    },
    {
      id: 'AL-2025-048',
      severity: 'medium',
      type: 'Documentation',
      title: 'Privacy policy update required',
      framework: 'CCPA',
      timestamp: '2025-09-16T08:20:00Z',
      status: 'in-progress',
      impact: 'medium',
      assignee: 'Legal Team',
      description: 'Privacy policy needs update for new CCPA amendments'
    },
    {
      id: 'AL-2025-049',
      severity: 'low',
      type: 'Training',
      title: 'Security awareness training due',
      framework: 'ISO 27001',
      timestamp: '2025-09-15T16:30:00Z',
      status: 'scheduled',
      impact: 'low',
      assignee: 'HR Department',
      description: 'Annual security awareness training for 45 employees'
    }
  ]

  const complianceReports = [
    {
      id: 'RPT-2025-Q3-01',
      name: 'Q3 2025 GDPR Compliance Report',
      type: 'Quarterly',
      framework: 'GDPR',
      status: 'completed',
      generatedDate: '2025-09-15',
      size: '2.3 MB',
      format: 'PDF',
      compliance: 100
    },
    {
      id: 'RPT-2025-Q3-02',
      name: 'Q3 2025 SOC 2 Audit Report',
      type: 'Quarterly',
      framework: 'SOC 2',
      status: 'in-progress',
      generatedDate: '2025-09-14',
      size: '1.8 MB',
      format: 'PDF',
      compliance: 95
    },
    {
      id: 'RPT-2025-M09-01',
      name: 'September 2025 CCPA Monthly Report',
      type: 'Monthly',
      framework: 'CCPA',
      status: 'completed',
      generatedDate: '2025-09-13',
      size: '1.2 MB',
      format: 'PDF',
      compliance: 98
    },
    {
      id: 'RPT-2025-W37-01',
      name: 'Week 37 Security Monitoring Report',
      type: 'Weekly',
      framework: 'ISO 27001',
      status: 'scheduled',
      generatedDate: '2025-09-12',
      size: '0.8 MB',
      format: 'PDF',
      compliance: 88
    }
  ]

  const complianceTrends = [
    { period: 'Jan 2025', gdpr: 98, ccpa: 95, soc2: 92, iso27001: 85 },
    { period: 'Feb 2025', gdpr: 99, ccpa: 96, soc2: 93, iso27001: 86 },
    { period: 'Mar 2025', gdpr: 99, ccpa: 97, soc2: 94, iso27001: 87 },
    { period: 'Apr 2025', gdpr: 100, ccpa: 97, soc2: 95, iso27001: 88 },
    { period: 'May 2025', gdpr: 100, ccpa: 98, soc2: 95, iso27001: 88 },
    { period: 'Jun 2025', gdpr: 100, ccpa: 98, soc2: 95, iso27001: 87 },
    { period: 'Jul 2025', gdpr: 100, ccpa: 98, soc2: 95, iso27001: 86 },
    { period: 'Aug 2025', gdpr: 100, ccpa: 98, soc2: 95, iso27001: 87 },
    { period: 'Sep 2025', gdpr: 100, ccpa: 98, soc2: 95, iso27001: 88 }
  ]

  const monitoringStats = {
    totalChecks: 1847,
    passedChecks: 1805,
    failedChecks: 42,
    pendingChecks: 0,
    automationRate: 97.7,
    avgResponseTime: 2.1,
    uptime: 99.9
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
      case 'completed':
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'monitoring':
      case 'in-progress':
      case 'acknowledged':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'review':
      case 'pending':
      case 'scheduled':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'active':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
      case 'completed':
      case 'excellent':
        return 'bg-green-100 text-green-800'
      case 'monitoring':
      case 'in-progress':
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800'
      case 'review':
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getComplianceScoreColor = (score) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  const filteredAlerts = monitoringAlerts.filter(alert =>
    alertFilter === 'all' || alert.severity === alertFilter
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-8 h-8 text-green-600" />
                <h1 className="text-3xl font-bold text-gray-900">Compliance Monitoring & Reporting</h1>
              </div>
              <p className="text-gray-600">
                Real-time compliance monitoring with automated reporting and alert management
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

        {/* Overall Compliance Score */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Overall Compliance Score</h2>
              <p className="text-gray-600 mt-1">Aggregated score across all compliance frameworks</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getComplianceScoreColor(complianceMetrics.overall.score)}`}>
                {complianceMetrics.overall.score}%
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getTrendIcon(complianceMetrics.overall.trend)}
                <span className="text-sm text-gray-600">{complianceMetrics.overall.change} this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-medium text-gray-600">Active Alerts</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{complianceMetrics.alerts.total}</p>
            <p className="text-xs text-gray-500">
              {complianceMetrics.alerts.critical + complianceMetrics.alerts.high} high priority
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-medium text-gray-600">Passed Checks</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{monitoringStats.passedChecks}</p>
            <p className="text-xs text-gray-500">
              of {monitoringStats.totalChecks} total checks
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-600">Response Time</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{monitoringStats.avgResponseTime}h</p>
            <p className="text-xs text-gray-500">Average alert response</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm font-medium text-gray-600">Automation</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{monitoringStats.automationRate}%</p>
            <p className="text-xs text-gray-500">Automated monitoring</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'alerts'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Alerts
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'reports'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'trends'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Trends
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Framework Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(complianceMetrics.frameworks).map(([key, framework]) => (
                <div key={key} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 uppercase">{key}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(framework.status)}
                      {getTrendIcon(framework.trend)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getComplianceScoreColor(framework.score)}`}>
                      {framework.score}%
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(framework.status)}`}>
                      {framework.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Alert Summary */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Alert Summary</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{complianceMetrics.alerts.critical}</div>
                    <div className="text-sm text-red-700">Critical</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{complianceMetrics.alerts.high}</div>
                    <div className="text-sm text-orange-700">High</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{complianceMetrics.alerts.medium}</div>
                    <div className="text-sm text-yellow-700">Medium</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{complianceMetrics.alerts.low}</div>
                    <div className="text-sm text-blue-700">Low</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{complianceMetrics.performance.auditResponseTime}</div>
                    <div className="text-sm text-gray-600">Avg Audit Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{complianceMetrics.performance.complianceChecks}</div>
                    <div className="text-sm text-gray-600">Compliance Checks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{complianceMetrics.performance.automatedReports}</div>
                    <div className="text-sm text-gray-600">Automated Reports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{complianceMetrics.performance.manualReviews}</div>
                    <div className="text-sm text-gray-600">Manual Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Alert Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter by severity:</label>
                <select
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Configure Alerts
                </button>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className={`bg-white rounded-lg shadow-sm border p-6 ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">{alert.framework}</span>
                        <span className="text-sm text-gray-600">{alert.type}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{alert.title}</h3>
                      <p className="text-gray-600 mb-3">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>ID: {alert.id}</span>
                        <span>Assigned: {alert.assignee}</span>
                        <span>Impact: {alert.impact}</span>
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(alert.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Compliance Reports</h2>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Generate New Report
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Framework
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Compliance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Generated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {complianceReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{report.name}</div>
                            <div className="text-sm text-gray-500">{report.size} • {report.format}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.framework}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {report.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(report.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getComplianceScoreColor(report.compliance)}`}>
                            {report.compliance}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {report.generatedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-green-600 hover:text-green-900 mr-3">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Compliance Trends</h2>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>

              {/* Trends Chart Placeholder */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Compliance trends chart would be displayed here</p>
                  <p className="text-sm text-gray-400">Integration with charting library required</p>
                </div>
              </div>

              {/* Trends Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GDPR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CCPA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SOC 2
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ISO 27001
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {complianceTrends.slice(-6).map((trend, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {trend.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getComplianceScoreColor(trend.gdpr)}`}>
                            {trend.gdpr}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getComplianceScoreColor(trend.ccpa)}`}>
                            {trend.ccpa}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getComplianceScoreColor(trend.soc2)}`}>
                            {trend.soc2}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getComplianceScoreColor(trend.iso27001)}`}>
                            {trend.iso27001}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}