export const dynamic = "force-dynamic";

import Link from 'next/link';

export default async function SessionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Group Sessions</h1>
          <p className="text-lg text-gray-600">
            Join our community training sessions and connect with fellow fitness enthusiasts.
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">
            Sessions functionality is coming soon. This page will show available group training sessions.
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
