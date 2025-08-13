import { Skeleton } from "@/components/ui/skeleton"

export default function SessionsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Skeleton */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex items-center space-x-6">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        {/* Page Header Skeleton */}
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-96 mx-auto mb-6" />
          <Skeleton className="h-6 w-2xl mx-auto" />
        </div>

        {/* Sessions List Skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {/* Session Title */}
                  <div className="flex items-center space-x-3 mb-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  
                  {/* Session Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                
                {/* Actions */}
                <div className="flex space-x-2 ml-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
              
              {/* Client List */}
              <div className="border-t pt-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, clientIndex) => (
                    <Skeleton key={clientIndex} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
