'use client';
import { useEffect, useState } from 'react';

export default function DebugOverlay() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    const onErr = (e: ErrorEvent) => { setMsg(String(e?.message ?? e)); };
    const onRej = (e: PromiseRejectionEvent) => { setMsg(String(e?.reason?.message ?? e?.reason ?? e)); };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);
  if (!msg) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',color:'#fff',padding:16,zIndex:99999,overflow:'auto'}}>
      <div style={{fontWeight:600,marginBottom:8}}>Runtime error</div>
      <pre style={{whiteSpace:'pre-wrap'}}>{msg}</pre>
    </div>
  );
}
