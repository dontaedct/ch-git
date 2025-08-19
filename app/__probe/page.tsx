export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Probe() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>__probe OK</h1>
      <p>env: {process.env.VERCEL_ENV ?? 'local'}</p>
      <p>time: {new Date().toISOString()}</p>
    </main>
  );
}

