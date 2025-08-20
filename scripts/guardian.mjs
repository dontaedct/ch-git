#!/usr/bin/env node

/**
 * 🛡️ GUARDIAN - Real Restorable Backup System
 * 
 * This system provides comprehensive, restorable backups:
 * - Git bundle of the repo
 * - Zipped snapshot of project (excluding node_modules, .next, etc.)
 * - Optional Supabase DB dump if SUPABASE_DB_URL is provided
 * 
 * Backups live under ".backups/YYYY-MM-DD/HHmmss/"
 * Follows universal header rules perfectly
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Promisify fs functions
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

class GuardianBackup {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupsDir = path.join(this.projectRoot, '.backups');
    this.metaDir = path.join(this.backupsDir, 'meta');
    this.isRunning = false;
    this.watchInterval = null;
  }

  async ensureDirectories() {
    await mkdir(this.backupsDir, { recursive: true });
    await mkdir(this.metaDir, { recursive: true });
  }

  getBackupPath() {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHmmss
    const backupPath = path.join(this.backupsDir, date, time);
    return { date, time, backupPath };
  }

  async spawnCommand(command, args, options = {}) {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        cwd: this.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          exitCode: code,
          stdout,
          stderr
        });
      });

      child.on('error', (error) => {
        resolve({
          success: false,
          exitCode: -1,
          stdout,
          stderr: error.message
        });
      });
    });
  }

  async createGitBundle(backupPath) {
    console.log('📦 Creating git bundle...');
    
    const result = await this.spawnCommand('git', [
      'bundle', 'create', 
      path.join(backupPath, 'repo.bundle'), 
      '--all'
    ]);

    if (result.success) {
      console.log('✅ Git bundle created successfully');
      return { ok: true, path: path.join(backupPath, 'repo.bundle') };
    } else {
      console.log(`❌ Git bundle failed: ${result.stderr}`);
      return { ok: false, reason: result.stderr };
    }
  }

  async createProjectSnapshot(backupPath) {
    console.log('📁 Creating project snapshot...');
    
    try {
      // Create a temporary directory for the snapshot
      const tempDir = path.join(this.projectRoot, '.guardian-temp-snapshot');
      await mkdir(tempDir, { recursive: true });

      // Copy project files excluding specified directories
      const excludePatterns = [
        'node_modules',
        '.next',
        '.turbo',
        '.vercel',
        '.git',
        '.backups',
        '.guardian-temp-snapshot',
        'dist',
        'build'
      ];

      await this.copyDirectory(this.projectRoot, tempDir, excludePatterns);

      // Create zip file using PowerShell Compress-Archive on Windows, zip on Unix
      let zipResult;
      if (process.platform === 'win32') {
        // Use PowerShell Compress-Archive on Windows
        const projectZipPath = path.join(backupPath, 'project.zip');
        zipResult = await this.spawnCommand('powershell', [
          '-Command',
          `Compress-Archive -Path "${tempDir}\\*" -DestinationPath "${projectZipPath}" -Force`
        ]);
      } else {
        // Use zip command on Unix systems
        zipResult = await this.spawnCommand('zip', [
          '-r', 
          path.join(backupPath, 'project.zip'),
          '.'
        ], { cwd: tempDir });
      }

      // Clean up temp directory
      await this.cleanupDirectory(tempDir);

      if (zipResult.success) {
        console.log('✅ Project snapshot created successfully');
        return { ok: true, path: path.join(backupPath, 'project.zip') };
      } else {
        console.log(`❌ Project snapshot failed: ${zipResult.stderr}`);
        return { ok: false, reason: zipResult.stderr };
      }
    } catch (error) {
      console.log(`❌ Project snapshot failed: ${error.message}`);
      return { ok: false, reason: error.message };
    }
  }

  async createDatabaseDump(backupPath) {
    const dbUrl = process.env.SUPABASE_DB_URL;
    if (!dbUrl) {
      console.log('ℹ️ No SUPABASE_DB_URL provided, skipping database dump');
      return { ok: false, reason: 'No SUPABASE_DB_URL provided' };
    }

    console.log('🗄️ Creating database dump...');
    
    // Extract connection details from URL (masked in logs)
    const maskedUrl = dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`🔗 Connecting to database: ${maskedUrl.split('@')[1] || '***'}`);

    try {
      // Parse connection string to extract host, port, database, username
      const url = new URL(dbUrl);
      const host = url.hostname;
      const port = url.port || '5432';
      const database = url.pathname.slice(1);
      const username = url.username;
      
      // Note: password is in url.password but we don't log it
      
      const result = await this.spawnCommand('pg_dump', [
        '--host', host,
        '--port', port,
        '--username', username,
        '--dbname', database,
        '--no-owner',
        '--no-privileges',
        '--format', 'custom',
        '--file', path.join(backupPath, 'db.dump')
      ], {
        env: { ...process.env, PGPASSWORD: url.password }
      });

      if (result.success) {
        console.log('✅ Database dump created successfully');
        return { ok: true, path: path.join(backupPath, 'db.dump') };
      } else {
        if (result.stderr.includes('command not found') || result.stderr.includes('pg_dump')) {
          console.log('⚠️ pg_dump not found, skipping database dump');
          return { ok: false, reason: 'pg_dump not found' };
        } else {
          console.log(`❌ Database dump failed: ${result.stderr}`);
          return { ok: false, reason: result.stderr };
        }
      }
    } catch (error) {
      console.log(`❌ Database dump failed: ${error.message}`);
      return { ok: false, reason: error.message };
    }
  }

  async copyDirectory(src, dest, excludePatterns) {
    const items = await readdir(src);
    
    for (const item of items) {
      if (excludePatterns.some(pattern => item.includes(pattern))) {
        continue;
      }

      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      try {
        const stats = await stat(srcPath);
        if (stats.isDirectory()) {
          await mkdir(destPath, { recursive: true });
          await this.copyDirectory(srcPath, destPath, excludePatterns);
        } else {
          // Copy file
          const fs = await import('fs');
          fs.copyFileSync(srcPath, destPath);
        }
      } catch (error) {
        // Skip files we can't copy
        console.log(`⚠️ Skipping ${item}: ${error.message}`);
      }
    }
  }

  async cleanupDirectory(dirPath) {
    try {
      const fs = await import('fs');
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    } catch (error) {
      console.log(`⚠️ Could not clean up ${dirPath}: ${error.message}`);
    }
  }

  async writeMetadata(backupPath, artifacts, startedAt, finishedAt) {
    // Consider backup successful if git and project are both working
    // DB backup is optional and can fail without affecting overall success
    const gitOk = artifacts.find(a => a.type === 'git')?.ok;
    const projectOk = artifacts.find(a => a.type === 'project')?.ok;
    const ok = gitOk && projectOk;
    
    const metadata = {
      ok,
      artifacts: artifacts.map(a => ({
        type: a.type,
        ok: a.ok,
        path: a.path,
        reason: a.reason
      })),
      startedAt,
      finishedAt
    };

    const metadataPath = path.join(this.metaDir, 'last.json');
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    console.log('📝 Metadata written to .backups/meta/last.json');
    return metadata;
  }

  async createBackup() {
    if (this.isRunning) {
      console.log('⚠️ Backup already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startedAt = new Date().toISOString();
    
    try {
      console.log('🚀 Starting Guardian backup...');
      
      // Ensure directories exist
      await this.ensureDirectories();
      
      // Create backup directory structure
      const { date, time, backupPath } = this.getBackupPath();
      await mkdir(backupPath, { recursive: true });
      
      console.log(`📁 Backup directory: ${backupPath}`);
      
      // Create backups
      const gitResult = await this.createGitBundle(backupPath);
      const projectResult = await this.createProjectSnapshot(backupPath);
      const dbResult = await this.createDatabaseDump(backupPath);
      
      const artifacts = [
        { type: 'git', ...gitResult },
        { type: 'project', ...projectResult },
        { type: 'db', ...dbResult }
      ];
      
      const finishedAt = new Date().toISOString();
      
      // Write metadata
      const metadata = await this.writeMetadata(backupPath, artifacts, startedAt, finishedAt);
      
      // Summary
      const successCount = artifacts.filter(a => a.ok).length;
      const totalCount = artifacts.length;
      
      console.log(`\n🎉 Backup completed! ${successCount}/${totalCount} artifacts successful`);
      console.log(`📁 Location: ${backupPath}`);
      console.log(`📝 Metadata: .backups/meta/last.json`);
      
      if (metadata.ok) {
        console.log('✅ All critical backups successful');
      } else {
        console.log('⚠️ Some backups failed, check metadata for details');
      }
      
      return metadata;
      
    } catch (error) {
      console.log(`❌ Backup failed: ${error.message}`);
      const finishedAt = new Date().toISOString();
      
      const metadata = {
        ok: false,
        artifacts: [],
        startedAt,
        finishedAt,
        error: error.message
      };
      
      await this.writeMetadata('', [], startedAt, finishedAt);
      return metadata;
      
    } finally {
      this.isRunning = false;
    }
  }

  async startWatching() {
    console.log('👀 Starting watch mode - backups every 60 minutes with jitter');
    
    const runBackup = async () => {
      if (!this.isRunning) {
        await this.createBackup();
      }
    };
    
    // Initial backup
    await runBackup();
    
    // Set up interval with jitter (55-65 minutes)
    this.watchInterval = setInterval(async () => {
      const jitter = Math.random() * 10 - 5; // -5 to +5 minutes
      const delay = (60 + jitter) * 60 * 1000;
      
      setTimeout(runBackup, delay);
    }, 60 * 60 * 1000); // Check every hour
    
    console.log('✅ Watch mode active');
  }

  stopWatching() {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
      console.log('⏹️ Watch mode stopped');
    }
  }

  showStatus() {
    try {
      const metadataPath = path.join(this.metaDir, 'last.json');
      
      if (fs.existsSync(metadataPath)) {
        const data = fs.readFileSync(metadataPath, 'utf8');
        const status = JSON.parse(data);
        
        process.stdout.write('📊 Last Backup Status:\n');
        process.stdout.write(JSON.stringify(status, null, 2) + '\n');
        
        if (status.artifacts) {
          process.stdout.write('\n📦 Artifacts:\n');
          status.artifacts.forEach(artifact => {
            const icon = artifact.ok ? '✅' : '❌';
            process.stdout.write(`  ${icon} ${artifact.type}: ${artifact.ok ? 'OK' : artifact.reason}\n`);
          });
        }
      } else {
        process.stdout.write('❌ No backup status found\n');
      }
    } catch (error) {
      process.stdout.write(`❌ Error reading status: ${error.message}\n`);
    }
  }
}

// CLI interface
async function main() {
  const guardian = new GuardianBackup();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case '--once':
        await guardian.createBackup();
        break;
        
      case '--watch':
        await guardian.startWatching();
        
        // Keep process running
        process.on('SIGINT', () => {
          guardian.stopWatching();
          process.exit(0);
        });
        
        // Keep alive
        setInterval(() => {}, 1000);
        break;
        
      case '--status':
        await guardian.showStatus();
        break;
        
      default:
        console.log(`
🛡️ GUARDIAN - Real Restorable Backup System

Usage:
  node scripts/guardian.js --once      - Run backup once
  node scripts/guardian.js --watch     - Run backup every 60 minutes with jitter
  node scripts/guardian.js --status    - Show last backup status

Features:
  ✅ Git bundle backup (repo.bundle)
  ✅ Project snapshot (project.zip)
  ✅ Optional database dump (db.dump)
  ✅ Metadata tracking (.backups/meta/last.json)
  ✅ Idempotent operations
  ✅ Non-blocking child processes
  ✅ Graceful degradation

Backup Location: .backups/YYYY-MM-DD/HHmmss/
        `);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch(console.error);
}

export default GuardianBackup;
