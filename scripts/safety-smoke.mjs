#!/usr/bin/env node

/**
 * Safety Smoke Test - Validates Guardian system health and backup integrity
 * Usage: npm run safety:smoke
 */

import fs from 'fs';;
import path from 'path';;

const BACKUP_META_PATH = '.backups/meta/last.json';
const MIN_SIZE_KB = 1;

async function checkGuardianStatus() {
  return new Promise((resolve) => {
    import { exec } from 'child_process';;
    exec('npm run guardian:check', { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        console.log('   Debug: Guardian check command failed:', error.message);
        resolve({ status: null, timestamp: 0 });
        return;
      }
      
              try {
          // Parse the Guardian status output
          const lines = stdout.split('\n');
          const statusLine = lines.find(line => line.includes('"ok":'));
          if (statusLine) {
            const statusMatch = statusLine.match(/"ok":\s*(true|false)/);
            const timestampMatch = lines.find(line => line.includes('"finishedAt"'));
            let timestamp = Date.now();
            
            if (timestampMatch) {
              const timestampStr = timestampMatch.match(/"([^"]+)"/);
              if (timestampStr) {
                const parsedDate = new Date(timestampStr[1]);
                if (!isNaN(parsedDate.getTime())) {
                  timestamp = parsedDate.getTime();
                }
              }
            }
            
            // Also try to find the timestamp in the JSON structure
            if (timestamp === Date.now()) {
              const jsonMatch = stdout.match(/"finishedAt":\s*"([^"]+)"/);
              if (jsonMatch) {
                const parsedDate = new Date(jsonMatch[1]);
                if (!isNaN(parsedDate.getTime())) {
                  timestamp = parsedDate.getTime();
                }
              }
            }
            
            console.log('   Debug: Status parsed successfully, ok:', statusMatch && statusMatch[1] === 'true', 'timestamp:', timestamp);
            resolve({ 
              status: { ok: statusMatch && statusMatch[1] === 'true' }, 
              timestamp 
            });
          } else {
            console.log('   Debug: No status line found in output');
            resolve({ status: null, timestamp: 0 });
          }
        } catch (e) {
          console.log('   Debug: Parse error:', e.message);
          resolve({ status: null, timestamp: 0 });
        }
    });
  });
}

async function triggerEmergency() {
  return new Promise((resolve) => {
    import { exec } from 'child_process';;
    exec('npm run guardian:emergency', { timeout: 15000 }, (error, stdout, stderr) => {
      resolve({ success: !error });
    });
  });
}

function checkBackupFiles() {
  if (!fs.existsSync(BACKUP_META_PATH)) {
    return { exists: false, files: [], error: 'Backup meta file not found' };
  }

  try {
    const meta = JSON.parse(fs.readFileSync(BACKUP_META_PATH, 'utf8'));
    const results = [];

    // Check each artifact from the meta file
    for (const artifact of meta.artifacts) {
      if (artifact.type === 'git' || artifact.type === 'project') {
        const filePath = artifact.path;
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);
          results.push({
            name: artifact.type === 'git' ? 'repo.bundle' : 'project.zip',
            exists: true,
            sizeKB,
            valid: sizeKB > MIN_SIZE_KB,
            path: filePath
          });
        } else {
          results.push({
            name: artifact.type === 'git' ? 'repo.bundle' : 'project.zip',
            exists: false,
            sizeKB: 0,
            valid: false,
            path: filePath
          });
        }
      }
    }

    return { exists: true, files: results };
  } catch (error) {
    return { exists: false, files: [], error: error.message };
  }
}

async function main() {
  console.log('🔥 Running Safety Smoke Test...\n');

  // Check Guardian status
  console.log('1. Checking Guardian status...');
  let { status, timestamp } = await checkGuardianStatus();
  console.log('   Debug: Initial status:', JSON.stringify(status), 'timestamp:', timestamp);
  
  if (!status || !status.ok || !timestamp) {
    console.log('   ❌ Guardian status unavailable');
    console.log('   🚨 Triggering emergency backup...');
    const emergencyResult = await triggerEmergency();
    
    if (emergencyResult.success) {
      console.log('   ✅ Emergency triggered, re-checking status...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      ({ status, timestamp } = await checkGuardianStatus());
      console.log('   Debug: After emergency, status:', JSON.stringify(status), 'timestamp:', timestamp);
    } else {
      console.log('   ❌ Emergency trigger failed');
    }
  }

  if (status && status.ok && timestamp) {
    const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (ageHours > 2) {
      console.log(`   ⚠️  Status is ${ageHours.toFixed(1)}h old`);
    } else {
      console.log(`   ✅ Status is ${ageHours.toFixed(1)}h old`);
    }
  }

  // Check backup files
  console.log('\n2. Validating backup files...');
  const backupCheck = checkBackupFiles();
  
  if (!backupCheck.exists) {
    console.log(`   ❌ ${backupCheck.error}`);
  } else {
    let allValid = true;
    for (const file of backupCheck.files) {
      const status = file.valid ? '✅' : '❌';
      const sizeInfo = file.exists ? `(${file.sizeKB}KB)` : '(missing)';
      console.log(`   ${status} ${file.name} ${sizeInfo}`);
      if (!file.valid) allValid = false;
    }
    
    if (allValid) {
      console.log('   ✅ All backup files valid');
    } else {
      console.log('   ❌ Some backup files invalid');
    }
  }

  // Summary
  console.log('\n📊 SUMMARY:');
  const guardianOk = status && status.ok && timestamp;
  const backupsOk = backupCheck.exists && backupCheck.files.every(f => f.valid);
  
  if (guardianOk && backupsOk) {
    console.log('   🟢 PASS - All systems operational');
    process.exit(0);
  } else {
    console.log('   🔴 FAIL - Issues detected');
    if (!guardianOk) console.log('   - Guardian system unhealthy');
    if (!backupsOk) console.log('   - Backup validation failed');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
});
