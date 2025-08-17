'use client';

import { useEffect, useState } from 'react';

export function HydrationProbe() {
  const [phase, setPhase] = useState<'SSR' | 'Hydration' | 'Complete'>('SSR');

  useEffect(() => {
    // Only run when debug flag is set
    if (process.env.NEXT_PUBLIC_DEBUG !== '1') {
      return;
    }

    // eslint-disable-next-line no-console
    console.log('🔍 [HydrationProbe] SSR HTML rendered');
    setPhase('Hydration');

    // Hydration started
    // eslint-disable-next-line no-console
    console.log('🔄 [HydrationProbe] Hydration started');
    
    // Hydration complete
    const timer = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log('✅ [HydrationProbe] Hydration complete');
      setPhase('Complete');
    }, 0);

    // Error handling for post-hydration crashes
    const handleError = (event: ErrorEvent) => {
      // eslint-disable-next-line no-console
      console.error('💥 [HydrationProbe] Window error caught:', {
        error: event.error,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        lastPhase: phase
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // eslint-disable-next-line no-console
      console.error('💥 [HydrationProbe] Unhandled promise rejection:', {
        reason: event.reason,
        lastPhase: phase
      });
    };

    // Add error listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [phase]);

  // Don't render anything visible
  return null;
}
