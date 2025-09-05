#!/usr/bin/env tsx

/**
 * @fileoverview Automatic Hero Tasks Verification Script
 * @module scripts/auto-hero-tasks-verification
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Universal Header: @scripts/auto-hero-tasks-verification.ts
 * 
 * This script automatically verifies all hero tasks in the system
 * and provides comprehensive reporting for new chat sessions.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface HeroTaskInfo {
  taskNumber: string;
  title: string;
  status: string;
  filePath: string;
  lastModified: Date;
  estimatedHours?: number;
  phases?: number;
}

interface VerificationReport {
  totalTasks: number;
  tasks: HeroTaskInfo[];
  missingTasks: string[];
  verificationDate: Date;
  recommendations: string[];
}

class HeroTasksVerifier {
  private projectRoot: string;
  private heroTasksDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.heroTasksDir = join(this.projectRoot, 'docs', 'hero-tasks');
  }

  /**
   * Scan for all hero task files and directories
   */
  private scanHeroTasksFiles(): HeroTaskInfo[] {
    const tasks: HeroTaskInfo[] = [];
    
    try {
      const entries = readdirSync(this.heroTasksDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.match(/^HT-\d{3}$/)) {
          const taskInfo = this.extractTaskInfo(entry.name);
          if (taskInfo) {
            tasks.push(taskInfo);
          }
        }
      }
    } catch (error) {
      console.warn('Could not scan hero-tasks directory:', error);
    }

    // Also check for JSON files in root
    try {
      const rootFiles = readdirSync(this.projectRoot);
      const heroTaskFiles = rootFiles.filter(file => 
        file.includes('hero-task') || file.includes('HT-00')
      );
      
      for (const file of heroTaskFiles) {
        const taskInfo = this.extractTaskInfoFromFile(file);
        if (taskInfo) {
          tasks.push(taskInfo);
        }
      }
    } catch (error) {
      console.warn('Could not scan root directory:', error);
    }

    return tasks.sort((a, b) => a.taskNumber.localeCompare(b.taskNumber));
  }

  /**
   * Extract task information from directory name
   */
  private extractTaskInfo(taskDir: string): HeroTaskInfo | null {
    const taskNumber = taskDir;
    const dirPath = join(this.heroTasksDir, taskDir);
    
    try {
      const files = readdirSync(dirPath);
      const jsonFile = files.find(f => f.endsWith('.json'));
      const mdFile = files.find(f => f.endsWith('.md'));
      
      let title = `Hero Task ${taskNumber}`;
      let status = 'unknown';
      let estimatedHours: number | undefined;
      let phases: number | undefined;

      if (jsonFile) {
        const jsonPath = join(dirPath, jsonFile);
        const content = readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(content);
        
        if (data.mainTask) {
          title = data.mainTask.title || title;
          status = data.mainTask.status || status;
          estimatedHours = data.mainTask.metadata?.estimated_hours;
          phases = data.mainTask.metadata?.phases;
        }
      } else if (mdFile) {
        const mdPath = join(dirPath, mdFile);
        const content = readFileSync(mdPath, 'utf-8');
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          title = titleMatch[1];
        }
      }

      const stats = statSync(dirPath);
      
      return {
        taskNumber,
        title,
        status,
        filePath: dirPath,
        lastModified: stats.mtime,
        estimatedHours,
        phases
      };
    } catch (error) {
      console.warn(`Could not extract info for ${taskDir}:`, error);
      return null;
    }
  }

  /**
   * Extract task information from file
   */
  private extractTaskInfoFromFile(fileName: string): HeroTaskInfo | null {
    const filePath = join(this.projectRoot, fileName);
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (data.mainTask) {
        const stats = statSync(filePath);
        
        return {
          taskNumber: data.mainTask.task_number,
          title: data.mainTask.title,
          status: data.mainTask.status,
          filePath,
          lastModified: stats.mtime,
          estimatedHours: data.mainTask.metadata?.estimated_hours,
          phases: data.mainTask.metadata?.phases
        };
      }
    } catch (error) {
      // Not a JSON file or not a hero task file
    }
    
    return null;
  }

  /**
   * Generate comprehensive verification report
   */
  public generateReport(): VerificationReport {
    const tasks = this.scanHeroTasksFiles();
    const verificationDate = new Date();
    
    // Find missing tasks (gaps in numbering)
    const taskNumbers = tasks.map(t => parseInt(t.taskNumber.replace('HT-', '')));
    const maxTaskNumber = Math.max(...taskNumbers, 0);
    const missingTasks: string[] = [];
    
    for (let i = 1; i <= maxTaskNumber; i++) {
      const expectedTask = `HT-${i.toString().padStart(3, '0')}`;
      if (!tasks.find(t => t.taskNumber === expectedTask)) {
        missingTasks.push(expectedTask);
      }
    }

    const recommendations: string[] = [];
    
    if (missingTasks.length > 0) {
      recommendations.push(`Missing tasks detected: ${missingTasks.join(', ')}`);
    }
    
    if (tasks.length === 0) {
      recommendations.push('No hero tasks found - check docs/hero-tasks/ directory');
    }
    
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    
    if (pendingTasks > 0) {
      recommendations.push(`${pendingTasks} tasks are pending - consider starting execution`);
    }
    
    if (inProgressTasks > 0) {
      recommendations.push(`${inProgressTasks} tasks are in progress - check status`);
    }

    return {
      totalTasks: tasks.length,
      tasks,
      missingTasks,
      verificationDate,
      recommendations
    };
  }

  /**
   * Print formatted report
   */
  public printReport(): void {
    const report = this.generateReport();
    
    console.log('🔍 HERO TASKS VERIFICATION REPORT');
    console.log('=====================================');
    console.log(`📅 Verification Date: ${report.verificationDate.toISOString()}`);
    console.log(`📊 Total Tasks Found: ${report.totalTasks}`);
    console.log('');

    if (report.tasks.length > 0) {
      console.log('📋 HERO TASKS OVERVIEW:');
      console.log('----------------------');
      
      report.tasks.forEach(task => {
        const statusIcon = this.getStatusIcon(task.status);
        const hours = task.estimatedHours ? ` (${task.estimatedHours}h)` : '';
        const phases = task.phases ? ` [${task.phases} phases]` : '';
        
        console.log(`${statusIcon} ${task.taskNumber}: ${task.title}${hours}${phases}`);
        console.log(`   Status: ${task.status}`);
        console.log(`   Modified: ${task.lastModified.toISOString()}`);
        console.log('');
      });
    }

    if (report.missingTasks.length > 0) {
      console.log('⚠️  MISSING TASKS:');
      console.log('-----------------');
      report.missingTasks.forEach(task => {
        console.log(`❌ ${task} - Not found`);
      });
      console.log('');
    }

    if (report.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:');
      console.log('-------------------');
      report.recommendations.forEach(rec => {
        console.log(`• ${rec}`);
      });
      console.log('');
    }

    console.log('✅ Verification complete!');
  }

  /**
   * Get status icon for display
   */
  private getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      case 'blocked': return '🚫';
      default: return '❓';
    }
  }
}

// Main execution
const verifier = new HeroTasksVerifier();
verifier.printReport();

export { HeroTasksVerifier, HeroTaskInfo, VerificationReport };
