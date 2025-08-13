import { Skeleton } from "@/components/ui/skeleton"

export default function WeeklyPlansLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Skeleton */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12">
        {/* Page Header Skeleton */}
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>

        {/* Create Plan Button Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-48 mx-auto" />
        </div>

        {/* Plans Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6">
              {/* Plan Header */}
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
              
              {/* Client Info */}
              <div className="mb-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-28" />
              </div>

              {/* Date Range */}
              <div className="mb-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Tasks */}
              <div className="space-y-2 mb-4">
                {Array.from({ length: 3 }).map((_, taskIndex) => (
                  <div key={taskIndex} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-2 w-full" />
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
