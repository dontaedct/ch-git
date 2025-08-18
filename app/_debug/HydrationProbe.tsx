'use client';

import { useEffect, useState } from 'react';

export default function HydrationProbe() {
  const [phase, setPhase] = useState<'ssr' | 'hydrating' | 'hydrated'>('ssr');
  
  useEffect(() => {
    // This runs after hydration starts
    setPhase('hydrating');
    
    // Simulate hydration completion
    const timer = setTimeout(() => {
      setPhase('hydrated');
      console.log('🟢 HydrationProbe: Hydration complete');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Log initial SSR
    console.log('🔵 HydrationProbe: SSR HTML rendered');
    
    // Log hydration start
    console.log('🟡 HydrationProbe: Hydration started');
    
    // Catch any unhandled errors
    const onError = (e: ErrorEvent) => {
      console.error('❌ HydrationProbe: Unhandled error during hydration:', e.error);
    };
    
    const onRejection = (e: PromiseRejectionEvent) => {
      console.error('❌ HydrationProbe: Unhandled rejection during hydration:', e.reason);
    };
    
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  
  // Only show in development and when debug is enabled
  if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_DEBUG !== '1') {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: phase === 'ssr' ? '#007bff' : phase === 'hydrating' ? '#ffc107' : '#28a745',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontFamily: 'monospace',
      zIndex: 10000,
      opacity: 0.8
    }}>
      {phase === 'ssr' && 'SSR'}
      {phase === 'hydrating' && 'HYDRATING'}
      {phase === 'hydrated' && 'HYDRATED'}
    </div>
  );
}
