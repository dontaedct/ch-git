import { requireClientWithLoading } from '@lib/auth/roles'
import { getClientPortalDataStub } from '@/data/client-portal.data'
import { VerifyingAccessShell } from '@ui/VerifyingAccessShell'
import { ProtectedNav } from '@components/Nav/ProtectedNav';
import Link from 'next/link';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';

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
      <>
        <ProtectedNav />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-gray-800">Access Required</CardTitle>
              <CardDescription>
                Please sign in to access your client portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-500 py-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm">Authentication required</p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
                <Link href="/intake">
                  <Button variant="outline" className="w-full">
                    New Client Intake
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }
  
  const { clientId, coachId } = authResult.data
  
  // Server-side data fetching using stub data
  const data = await getClientPortalDataStub(clientId)
  
  // Render a simple server component instead of importing client component
  return (
    <>
      <ProtectedNav userRole="client" userName={`Client ${clientId.slice(0, 8)}`} />
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
    </>
  )
}
