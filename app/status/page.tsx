import { getClientEnv } from '@lib/env-client';

export default function StatusPage() {
  const env = getClientEnv();
  
  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Status Page</h1>
      <p>Environment: {env.NODE_ENV}</p>
      <p>Timestamp: {new Date().toISOString()}</p>
      <p>This is a standard Next.js route</p>
    </div>
  );
}
