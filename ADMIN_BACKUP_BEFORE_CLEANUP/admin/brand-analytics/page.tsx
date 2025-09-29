/**
 * @fileoverview Brand-Aware Analytics Admin Page
 * @module app/admin/brand-analytics/page
 * @author OSS Hero System
 * @version 1.0.0
 */

import { Suspense } from 'react';
import { BrandAwareAnalyticsDashboard } from '@/components/analytics/brand-aware-analytics-dashboard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { BrandAwareErrorProvider } from '@/components/error/BrandAwareErrorProvider';
import { requirePermission } from '@/lib/auth/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface BrandAnalyticsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function BrandAnalyticsContent() {
  // Require admin permissions
  await requirePermission('canManageSettings');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track brand usage, performance, and user engagement metrics
          </p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <BrandAwareAnalyticsDashboard />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default async function BrandAnalyticsPage({ searchParams }: BrandAnalyticsPageProps) {
  return (
    <AdminLayout>
      <BrandAwareErrorProvider>
        <div className="min-h-screen bg-gray-50">
          <AdminNavigation />
          
          <main className="p-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <BrandAnalyticsContent />
            </Suspense>
          </main>
        </div>
      </BrandAwareErrorProvider>
    </AdminLayout>
  );
}
