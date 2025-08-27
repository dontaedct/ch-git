import Link from 'next/link';

export default function ConsultationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <Link 
            href="/questionnaire"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Back to questionnaire
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <div className="w-3 h-2 border-b-2 border-l-2 border-white transform -rotate-45 -translate-y-0.5"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your consultation is confirmed!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your interest. We&apos;ll be in touch within 24 hours to schedule your free consultation.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-blue-900 mb-4">What happens next?</h2>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Email confirmation</p>
                  <p className="text-sm text-blue-700">You&apos;ll receive a confirmation email with next steps shortly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Schedule call</p>
                  <p className="text-sm text-blue-700">Our team will reach out to schedule your consultation at a convenient time.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Consultation</p>
                  <p className="text-sm text-blue-700">We&apos;ll discuss your needs and how we can help you achieve your goals.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Consultation details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Duration:</strong> 30-45 minutes</p>
              <p><strong>Format:</strong> Video call or phone (your choice)</p>
              <p><strong>Cost:</strong> Completely free, no obligations</p>
              <p><strong>Focus:</strong> Understanding your needs and providing initial recommendations</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/"
              className="flex-1 text-center px-6 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to home
            </Link>
            <Link 
              href="/login"
              className="flex-1 text-center px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help or have questions?
          </p>
          <p className="text-sm">
            <span className="text-gray-500">Email us at </span>
            <span className="text-blue-600 font-medium">hello@consultation.app</span>
          </p>
        </div>
      </div>
    </div>
  );
}