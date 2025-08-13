'use client';
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html><body style={{ padding: 24 }}>
      <h1>Oops — something went wrong</h1>
      <p style={{ color: "#666" }}>{error.message}</p>
      <button onClick={() => reset()} style={{ padding: 8, marginTop: 12 }}>Try again</button>
    </body></html>
  );
}
