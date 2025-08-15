'use client';

import { useEffect } from 'react';

export function PageBoot() {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (process.env.NEXT_PUBLIC_DEBUG === '1') {
        console.warn('PageBoot: Still suspended after 1000ms - check for stuck async operations');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Loading UI...</p>
      </div>
    </div>
  );
}
