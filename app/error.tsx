'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚨 Route Error</h1>
          <p className="text-gray-700 mb-4">Something went wrong on this page:</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 font-mono break-words">{error.message}</p>
          </div>
          <button 
            onClick={() => reset()} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
