'use client'

import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Eye,
  Edit,
  Users,
  Briefcase,
  TrendingUp,
  Star,
  ArrowRight
} from 'lucide-react'

interface ClientSelectionProps {
  onSelectClient: (client: any) => void
}

export function ClientSelection({ onSelectClient }: ClientSelectionProps) {
  // Mock client data
  const clients = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      industry: 'Technology',
      status: 'active',
      progress: 75,
      daysRemaining: 3,
      lastActivity: '2 hours ago',
      budget: '$15,000',
      timeline: '7 days',
      avatar: 'TC',
      color: 'bg-blue-500',
      priority: 'high',
      team: 'Development Team A',
      nextMilestone: 'Brand Customization'
    },
    {
      id: 2,
      name: 'HealthPlus Clinic',
      industry: 'Healthcare',
      status: 'in-progress',
      progress: 45,
      daysRemaining: 5,
      lastActivity: '1 day ago',
      budget: '$25,000',
      timeline: '7 days',
      avatar: 'HP',
      color: 'bg-green-500',
      priority: 'medium',
      team: 'Development Team B',
      nextMilestone: 'Form Builder Setup'
    },
    {
      id: 3,
      name: 'FinanceFlow Inc',
      industry: 'Finance',
      status: 'completed',
      progress: 100,
      daysRemaining: 0,
      lastActivity: '3 days ago',
      budget: '$35,000',
      timeline: '7 days',
      avatar: 'FF',
      color: 'bg-purple-500',
      priority: 'low',
      team: 'Development Team A',
      nextMilestone: 'Project Handover'
    },
    {
      id: 4,
      name: 'RetailMax Store',
      industry: 'Retail',
      status: 'planning',
      progress: 20,
      daysRemaining: 7,
      lastActivity: '5 days ago',
      budget: '$12,000',
      timeline: '7 days',
      avatar: 'RM',
      color: 'bg-orange-500',
      priority: 'medium',
      team: 'Development Team C',
      nextMilestone: 'Requirements Gathering'
    },
    {
      id: 5,
      name: 'EduTech Academy',
      industry: 'Education',
      status: 'active',
      progress: 60,
      daysRemaining: 4,
      lastActivity: '6 hours ago',
      budget: '$18,000',
      timeline: '7 days',
      avatar: 'EA',
      color: 'bg-indigo-500',
      priority: 'high',
      team: 'Development Team B',
      nextMilestone: 'Workflow Configuration'
    },
    {
      id: 6,
      name: 'GreenEnergy Co',
      industry: 'Manufacturing',
      status: 'in-progress',
      progress: 30,
      daysRemaining: 6,
      lastActivity: '2 days ago',
      budget: '$22,000',
      timeline: '7 days',
      avatar: 'GE',
      color: 'bg-emerald-500',
      priority: 'medium',
      team: 'Development Team A',
      nextMilestone: 'Form Customization'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'in-progress':
        return <Play className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'planning':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Selection & Workspace Access</h2>
          <p className="text-gray-600 mt-1">Select or create a client to work on their dedicated micro-app workspace</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
          <Plus className="w-4 h-4" />
          <span>New Client</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
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
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">16</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Delivery</p>
              <p className="text-2xl font-bold text-gray-900">5.2 days</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Plus className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Create New Client</div>
              <div className="text-sm text-gray-500">Start a new project</div>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">View All Projects</div>
              <div className="text-sm text-gray-500">See project overview</div>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Analytics Dashboard</div>
              <div className="text-sm text-gray-500">View performance metrics</div>
            </div>
          </button>
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
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 transition-all duration-200 hover:shadow-lg">
            {/* Client Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${client.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                  {client.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-500">{client.industry}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(client.priority)}`}>
                {client.priority}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{client.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${client.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Status and Timeline */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                {getStatusIcon(client.status)}
                <span className="capitalize">{client.status}</span>
              </span>
              <div className="text-sm text-gray-500">
                {client.daysRemaining} days left
              </div>
            </div>

            {/* Client Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Budget</span>
                <span className="font-medium text-gray-900">{client.budget}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Team</span>
                <span className="font-medium text-gray-900">{client.team}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Milestone</span>
                <span className="font-medium text-gray-900">{client.nextMilestone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Activity</span>
                <span className="font-medium text-gray-900">{client.lastActivity}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onSelectClient(client)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                <Eye className="w-4 h-4" />
                <span>Open Workspace</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">TechCorp Solutions - Brand customization completed</p>
              <p className="text-xs text-gray-500">2 hours ago • Development Team A</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Play className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">HealthPlus Clinic - Form builder setup in progress</p>
              <p className="text-xs text-gray-500">1 day ago • Development Team B</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">FinanceFlow Inc - Project handover completed</p>
              <p className="text-xs text-gray-500">3 days ago • Development Team A</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
