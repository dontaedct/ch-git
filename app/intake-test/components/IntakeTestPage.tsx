'use client'

import { useState } from 'react'
import { SharedDashboardLayout } from '../../../components/dashboard/SharedDashboardLayout'
import { ClientIntakeForm } from '../sections/ClientIntakeForm'

export function IntakeTestPage() {
  const [activeView, setActiveView] = useState('intake')

  return (
    <SharedDashboardLayout
      activeView={activeView}
      onViewChange={setActiveView}
      title="Client Intake & Project Initialization"
      description="Comprehensive client intake form for new client project initialization"
    >
      <ClientIntakeForm />
    </SharedDashboardLayout>
  )
}
