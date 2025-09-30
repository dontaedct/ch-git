'use client'

import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Server,
  Database,
  Globe,
  Users,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react'

export function SystemMonitoring() {
  const systemHealth = {
    overall: 98,
    uptime: '99.9%',
    responseTime: '120ms',
    errorRate: '0.02%'
  }

  const services = [
    {
      name: 'API Gateway',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '45ms',
      lastCheck: '2 minutes ago'
    },
    {
      name: 'Database',
      status: 'healthy',
      uptime: '99.8%',
      responseTime: '12ms',
      lastCheck: '1 minute ago'
    },
    {
      name: 'Authentication',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '23ms',
      lastCheck: '3 minutes ago'
    },
    {
      name: 'File Storage',
      status: 'warning',
      uptime: '99.5%',
      responseTime: '89ms',
      lastCheck: '5 minutes ago'
    },
    {
      name: 'Email Service',
      status: 'healthy',
      uptime: '99.7%',
      responseTime: '156ms',
      lastCheck: '4 minutes ago'
    },
    {
      name: 'n8n Workflows',
      status: 'healthy',
      uptime: '99.6%',
      responseTime: '234ms',
      lastCheck: '6 minutes ago'
    }
  ]

  const metrics = [
    {
      title: 'Active Users',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'API Requests',
      value: '45.2K',
      change: '+8%',
      trend: 'up',
      icon: Zap
    },
    {
      title: 'Database Queries',
      value: '12.8K',
      change: '-3%',
      trend: 'down',
      icon: Database
    },
    {
      title: 'Error Rate',
      value: '0.02%',
      change: '-15%',
      trend: 'down',
      icon: AlertTriangle
    }
  ]

  const recentAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'File storage response time increased',
      time: '5 minutes ago',
      service: 'File Storage'
    },
    {
      id: 2,
      type: 'info',
      message: 'Scheduled maintenance completed',
      time: '2 hours ago',
      service: 'System'
    },
    {
      id: 3,
      type: 'success',
      message: 'New client workspace created',
      time: '3 hours ago',
      service: 'Client Management'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      case 'error':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Monitoring</h2>
          <p className="text-gray-600 mt-1">Monitor system health, performance, and errors</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Health</p>
              <p className="text-2xl font-bold text-gray-900">{systemHealth.overall}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{systemHealth.uptime}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{systemHealth.responseTime}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900">{systemHealth.errorRate}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Status */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Status</h3>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Server className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-500">Last check: {service.lastCheck}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{service.uptime}</div>
                      <div className="text-xs text-gray-500">{service.responseTime}</div>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)}
                      <span className="capitalize">{service.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Alerts</h3>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 border rounded-lg ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                      {alert.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                      {alert.type === 'info' && <Activity className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs mt-1">{alert.service} • {alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
            <div className="space-y-4">
              {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <div key={metric.title} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{metric.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{metric.value}</span>
                      <span className={`text-sm flex items-center space-x-1 ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{metric.change}</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Logs</h3>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
          <div className="space-y-1">
            <div>[2024-01-15 14:30:25] INFO: Client workspace created for TechCorp Solutions</div>
            <div>[2024-01-15 14:28:12] INFO: Form builder initialized successfully</div>
            <div>[2024-01-15 14:25:45] INFO: Database connection established</div>
            <div>[2024-01-15 14:23:18] INFO: API Gateway health check passed</div>
            <div>[2024-01-15 14:20:33] INFO: System startup completed</div>
            <div>[2024-01-15 14:18:07] INFO: Loading client configurations</div>
            <div>[2024-01-15 14:15:42] INFO: Initializing DCT Micro-Apps platform</div>
          </div>
        </div>
      </div>
    </div>
  )
}
