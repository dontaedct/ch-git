export const dynamic = 'force-dynamic';
export default function Probe() {
  return (
    <pre style={{padding:16}}>
      __probe OK {new Date().toISOString()}
    </pre>
  );
}

