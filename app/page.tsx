export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Coach Hub
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Your comprehensive personal training management platform. Streamline client management, 
            track progress, and deliver exceptional coaching experiences.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Client Portal Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Client Portal</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Access your personalized dashboard, track progress, and manage your training journey.
              </p>
              <a 
                href="/client-portal"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Access Portal →
              </a>
            </div>

            {/* New Client Intake Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">New Client Intake</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Start your fitness journey with our comprehensive intake process and assessment.
              </p>
              <a 
                href="/intake"
                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
              >
                Get Started →
              </a>
            </div>

            {/* Group Sessions Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Group Sessions</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Join our community training sessions and connect with fellow fitness enthusiasts.
              </p>
              <a 
                href="/sessions"
                className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                View Sessions →
              </a>
            </div>
          </div>

          {/* Conditional AI Live Link */}
          {process.env.NEXT_PUBLIC_ENABLE_AI_LIVE === '1' && (
            <div className="mt-12 text-center">
              <a 
                href="/ai/live"
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Try AI Live Assistant
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}