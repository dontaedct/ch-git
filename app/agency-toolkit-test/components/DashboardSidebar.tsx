'use client'

import { 
  Users, 
  Briefcase, 
  Activity, 
  Settings, 
  Wrench,
  Home,
  ChevronRight
} from 'lucide-react'

interface DashboardSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function DashboardSidebar({ activeView, onViewChange }: DashboardSidebarProps) {
  const menuItems = [
    {
      id: 'clients',
      label: 'Client Management',
      icon: Users,
      description: 'Manage clients and projects'
    },
    {
      id: 'workspace',
      label: 'Client Workspace',
      icon: Briefcase,
      description: 'Development workspace',
      disabled: false
    },
    {
      id: 'monitoring',
      label: 'System Monitoring',
      icon: Activity,
      description: 'Health and performance'
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: Settings,
      description: 'Agency management'
    },
    {
      id: 'tools',
      label: 'Development Tools',
      icon: Wrench,
      description: 'Client-scoped tools'
    }
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">DCT Toolkit</h1>
            <p className="text-xs text-gray-500">Agency Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          const isDisabled = item.disabled === false ? false : false

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onViewChange(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : isDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-purple-600" />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <div>DCT Micro-Apps Platform</div>
          <div>Version 3.0 - Client-Scoped</div>
        </div>
      </div>
    </div>
  )
}
