/**
 * @fileoverview Brand-Aware Admin Layout Component
 * @module components/admin/AdminLayout
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { AdminNavigation } from './AdminNavigation';
import { BrandAwareErrorNotification } from '@/components/ui/brand-aware-error-notification';
import { useBrandAwareErrorContext } from '@/lib/errors/brand-aware-context';

interface AdminLayoutProps {
  children: React.ReactNode;
  client?: {
    email?: string;
    role?: string | null;
  } | null;
  isSafeMode?: boolean;
}

export function AdminLayout({ children, client, isSafeMode }: AdminLayoutProps) {
  const { errors, globalError } = useBrandAwareErrorContext();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <AdminNavigation client={client} isSafeMode={isSafeMode} />
      
      {/* Main Content */}
      <main className="lg:ml-80">
        <div className="p-6">
          {/* Global Error Display */}
          {globalError && (
            <div className="mb-6">
              <BrandAwareErrorNotification
                error={globalError}
                variant="banner"
                showActions={true}
                showSupport={true}
                onDismiss={() => {
                  // Handle global error dismiss
                }}
              />
            </div>
          )}
          
          {/* Error Notifications */}
          {errors.length > 0 && (
            <div className="mb-6 space-y-2">
              {errors.slice(0, 3).map((error) => (
                <BrandAwareErrorNotification
                  key={error.correlationId}
                  error={error}
                  variant="card"
                  showActions={true}
                  showDismiss={true}
                  onDismiss={() => {
                    // Handle error dismiss
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
