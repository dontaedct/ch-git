import { ProgressDashboard } from './progress-dashboard'

interface ProgressDashboardServerProps {
  clientId: string
}

// This component should not import Supabase directly
// Data fetching should be done via API routes or server actions
export async function ProgressDashboardServer({ clientId }: ProgressDashboardServerProps) {
  // TODO: Replace with API call or server action
  // For now, return empty data to avoid build errors
  const initialData = {
    client: null,
    weeklyPlan: null,
    checkIns: [],
    progressMetrics: []
  }

  return <ProgressDashboard _clientId={clientId} initialData={initialData} />
}
