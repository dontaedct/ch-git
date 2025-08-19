'use client';

import { useEffect, useState } from 'react';

export default function PageBoot() {
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWarning(true);
      console.warn('⚠️ PageBoot: Suspense fallback still showing after 1000ms. This may indicate a suspended component that never resolves.');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: '#f8f9fa',
      minHeight: '50vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e9ecef',
        borderTop: '3px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
      }} />
      <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#495057' }}>
        Loading UI...
      </h2>
      <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
        Preparing your experience
      </p>
      {showWarning && (
        <div style={{
          marginTop: '16px',
          padding: '8px 12px',
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          color: '#856404',
          fontSize: '12px'
        }}>
          ⚠️ Taking longer than expected
        </div>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
