// scripts/dev-bootstrap.js
// Single launcher for dev: pick a free port, then start Next there.
// Tries 9999 first, then 3000..3010. Windows-friendly.

const net = require('node:net');
const { spawn } = require('node:child_process');

const candidates = [9999, ...Array.from({ length: 11 }, (_, i) => 3000 + i)]; // 9999, 3000..3010
const requested = process.env.PORT ? Number(process.env.PORT) : null;
if (requested && !Number.isNaN(requested)) {
  // honor PORT env first
  candidates.unshift(requested);
}

function check(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, '0.0.0.0');
  });
}

(async () => {
  let port = null;
  for (const p of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await check(p)) { port = p; break; }
  }
  if (!port) {
    console.error('[dev-bootstrap] No free port found (9999 or 3000–3010).');
    process.exit(1);
  }
  console.log(`[dev-bootstrap] Starting Next.js on http://localhost:${port}`);
  
  // Windows compatibility: use shell: true for Windows
  const isWindows = process.platform === 'win32';
  const child = spawn('npx', ['next', 'dev', '-p', String(port)], { 
    stdio: 'inherit',
    shell: isWindows
  });
  
  child.on('exit', (code) => process.exit(code ?? 0));
})();
