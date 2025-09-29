'use client'

import { useState, useEffect } from 'react'
import { Shield, Eye, AlertTriangle, Activity, Clock, Users, Database, Network, RefreshCw, Play, Pause, Settings } from 'lucide-react'

interface SecurityMetrics {
  activeThreats: number
  blockedAttempts: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  activeSessions: number
  dataIntegrity: number
  networkSecurity: number
  lastUpdate: string
}

interface SecurityAlert {
  id: string
  type: 'threat' | 'breach' | 'anomaly' | 'system' | 'auth'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  source: string
  timestamp: string
  status: 'active' | 'investigating' | 'resolved'
  affectedSystems: string[]
}

interface MonitoringConfig {
  autoRefresh: boolean
  refreshInterval: number
  alertThreshold: 'low' | 'medium' | 'high'
  enableRealTime: boolean
  showResolved: boolean
}

export default function SecurityMonitoring() {
  const [isRealTime, setIsRealTime] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')
  const [config, setConfig] = useState<MonitoringConfig>({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    alertThreshold: 'medium',
    enableRealTime: true,
    showResolved: false
  })

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeThreats: 0,
    blockedAttempts: 147,
    systemHealth: 'healthy',
    activeSessions: 43,
    dataIntegrity: 99.8,
    networkSecurity: 97.2,
    lastUpdate: new Date().toLocaleTimeString()
  })

  const [alerts, setAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'auth',
      severity: 'medium',
      title: 'Multiple Failed Login Attempts',
      description: 'Detected 12 failed login attempts from IP 192.168.1.100 in the last 10 minutes',
      source: 'Authentication System',
      timestamp: '5 minutes ago',
      status: 'investigating',
      affectedSystems: ['Auth Service', 'User Management']
    },
    {
      id: '2',
      type: 'anomaly',
      severity: 'low',
      title: 'Unusual Data Access Pattern',
      description: 'User accessing data outside normal business hours',
      source: 'Data Access Monitor',
      timestamp: '15 minutes ago',
      status: 'active',
      affectedSystems: ['Database', 'API Gateway']
    },
    {
      id: '3',
      type: 'system',
      severity: 'high',
      title: 'Guardian Backup Failed',
      description: 'Automated backup process encountered an error during execution',
      source: 'Guardian System',
      timestamp: '1 hour ago',
      status: 'resolved',
      affectedSystems: ['Backup Service', 'Storage']
    },
    {
      id: '4',
      type: 'threat',
      severity: 'critical',
      title: 'Potential SQL Injection Attempt',
      description: 'Malicious SQL patterns detected in API requests',
      source: 'Web Application Firewall',
      timestamp: '2 hours ago',
      status: 'resolved',
      affectedSystems: ['API Gateway', 'Database']
    }
  ])

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (config.autoRefresh && isRealTime) {
      interval = setInterval(() => {
        refreshMetrics()
      }, config.refreshInterval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [config.autoRefresh, config.refreshInterval, isRealTime])

  const refreshMetrics = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setMetrics(prev => ({
      ...prev,
      blockedAttempts: prev.blockedAttempts + Math.floor(Math.random() * 3),
      activeSessions: 40 + Math.floor(Math.random() * 10),
      lastUpdate: new Date().toLocaleTimeString()
    }))

    setIsLoading(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-red-600 bg-red-100'
      case 'investigating':
        return 'text-yellow-600 bg-yellow-100'
      case 'resolved':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (!config.showResolved && alert.status === 'resolved') {
      return false
    }

    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 }
    const thresholdLevel = severityLevels[config.alertThreshold]
    const alertLevel = severityLevels[alert.severity]

    return alertLevel >= thresholdLevel
  })

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Real-time Security Monitoring
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Auto-refresh:</span>
              <button
                onClick={() => setConfig(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  config.autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {config.autoRefresh ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {config.autoRefresh ? 'On' : 'Off'}
              </button>
            </div>
            <button
              onClick={refreshMetrics}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Threats</p>
              <p className="text-xl font-semibold text-gray-900">{metrics.activeThreats}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Blocked Today</p>
              <p className="text-xl font-semibold text-gray-900">{metrics.blockedAttempts}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-xl font-semibold text-gray-900">{metrics.activeSessions}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-lg ${getHealthColor(metrics.systemHealth).replace('text-', 'bg-').replace('bg-', 'bg-').replace('-600', '-100')}`}>
              <Activity className={`w-5 h-5 ${getHealthColor(metrics.systemHealth).split(' ')[0]}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">System Health</p>
              <p className="text-xl font-semibold text-gray-900 capitalize">{metrics.systemHealth}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Last updated: {metrics.lastUpdate}
        </div>
      </div>

      {/* Security Metrics */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Security Metrics
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Data Integrity</span>
              <span className="text-sm font-semibold text-gray-900">{metrics.dataIntegrity}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${metrics.dataIntegrity}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Network Security</span>
              <span className="text-sm font-semibold text-gray-900">{metrics.networkSecurity}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${metrics.networkSecurity}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Configuration */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Monitoring Configuration
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Threshold
            </label>
            <select
              value={config.alertThreshold}
              onChange={(e) => setConfig(prev => ({ ...prev, alertThreshold: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="low">Low and above</option>
              <option value="medium">Medium and above</option>
              <option value="high">High and above</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refresh Interval
            </label>
            <select
              value={config.refreshInterval}
              onChange={(e) => setConfig(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="10000">10 seconds</option>
              <option value="30000">30 seconds</option>
              <option value="60000">1 minute</option>
              <option value="300000">5 minutes</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.showResolved}
                onChange={(e) => setConfig(prev => ({ ...prev, showResolved: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Show resolved alerts</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.enableRealTime}
                onChange={(e) => setConfig(prev => ({ ...prev, enableRealTime: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Enable real-time updates</span>
            </label>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Security Alerts ({filteredAlerts.length})
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="1h">Last hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No security alerts matching current criteria</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Source: {alert.source}</span>
                      <span>Time: {alert.timestamp}</span>
                      <span>Systems: {alert.affectedSystems.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {alert.status === 'active' && (
                      <button className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700">
                        Investigate
                      </button>
                    )}
                    {alert.status === 'investigating' && (
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          System Status
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Guardian System</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Operational
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Authentication Service</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Operational
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Monitoring Service</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              Degraded
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}