'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body style={{padding:24,fontFamily:'ui-sans-serif,system-ui'}}>
        <h2 style={{fontSize:20,marginBottom:12}}>App crashed</h2>
        <pre style={{whiteSpace:'pre-wrap',opacity:0.8,background:'#111',color:'#fff',padding:12,borderRadius:8}}>
          {error?.message || 'Unknown error'}
        </pre>
        <button onClick={() => reset()} style={{marginTop:12,padding:'8px 12px',borderRadius:8}}>
          Reload
        </button>
      </body>
    </html>
  );
}

