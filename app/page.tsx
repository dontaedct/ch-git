export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getPublicEnv } from '@/lib/env';

export default function Home() {
  return (
    <main style={{padding:24,fontFamily:'ui-sans-serif,system-ui'}}>
      <h1 style={{fontSize:24,marginBottom:8}}>
        Micro App Template
      </h1>
      <p style={{opacity:0.8,marginBottom:16}}>
        Welcome to your micro web application template. This is a modern, production-ready foundation for building client applications.
      </p>
      <ul style={{lineHeight:'1.9'}}>
        <li><a href="/api/health">/api/health</a> (JSON)</li>
        <li><a href="/probe">/probe</a> (probe page)</li>
        {getPublicEnv().NEXT_PUBLIC_ENABLE_AI_LIVE === '1' && (
          <li><a href="/ai/live">/ai/live</a> (AI Live)</li>
        )}
        <li><a href="/sessions">/sessions</a> (example route)</li>
      </ul>
    </main>
  );
}