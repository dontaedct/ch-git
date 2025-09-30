'use client'

import { 
  Settings, 
  Users, 
  Shield, 
  Database,
  Globe,
  Mail,
  Bell,
  Key,
  Server,
  Activity,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export function AdminPanel() {
  const systemSettings = [
    {
      category: 'General',
      icon: Settings,
      settings: [
        { name: 'Platform Name', value: 'DCT Micro-Apps', type: 'text' },
        { name: 'Default Timezone', value: 'UTC-8 (PST)', type: 'select' },
        { name: 'Maintenance Mode', value: false, type: 'toggle' },
        { name: 'Debug Mode', value: false, type: 'toggle' }
      ]
    },
    {
      category: 'Security',
      icon: Shield,
      settings: [
        { name: 'Two-Factor Authentication', value: true, type: 'toggle' },
        { name: 'Session Timeout', value: '30 minutes', type: 'select' },
        { name: 'Password Policy', value: 'Strong', type: 'select' },
        { name: 'IP Whitelist', value: false, type: 'toggle' }
      ]
    },
    {
      category: 'Database',
      icon: Database,
      settings: [
        { name: 'Connection Pool Size', value: '20', type: 'number' },
        { name: 'Query Timeout', value: '30 seconds', type: 'select' },
        { name: 'Backup Frequency', value: 'Daily', type: 'select' },
        { name: 'Auto Vacuum', value: true, type: 'toggle' }
      ]
    },
    {
      category: 'Email',
      icon: Mail,
      settings: [
        { name: 'SMTP Server', value: 'smtp.gmail.com', type: 'text' },
        { name: 'SMTP Port', value: '587', type: 'number' },
        { name: 'Email Templates', value: true, type: 'toggle' },
        { name: 'Rate Limiting', value: '100/hour', type: 'select' }
      ]
    }
  ]

  const userRoles = [
    {
      name: 'Super Admin',
      description: 'Full system access',
      users: 1,
      permissions: ['All permissions'],
      color: 'bg-red-100 text-red-800'
    },
    {
      name: 'Agency Admin',
      description: 'Agency management access',
      users: 3,
      permissions: ['Client management', 'User management', 'System monitoring'],
      color: 'bg-purple-100 text-purple-800'
    },
    {
      name: 'Developer',
      description: 'Development and deployment access',
      users: 5,
      permissions: ['Client workspace', 'Form builder', 'Deployment'],
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Client',
      description: 'Client-specific access',
      users: 24,
      permissions: ['View own workspace', 'Submit forms'],
      color: 'bg-green-100 text-green-800'
    }
  ]

  const systemInfo = [
    { label: 'Platform Version', value: '3.0.0' },
    { label: 'Node.js Version', value: '20.10.0' },
    { label: 'Database Version', value: 'PostgreSQL 15.4' },
    { label: 'Last Update', value: '2024-01-15' },
    { label: 'Uptime', value: '15 days, 8 hours' },
    { label: 'Memory Usage', value: '2.4 GB / 8 GB' },
    { label: 'CPU Usage', value: '23%' },
    { label: 'Disk Usage', value: '45 GB / 100 GB' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-600 mt-1">Manage system settings, users, and configurations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">33</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">98%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">45%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Settings */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h3>
            <div className="space-y-8">
              {systemSettings.map((category) => {
                const Icon = category.icon
                return (
                  <div key={category.category}>
                    <div className="flex items-center space-x-2 mb-4">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-900">{category.category}</h4>
                    </div>
                    <div className="space-y-4">
                      {category.settings.map((setting) => (
                        <div key={setting.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900">{setting.name}</h5>
                            <p className="text-sm text-gray-500">Current value: {setting.value}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {setting.type === 'toggle' ? (
                              <button className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                                setting.value ? 'bg-purple-600' : 'bg-gray-300'
                              }`}>
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                                  setting.value ? 'translate-x-6' : 'translate-x-0.5'
                                }`}></div>
                              </button>
                            ) : (
                              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200">
                                Edit
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* User Roles & System Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">User Roles</h3>
            <div className="space-y-4">
              {userRoles.map((role) => (
                <div key={role.name} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{role.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                      {role.users} users
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                  <div className="space-y-1">
                    {role.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-gray-500">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Information</h3>
            <div className="space-y-3">
              {systemInfo.map((info) => (
                <div key={info.label} className="flex justify-between">
                  <span className="text-sm text-gray-600">{info.label}</span>
                  <span className="text-sm font-medium text-gray-900">{info.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Actions</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Key className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Reset API Keys</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Security Audit</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Database className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Backup Database</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Test Notifications</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Maintenance</h3>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Scheduled Maintenance</span>
              </div>
              <p className="text-sm text-yellow-700">System maintenance scheduled for January 20, 2024 at 2:00 AM PST</p>
            </div>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Server className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Clear Cache</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Activity className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Optimize Database</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <RefreshCw className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Restart Services</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
