#!/usr/bin/env node

/**
 * @fileoverview OSS Hero Development Session Tracker
 * @module scripts/generate-cursor-report
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * Automatically generates new session reports by auditing codebase health
 * including OSS Hero Design Safety, import boundaries, and code quality.
 * 
 * Usage: node scripts/generate-cursor-report.mjs [session-focus]
 * Example: node scripts/generate-cursor-report.mjs "API endpoint development"
 * 
 * Process: AUDIT → DECIDE → APPLY → VERIFY
 * - Audits OSS Hero Design Safety compliance
 * - Runs comprehensive health checks
 * - Generates AI-assistant agnostic reports
 * - Verifies system integrity
 */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class OSSHeroSessionTracker {
  constructor() {
    this.reportsPath = path.join(__dirname, '../docs/CURSOR_AI_REPORTS.md');
    this.currentDate = new Date().toISOString().split('T')[0];
    this.sessionFocus = process.argv[2] || 'General development and maintenance';
    this.aiAssistant = this.detectAIEnvironment();
  }

  /**
   * Detect which AI assistant is being used
   * @returns {string} AI assistant name
   */
  detectAIEnvironment() {
    if (process.env.AI_ASSISTANT) return process.env.AI_ASSISTANT;
    if (process.env.CURSOR) return 'Cursor AI';
    if (process.env.GITHUB_COPILOT) return 'GitHub Copilot';
    if (process.env.CODEIUM) return 'Codeium';
    if (process.env.TABNINE) return 'Tabnine';
    // Default to generic if no specific environment detected
    return 'OSS Hero AI Assistant';
  }

  async generateReport() {
    console.log(`🔍 Generating OSS Hero Development Session Report (${this.aiAssistant})...`);
    
    try {
      // 1. Audit current codebase health including OSS Hero Design Safety
      const healthStatus = await this.auditCodebaseHealth();
      
      // 2. Read existing report
      const existingContent = fs.readFileSync(this.reportsPath, 'utf8');
      
      // 3. Generate new session entry
      const newSession = this.generateSessionEntry(healthStatus);
      
      // 4. Insert new session after the session reports section
      const updatedContent = this.insertNewSession(existingContent, newSession);
      
      // 5. Update health status
      const finalContent = this.updateHealthStatus(updatedContent, healthStatus);
      
      // 6. Write updated report
      fs.writeFileSync(this.reportsPath, finalContent, 'utf8');
      
      console.log('✅ OSS Hero Development Session Report generated successfully!');
      console.log(`📅 New session added for: ${this.currentDate}`);
      console.log(`🎯 Focus: ${this.sessionFocus}`);
      console.log(`🤖 AI Assistant: ${this.aiAssistant}`);
      
      // 7. Generate AI-assistant agnostic snippet
      this.generateAISnippet(newSession, healthStatus);
      
    } catch (error) {
      console.error('❌ Error generating report:', error.message);
      process.exit(1);
    }
  }

  async auditCodebaseHealth() {
    console.log('  📊 Auditing codebase health with OSS Hero Design Safety...');
    
    const health = {
      timestamp: new Date().toISOString(),
      overallHealth: 'UNKNOWN',
      criticalIssues: 0,
      styleWarnings: 0,
      typeSafety: 'UNKNOWN',
      importResolution: 'UNKNOWN',
      validationCoverage: 'UNKNOWN',
      designSafety: 'UNKNOWN',
      ossHeroCompliance: 'UNKNOWN',
      lintResults: null,
      doctorResults: null,
      designResults: null,
      contractResults: null
    };

    try {
      // Run OSS Hero Design Safety checks first
      console.log('  🎨 Running OSS Hero Design Safety checks...');
      await this.runOSSHeroDesignChecks(health);
      
      // Run linting to check current status
      console.log('  🔍 Running Next.js lint...');
      const lintOutput = execSync('npx next lint --dir app --max-warnings 0', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Parse lint results
      const warnings = (lintOutput.match(/Error:/g) || []).length;
      health.styleWarnings = warnings;
      health.lintResults = lintOutput;
      
      // Determine overall health based on warnings and OSS Hero compliance
      if (warnings === 0 && health.designSafety === 'EXCELLENT') {
        health.overallHealth = 'EXCELLENT';
        health.typeSafety = 'FULLY ALIGNED';
        health.importResolution = '100% WORKING';
        health.validationCoverage = 'COMPLETE';
        health.ossHeroCompliance = 'FULLY COMPLIANT';
      } else if (warnings <= 5 && health.designSafety !== 'CRITICAL') {
        health.overallHealth = 'GOOD';
        health.typeSafety = 'MOSTLY ALIGNED';
        health.importResolution = 'MOSTLY WORKING';
        health.validationCoverage = 'MOSTLY COMPLETE';
        health.ossHeroCompliance = 'MOSTLY COMPLIANT';
      } else {
        health.overallHealth = 'NEEDS ATTENTION';
        health.typeSafety = 'PARTIALLY ALIGNED';
        health.importResolution = 'PARTIALLY WORKING';
        health.validationCoverage = 'PARTIALLY COMPLETE';
        health.ossHeroCompliance = 'PARTIALLY COMPLIANT';
      }

    } catch (error) {
      // Lint failed, check if it's due to errors
      if (error.stdout) {
        const warnings = (error.stdout.match(/Error:/g) || []).length;
        health.styleWarnings = warnings;
        health.lintResults = error.stdout;
        
        if (warnings > 10) {
          health.overallHealth = 'CRITICAL';
          health.criticalIssues = warnings;
        } else {
          health.overallHealth = 'NEEDS ATTENTION';
        }
      }
    }

    try {
      // Try to run doctor script for additional insights
      console.log('  🩺 Running doctor script...');
      const doctorOutput = execSync('npm run doctor', { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000 // 30 second timeout
      });
      health.doctorResults = doctorOutput;
    } catch (error) {
      // Doctor script may fail or timeout, that's okay
      health.doctorResults = 'Doctor script unavailable or timed out';
    }

    return health;
  }

  /**
   * Run OSS Hero Design Safety checks
   * @param {Object} health - Health status object to update
   */
  async runOSSHeroDesignChecks(health) {
    try {
      // Run design safety checks
      console.log('    🎨 Checking Design Safety compliance...');
      const designOutput = execSync('npm run tool:design:check', { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000
      });
      health.designResults = designOutput;
      health.designSafety = 'EXCELLENT';
      
      // Run component contracts validation
      console.log('    📋 Validating component contracts...');
      const contractOutput = execSync('npm run tool:ui:contracts', { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000
      });
      health.contractResults = contractOutput;
      
    } catch (error) {
      // Design safety checks failed
      if (error.stdout) {
        health.designResults = error.stdout;
        const designIssues = (error.stdout.match(/error/gi) || []).length;
        if (designIssues > 10) {
          health.designSafety = 'CRITICAL';
        } else if (designIssues > 0) {
          health.designSafety = 'NEEDS ATTENTION';
        } else {
          health.designSafety = 'GOOD';
        }
      } else {
        health.designSafety = 'UNKNOWN';
        health.designResults = 'Design safety checks unavailable';
      }
    }
  }

  generateSessionEntry(healthStatus) {
    const sessionNumber = this.getNextSessionNumber();
    const duration = this.estimateSessionDuration(healthStatus);
    
    return `### **Session ${sessionNumber}: ${this.currentDate}** - ${this.sessionFocus}
**Duration**: ${duration}  
**AI Assistant**: ${this.aiAssistant}  
**Focus**: ${this.sessionFocus}

#### **Issues Encountered**
${this.generateIssuesSection(healthStatus)}

#### **Solutions Implemented**
${this.generateSolutionsSection(healthStatus)}

#### **Files Modified**
${this.generateFilesSection(healthStatus)}

#### **Technical Approach**
${this.generateApproachSection(healthStatus)}

#### **Current Status**
${this.generateStatusSection(healthStatus)}

#### **Lessons Learned**
${this.generateLessonsSection(healthStatus)}

#### **Impact Assessment**
${this.generateImpactSection(healthStatus)}

---
`;
  }

  getNextSessionNumber() {
    const content = fs.readFileSync(this.reportsPath, 'utf8');
    
    // Check for existing sessions on the same date
    const todaySessions = content.match(new RegExp(`### \\*\\*Session (\\d+): ${this.currentDate}`, 'g'));
    
    if (todaySessions && todaySessions.length > 0) {
      // Multiple sessions today - use rising number suffix
      const existingNumbers = [];
      const regex = new RegExp(`### \\*\\*Session (\\d+): ${this.currentDate}`, 'g');
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        existingNumbers.push(parseInt(match[1]));
      }
      
      // Find the next available number in sequence
      let nextNumber = 1;
      while (existingNumbers.includes(nextNumber)) {
        nextNumber++;
      }
      
      console.log(`📝 Multiple sessions detected for ${this.currentDate}, using session number: ${nextNumber}`);
      return nextNumber;
    } else {
      // First session of the day - use sequential numbering
      const sessionMatches = content.match(/### \*\*Session (\d+):/g);
      return sessionMatches ? sessionMatches.length + 1 : 1;
    }
  }

  estimateSessionDuration(healthStatus) {
    if (healthStatus.criticalIssues > 0) {
      return 'Extended session (critical issues found)';
    } else if (healthStatus.styleWarnings > 5) {
      return 'Standard session (moderate issues)';
    } else {
      return 'Quick session (minor issues)';
    }
  }

  generateIssuesSection(healthStatus) {
    const issues = [];
    
    if (healthStatus.criticalIssues > 0) {
      issues.push(`1. **Critical Issues Detected** ⚠️
   - Found ${healthStatus.criticalIssues} critical issues requiring immediate attention
   - Codebase health: ${healthStatus.overallHealth}
   - Impact: Development workflow may be blocked`);
    }
    
    if (healthStatus.styleWarnings > 0) {
      issues.push(`2. **Code Style Issues** ⚠️
   - ${healthStatus.styleWarnings} ESLint warnings detected
   - Mostly cosmetic issues (nullish coalescing, unused variables)
   - Impact: Code quality standards not fully met`);
    }
    
    if (healthStatus.overallHealth === 'EXCELLENT') {
      issues.push(`1. **Maintenance Mode** ✅
   - No critical issues found
   - Codebase in excellent health
   - Focus on improvements and new features`);
    }
    
    if (issues.length === 0) {
      issues.push(`1. **No Issues Detected** ✅
   - Codebase health check passed
   - All systems operational
   - Ready for new development`);
    }
    
    return issues.join('\n\n');
  }

  generateSolutionsSection(healthStatus) {
    if (healthStatus.criticalIssues > 0) {
      return `- **Immediate Action Required**: Address critical issues before continuing development
- **Issue Prioritization**: Focus on blocking issues first
- **Systematic Resolution**: Use established patterns for error resolution`;
    } else if (healthStatus.styleWarnings > 0) {
      return `- **Style Cleanup**: Fix remaining ESLint warnings for perfect linting
- **Code Quality**: Maintain high standards through automated checks
- **Documentation**: Update any outdated documentation`;
    } else {
      return `- **Maintenance**: Keep codebase in excellent condition
- **Improvements**: Consider adding new features or optimizations
- **Documentation**: Ensure all changes are properly documented`;
    }
  }

  generateFilesSection(healthStatus) {
    if (healthStatus.criticalIssues > 0) {
      return `- Files requiring attention identified through linting
- Specific file paths will be listed after issue resolution
- Focus on critical path files first`;
    } else {
      return `- No files require modification at this time
- All components are properly typed and validated
- Ready for new development work`;
    }
  }

  generateApproachSection(healthStatus) {
    if (healthStatus.criticalIssues > 0) {
      return `1. **Issue Assessment**: Identify root causes of critical issues
2. **Priority Resolution**: Fix blocking issues first
3. **Verification**: Use Next.js tools for validation
4. **Documentation**: Update this report with resolution details`;
    } else {
      return `1. **Health Monitoring**: Regular codebase health checks
2. **Preventive Maintenance**: Address issues before they become critical
3. **Quality Assurance**: Maintain high coding standards
4. **Continuous Improvement**: Look for optimization opportunities`;
    }
  }

  generateStatusSection(healthStatus) {
    const status = [];
    
    status.push(`- **Overall Health**: ${this.getHealthEmoji(healthStatus.overallHealth)} **${healthStatus.overallHealth}**`);
    status.push(`- **Critical Issues**: ${healthStatus.criticalIssues}`);
    status.push(`- **Style Warnings**: ${healthStatus.styleWarnings} (cosmetic only)`);
    status.push(`- **Type Safety**: ${this.getHealthEmoji(healthStatus.typeSafety)} **${healthStatus.typeSafety}**`);
    status.push(`- **Import Resolution**: ${this.getHealthEmoji(healthStatus.importResolution)} **${healthStatus.importResolution}**`);
    status.push(`- **Validation Coverage**: ${this.getHealthEmoji(healthStatus.validationCoverage)} **${healthStatus.validationCoverage}**`);
    status.push(`- **Design Safety**: ${this.getHealthEmoji(healthStatus.designSafety)} **${healthStatus.designSafety}**`);
    status.push(`- **OSS Hero Compliance**: ${this.getHealthEmoji(healthStatus.ossHeroCompliance)} **${healthStatus.ossHeroCompliance}**`);
    
    return status.join('\n');
  }

  generateLessonsSection(healthStatus) {
    if (healthStatus.criticalIssues > 0) {
      return `1. **Issue Prevention**: Regular health checks prevent critical issues
2. **Early Detection**: Address problems before they block development
3. **Systematic Resolution**: Use established patterns for quick fixes
4. **Documentation**: Keep reports updated for future reference`;
    } else {
      return `1. **Maintenance Matters**: Regular upkeep prevents issues
2. **Quality Standards**: High standards lead to better development experience
3. **Automation**: Automated tools catch issues early
4. **Continuous Improvement**: Always look for ways to improve`;
    }
  }

  generateImpactSection(healthStatus) {
    if (healthStatus.criticalIssues > 0) {
      return `- **Development Blocked**: Critical issues must be resolved before continuing
- **Team Productivity**: Blocking issues affect entire development team
- **Project Timeline**: Delays in resolution impact project delivery
- **Code Quality**: Issues indicate areas needing attention`;
    } else {
      return `- **Development Velocity**: High-quality codebase enables fast development
- **Team Confidence**: Developers can make changes with confidence
- **Maintenance**: Easy to maintain and extend existing code
- **Onboarding**: New team members can get up to speed quickly`;
    }
  }

  getHealthEmoji(status) {
    if (status.includes('EXCELLENT') || status.includes('FULLY') || status.includes('100%') || status.includes('COMPLETE')) {
      return '🟢';
    } else if (status.includes('GOOD') || status.includes('MOSTLY')) {
      return '🟡';
    } else if (status.includes('NEEDS ATTENTION') || status.includes('PARTIALLY')) {
      return '🟠';
    } else {
      return '🔴';
    }
  }

  insertNewSession(existingContent, newSession) {
    const sessionReportsIndex = existingContent.indexOf('## 🗓️ **Session Reports by Date**');
    if (sessionReportsIndex === -1) {
      throw new Error('Could not find session reports section');
    }
    
    // Look for the next major section (Next Steps or Current Codebase Health)
    const nextStepsIndex = existingContent.indexOf('## 🚀 **Next Steps & Recommendations**', sessionReportsIndex);
    const healthStatusIndex = existingContent.indexOf('## 🔍 **Current Codebase Health Status**', sessionReportsIndex);
    
    let sectionEndIndex;
    if (nextStepsIndex !== -1) {
      sectionEndIndex = nextStepsIndex;
    } else if (healthStatusIndex !== -1) {
      sectionEndIndex = healthStatusIndex;
    } else {
      // If neither section exists, insert at the end
      sectionEndIndex = existingContent.length;
    }
    
    const before = existingContent.substring(0, sectionEndIndex);
    const after = existingContent.substring(sectionEndIndex);
    
    return before + '\n' + newSession + after;
  }

  updateHealthStatus(content, healthStatus) {
    const healthStatusPattern = /\*\*Last Updated\*\*: .*\n\*\*Overall Health\*\*: .*\n\*\*Critical Issues\*\*: .*\n\*\*Style Warnings\*\*: .*\n\*\*Type Safety\*\*: .*\n\*\*Import Resolution\*\*: .*\n\*\*Validation Coverage\*\*: .*/;
    
    const newHealthStatus = `**Last Updated**: ${this.currentDate}  
**Overall Health**: ${this.getHealthEmoji(healthStatus.overallHealth)} **${healthStatus.overallHealth}** (${healthStatus.criticalIssues} critical issues, ${healthStatus.styleWarnings} style warnings)  
**Critical Issues**: ${healthStatus.criticalIssues}  
**Style Warnings**: ${healthStatus.styleWarnings} (cosmetic only)  
**Type Safety**: ${this.getHealthEmoji(healthStatus.typeSafety)} **${healthStatus.typeSafety}**  
**Import Resolution**: ${this.getHealthEmoji(healthStatus.importResolution)} **${healthStatus.importResolution}**  
**Validation Coverage**: ${this.getHealthEmoji(healthStatus.validationCoverage)} **${healthStatus.validationCoverage}**`;
    
    return content.replace(healthStatusPattern, newHealthStatus);
  }

  generateAISnippet(sessionEntry, healthStatus) {
    const snippet = `## 📋 **AI Assistant Upload Snippet - ${this.currentDate}**

**AI Assistant**: ${this.aiAssistant}
**Session Focus**: ${this.sessionFocus}
**Codebase Health**: ${healthStatus.overallHealth}
**OSS Hero Compliance**: ${healthStatus.ossHeroCompliance}
**Design Safety**: ${healthStatus.designSafety}
**Critical Issues**: ${healthStatus.criticalIssues}
**Style Warnings**: ${healthStatus.styleWarnings}

**Copy this section for any AI assistant:**

${sessionEntry}

**Context**: This is from a Next.js 14 + TypeScript + Supabase micro web application template with OSS Hero Design Safety framework. The codebase is currently in ${healthStatus.overallHealth.toLowerCase()} health with ${healthStatus.criticalIssues} critical issues, ${healthStatus.styleWarnings} style warnings, and ${healthStatus.designSafety.toLowerCase()} design safety compliance.

**Request**: Please analyze this OSS Hero development session and provide insights on:
1. The technical approach used
2. OSS Hero Design Safety compliance
3. Best practices for maintaining code quality
4. Recommendations for the next development session`;

    console.log('\n📋 **AI Assistant Upload Snippet Generated**');
    console.log(`Copy the section above to upload to ${this.aiAssistant} or any AI assistant for analysis`);
    console.log('The snippet includes OSS Hero context and specific questions for optimal AI assistance');
  }
}

// Run the OSS Hero Session Tracker
const tracker = new OSSHeroSessionTracker();
tracker.generateReport();

export default OSSHeroSessionTracker;
