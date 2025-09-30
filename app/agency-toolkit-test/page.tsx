import { Metadata } from 'next'
import { AgencyToolkitTestPage } from './components/AgencyToolkitTestPage'
import './styles/agency-toolkit-test.css'

export const metadata: Metadata = {
  title: 'Agency Toolkit Test - DCT Micro-Apps Platform | Rapid Custom Development',
  description: 'Test the DCT Micro-Apps platform - a sophisticated, enterprise-grade toolkit for rapid custom micro-app development (≤7 days) with AI-assisted development capabilities.',
  keywords: ['agency toolkit', 'micro-apps', 'rapid development', 'custom software', 'enterprise toolkit', 'DCT platform'],
}

export default function Page() {
  return <AgencyToolkitTestPage />
}
