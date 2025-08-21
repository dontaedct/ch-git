import { NextResponse } from 'next/server';
import { readStatus, isLastBackupSuccessful } from '@lib/guardian/service';

// Force Node runtime and dynamic execution
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get backup status
    const status = await readStatus();
    const lastBackupOk = await isLastBackupSuccessful();
    
    // Determine overall health
    let healthStatus = 'HEALTHY';
    let message = 'All systems operational';
    
    if (!status) {
      healthStatus = 'WARNING';
      message = 'No backup status available';
    } else if (!status.ok) {
      healthStatus = 'ERROR';
      message = `Last backup failed: ${status.error ?? 'Unknown error'}`;
    } else if (!lastBackupOk) {
      healthStatus = 'WARNING';
      message = 'Last backup was not successful';
    }
    
    // Check if backup is recent (within last 24 hours)
    let backupAge = 'unknown';
    if (status?.finishedAt) {
      const lastBackup = new Date(status.finishedAt);
      const now = new Date();
      const hoursAgo = Math.floor((now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60));
      
      if (hoursAgo < 1) {
        backupAge = 'less than 1 hour ago';
      } else if (hoursAgo < 24) {
        backupAge = `${hoursAgo} hours ago`;
      } else {
        backupAge = `${Math.floor(hoursAgo / 24)} days ago`;
        if (hoursAgo > 48) {
          healthStatus = 'WARNING';
          message = 'Backup is older than 48 hours';
        }
      }
    }
    
    return NextResponse.json({
      status: healthStatus,
      message,
      timestamp: new Date().toISOString(),
      backup: {
        lastBackup: status?.finishedAt ?? null,
        backupAge,
        lastBackupOk,
        artifacts: status?.artifacts ?? []
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'ERROR',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
