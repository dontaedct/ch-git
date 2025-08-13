import { Skeleton } from "@/components/ui/skeleton"

export default function CheckInLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Skeleton */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-4">
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

        {/* Check-in Form Skeleton */}
        <div className="max-w-2xl mx-auto">
          <div className="card p-8">
            <Skeleton className="h-6 w-32 mb-8" />
            
            {/* Mood Rating Skeleton */}
            <div className="mb-8">
              <Skeleton className="h-5 w-24 mb-4" />
              <div className="flex justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-12 rounded-full" />
                ))}
              </div>
            </div>

            {/* Energy Level Skeleton */}
            <div className="mb-8">
              <Skeleton className="h-5 w-28 mb-4" />
              <div className="flex justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-12 rounded-full" />
                ))}
              </div>
            </div>

            {/* Form Fields Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>

            {/* Notes Skeleton */}
            <div className="mb-8">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>

            {/* Submit Button Skeleton */}
            <Skeleton className="h-12 w-32 mx-auto" />
          </div>
        </div>
      </main>
    </div>
  )
}
