'use client'

import { 
  Wrench, 
  Code, 
  FileText, 
  Palette, 
  Workflow, 
  TestTube, 
  Rocket,
  Database,
  Globe,
  Mail,
  Settings,
  Play,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react'

export function DevelopmentTools() {
  const tools = [
    {
      id: 'forms',
      title: 'Form Builder',
      description: 'Create and customize client forms with 21 field types',
      icon: FileText,
      status: 'active',
      clients: 24,
      lastUsed: '2 hours ago',
      category: 'Forms'
    },
    {
      id: 'theming',
      title: 'Brand Customization',
      description: 'Apply client branding and visual identity',
      icon: Palette,
      status: 'active',
      clients: 18,
      lastUsed: '1 hour ago',
      category: 'Design'
    },
    {
      id: 'workflows',
      title: 'Workflow Automation',
      description: 'Configure n8n workflows and automation',
      icon: Workflow,
      status: 'active',
      clients: 12,
      lastUsed: '3 hours ago',
      category: 'Automation'
    },
    {
      id: 'testing',
      title: 'Testing & QA',
      description: 'Test and validate client applications',
      icon: TestTube,
      status: 'active',
      clients: 8,
      lastUsed: '4 hours ago',
      category: 'Quality'
    },
    {
      id: 'deploy',
      title: 'Deployment',
      description: 'Deploy client applications to production',
      icon: Rocket,
      status: 'active',
      clients: 15,
      lastUsed: '1 hour ago',
      category: 'Deployment'
    },
    {
      id: 'database',
      title: 'Database Manager',
      description: 'Manage client databases and schemas',
      icon: Database,
      status: 'active',
      clients: 20,
      lastUsed: '30 minutes ago',
      category: 'Database'
    },
    {
      id: 'api',
      title: 'API Explorer',
      description: 'Explore and test client APIs',
      icon: Code,
      status: 'active',
      clients: 16,
      lastUsed: '2 hours ago',
      category: 'Development'
    },
    {
      id: 'email',
      title: 'Email Templates',
      description: 'Create and manage email templates',
      icon: Mail,
      status: 'active',
      clients: 22,
      lastUsed: '1 hour ago',
      category: 'Communication'
    }
  ]

  const categories = ['All', 'Forms', 'Design', 'Automation', 'Quality', 'Deployment', 'Database', 'Development', 'Communication']

  const recentActivity = [
    {
      id: 1,
      tool: 'Form Builder',
      action: 'Created contact form',
      client: 'TechCorp Solutions',
      time: '2 hours ago',
      icon: FileText
    },
    {
      id: 2,
      tool: 'Brand Customization',
      action: 'Updated color scheme',
      client: 'HealthPlus Clinic',
      time: '3 hours ago',
      icon: Palette
    },
    {
      id: 3,
      tool: 'Deployment',
      action: 'Deployed to production',
      client: 'FinanceFlow Inc',
      time: '4 hours ago',
      icon: Rocket
    },
    {
      id: 4,
      tool: 'Workflow Automation',
      action: 'Configured email workflow',
      client: 'RetailMax Store',
      time: '5 hours ago',
      icon: Workflow
    },
    {
      id: 5,
      tool: 'Testing & QA',
      action: 'Completed quality check',
      client: 'TechCorp Solutions',
      time: '6 hours ago',
      icon: TestTube
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Development Tools</h2>
          <p className="text-gray-600 mt-1">Access client-scoped development tools and utilities</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
          <Plus className="w-4 h-4" />
          <span>Add Tool</span>
        </button>
      </div>

      {/* Tool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tools</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Tools</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Response</p>
              <p className="text-2xl font-bold text-gray-900">120ms</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tools Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Available Tools</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <div key={tool.id} className="p-6 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{tool.title}</h4>
                            <p className="text-sm text-gray-500">{tool.category}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                          {tool.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{tool.clients} clients</span>
                        <span>Last used: {tool.lastUsed}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                          <Play className="w-4 h-4" />
                          <span>Launch</span>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.tool} • {activity.client}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <Download className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Export Tool Configs</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Import Tool Configs</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Tool Settings</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <Eye className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Usage Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
