#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const log = (msg) => console.log(`[validate] ${msg}`);
const run = (cmd, opts = {}) => {
  const start = Date.now();
  log(`$ ${cmd}`);
  const res = spawnSync(cmd, { shell: true, stdio: 'inherit', ...opts });
  const ms = Date.now() - start;
  if (res.status !== 0) {
    throw new Error(`Command failed (${res.status}) after ${ms}ms: ${cmd}`);
  }
  log(`ok (${ms}ms)`);
};

const tryRun = (cmd, opts = {}) => {
  try {
    run(cmd, opts);
    return true;
  } catch (err) {
    console.warn(`[validate] WARN: ${err.message}`);
    return false;
  }
};

const args = new Set(process.argv.slice(2));
const FULL = args.has('--full');

async function main() {
  const sourceDir = process.cwd();
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sos-validate-'));
  const destDir = path.join(tmpRoot, 'repo');

  log(`Source: ${sourceDir}`);
  log(`Temp:   ${destDir}`);

  // 1) Clone fresh copy without local hardlinks
  run(`git clone --depth 1 --no-local --no-hardlinks "${sourceDir}" "${destDir}"`);

  // 2) Install dependencies (ci for reproducibility)
  process.chdir(destDir);
  run('npm ci --no-audit --no-fund');

  // 3) Basic health checks
  run('npm run -s typecheck');
  run('npm run -s lint');

  // 4) Build
  run('npm run -s build');

  // 5) Minimal tests (fast path)
  tryRun('npm run -s test:unit');

  // 6) Smoke test (Playwright-based) — optional if environment lacks browsers
  tryRun('npm run -s tool:test:smoke');

  // 7) Optional: performance validation via LHCI (heavier)
  if (FULL) {
    const ok = tryRun('npm run -s tool:ui:perf');
    if (ok) {
      tryRun('npm run -s tool:ui:perf:validate');
    }
  } else {
    log('Skipping LHCI perf run (use --full to enable).');
  }

  // 8) Summary
  log('Clean-clone validation completed.');
  log(`Artifacts directory: ${destDir}`);
}

main().catch((err) => {
  console.error('[validate] ERROR:', err.message);
  process.exit(1);
});

