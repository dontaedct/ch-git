import { requireCoachWithLoading } from '@lib/auth/roles'
import { VerifyingAccessShell } from '@ui/VerifyingAccessShell'
import { ProtectedNav } from '@components/Nav/ProtectedNav';
import Link from 'next/link';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  // Server-side authentication with loading state support
  const authResult = await requireCoachWithLoading()
  
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
              <CardTitle className="text-xl text-gray-800">Coach Access Required</CardTitle>
              <CardDescription>
                Only coaches can access the sessions management page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-500 py-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm">Coach role required</p>
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
  
  const { coachId } = authResult.data
  
  return (
    <>
      <ProtectedNav userRole="coach" userName={`Coach ${coachId.slice(0, 8)}`} />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">Sessions Management</h1>
          <div className="text-center text-gray-600">
            <p>Coach ID: {coachId}</p>
            <p>Welcome to the sessions management page.</p>
            <p className="mt-4">Session management functionality will be implemented here.</p>
          </div>
        </div>
      </main>
    </>
  );
}
