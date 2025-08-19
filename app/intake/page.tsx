import { PublicNav } from '@components/Nav/PublicNav';
import Link from 'next/link';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';

export default function IntakePage() {
  return (
    <>
      <PublicNav />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Client Intake Form</h1>
              <p className="text-gray-600">
                Welcome to Coach Hub! Please fill out this form to get started with your fitness journey.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>New Client Registration</CardTitle>
                <CardDescription>
                  This form will be processed by our team and you'll receive a welcome email shortly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">Intake Form Coming Soon</p>
                    <p className="text-sm">Our comprehensive intake form is being finalized.</p>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Link href="/">
                      <Button variant="outline">
                        Back to Home
                      </Button>
                    </Link>
                    <Link href="/client-portal">
                      <Button>
                        Go to Client Portal
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
