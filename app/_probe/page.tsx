export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function UnderscoreProbe() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>_probe OK</h1>
      <p>env: {process.env.VERCEL_ENV ?? 'local'}</p>
      <p>time: {new Date().toISOString()}</p>
      <p>This is the _probe route (single underscore)</p>
    </main>
  );
}
