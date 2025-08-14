import { NextResponse } from 'next/server';
import Guardian from '@/scripts/guardian.js';

export async function POST() {
  try {
    const guardian = new Guardian();
    const backupPath = await guardian.emergencyBackup();
    
    if (backupPath) {
      return NextResponse.json({
        status: 'success',
        message: 'Emergency backup created successfully',
        backupPath,
        timestamp: new Date().toISOString(),
        type: 'emergency'
      });
    } else {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Emergency backup creation failed',
          timestamp: new Date().toISOString(),
          type: 'emergency'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        type: 'emergency'
      },
      { status: 500 }
    );
  }
}

