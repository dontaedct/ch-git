export default function TestProbe() {
  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>Test Probe Working!</h1>
      <p>Time: {new Date().toISOString()}</p>
      <p>This is a test endpoint</p>
    </div>
  );
}
