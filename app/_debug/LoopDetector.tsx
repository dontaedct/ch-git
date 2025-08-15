'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface RouteChange {
  pathname: string;
  timestamp: number;
}

export function LoopDetector() {
  const [routeHistory, setRouteHistory] = useState<RouteChange[]>([]);
  const [isLoopDetected, setIsLoopDetected] = useState(false);
  const [loopPaths, setLoopPaths] = useState<string[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Only run when debug flag is set
    if (process.env.NEXT_PUBLIC_DEBUG !== '1') {
      return;
    }

    const now = Date.now();
    const newRouteChange: RouteChange = { pathname, timestamp: now };
    
    setRouteHistory(prev => {
      const updated = [...prev, newRouteChange];
      // Keep only last 5 route changes
      return updated.slice(-5);
    });
  }, [pathname]);

  useEffect(() => {
    // Only run when debug flag is set
    if (process.env.NEXT_PUBLIC_DEBUG !== '1') {
      return;
    }

    if (routeHistory.length < 3) return;

    const now = Date.now();
    const recentChanges = routeHistory.filter(
      change => now - change.timestamp < 2000 // Within 2 seconds
    );

    if (recentChanges.length > 3) {
      const paths = recentChanges.map(change => change.pathname);
      setLoopPaths(paths);
      setIsLoopDetected(true);
      
      console.warn('🚨 [LoopDetector] Redirect loop detected:', {
        paths,
        timestamps: recentChanges.map(change => change.timestamp),
        totalChanges: recentChanges.length,
        timeWindow: '2s'
      });
    } else {
      setIsLoopDetected(false);
      setLoopPaths([]);
    }
  }, [routeHistory]);

  // Don't render anything visible unless loop detected
  if (!isLoopDetected) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-500/90 text-white">
      <div className="bg-red-600 p-6 rounded-lg shadow-xl max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">🚨 Redirect Loop Detected</h2>
        <div className="space-y-2">
          {loopPaths.map((path, index) => (
            <div key={index} className="font-mono text-sm bg-red-700 px-2 py-1 rounded">
              {path}
            </div>
          ))}
        </div>
        <p className="text-sm mt-4 opacity-90">
          More than 3 route changes detected within 2 seconds.
        </p>
      </div>
    </div>
  );
}
