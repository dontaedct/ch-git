'use client'

import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  Settings,
  Code,
  FileText,
  Palette,
  Workflow,
  TestTube,
  Rocket,
  Users,
  BarChart3,
  Activity
} from 'lucide-react'

interface ClientWorkspaceProps {
  client: any
}

export function ClientWorkspace({ client }: ClientWorkspaceProps) {
  // Mock client data if none selected
  const mockClient = client || {
    id: 1,
    name: 'TechCorp Solutions',
    industry: 'Technology',
    status: 'active',
    progress: 75,
    daysRemaining: 3,
    budget: '$15,000',
    timeline: '7 days'
  }

  const milestones = [
    { id: 1, title: 'Project Initialization', status: 'completed', date: 'Day 1' },
    { id: 2, title: 'Requirements Gathering', status: 'completed', date: 'Day 2' },
    { id: 3, title: 'Form Builder Setup', status: 'completed', date: 'Day 3' },
    { id: 4, title: 'Brand Customization', status: 'in-progress', date: 'Day 4' },
    { id: 5, title: 'Workflow Configuration', status: 'pending', date: 'Day 5' },
    { id: 6, title: 'Testing & QA', status: 'pending', date: 'Day 6' },
    { id: 7, title: 'Deployment', status: 'pending', date: 'Day 7' }
  ]

  const tools = [
    {
      id: 'forms',
      title: 'Form Builder',
      description: 'Create and customize client forms',
      icon: FileText,
      status: 'completed',
      progress: 100
    },
    {
      id: 'theming',
      title: 'Brand Customization',
      description: 'Apply client branding and styling',
      icon: Palette,
      status: 'in-progress',
      progress: 60
    },
    {
      id: 'workflows',
      title: 'Workflow Automation',
      description: 'Configure n8n workflows',
      icon: Workflow,
      status: 'pending',
      progress: 0
    },
    {
      id: 'testing',
      title: 'Testing & QA',
      description: 'Test and validate functionality',
      icon: TestTube,
      status: 'pending',
      progress: 0
    },
    {
      id: 'deploy',
      title: 'Deployment',
      description: 'Deploy to production',
      icon: Rocket,
      status: 'pending',
      progress: 0
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'in-progress':
        return <Play className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {mockClient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{mockClient.name}</h2>
              <p className="text-gray-600">{mockClient.industry} • {mockClient.budget} • {mockClient.timeline}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{mockClient.daysRemaining} days left</div>
              <div className="text-sm text-gray-500">until delivery</div>
            </div>
            <div className="w-20 h-20 relative">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  strokeDasharray={`${mockClient.progress}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">{mockClient.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Timeline</h3>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {milestone.status === 'completed' ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    ) : milestone.status === 'in-progress' ? (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      <span className="text-sm text-gray-500">{milestone.date}</span>
                    </div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                        {getStatusIcon(milestone.status)}
                        <span className="capitalize">{milestone.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <Code className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">View Source Code</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <Activity className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">View Logs</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Analytics</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Settings</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Forms Created</span>
                <span className="font-semibold text-gray-900">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Workflows Active</span>
                <span className="font-semibold text-gray-900">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Users</span>
                <span className="font-semibold text-gray-900">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Deploy</span>
                <span className="font-semibold text-gray-900">2h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Development Tools */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Development Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <div key={tool.id} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors duration-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Icon className="w-6 h-6 text-gray-400" />
                  <h4 className="font-medium text-gray-900">{tool.title}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{tool.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${tool.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                      {getStatusIcon(tool.status)}
                      <span className="capitalize">{tool.status}</span>
                    </span>
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      {tool.status === 'completed' ? 'View' : 'Open'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
