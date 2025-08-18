'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PathRecord {
  path: string;
  timestamp: number;
}

export default function LoopDetector() {
  const pathname = usePathname();
  const [pathHistory, setPathHistory] = useState<PathRecord[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  
  useEffect(() => {
    const now = Date.now();
    const newRecord: PathRecord = { path: pathname, timestamp: now };
    
    setPathHistory(prev => {
      const updated = [...prev, newRecord].slice(-5); // Keep last 5
      
      // Check for rapid changes (more than 3 in 2 seconds)
      const recentPaths = updated.filter(record => now - record.timestamp < 2000);
      
      if (recentPaths.length > 3) {
        console.warn('⚠️ LoopDetector: Rapid route changes detected:', {
          count: recentPaths.length,
          paths: recentPaths.map(r => r.path),
          timeWindow: '2s'
        });
        setShowOverlay(true);
      }
      
      return updated;
    });
  }, [pathname]);
  
  // Only show in development and when debug is enabled
  if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_DEBUG !== '1') {
    return null;
  }
  
  if (!showOverlay) {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(220, 53, 69, 0.95)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      zIndex: 10001,
      maxWidth: '400px',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
        🔄 Redirect Loop Detected
      </h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '14px', opacity: 0.9 }}>
        Multiple route changes detected in a short time. This may cause white screens.
      </p>
      <div style={{ 
        background: 'rgba(0,0,0,0.2)', 
        padding: '8px', 
        borderRadius: '4px',
        marginBottom: '16px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        {pathHistory.slice(-3).map((record, i) => (
          <div key={i} style={{ marginBottom: '4px' }}>
            {record.path} ({new Date(record.timestamp).toLocaleTimeString()})
          </div>
        ))}
      </div>
      <button 
        onClick={() => setShowOverlay(false)}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
