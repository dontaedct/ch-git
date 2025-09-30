'use client'

import { useState } from 'react'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'
import { ClientWorkspace } from '../sections/ClientWorkspace'
import { ClientManagement } from '../sections/ClientManagement'
import { SystemMonitoring } from '../sections/SystemMonitoring'
import { AdminPanel } from '../sections/AdminPanel'
import { DevelopmentTools } from '../sections/DevelopmentTools'

export function AgencyToolkitDashboard() {
  const [activeView, setActiveView] = useState('clients')
  const [selectedClient, setSelectedClient] = useState(null)

  const renderActiveView = () => {
    switch (activeView) {
      case 'clients':
        return <ClientManagement onSelectClient={setSelectedClient} />
      case 'workspace':
        return <ClientWorkspace client={selectedClient} />
      case 'monitoring':
        return <SystemMonitoring />
      case 'admin':
        return <AdminPanel />
      case 'tools':
        return <DevelopmentTools />
      default:
        return <ClientManagement onSelectClient={setSelectedClient} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader activeView={activeView} selectedClient={selectedClient} />
        <main className="flex-1 p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  )
}
