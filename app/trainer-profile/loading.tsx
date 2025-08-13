import { Skeleton } from "@/components/ui/skeleton"

export default function TrainerProfileLoading() {
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

        {/* Profile Form Skeleton */}
        <div className="max-w-4xl mx-auto">
          <div className="card p-8">
            <Skeleton className="h-6 w-32 mb-8" />
            
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>

            {/* Bio Section */}
            <div className="mb-8">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>

            {/* Specialties Section */}
            <div className="mb-8">
              <Skeleton className="h-5 w-24 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* Certifications Section */}
            <div className="mb-8">
              <Skeleton className="h-5 w-28 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
                <Skeleton className="h-10 w-40" />
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>

            {/* Submit Button Skeleton */}
            <div className="text-center">
              <Skeleton className="h-12 w-32 mx-auto" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
