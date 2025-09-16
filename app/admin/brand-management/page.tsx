/**
 * @fileoverview Brand Management Admin UI
 * @module app/admin/brand-management/page
 * @author OSS Hero System
 * @version 1.0.0
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/guard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BrandManagementInterface } from './brand-management-interface';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { BrandAwareErrorProvider } from '@/lib/errors/brand-aware-context';

export default async function BrandManagementPage() {
  try {
    // Require admin permissions
    await requirePermission('canManageSettings');
    
    return (
      <BrandAwareErrorProvider>
        <AdminLayout>
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Brand Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage your organization&apos;s branding, including logos, colors, typography, and brand names. 
                Changes apply immediately across the entire application.
              </p>
            </div>

            <Suspense fallback={<BrandManagementLoadingSkeleton />}>
              <BrandManagementInterface />
            </Suspense>
          </div>
        </AdminLayout>
      </BrandAwareErrorProvider>
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Insufficient permissions')) {
        redirect('/');
      }
      if (error.message === 'Unauthorized') {
        redirect('/login');
      }
    }
    
    return (
      <AdminLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error loading brand management: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }
}

function BrandManagementLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Brand Overview Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Brand Presets Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
