'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

// Import all our new state components
import {
  SkeletonShimmer,
  CardSkeleton,
  TabsSkeleton,
  ConsultationSkeleton,
  DashboardSkeleton,
  CatalogSkeleton
} from '@/components/ui/skeletons'

import {
  DashboardEmptyState,
  ConsultationsEmptyState,
  ModulesEmptyState,
  CatalogEmptyState,
  SearchEmptyState,
  InboxEmptyState,
  ReportsEmptyState,
  ClientsEmptyState,
  DocumentsEmptyState,
  FirstRunEmptyState,
  LoadingEmptyState,
  GenericListEmptyState
} from '@/components/empty-states'

import {
  ErrorBlock,
  NetworkErrorBlock,
  ServerErrorBlock,
  AuthErrorBlock,
  NotFoundErrorBlock,
  ValidationErrorBlock,
  InlineError,
  LoadingErrorBlock
} from '@/components/ui/error-block'

export default function StatesDemo() {
  const [retryCount, setRetryCount] = useState(0)

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Empty, Loading & Error States Demo
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive showcase of all loading states, empty states, and error handling components 
              designed for this application.
            </p>
            <Badge variant="outline" className="text-xs">
              UI State Management System
            </Badge>
          </div>

          <Tabs defaultValue="skeleton" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="skeleton">Skeleton Loaders</TabsTrigger>
              <TabsTrigger value="empty">Empty States</TabsTrigger>
              <TabsTrigger value="errors">Error States</TabsTrigger>
              <TabsTrigger value="page-examples">Page Examples</TabsTrigger>
            </TabsList>

            {/* Skeleton Loaders */}
            <TabsContent value="skeleton" className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Skeleton Loaders</h2>
                <div className="space-y-8">
                  
                  {/* Basic Shimmer */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Shimmer Elements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <SkeletonShimmer className="h-4 w-full" />
                        <SkeletonShimmer className="h-4 w-3/4" />
                        <SkeletonShimmer className="h-4 w-1/2" />
                      </div>
                      <div className="flex gap-2">
                        <SkeletonShimmer className="h-8 w-20" />
                        <SkeletonShimmer className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card Skeleton */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Card Skeleton</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <CardSkeleton />
                        <CardSkeleton />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tabs Skeleton */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tabs Skeleton</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TabsSkeleton />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Empty States */}
            <TabsContent value="empty" className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Empty States</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Dashboard Empty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DashboardEmptyState />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Consultations Empty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ConsultationsEmptyState />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Modules Empty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ModulesEmptyState />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Catalog Empty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CatalogEmptyState />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Search Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SearchEmptyState />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Inbox Empty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InboxEmptyState />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Reports Empty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReportsEmptyState />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Clients Empty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ClientsEmptyState />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Documents Empty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DocumentsEmptyState />
                    </CardContent>
                  </Card>
                </div>

                {/* Special Empty States */}
                <div className="space-y-6 mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>First Run Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FirstRunEmptyState />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Loading State</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LoadingEmptyState message="Loading your data..." />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Generic List Empty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <GenericListEmptyState 
                        itemType="projects"
                        actionLabel="Create Project"
                        actionHref="/projects/new"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Error States */}
            <TabsContent value="errors" className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Error States</h2>
                <div className="space-y-6">
                  
                  {/* Network Error */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Network Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <NetworkErrorBlock 
                        onRetry={handleRetry}
                      />
                      <p className="text-xs text-gray-500 mt-2">Retry count: {retryCount}</p>
                    </CardContent>
                  </Card>

                  {/* Server Error */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Server Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ServerErrorBlock />
                    </CardContent>
                  </Card>

                  {/* Auth Error */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Authentication Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AuthErrorBlock />
                    </CardContent>
                  </Card>

                  {/* Not Found Error */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Not Found Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <NotFoundErrorBlock />
                    </CardContent>
                  </Card>

                  {/* Validation Error */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Validation Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ValidationErrorBlock 
                        onRetry={handleRetry}
                        message="Please check the email address format."
                      />
                    </CardContent>
                  </Card>

                  {/* Loading Error */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Loading Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LoadingErrorBlock 
                        onRetry={handleRetry}
                        isRetrying={false}
                      />
                    </CardContent>
                  </Card>

                  {/* Custom Error */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Custom Error Block</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ErrorBlock
                        type="database"
                        title="Database Unavailable"
                        message="We're experiencing database connectivity issues. Please try again in a few minutes."
                        onRetry={handleRetry}
                        supportUrl="/status"
                        supportLabel="System Status"
                      />
                    </CardContent>
                  </Card>

                  {/* Inline Error */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Inline Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <input 
                          className="w-full p-2 border border-red-300 rounded-md" 
                          value="invalid-email" 
                          readOnly
                        />
                        <InlineError message="Please enter a valid email address." />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Page Examples */}
            <TabsContent value="page-examples" className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Full Page Examples</h2>
                <div className="space-y-8">
                  
                  {/* Dashboard Skeleton */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dashboard Loading State</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="scale-50 origin-top-left w-[200%]">
                          <DashboardSkeleton />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Catalog Skeleton */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Catalog Loading State</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="scale-50 origin-top-left w-[200%]">
                          <CatalogSkeleton />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Consultation Skeleton */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Consultation Loading State</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                        <div className="scale-50 origin-top-left w-[200%]">
                          <ConsultationSkeleton />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}