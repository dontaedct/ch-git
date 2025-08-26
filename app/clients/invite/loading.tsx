import { Skeleton } from "@/components/ui/skeleton"

export default function InviteClientsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="space-y-4">
            {/* Search Skeleton */}
            <div className="relative">
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Client List Skeleton */}
            <div className="border rounded-lg">
              <div className="p-3 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
              
              <div className="h-64 p-2 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2">
                    <Skeleton className="w-4 h-4" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-24 w-full" />
            </div>

            {/* Actions Skeleton */}
            <div className="flex justify-end gap-3 pt-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
