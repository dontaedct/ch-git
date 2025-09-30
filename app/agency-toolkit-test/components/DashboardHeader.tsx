'use client'

import { 
  Bell, 
  Search, 
  User, 
  Settings,
  Plus,
  Filter,
  Download
} from 'lucide-react'

interface DashboardHeaderProps {
  activeView: string
  selectedClient: any
}

export function DashboardHeader({ activeView, selectedClient }: DashboardHeaderProps) {
  const getViewTitle = () => {
    switch (activeView) {
      case 'clients':
        return 'Client Management'
      case 'workspace':
        return selectedClient ? `${selectedClient.name} - Workspace` : 'Client Workspace'
      case 'monitoring':
        return 'System Monitoring'
      case 'admin':
        return 'Admin Panel'
      case 'tools':
        return 'Development Tools'
      default:
        return 'Dashboard'
    }
  }

  const getViewDescription = () => {
    switch (activeView) {
      case 'clients':
        return 'Manage clients, track projects, and monitor progress'
      case 'workspace':
        return selectedClient ? `Development workspace for ${selectedClient.name}` : 'Select a client to access their workspace'
      case 'monitoring':
        return 'Monitor system health, performance, and errors'
      case 'admin':
        return 'Agency-level management and configuration'
      case 'tools':
        return 'Access client-scoped development tools and utilities'
      default:
        return 'Main dashboard overview'
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{getViewTitle()}</h1>
          <p className="text-sm text-gray-600 mt-1">{getViewDescription()}</p>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients, projects, or tools..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {activeView === 'clients' && (
            <>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                <Plus className="w-4 h-4" />
                <span>New Client</span>
              </button>
            </>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">Agency Admin</div>
                <div className="text-gray-500">admin@dct.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
