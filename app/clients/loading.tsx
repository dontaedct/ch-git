import { Skeleton } from "@/components/ui/skeleton"

export default function ClientsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
