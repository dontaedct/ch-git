export default function ProgressLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <div className="space-y-6">
          {/* Client Header Skeleton */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Key Metrics Skeleton */}
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                <div className="h-2 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Charts Row Skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Weekly Plan Status Skeleton */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              <div>
                <div className="h-5 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Check-ins Skeleton */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
