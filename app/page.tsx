import Link from 'next/link';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { PublicNav } from '@components/Nav/PublicNav';

export default function Home() {
  const showPublicLanding = process.env.NEXT_PUBLIC_PUBLIC_LANDING !== "0";
  
  if (!showPublicLanding) {
    // Fallback to redirect behavior if flag is disabled
    return (
      <>
        <PublicNav />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Redirecting...</h1>
            <p className="text-gray-600 mb-6">Taking you to the client portal</p>
            <Link href="/client-portal">
              <Button>Go to Client Portal</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <PublicNav />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-12 sm:mb-16">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Another Level — Coach Hub
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              The complete platform for fitness trainers to manage clients, deliver training plans, and track progress—all from one streamlined app.
            </p>
          </div>

          {/* Primary Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Client Portal</span>
                </CardTitle>
                <CardDescription>
                  Access your personalized client dashboard and training plans.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/client-portal">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Enter Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>New Client Intake</span>
                </CardTitle>
                <CardDescription>
                  Start your fitness journey with our comprehensive intake form.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/intake">
                  <Button variant="outline" className="w-full">
                    Begin Intake
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Group Sessions</span>
                </CardTitle>
                <CardDescription>
                  View and join group training sessions (coach access required).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/sessions">
                  <Button variant="outline" className="w-full">
                    View Sessions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>System Status: Operational</span>
              <Link href="/api/health" className="text-blue-600 hover:underline">
                View Details
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}