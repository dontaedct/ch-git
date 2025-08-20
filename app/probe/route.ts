export async function GET() {
  const env = process.env.NODE_ENV ?? 'unknown';
  const version = process.env.npm_package_version ?? 'unknown';
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Probe</title>
  <meta charset="utf-8">
</head>
<body>
  <h1>__probe OK</h1>
  <p>Environment: ${env}</p>
  <p>Version: ${version}</p>
  <p>Timestamp: ${new Date().toISOString()}</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
