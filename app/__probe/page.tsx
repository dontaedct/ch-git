export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Probe() {
  return (
    <pre style={{
      padding: 24,
      fontFamily: 'monospace',
      fontSize: 14,
      background: '#f5f5f5',
      borderRadius: 4
    }}>
      __probe OK • {Date.now()}
    </pre>
  );
}

