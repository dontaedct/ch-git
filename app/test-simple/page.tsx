import { getClientEnv } from '@lib/env-client';

export default function TestSimplePage() {
  const env = getClientEnv();
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, the basic rendering is working.</p>
      <p>Environment: {env.NODE_ENV}</p>
      <p>Build Env: {env.BUILD_ENV}</p>
      <p>Debug Mode: {env.DEBUG ? 'enabled' : 'disabled'}</p>
    </div>
  );
}
