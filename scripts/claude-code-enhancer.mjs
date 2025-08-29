#!/usr/bin/env node

/**
 * @fileoverview Claude Code Enhancement System
 * @module scripts/claude-code-enhancer
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Provides enhanced Claude Code integration features including:
 * - Smart context generation
 * - Performance metrics tracking
 * - Development velocity insights
 * - Risk assessment automation
 */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ClaudeCodeEnhancer {
  constructor() {
    this.metricsPath = path.join(__dirname, '../var/claude-metrics.json');
    this.ensureMetricsFile();
  }

  ensureMetricsFile() {
    const dir = path.dirname(this.metricsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    if (!fs.existsSync(this.metricsPath)) {
      const initialMetrics = {
        sessions: [],
        performance: {
          averageSessionDuration: 0,
          issuesResolved: 0,
          codeQualityScore: 0,
          developmentVelocity: 0
        },
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.metricsPath, JSON.stringify(initialMetrics, null, 2));
    }
  }

  /**
   * Generate Claude-optimized development context
   */
  generateClaudeContext() {
    console.log('🎯 Generating Claude Code Enhanced Context...');
    
    try {
      // Get current project status
      const projectStatus = this.getProjectStatus();
      
      // Generate performance insights
      const performanceInsights = this.generatePerformanceInsights();
      
      // Create risk assessment
      const riskAssessment = this.generateRiskAssessment(projectStatus);
      
      // Generate Claude-specific recommendations
      const recommendations = this.generateClaudeRecommendations(projectStatus);
      
      const context = `## 🚀 **Claude Code Enhanced Development Context**

### **Project Status Overview**
${projectStatus}

### **Performance Insights**
${performanceInsights}

### **Risk Assessment**
${riskAssessment}

### **Claude-Specific Recommendations**
${recommendations}

### **Next Development Session Focus**
${this.generateNextSessionFocus(projectStatus)}

---
**Generated**: ${new Date().toLocaleString()}
**Claude Code Integration**: Enhanced for optimal performance`;

      console.log('✅ Claude Code context generated successfully!');
      return context;
      
    } catch (error) {
      console.error('❌ Error generating Claude context:', error.message);
      return null;
    }
  }

  getProjectStatus() {
    try {
      // Check git status
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
      const modifiedFiles = gitStatus.split('\n').filter(line => line.trim()).length;
      
      // Check package.json for recent changes
      const packageStats = fs.statSync(path.join(__dirname, '../package.json'));
      const lastModified = new Date(packageStats.mtime);
      const hoursSinceModification = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60);
      
      // Check for critical files
      const criticalFiles = ['next.config.ts', 'tsconfig.json', 'tailwind.config.js'];
      const criticalFileStatus = criticalFiles.map(file => {
        const filePath = path.join(__dirname, '..', file);
        return fs.existsSync(filePath) ? '✅' : '❌';
      });
      
      return `- **Modified Files**: ${modifiedFiles} files have uncommitted changes
- **Last Package Update**: ${hoursSinceModification < 24 ? 'Today' : `${Math.floor(hoursSinceModification / 24)} days ago`}
- **Critical Configs**: ${criticalFiles.map((f, i) => `${f} ${criticalFileStatus[i]}`).join(', ')}
- **Project Health**: ${this.getProjectHealth()}`;
      
    } catch (error) {
      return '- **Status**: Unable to determine (git or file system error)';
    }
  }

  getProjectHealth() {
    try {
      // Quick health check
      const hasNextConfig = fs.existsSync(path.join(__dirname, '../next.config.ts'));
      const hasTsConfig = fs.existsSync(path.join(__dirname, '../tsconfig.json'));
      const hasPackageJson = fs.existsSync(path.join(__dirname, '../package.json'));
      
      if (hasNextConfig && hasTsConfig && hasPackageJson) {
        return '🟢 Healthy (core configs present)';
      } else if (hasNextConfig || hasTsConfig) {
        return '🟡 Partial (some configs missing)';
      } else {
        return '🔴 Critical (core configs missing)';
      }
    } catch {
      return '❓ Unknown';
    }
  }

  generatePerformanceInsights() {
    try {
      const metrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
      
      if (metrics.sessions.length === 0) {
        return '- **No historical data available** - This is your first session with Claude Code integration';
      }
      
      const recentSessions = metrics.sessions.slice(-5); // Last 5 sessions
      const avgDuration = recentSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / recentSessions.length;
      const totalIssues = recentSessions.reduce((sum, session) => sum + (session.issuesResolved || 0), 0);
      
      return `- **Recent Sessions**: ${recentSessions.length} sessions analyzed
- **Average Duration**: ${Math.round(avgDuration)} minutes per session
- **Issues Resolved**: ${totalIssues} total issues addressed
- **Development Velocity**: ${this.calculateVelocity(recentSessions)}`;
      
    } catch (error) {
      return '- **Performance data unavailable** - Metrics file corrupted or missing';
    }
  }

  calculateVelocity(sessions) {
    if (sessions.length < 2) return 'Insufficient data';
    
    const recent = sessions.slice(-3);
    const older = sessions.slice(-6, -3);
    
    if (older.length === 0) return 'Improving';
    
    const recentAvg = recent.reduce((sum, s) => sum + (s.issuesResolved || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + (s.issuesResolved || 0), 0) / older.length;
    
    if (recentAvg > olderAvg * 1.2) return '🚀 Accelerating';
    if (recentAvg > olderAvg) return '📈 Improving';
    if (recentAvg < olderAvg * 0.8) return '📉 Declining';
    return '➡️ Stable';
  }

  generateRiskAssessment(projectStatus) {
    const risks = [];
    
    // Check for common risk factors
    if (projectStatus.includes('uncommitted changes')) {
      risks.push('- **Data Loss Risk**: Uncommitted changes could be lost');
    }
    
    if (projectStatus.includes('Critical configs missing')) {
      risks.push('- **Configuration Risk**: Missing core configuration files');
    }
    
    if (projectStatus.includes('days ago')) {
      risks.push('- **Stale Dependencies**: Package dependencies may be outdated');
    }
    
    if (risks.length === 0) {
      risks.push('- **Low Risk**: Project appears to be in good condition');
    }
    
    return risks.join('\n');
  }

  generateClaudeRecommendations(projectStatus) {
    const recommendations = [];
    
    if (projectStatus.includes('uncommitted changes')) {
      recommendations.push('- **Immediate**: Commit or stash current changes before major work');
    }
    
    if (projectStatus.includes('Critical configs missing')) {
      recommendations.push('- **Critical**: Restore missing configuration files');
    }
    
    recommendations.push('- **Best Practice**: Use Claude Code for complex refactoring tasks');
    recommendations.push('- **Efficiency**: Leverage Claude\'s understanding of your codebase patterns');
    recommendations.push('- **Quality**: Request code reviews and optimization suggestions');
    
    return recommendations.join('\n');
  }

  generateNextSessionFocus(projectStatus) {
    if (projectStatus.includes('uncommitted changes')) {
      return '**Priority**: Resolve uncommitted changes and establish clean working state';
    } else if (projectStatus.includes('Critical configs missing')) {
      return '**Priority**: Restore project configuration and validate setup';
    } else {
      return '**Focus**: Continue development with confidence - project is healthy';
    }
  }

  /**
   * Update metrics after a development session
   */
  updateMetrics(sessionData) {
    try {
      const metrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
      
      metrics.sessions.push({
        timestamp: new Date().toISOString(),
        duration: sessionData.duration || 0,
        issuesResolved: sessionData.issuesResolved || 0,
        codeQualityScore: sessionData.codeQualityScore || 0,
        focus: sessionData.focus || 'General development'
      });
      
      // Keep only last 50 sessions
      if (metrics.sessions.length > 50) {
        metrics.sessions = metrics.sessions.slice(-50);
      }
      
      // Update performance metrics
      metrics.performance = this.calculatePerformanceMetrics(metrics.sessions);
      metrics.lastUpdated = new Date().toISOString();
      
      fs.writeFileSync(this.metricsPath, JSON.stringify(metrics, null, 2));
      console.log('✅ Metrics updated successfully');
      
    } catch (error) {
      console.error('❌ Error updating metrics:', error.message);
    }
  }

  calculatePerformanceMetrics(sessions) {
    if (sessions.length === 0) return { averageSessionDuration: 0, issuesResolved: 0, codeQualityScore: 0, developmentVelocity: 0 };
    
    const recentSessions = sessions.slice(-10); // Last 10 sessions
    
    return {
      averageSessionDuration: recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSessions.length,
      issuesResolved: recentSessions.reduce((sum, s) => sum + (s.issuesResolved || 0), 0),
      codeQualityScore: recentSessions.reduce((sum, s) => sum + (s.codeQualityScore || 0), 0) / recentSessions.length,
      developmentVelocity: this.calculateVelocity(recentSessions)
    };
  }
}

// Export for use in other scripts
export default ClaudeCodeEnhancer;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const enhancer = new ClaudeCodeEnhancer();
  const context = enhancer.generateClaudeContext();
  
  if (context) {
    console.log('\n' + context);
  }
}
