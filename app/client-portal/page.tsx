import { requireClientWithLoading } from '@lib/auth/roles'
import { getClientPortalDataStub } from '@/data/client-portal.data'
import { VerifyingAccessShell } from '@ui/VerifyingAccessShell'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function ClientPortalPage() {
  // Server-side authentication with loading state support
  const authResult = await requireClientWithLoading()
  
  if (authResult.status === 'loading') {
    return <VerifyingAccessShell />
  }
  
  if (authResult.status === 'unauthorized') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    )
  }
  
  const { clientId, coachId } = authResult.data
  
  // Server-side data fetching using stub data
  const data = await getClientPortalDataStub(clientId)
  
  // Render a simple server component instead of importing client component
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Client Portal</h1>
        <div className="text-center text-gray-600">
          <p>Client portal functionality will be implemented here</p>
          <p className="mt-2">Client ID: {clientId}</p>
          <p>Coach ID: {coachId}</p>
          <p>Check-ins: {data.checkIns.length}</p>
          <p>Progress metrics: {data.progressMetrics.length}</p>
        </div>
      </div>
    </div>
  )
}
