'use client';

import { useEffect } from 'react';

export function VerifyingAccessShell() {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (process.env.NEXT_PUBLIC_DEBUG === '1') {
        console.warn('VerifyingAccessShell: Still verifying after 2000ms - check for stuck auth operations');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Access...</h2>
        <p className="text-gray-600">Please wait while we confirm your permissions.</p>
      </div>
    </div>
  );
}
