'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console when debug flag is set
    if (process.env.NEXT_PUBLIC_DEBUG === '1') {
      console.error('Global error caught:', error);
    }
  }, [error]);

  const isDebugMode = process.env.NEXT_PUBLIC_DEBUG === '1';

  return (
    <html>
      <body className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200">
              <h1 className="text-3xl font-bold text-red-600 mb-4">
                🚨 Critical Application Error
              </h1>
              
              <p className="text-gray-700 mb-6">
                {isDebugMode 
                  ? "An uncaught error occurred in the application. Check the console for details."
                  : "Something went wrong. Please try reloading the application."
                }
              </p>

              {isDebugMode && (
                <>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                    <p className="text-sm text-red-700 font-mono break-words mb-2">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-red-600">
                        Digest: {error.digest}
                      </p>
                    )}
                  </div>
                  
                  {error.stack && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left max-h-64 overflow-y-auto">
                      <h3 className="font-semibold text-gray-800 mb-2">Stack Trace:</h3>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => reset()}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  🔄 Try Again
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  🔄 Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
