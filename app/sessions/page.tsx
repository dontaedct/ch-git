import { requireCoachWithLoading } from '@lib/auth/roles'
import { VerifyingAccessShell } from '@ui/VerifyingAccessShell'

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  // Server-side authentication with loading state support
  const authResult = await requireCoachWithLoading()
  
  if (authResult.status === 'loading') {
    return <VerifyingAccessShell />
  }
  
  if (authResult.status === 'unauthorized') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only coaches can access the sessions page.</p>
        </div>
      </div>
    )
  }
  
  const { coachId } = authResult.data
  
  return (
    <main style={{ padding: 24 }}>
      <h1>Sessions</h1>
      <p>Coach ID: {coachId}</p>
      <p>Welcome to the sessions management page.</p>
    </main>
  );
}
