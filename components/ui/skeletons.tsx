import { cn } from "@/lib/utils"

function SkeletonShimmer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-slate-200/60 rounded-md relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-r",
        "before:from-transparent before:via-white/40 before:to-transparent",
        "before:animate-[shimmer_1.5s_ease-in-out_infinite]",
        className
      )}
      style={{
        // Fallback shimmer animation for browsers that don't support CSS custom animations
        backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite"
      }}
      {...props}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonShimmer className="h-5 w-32" />
          <SkeletonShimmer className="h-4 w-48" />
        </div>
        <SkeletonShimmer className="h-8 w-16 rounded-full" />
      </div>
      <div className="space-y-3">
        <SkeletonShimmer className="h-4 w-full" />
        <SkeletonShimmer className="h-4 w-3/4" />
        <SkeletonShimmer className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2 pt-2">
        <SkeletonShimmer className="h-3 w-3 rounded-full" />
        <SkeletonShimmer className="h-3 w-24" />
      </div>
    </div>
  )
}

function TabsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tab headers */}
      <div className="flex space-x-1 bg-gray-100/80 rounded-lg p-1">
        <SkeletonShimmer className="h-8 w-20 rounded-md" />
        <SkeletonShimmer className="h-8 w-24 rounded-md" />
        <SkeletonShimmer className="h-8 w-28 rounded-md" />
      </div>
      {/* Tab content */}
      <div className="space-y-4">
        <SkeletonShimmer className="h-6 w-48" />
        <div className="space-y-2">
          <SkeletonShimmer className="h-4 w-full" />
          <SkeletonShimmer className="h-4 w-5/6" />
          <SkeletonShimmer className="h-4 w-2/3" />
        </div>
        <div className="grid gap-2 pt-2">
          <SkeletonShimmer className="h-3 w-3/4" />
          <SkeletonShimmer className="h-3 w-2/3" />
          <SkeletonShimmer className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}

function ConsultationSkeleton() {
  return (
    <div className="max-w-5xl mx-auto bg-white space-y-8">
      {/* Header skeleton */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 border-b border-border/30">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-slate-200/40 rounded-2xl">
            <SkeletonShimmer className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <SkeletonShimmer className="h-8 w-64 mx-auto" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <SkeletonShimmer className="h-4 w-32" />
              <SkeletonShimmer className="h-4 w-28" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary skeleton */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <SkeletonShimmer className="h-7 w-48 mx-auto" />
          <div className="space-y-3">
            <SkeletonShimmer className="h-4 w-full" />
            <SkeletonShimmer className="h-4 w-5/6 mx-auto" />
            <SkeletonShimmer className="h-4 w-4/5 mx-auto" />
          </div>
        </div>
      </div>
      
      {/* Tabs skeleton */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="text-center space-y-6">
          <SkeletonShimmer className="h-7 w-56 mx-auto" />
          <div className="max-w-4xl mx-auto">
            <TabsSkeleton />
          </div>
        </div>
      </div>
      
      {/* CTA skeleton */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col gap-4">
            <SkeletonShimmer className="w-full h-12 rounded-lg" />
            <div className="flex gap-3 justify-center">
              <SkeletonShimmer className="h-11 w-32 rounded-lg" />
              <SkeletonShimmer className="h-11 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section Skeleton */}
        <div className="space-y-3">
          <SkeletonShimmer className="h-9 w-72" />
          <SkeletonShimmer className="h-6 w-96" />
        </div>

        {/* Key Metrics Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <SkeletonShimmer className="h-6 w-32" />
            <SkeletonShimmer className="h-5 w-20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <SkeletonShimmer className="h-6 w-32" />
                <SkeletonShimmer className="h-5 w-16" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-5 border border-gray-200/80 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <SkeletonShimmer className="w-10 h-10 rounded-xl" />
                      <SkeletonShimmer className="w-4 h-4" />
                    </div>
                    <SkeletonShimmer className="h-5 w-32" />
                    <SkeletonShimmer className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <SkeletonShimmer className="h-8 w-48" />
              <SkeletonShimmer className="h-5 w-72" />
            </div>
            <div className="flex gap-2">
              <SkeletonShimmer className="h-10 w-24" />
              <SkeletonShimmer className="h-10 w-32" />
            </div>
          </div>

          {/* Plan Selection Tabs */}
          <TabsSkeleton />

          {/* Plan Content */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

export { 
  SkeletonShimmer, 
  CardSkeleton, 
  TabsSkeleton, 
  ConsultationSkeleton, 
  DashboardSkeleton, 
  CatalogSkeleton 
}