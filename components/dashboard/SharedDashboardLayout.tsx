'use client'

import { ReactNode } from 'react'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'

interface SharedDashboardLayoutProps {
  children: ReactNode
  activeView: string
  onViewChange: (view: string) => void
  selectedClient?: any
  title: string
  description: string
}

export function SharedDashboardLayout({ 
  children, 
  activeView, 
  onViewChange, 
  selectedClient, 
  title, 
  description 
}: SharedDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar activeView={activeView} onViewChange={onViewChange} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          activeView={activeView} 
          selectedClient={selectedClient}
          title={title}
          description={description}
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
