export default function TestSimplePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, the basic rendering is working.</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Vercel Env: {process.env.VERCEL_ENV || 'not set'}</p>
      <p>Debug Overlay: {process.env.NEXT_PUBLIC_DEBUG_OVERLAY || 'not set'}</p>
    </div>
  );
}
