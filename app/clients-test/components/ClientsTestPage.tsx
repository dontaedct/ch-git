'use client'

import { useState } from 'react'
import { SharedDashboardLayout } from '../../../components/dashboard/SharedDashboardLayout'
import { ClientSelection } from '../sections/ClientSelection'

export function ClientsTestPage() {
  const [activeView, setActiveView] = useState('clients')
  const [selectedClient, setSelectedClient] = useState(null)

  return (
    <SharedDashboardLayout
      activeView={activeView}
      onViewChange={setActiveView}
      selectedClient={selectedClient}
      title="Client Selection & Workspace Access"
      description="Select or create a client to work on their dedicated micro-app workspace"
    >
      <ClientSelection onSelectClient={setSelectedClient} />
    </SharedDashboardLayout>
  )
}
