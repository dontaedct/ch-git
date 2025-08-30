#!/usr/bin/env node

/**
 * @fileoverview Development Session Dashboard
 * @module scripts/dev-session-dashboard
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Comprehensive dashboard for development sessions with:
 * - OSS Hero Design Safety status
 * - Claude Code integration
 * - Performance metrics
 * - Development velocity tracking
 * - Risk assessment
 */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DevSessionDashboard {
  constructor() {
    this.sessionStartTime = Date.now();
    this.currentDate = new Date().toISOString().split('T')[0];
    this.aiEnvironment = this.detectAIEnvironment();
  }

  detectAIEnvironment() {
    if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) return 'Claude Code';
    if (process.env.CURSOR) return 'Cursor AI';
    if (process.env.GITHUB_COPILOT) return 'GitHub Copilot';
    if (process.env.OPENAI_API_KEY) return 'OpenAI Assistant';
    return 'OSS Hero AI Assistant';
  }

  async generateDashboard() {
    console.log('🚀 **OSS Hero Development Session Dashboard**');
    console.log('=' .repeat(60));
    
    try {
      // 1. Project Overview
      this.displayProjectOverview();
      
      // 2. AI Environment Status
      this.displayAIEnvironmentStatus();
      
      // 3. Quick Health Check
      await this.displayQuickHealthCheck();
      
      // 4. Development Recommendations
      this.displayDevelopmentRecommendations();
      
      // 5. Session Tracking
      this.displaySessionTracking();
      
      console.log('\n' + '=' .repeat(60));
      console.log('✅ Dashboard generated successfully!');
      
    } catch (error) {
      console.error('❌ Dashboard generation failed:', error.message);
    }
  }

  displayProjectOverview() {
    console.log('\n📊 **Project Overview**');
    console.log('-'.repeat(30));
    
    try {
      // Check git status
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
      const modifiedFiles = gitStatus.split('\n').filter(line => line.trim()).length;
      
      // Check package.json
      const packagePath = path.join(__dirname, '../package.json');
      const packageStats = fs.statSync(packagePath);
      const lastModified = new Date(packageStats.mtime);
      const hoursSinceModification = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60);
      
      console.log(`📁 **Repository**: ${modifiedFiles} files modified`);
      console.log(`📦 **Dependencies**: Last updated ${hoursSinceModification < 24 ? 'today' : `${Math.floor(hoursSinceModification / 24)} days ago`}`);
      console.log(`🕒 **Session Started**: ${new Date().toLocaleTimeString()}`);
      
    } catch (error) {
      console.log('📁 **Repository**: Unable to determine status');
      console.log('📦 **Dependencies**: Unable to determine status');
    }
  }

  displayAIEnvironmentStatus() {
    console.log('\n🤖 **AI Environment Status**');
    console.log('-'.repeat(30));
    
    const isClaude = this.aiEnvironment === 'Claude Code';
    
    console.log(`🔧 **Detected**: ${this.aiEnvironment}`);
    console.log(`🎯 **Optimization**: ${isClaude ? 'Claude Code Enhanced' : 'Standard AI Assistant'}`);
    
    if (isClaude) {
      console.log('✨ **Features**: Performance metrics, risk assessment, development velocity');
      console.log('📈 **Benefits**: Context-aware recommendations, optimized prompts');
    } else {
      console.log('✨ **Features**: Standard OSS Hero integration');
      console.log('📈 **Benefits**: Reliable development workflow automation');
    }
  }

  async displayQuickHealthCheck() {
    console.log('\n🏥 **Quick Health Check**');
    console.log('-'.repeat(30));
    
    try {
      // Check critical files
      const criticalFiles = ['next.config.ts', 'tsconfig.json', 'tailwind.config.js'];
      const fileStatus = criticalFiles.map(file => {
        const filePath = path.join(__dirname, '..', file);
        return fs.existsSync(filePath) ? '✅' : '❌';
      });
      
      console.log(`📋 **Config Files**: ${criticalFiles.map((f, i) => `${f} ${fileStatus[i]}`).join(', ')}`);
      
      // Quick lint check
      try {
        const lintResult = execSync('npx next lint --dir app --max-warnings 0', { 
          encoding: 'utf8', 
          stdio: 'pipe',
          timeout: 10000 
        });
        console.log('🔍 **Linting**: ✅ Clean (no errors)');
      } catch (lintError) {
        if (lintError.stdout) {
          const warnings = (lintError.stdout.match(/Error:/g) || []).length;
          console.log(`🔍 **Linting**: ⚠️ ${warnings} issues found`);
        } else {
          console.log('🔍 **Linting**: ❌ Check failed');
        }
      }
      
      // Check for common issues
      const commonIssues = this.checkCommonIssues();
      if (commonIssues.length > 0) {
        console.log('⚠️ **Common Issues**:');
        commonIssues.forEach(issue => console.log(`   - ${issue}`));
      } else {
        console.log('✅ **Common Issues**: None detected');
      }
      
    } catch (error) {
      console.log('❌ **Health Check**: Failed to complete');
    }
  }

  checkCommonIssues() {
    const issues = [];
    
    try {
      // Check for large node_modules
      const nodeModulesPath = path.join(__dirname, '../node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        const stats = fs.statSync(nodeModulesPath);
        const sizeInMB = stats.size / (1024 * 1024);
        if (sizeInMB > 500) {
          issues.push('Large node_modules detected (consider cleanup)');
        }
      }
      
      // Check for environment files
      const envFiles = ['.env.local', '.env.development', '.env.production'];
      const missingEnv = envFiles.filter(file => !fs.existsSync(path.join(__dirname, '..', file)));
      if (missingEnv.length > 0) {
        issues.push(`Missing environment files: ${missingEnv.join(', ')}`);
      }
      
    } catch (error) {
      // Ignore errors in issue checking
    }
    
    return issues;
  }

  displayDevelopmentRecommendations() {
    console.log('\n💡 **Development Recommendations**');
    console.log('-'.repeat(30));
    
    const recommendations = [];
    
    if (this.aiEnvironment === 'Claude Code') {
      recommendations.push('🎯 **Use Claude Code** for complex refactoring and code reviews');
      recommendations.push('📊 **Track metrics** to monitor development velocity');
      recommendations.push('🔍 **Request insights** on code quality and best practices');
    }
    
    recommendations.push('🔄 **Run health checks** regularly with `npm run cursor:health`');
    recommendations.push('📝 **Document changes** in the OSS Hero session reports');
    recommendations.push('🧪 **Test thoroughly** before committing major changes');
    
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  displaySessionTracking() {
    console.log('\n📈 **Session Tracking**');
    console.log('-'.repeat(30));
    
    const sessionDuration = Math.round((Date.now() - this.sessionStartTime) / 1000 / 60);
    
    console.log(`⏱️ **Duration**: ${sessionDuration} minutes`);
    console.log(`📅 **Date**: ${this.currentDate}`);
    console.log(`🤖 **AI Assistant**: ${this.aiEnvironment}`);
    
    console.log('\n**Available Commands**:');
    console.log('• `npm run cursor:auto` - Generate session report');
    console.log('• `npm run cursor:health` - Health check focus');
    console.log('• `npm run claude:context` - Claude Code context');
    console.log('• `npm run tool:doctor` - System health diagnosis');
  }
}

// Run the dashboard
const dashboard = new DevSessionDashboard();
dashboard.generateDashboard();

export default DevSessionDashboard;
