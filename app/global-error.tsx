'use client';

import { isDevelopment } from '@lib/env-client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  const isDev = isDevelopment();
  
  return (
    <html>
      <body style={{padding:24,fontFamily:'ui-sans-serif,system-ui'}}>
        <h2 style={{fontSize:20,marginBottom:12}}>App crashed</h2>
        <pre style={{whiteSpace:'pre-wrap',opacity:0.8,background:'#111',color:'#fff',padding:12,borderRadius:8}}>
          {error?.message || 'Unknown error'}
        </pre>
        {isDev && error?.stack && (
          <details style={{marginTop:12}}>
            <summary style={{cursor:'pointer',color:'#666'}}>Stack trace (dev only)</summary>
            <pre style={{whiteSpace:'pre-wrap',opacity:0.8,background:'#111',color:'#fff',padding:12,borderRadius:8,marginTop:8}}>
              {error.stack}
            </pre>
          </details>
        )}
        <div style={{marginTop:16}}>
          <button onClick={() => reset()} style={{padding:'8px 12px',borderRadius:8,marginRight:8}}>
            Try again
          </button>
          <button onClick={() => window.location.reload()} style={{padding:'8px 12px',borderRadius:8}}>
            Hard reload
          </button>
        </div>
      </body>
    </html>
  );
}

