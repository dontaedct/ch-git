export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 md:text-5xl">
            Get the consultation you need
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto md:text-xl">
            Professional consultation services tailored to your needs. Start your journey with a free consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/questionnaire"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Start free consultation
            </Link>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
        
        <div className="mt-16 pt-16 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Expert guidance</h3>
              <p className="text-gray-600">Professional consultation from experienced experts in their field.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Personalized approach</h3>
              <p className="text-gray-600">Tailored solutions that match your specific requirements and goals.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Results focused</h3>
              <p className="text-gray-600">Proven methodology designed to deliver measurable outcomes.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}