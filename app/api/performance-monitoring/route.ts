/**
 * @fileoverview Performance Monitoring API Routes
 * @module app/api/performance-monitoring/route
 * @author OSS Hero System
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PerformanceMonitoringService } from '@/lib/performance-monitoring/service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const performanceService = new PerformanceMonitoringService(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'start':
        await performanceService.startMonitoring();
        return NextResponse.json({ 
          success: true, 
          message: 'Performance monitoring started' 
        });
        
      case 'stop':
        await performanceService.stopMonitoring();
        return NextResponse.json({ 
          success: true, 
          message: 'Performance monitoring stopped' 
        });
        
      case 'status':
        return NextResponse.json({ 
          success: true, 
          status: 'running',
          message: 'Performance monitoring is active' 
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance monitoring API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    switch (action) {
      case 'collect_metrics':
        const metrics = await performanceService.collectMetrics();
        return NextResponse.json({ 
          success: true, 
          data: metrics 
        });
        
      case 'generate_report':
        const { startDate, endDate } = data;
        const report = await performanceService.generateReport(startDate, endDate);
        return NextResponse.json({ 
          success: true, 
          data: report 
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance monitoring API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
