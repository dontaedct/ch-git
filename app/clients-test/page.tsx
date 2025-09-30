import { Metadata } from 'next'
import { ClientsTestPage } from './components/ClientsTestPage'
import '../../styles/dashboard-shared.css'

export const metadata: Metadata = {
  title: 'Client Selection Test - DCT Micro-Apps Platform | Choose Client to Work On',
  description: 'Select or create a client to work on their dedicated micro-app workspace. Manage client projects and access client-specific development environments.',
  keywords: ['client selection', 'workspace access', 'client management', 'micro-apps', 'DCT platform'],
}

export default function Page() {
  return <ClientsTestPage />
}
