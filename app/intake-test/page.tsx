import { Metadata } from 'next'
import { IntakeTestPage } from './components/IntakeTestPage'
import '../../styles/dashboard-shared.css'

export const metadata: Metadata = {
  title: 'Client Intake Test - DCT Micro-Apps Platform | New Client Project Initialization',
  description: 'Comprehensive client intake form for new client project initialization. Fill out client information, requirements, and automatically execute DCT CLI setup.',
  keywords: ['client intake', 'new client', 'project initialization', 'DCT CLI', 'client onboarding', 'micro-apps'],
}

export default function Page() {
  return <IntakeTestPage />
}
