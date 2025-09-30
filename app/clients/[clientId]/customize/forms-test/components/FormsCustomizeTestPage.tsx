'use client'

import { useState } from 'react'
import { SharedDashboardLayout } from '../../../../../components/dashboard/SharedDashboardLayout'
import { FormBuilder } from '../sections/FormBuilder'

export function FormsCustomizeTestPage() {
  const [activeView, setActiveView] = useState('forms')

  return (
    <SharedDashboardLayout
      activeView={activeView}
      onViewChange={setActiveView}
      title="Form Builder - TechCorp Solutions"
      description="Create and customize forms specifically for TechCorp Solutions"
    >
      <FormBuilder />
    </SharedDashboardLayout>
  )
}
