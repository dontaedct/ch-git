'use client';

import { ReactNode } from 'react';
import { VerifyingAccessShell } from './VerifyingAccessShell';

export type RoleGateProps<T> = {
  authResult: { status: 'loading' } | { status: 'authenticated'; data: T } | { status: 'unauthorized' };
  children: (data: T) => ReactNode;
  onUnauthorized?: ReactNode;
};

export function RoleGate<T>({ authResult, children, onUnauthorized }: RoleGateProps<T>) {
  if (authResult.status === 'loading') {
    return <VerifyingAccessShell />;
  }
  
  if (authResult.status === 'unauthorized') {
    return onUnauthorized ?? (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    );
  }
  
  return <>{children(authResult.data)}</>;
}
