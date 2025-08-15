import { Suspense } from 'react'
import { requireClientWithLoading } from '@lib/auth/roles'
import { CheckInPageContent } from './CheckInPageContent'
import { VerifyingAccessShell } from '@ui/VerifyingAccessShell'
import CheckInLoading from './loading'

export default async function CheckInPage() {
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
          <p className="text-gray-600">Only clients can access the check-in page.</p>
        </div>
      </div>
    )
  }
  
  const { clientId, coachId } = authResult.data
  
  return (
    <Suspense fallback={<CheckInLoading />}>
      <CheckInPageContent 
        initialClientId={clientId}
        initialCoachId={coachId}
      />
    </Suspense>
  )
}
