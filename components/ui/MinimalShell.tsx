'use client';

import { useEffect } from 'react';

export function MinimalShell() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEBUG === '1') {
      // eslint-disable-next-line no-console
      console.log('MinimalShell: Rendering minimal shell component');
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
