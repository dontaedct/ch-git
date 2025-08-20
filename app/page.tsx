export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Coach Hub</h1>
        </div>
      </div>

      {/* Simple content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Personal Training Management Platform
          </h2>
          <p className="text-lg text-gray-600">
            Streamline client management, track progress, and deliver exceptional coaching experiences.
          </p>
        </div>

        {/* Simple cards */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Portal</h3>
            <p className="text-gray-600 mb-4">Access your personalized dashboard and track progress.</p>
            <a href="/client-portal" className="text-blue-600 hover:text-blue-700 font-medium">
              Access Portal →
            </a>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">New Client Intake</h3>
            <p className="text-gray-600 mb-4">Start your fitness journey with our intake process.</p>
            <a href="/intake" className="text-green-600 hover:text-green-700 font-medium">
              Get Started →
            </a>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Group Sessions</h3>
            <p className="text-gray-600 mb-4">Join community training sessions.</p>
            <a href="/sessions" className="text-purple-600 hover:text-purple-700 font-medium">
              View Sessions →
            </a>
          </div>
        </div>

        {/* Conditional AI Live */}
        {process.env.NEXT_PUBLIC_ENABLE_AI_LIVE === '1' && (
          <div className="mt-12 text-center">
            <a 
              href="/ai/live"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
            >
              Try AI Live Assistant
            </a>
          </div>
        )}
      </div>
    </div>
  );
}