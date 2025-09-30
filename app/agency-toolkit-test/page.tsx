import { Metadata } from 'next'
import { AgencyToolkitDashboard } from './components/AgencyToolkitTestPage'
import './styles/agency-toolkit-dashboard.css'

export const metadata: Metadata = {
  title: 'Agency Toolkit Dashboard - DCT Micro-Apps Platform | Client Management',
  description: 'Main dashboard for the DCT Micro-Apps platform - manage clients, track progress, and access development tools for rapid custom micro-app development.',
  keywords: ['agency dashboard', 'client management', 'micro-apps', 'development tools', 'project tracking', 'DCT platform'],
}

export default function Page() {
  return <AgencyToolkitDashboard />
}
