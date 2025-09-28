'use client'

import { useState, useEffect } from 'react'
import { Shield, Lock, Users, Database, Eye, Settings, AlertTriangle, CheckCircle, RefreshCw, Activity, Network, Key } from 'lucide-react'
import Link from 'next/link'

interface SecurityMetrics {
  securityScore: number
  threatLevel: 'low' | 'medium' | 'high'
  activeThreats: number
  blockedAttempts: number
  complianceStatus: string
  lastScan: string
}

interface SecurityModule {
  id: string
  name: string
  status: 'active' | 'inactive' | 'warning' | 'error'
  lastUpdate: string
  coverage: number
  incidents: number
}

export default function EnterpriseSecurityDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    securityScore: 98,
    threatLevel: 'low',
    activeThreats: 0,
    blockedAttempts: 47,
    complianceStatus: 'Compliant',
    lastScan: '2 minutes ago'
  })

  const securityModules: SecurityModule[] = [
    {
      id: 'guardian',
      name: 'Guardian System',
      status: 'active',
      lastUpdate: '5 minutes ago',
      coverage: 100,
      incidents: 0
    },
    {
      id: 'authentication',
      name: 'Advanced Authentication',
      status: 'active',
      lastUpdate: '1 hour ago',
      coverage: 99,
      incidents: 2
    },
    {
      id: 'monitoring',
      name: 'Security Monitoring',
      status: 'active',
      lastUpdate: '30 seconds ago',
      coverage: 97,
      incidents: 1
    },
    {
      id: 'encryption',
      name: 'Data Encryption',
      status: 'active',
      lastUpdate: '2 hours ago',
      coverage: 100,
      incidents: 0
    },
    {
      id: 'compliance',
      name: 'Compliance Framework',
      status: 'warning',
      lastUpdate: '6 hours ago',
      coverage: 95,
      incidents: 3
    },
    {
      id: 'incident',
      name: 'Incident Response',
      status: 'active',
      lastUpdate: '1 minute ago',
      coverage: 98,
      incidents: 0
    }
  ]

  const recentAlerts = [
    {
      id: '1',
      type: 'info',
      message: 'Security scan completed successfully',
      timestamp: '2 minutes ago',
      resolved: true
    },
    {
      id: '2',
      type: 'warning',
      message: 'Unusual login pattern detected from IP 192.168.1.100',
      timestamp: '15 minutes ago',
      resolved: false
    },
    {
      id: '3',
      type: 'success',
      message: '47 automated threats blocked in the last hour',
      timestamp: '1 hour ago',
      resolved: true
    },
    {
      id: '4',
      type: 'info',
      message: 'Compliance audit report generated',
      timestamp: '3 hours ago',
      resolved: true
    }
  ]

  const complianceFrameworks = [
    { name: 'GDPR', status: 'compliant', score: 98 },
    { name: 'SOC 2', status: 'compliant', score: 96 },
    { name: 'ISO 27001', status: 'compliant', score: 94 },
    { name: 'CCPA', status: 'compliant', score: 99 },
    { name: 'HIPAA', status: 'review', score: 87 }
  ]

  const refreshMetrics = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setMetrics(prev => ({
      ...prev,
      lastScan: 'Just now',
      blockedAttempts: prev.blockedAttempts + Math.floor(Math.random() * 5)
    }))
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'compliant':
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'warning':
      case 'review':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'inactive':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-blue-600 bg-blue-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'compliant':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
      case 'review':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'high':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/agency-toolkit" className="text-blue-600 hover:text-blue-800">
                <Shield className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Enterprise Security Dashboard</h1>
                <p className="text-gray-600">Advanced security framework with Guardian integration</p>
              </div>
            </div>
            <button
              onClick={refreshMetrics}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Security Score Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{metrics.securityScore}%</div>
              <div className="text-blue-100">Security Score</div>
            </div>
            <div className="text-center">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getThreatLevelColor(metrics.threatLevel)} bg-opacity-20 text-white border border-white border-opacity-30`}>
                {metrics.threatLevel.toUpperCase()}
              </div>
              <div className="text-blue-100 mt-2">Threat Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{metrics.activeThreats}</div>
              <div className="text-blue-100">Active Threats</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{metrics.blockedAttempts}</div>
              <div className="text-blue-100">Blocked Today</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Security Overview', icon: Shield },
                { id: 'modules', label: 'Security Modules', icon: Network },
                { id: 'monitoring', label: 'Live Monitoring', icon: Eye },
                { id: 'compliance', label: 'Compliance', icon: CheckCircle },
                { id: 'settings', label: 'Configuration', icon: Settings }
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
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Guardian Status</p>
                        <p className="text-lg font-semibold text-gray-900">Active</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Sessions</p>
                        <p className="text-lg font-semibold text-gray-900">143</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Database className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data Encrypted</p>
                        <p className="text-lg font-semibold text-gray-900">100%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Eye className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Scan</p>
                        <p className="text-lg font-semibold text-gray-900">{metrics.lastScan}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Security Alerts */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Alerts</h3>
                  <div className="space-y-3">
                    {recentAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between bg-white rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(alert.type)}
                          <div>
                            <p className="font-medium text-gray-900">{alert.message}</p>
                            <p className="text-sm text-gray-500">{alert.timestamp}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${alert.resolved ? getStatusColor('success') : getStatusColor('warning')}`}>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {securityModules.map((module) => (
                    <div key={module.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Network className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{module.name}</h3>
                            <p className="text-sm text-gray-500">Last update: {module.lastUpdate}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                          {module.status}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coverage:</span>
                          <span className="font-medium">{module.coverage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Incidents (24h):</span>
                          <span className="font-medium">{module.incidents}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${module.coverage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Security Monitoring</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Real-time Threats</h4>
                      <div className="text-2xl font-bold text-green-600 mb-1">{metrics.activeThreats}</div>
                      <p className="text-sm text-gray-600">No active threats detected</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">System Health</h4>
                      <div className="text-2xl font-bold text-green-600 mb-1">98.7%</div>
                      <p className="text-sm text-gray-600">All systems operational</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Response Time</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-1">0.3s</div>
                      <p className="text-sm text-gray-600">Average threat response</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Framework Status</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {complianceFrameworks.map((framework, index) => (
                      <div key={index} className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{framework.name}</h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(framework.status)}`}>
                            {framework.status}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Compliance Score:</span>
                          <span className="font-semibold text-gray-900">{framework.score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${framework.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Authentication Settings</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">MFA Required:</span>
                          <span className="text-green-600 font-medium">Enabled</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Session Timeout:</span>
                          <span className="font-medium">30 minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Password Policy:</span>
                          <span className="font-medium">Strong</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Monitoring Settings</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Real-time Alerts:</span>
                          <span className="text-green-600 font-medium">Enabled</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Log Retention:</span>
                          <span className="font-medium">90 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Audit Frequency:</span>
                          <span className="font-medium">Daily</span>
                        </div>
                      </div>
                    </div>
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