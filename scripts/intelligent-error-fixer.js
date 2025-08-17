#!/usr/bin/env node

/**
 * 🧠 INTELLIGENT ERROR FIXING SYSTEM
 * 
 * Core error analysis and fixing system that:
 * - Analyzes error types and complexity
 * - Sets adaptive attempt limits based on error context
 * - Requests user permission to continue when limits are reached
 * - Provides intelligent recommendations for fixes
 * - Tracks success rates and learns from patterns
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class IntelligentErrorFixer {
  constructor() {
    this.attemptHistory = new Map();
    this.successPatterns = new Map();
    this.errorClassifications = new Map();
    this.userPermissions = new Map();
    this.maxAttempts = {
      YAML_FORMATTING: 8,
      INDENTATION: 6,
      SYNTAX_ERRORS: 5,
      LOGIC_ERRORS: 4,
      COMPLEX_REFACTORING: 3,
      UNKNOWN: 5
    };
  }

  /**
   * Analyze error type and determine appropriate attempt limit
   */
  classifyError(error, filePath, context = {}) {
    const errorText = error.toString().toLowerCase();
    const fileExtension = path.extname(filePath);
    
    // YAML/Formatting errors
    if (errorText.includes('yaml') || errorText.includes('indentation') || 
        errorText.includes('mapping') || errorText.includes('sequence')) {
      return {
        type: 'YAML_FORMATTING',
        complexity: 'LOW',
        maxAttempts: this.maxAttempts.YAML_FORMATTING,
        confidence: 0.9,
        description: 'YAML formatting or indentation issue'
      };
    }
    
    // Indentation errors
    if (errorText.includes('indent') || errorText.includes('column')) {
      return {
        type: 'INDENTATION',
        complexity: 'LOW',
        maxAttempts: this.maxAttempts.INDENTATION,
        confidence: 0.85,
        description: 'Code indentation or formatting issue'
      };
    }
    
    // Syntax errors
    if (errorText.includes('syntax') || errorText.includes('parse') || 
        errorText.includes('token') || errorText.includes('unexpected')) {
      return {
        type: 'SYNTAX_ERRORS',
        complexity: 'MEDIUM',
        maxAttempts: this.maxAttempts.SYNTAX_ERRORS,
        confidence: 0.7,
        description: 'Syntax or parsing error'
      };
    }
    
    // Logic errors
    if (errorText.includes('logic') || errorText.includes('semantic') || 
        errorText.includes('type') || errorText.includes('reference')) {
      return {
        type: 'LOGIC_ERRORS',
        complexity: 'HIGH',
        maxAttempts: this.maxAttempts.LOGIC_ERRORS,
        confidence: 0.6,
        description: 'Logic or semantic error'
      };
    }
    
    // Complex refactoring
    if (context.isRefactoring || context.touchesMultipleFiles || 
        context.affectsDependencies) {
      return {
        type: 'COMPLEX_REFACTORING',
        complexity: 'VERY_HIGH',
        maxAttempts: this.maxAttempts.COMPLEX_REFACTORING,
        confidence: 0.4,
        description: 'Complex refactoring operation'
      };
    }
    
    // Default classification
    return {
      type: 'UNKNOWN',
      complexity: 'MEDIUM',
      maxAttempts: this.maxAttempts.UNKNOWN,
      confidence: 0.5,
      description: 'Unknown error type'
    };
  }

  /**
   * Check if we can attempt more fixes
   */
  canAttemptMore(filePath, errorType) {
    const fileKey = `${filePath}:${errorType}`;
    const attempts = this.attemptHistory.get(fileKey) || 0;
    const classification = this.errorClassifications.get(fileKey);
    
    if (!classification) return { canContinue: true, attemptsLeft: 'unknown' };
    
    const attemptsLeft = classification.maxAttempts - attempts;
    const canContinue = attemptsLeft > 0;
    
    return { canContinue, attemptsLeft, maxAttempts: classification.maxAttempts };
  }

  /**
   * Record an attempt
   */
  recordAttempt(filePath, errorType, success = false, details = {}) {
    const fileKey = `${filePath}:${errorType}`;
    const current = this.attemptHistory.get(fileKey) || 0;
    this.attemptHistory.set(fileKey, current + 1);
    
    // Track success patterns
    if (success) {
      const patternKey = `${errorType}:${details.fixMethod || 'unknown'}`;
      const pattern = this.successPatterns.get(patternKey) || { attempts: 0, successes: 0 };
      pattern.attempts++;
      pattern.successes++;
      this.successPatterns.set(patternKey, pattern);
    }
    
    return this.attemptHistory.get(fileKey);
  }

  /**
   * Request user permission to continue
   */
  async requestPermission(filePath, errorType, attempts, maxAttempts, errorDetails) {
    const fileKey = `${filePath}:${errorType}`;
    
    // Check if user already granted permission for this file/error combination
    if (this.userPermissions.get(fileKey)) {
      return true;
    }
    
    console.log('\n🚨 ERROR FIXING LIMIT REACHED');
    console.log('='.repeat(50));
    console.log(`📁 File: ${filePath}`);
    console.log(`❌ Error Type: ${errorType}`);
    console.log(`🔢 Attempts Made: ${attempts}/${maxAttempts}`);
    console.log(`📊 Error Details: ${errorDetails.description || 'Unknown'}`);
    console.log(`🎯 Confidence: ${Math.round(errorDetails.confidence * 100)}%`);
    
    console.log('\n💡 RECOMMENDATIONS:');
    if (errorDetails.complexity === 'LOW') {
      console.log('✅ This appears to be a simple formatting issue');
      console.log('✅ Additional attempts are likely to succeed');
      console.log('✅ Risk of breaking the file is minimal');
    } else if (errorDetails.complexity === 'MEDIUM') {
      console.log('⚠️ This is a moderate complexity issue');
      console.log('⚠️ Additional attempts may help but carry some risk');
      console.log('⚠️ Consider manual review if attempts fail');
    } else {
      console.log('❌ This is a high complexity issue');
      console.log('❌ Additional attempts carry significant risk');
      console.log('❌ Manual intervention is strongly recommended');
    }
    
    console.log('\n🤔 Would you like me to continue attempting fixes?');
    console.log('   This will override the safety limit.');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('Continue? (y/N): ', (answer) => {
        rl.close();
        const shouldContinue = answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
        
        if (shouldContinue) {
          this.userPermissions.set(fileKey, true);
          console.log('✅ Permission granted. Continuing with fixes...\n');
        } else {
          console.log('❌ Permission denied. Stopping fixes.\n');
        }
        
        resolve(shouldContinue);
      });
    });
  }

  /**
   * Get intelligent fix recommendations
   */
  getFixRecommendations(filePath, errorType, attempts, errorDetails) {
    const recommendations = [];
    
    if (errorDetails.type === 'YAML_FORMATTING') {
      recommendations.push({
        priority: 'HIGH',
        method: 'Fix YAML indentation',
        description: 'Correct the indentation levels to match the file structure',
        risk: 'LOW',
        successRate: 0.9
      });
    }
    
    if (errorDetails.type === 'INDENTATION') {
      recommendations.push({
        priority: 'HIGH',
        method: 'Fix code indentation',
        description: 'Align code blocks and fix spacing issues',
        risk: 'LOW',
        successRate: 0.85
      });
    }
    
    if (errorDetails.type === 'SYNTAX_ERRORS') {
      recommendations.push({
        priority: 'MEDIUM',
        method: 'Fix syntax issues',
        description: 'Correct syntax errors and validate code structure',
        risk: 'MEDIUM',
        successRate: 0.7
      });
    }
    
    // Add pattern-based recommendations
    const patternKey = `${errorType}:fix`;
    const pattern = this.successPatterns.get(patternKey);
    if (pattern && pattern.successes > 0) {
      recommendations.push({
        priority: 'HIGH',
        method: 'Apply known successful pattern',
        description: `Use previously successful fix method (${pattern.successes}/${pattern.attempts} success rate)`,
        risk: 'LOW',
        successRate: pattern.successes / pattern.attempts
      });
    }
    
    return recommendations.sort((a, b) => {
      if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
      if (b.priority === 'HIGH' && a.priority !== 'HIGH') return 1;
      return b.successRate - a.successRate;
    });
  }

  /**
   * Generate fix report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.attemptHistory.size,
        totalAttempts: Array.from(this.attemptHistory.values()).reduce((a, b) => a + b, 0),
        successPatterns: this.successPatterns.size
      },
      fileAnalysis: {},
      recommendations: []
    };
    
    // Analyze each file
    for (const [fileKey, attempts] of this.attemptHistory) {
      const [filePath, errorType] = fileKey.split(':');
      const classification = this.errorClassifications.get(fileKey);
      
      if (!report.fileAnalysis[filePath]) {
        report.fileAnalysis[filePath] = {
          totalAttempts: 0,
          errorTypes: {},
          complexity: 'UNKNOWN'
        };
      }
      
      report.fileAnalysis[filePath].totalAttempts += attempts;
      report.fileAnalysis[filePath].errorTypes[errorType] = attempts;
      
      if (classification) {
        report.fileAnalysis[filePath].complexity = classification.complexity;
      }
    }
    
    // Generate recommendations
    for (const [fileKey, attempts] of this.attemptHistory) {
      const [filePath, errorType] = fileKey.split(':');
      const classification = this.errorClassifications.get(fileKey);
      
      if (classification && attempts >= classification.maxAttempts) {
        const recommendations = this.getFixRecommendations(filePath, errorType, attempts, classification);
        report.recommendations.push({
          file: filePath,
          errorType,
          attempts,
          maxAttempts: classification.maxAttempts,
          recommendations
        });
      }
    }
    
    return report;
  }

  /**
   * Reset permissions for a file
   */
  resetPermissions(filePath) {
    for (const key of this.userPermissions.keys()) {
      if (key.startsWith(filePath)) {
        this.userPermissions.delete(key);
      }
    }
    console.log(`🔄 Reset permissions for ${filePath}`);
  }

  /**
   * Clear all history and permissions
   */
  clearAll() {
    this.attemptHistory.clear();
    this.successPatterns.clear();
    this.errorClassifications.clear();
    this.userPermissions.clear();
    console.log('🧹 Cleared all error fixing history and permissions');
  }
}

// Export for use in other systems
module.exports = IntelligentErrorFixer;

// CLI interface
if (require.main === module) {
  const fixer = new IntelligentErrorFixer();
  
  console.log('🧠 Intelligent Error Fixing System');
  console.log('='.repeat(40));
  
  const command = process.argv[2];
  
  switch (command) {
    case 'report':
      console.log(JSON.stringify(fixer.generateReport(), null, 2));
      break;
    case 'reset':
      const filePath = process.argv[3];
      if (filePath) {
        fixer.resetPermissions(filePath);
      } else {
        console.log('Usage: node intelligent-error-fixer.js reset <filepath>');
      }
      break;
    case 'clear':
      fixer.clearAll();
      break;
    default:
      console.log('Available commands:');
      console.log('  report - Generate analysis report');
      console.log('  reset <filepath> - Reset permissions for a file');
      console.log('  clear - Clear all history and permissions');
  }
}
