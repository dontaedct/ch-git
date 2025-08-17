import { FeatureGate } from '@ui/FeatureGate';
import { getTrainerProfileStub } from '@/data/trainer-profile.data'
import { requireCoachWithLoading } from '@lib/auth/roles'
import { VerifyingAccessShell } from '@ui/VerifyingAccessShell'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function TrainerProfilePage() {
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
          <p className="text-gray-600">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    )
  }
  
  // Server-side data fetching using stub data
  const profile = await getTrainerProfileStub()
  
  // Render a simple server component instead of importing client component
  return (
    <FeatureGate flag="trainer-profile">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">Trainer Profile</h1>
          <div className="text-center text-gray-600">
            <p>Trainer profile functionality will be implemented here</p>
            <p className="mt-2">Name: {profile.first_name} {profile.last_name}</p>
            <p>Email: {profile.email}</p>
          </div>
        </div>
      </div>
    </FeatureGate>
  )
}