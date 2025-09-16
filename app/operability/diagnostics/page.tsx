/**
 * System Diagnostics Admin UI - Phase 1, Task 3
 * 
 * Provides real-time system monitoring and diagnostics dashboard
 * Protected by admin authentication
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DiagnosticsInterface } from './diagnostics-interface';
import { Skeleton } from '@/components/ui/skeleton';

export default async function DiagnosticsPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';
  
  let client = null;
  
  if (!isSafeMode) {
    try {
      // Require admin permissions
      client = await requirePermission('canManageSettings');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Insufficient permissions')) {
          redirect('/');
        }
        if (error.message === 'Unauthorized') {
          redirect('/login');
        }
      }
      throw error;
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">System Diagnostics</h1>
        <p className="text-muted-foreground mt-2">
          Real-time system monitoring, environment validation, and performance metrics
        </p>
        {isSafeMode && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Safe Mode Active
            </span>
          </div>
        )}
      </div>

      <Suspense fallback={<DiagnosticsLoadingSkeleton />}>
        <DiagnosticsInterface />
      </Suspense>
    </div>
  );
}

function DiagnosticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Health */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}