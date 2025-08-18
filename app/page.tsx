export const dynamic = 'force-dynamic';
export const revalidate = 0;

const isPreview = process.env.VERCEL_ENV === 'preview';

export default function Home() {
  return (
    <main style={{padding:24,fontFamily:'ui-sans-serif,system-ui'}}>
      <h1 style={{fontSize:24,marginBottom:8}}>
        Coach Hub — {isPreview ? 'preview' : 'dev home'}
      </h1>
      <p style={{opacity:0.8,marginBottom:16}}>
        If you still see a blank screen, something is crashing before render.
      </p>
      <ul style={{lineHeight:'1.9'}}>
        <li><a href="/api/health">/api/health</a> (JSON)</li>
        <li><a href="/__probe">/__probe</a> (probe page)</li>
        <li><a href="/ai/live">/ai/live</a> (if implemented)</li>
        <li><a href="/sessions">/sessions</a> (if implemented)</li>
      </ul>
    </main>
  );
}