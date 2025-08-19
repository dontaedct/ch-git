'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <main style={{padding:24,fontFamily:'ui-sans-serif,system-ui'}}>
      <h2 style={{fontSize:20,marginBottom:12}}>Something went wrong in this route.</h2>
      <pre style={{whiteSpace:'pre-wrap',opacity:0.8,background:'#111',color:'#fff',padding:12,borderRadius:8}}>
        {error?.message || 'Unknown error'}
      </pre>
      <button onClick={() => reset()} style={{marginTop:12,padding:'8px 12px',borderRadius:8}}>
        Try again
      </button>
    </main>
  );
}
