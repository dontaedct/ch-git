import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export interface BackupStatus {
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  artifacts: BackupArtifact[];
  error?: string;
}

export interface BackupArtifact {
  type: 'git' | 'project' | 'db';
  ok: boolean;
  path?: string;
  reason?: string;
}

export interface BackupOptions {
  reason?: string;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 30 * 1000; // 30 seconds (reduced for API responsiveness)
const STATUS_FILE = '.backups/meta/last.json';

/**
 * Runs a one-time backup using the guardian script
 */
export async function runBackupOnce(opts: BackupOptions = {}): Promise<BackupStatus> {
  const startedAt = new Date().toISOString();
  const timeout = opts.timeout ?? DEFAULT_TIMEOUT;
  
  try {
    // Ensure backup directory exists
    const backupDir = path.join(process.cwd(), '.backups/meta');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Spawn guardian.js with --once command
    const child = spawn('node', ['scripts/guardian.js', '--once'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
      shell: true, // Add shell for better Windows compatibility
      windowsHide: true // Hide console window on Windows
    });
    
    // Set up timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Backup operation timed out'));
      }, timeout);
    });
    
    // Collect output
    let stderr = '';
    
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
      console.error('Guardian stderr:', data.toString());
    });
    
    child.stdout?.on('data', (data) => {
      console.log('Guardian stdout:', data.toString());
    });
    
    // Wait for completion or timeout
    const exitCode = await Promise.race([
      new Promise<number>((resolve) => {
        child.on('close', (code) => resolve(code ?? 0));
      }),
      timeoutPromise
    ]);
    
    const finishedAt = new Date().toISOString();
    
    if (exitCode === 0) {
      // Success - read the status file for detailed results
      try {
        const statusData = await fs.readFile(STATUS_FILE, 'utf-8');
        const status = JSON.parse(statusData) as BackupStatus;
        
        // Update timestamps to match our execution
        status.startedAt = startedAt;
        status.finishedAt = finishedAt;
        
        // Write updated status
        await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
        
        return status;
      } catch {
        // Fallback if status file can't be read
        const status: BackupStatus = {
          ok: true,
          startedAt,
          finishedAt,
          artifacts: [
            { type: 'git', ok: true },
            { type: 'project', ok: true },
            { type: 'db', ok: false, reason: 'Status file not readable' }
          ]
        };
        
        await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
        return status;
      }
    } else {
      // Failed
      const status: BackupStatus = {
        ok: false,
        startedAt,
        finishedAt,
        artifacts: [],
        error: stderr ?? `Process exited with code ${exitCode}`
      };
      
      // Write status file
      await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
      
      return status;
    }
    
  } catch (error) {
    const finishedAt = new Date().toISOString();
    
    const status: BackupStatus = {
      ok: false,
      startedAt,
      finishedAt,
      artifacts: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    // Write status file
    try {
      await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
    } catch {
      // Ignore write errors, return status anyway
    }
    
    return status;
  }
}

/**
 * Reads the current backup status from the status file
 */
export async function readStatus(): Promise<BackupStatus | null> {
  try {
    const statusPath = path.join(process.cwd(), STATUS_FILE);
    const statusData = await fs.readFile(statusPath, 'utf-8');
    return JSON.parse(statusData) as BackupStatus;
  } catch {
    // File doesn't exist or can't be read
    return null;
  }
}

/**
 * Gets the latest backup artifacts for reporting
 */
export async function getLatestArtifacts(): Promise<BackupArtifact[]> {
  const status = await readStatus();
  return status?.artifacts ?? [];
}

/**
 * Checks if the last backup was successful
 */
export async function isLastBackupSuccessful(): Promise<boolean> {
  const status = await readStatus();
  return status?.ok ?? false;
}
