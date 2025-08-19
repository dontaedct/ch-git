export default function TestPage() {
  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>Basic Test Page</h1>
      <p>If you can see this, Next.js routing is working!</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}
