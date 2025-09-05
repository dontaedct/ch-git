#!/usr/bin/env tsx

/**
 * Process Guarantee System
 * 
 * Ensures AI follows the correct AUDIT → DECIDE → APPLY → VERIFY process
 * in every new chat session. Provides automatic verification and compliance checking.
 * 
 * Universal Header: @scripts/process-guarantee-system.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ProcessStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  timestamp?: string;
  evidence?: string[];
}

interface ProcessSession {
  sessionId: string;
  startTime: string;
  currentStep: string;
  steps: ProcessStep[];
  complianceScore: number;
  violations: string[];
  recommendations: string[];
}

class ProcessGuaranteeSystem {
  private projectRoot: string;
  private sessionId: string;
  private session: ProcessSession;

  constructor() {
    this.projectRoot = process.cwd();
    this.sessionId = this.generateSessionId();
    this.session = this.initializeSession();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `session-${timestamp}`;
  }

  /**
   * Initialize new process session
   */
  private initializeSession(): ProcessSession {
    return {
      sessionId: this.sessionId,
      startTime: new Date().toISOString(),
      currentStep: 'audit',
      steps: [
        {
          id: 'audit',
          name: 'AUDIT',
          description: 'Analyze current state, identify issues, gather information',
          required: true,
          completed: false,
          evidence: []
        },
        {
          id: 'decide',
          name: 'DECIDE',
          description: 'Make decisions with documented reasoning and strategy',
          required: true,
          completed: false,
          evidence: []
        },
        {
          id: 'apply',
          name: 'APPLY',
          description: 'Implement changes with minimal diffs and proper methodology',
          required: true,
          completed: false,
          evidence: []
        },
        {
          id: 'verify',
          name: 'VERIFY',
          description: 'Validate implementation with tests and verification',
          required: true,
          completed: false,
          evidence: []
        }
      ],
      complianceScore: 0,
      violations: [],
      recommendations: []
    };
  }

  /**
   * Check if universal header is being followed
   */
  public checkUniversalHeaderCompliance(): boolean {
    const violations: string[] = [];
    
    // Check if required files exist
    const requiredFiles = [
      'UNIVERSAL_HEADER.md',
      'docs/AI_RULES.md',
      'docs/RENAMES.md',
      'AI_ENTRYPOINT.md'
    ];

    for (const file of requiredFiles) {
      if (!existsSync(join(this.projectRoot, file))) {
        violations.push(`Missing required file: ${file}`);
      }
    }

    // Check if hero tasks verification is available
    try {
      const packageJson = JSON.parse(readFileSync(join(this.projectRoot, 'package.json'), 'utf8'));
      if (!packageJson.scripts['hero:tasks:verify']) {
        violations.push('Missing hero:tasks:verify script in package.json');
      }
    } catch (error) {
      violations.push('Could not read package.json');
    }

    this.session.violations = violations;
    return violations.length === 0;
  }

  /**
   * Mark a process step as completed
   */
  public completeStep(stepId: string, evidence: string[] = []): void {
    const step = this.session.steps.find(s => s.id === stepId);
    if (step) {
      step.completed = true;
      step.timestamp = new Date().toISOString();
      step.evidence = evidence;
      
      // Move to next step
      const currentIndex = this.session.steps.findIndex(s => s.id === stepId);
      if (currentIndex < this.session.steps.length - 1) {
        this.session.currentStep = this.session.steps[currentIndex + 1].id;
      }
      
      this.updateComplianceScore();
    }
  }

  /**
   * Update compliance score based on completed steps
   */
  private updateComplianceScore(): void {
    const completedSteps = this.session.steps.filter(s => s.completed).length;
    const totalSteps = this.session.steps.length;
    this.session.complianceScore = (completedSteps / totalSteps) * 100;
  }

  /**
   * Generate process compliance report
   */
  public generateComplianceReport(): string {
    const report = [];
    
    report.push('🎯 PROCESS COMPLIANCE REPORT');
    report.push('=====================================');
    report.push(`📅 Session ID: ${this.session.sessionId}`);
    report.push(`⏰ Start Time: ${this.session.startTime}`);
    report.push(`📊 Compliance Score: ${this.session.complianceScore.toFixed(1)}%`);
    report.push(`📍 Current Step: ${this.session.currentStep.toUpperCase()}`);
    report.push('');

    // Process steps status
    report.push('📋 PROCESS STEPS STATUS:');
    report.push('----------------------');
    this.session.steps.forEach(step => {
      const status = step.completed ? '✅' : '⏳';
      const timestamp = step.timestamp ? ` (${step.timestamp})` : '';
      report.push(`${status} ${step.name}: ${step.description}${timestamp}`);
      
      if (step.evidence && step.evidence.length > 0) {
        report.push(`   Evidence: ${step.evidence.join(', ')}`);
      }
    });
    report.push('');

    // Violations
    if (this.session.violations.length > 0) {
      report.push('🚨 COMPLIANCE VIOLATIONS:');
      report.push('-------------------------');
      this.session.violations.forEach(violation => {
        report.push(`❌ ${violation}`);
      });
      report.push('');
    }

    // Recommendations
    report.push('💡 RECOMMENDATIONS:');
    report.push('-------------------');
    
    if (this.session.complianceScore < 100) {
      const incompleteSteps = this.session.steps.filter(s => !s.completed);
      incompleteSteps.forEach(step => {
        report.push(`• Complete ${step.name} phase: ${step.description}`);
      });
    }
    
    if (this.session.violations.length > 0) {
      report.push('• Address compliance violations listed above');
    }
    
    report.push('• Follow AUDIT → DECIDE → APPLY → VERIFY methodology');
    report.push('• Use npm run hero:tasks:verify for comprehensive verification');
    report.push('');

    report.push('✅ Process compliance report complete!');
    
    return report.join('\n');
  }

  /**
   * Generate process guarantee checklist
   */
  public generateProcessChecklist(): string {
    const checklist = [];
    
    checklist.push('📋 PROCESS GUARANTEE CHECKLIST');
    checklist.push('================================');
    checklist.push('');
    checklist.push('🔍 AUDIT PHASE CHECKLIST:');
    checklist.push('□ Read and acknowledge UNIVERSAL_HEADER.md');
    checklist.push('□ Read docs/AI_RULES.md and docs/COACH_HUB.md');
    checklist.push('□ Run npm run hero:tasks:verify');
    checklist.push('□ Analyze current system state');
    checklist.push('□ Identify issues and requirements');
    checklist.push('□ Gather comprehensive information');
    checklist.push('');
    
    checklist.push('🎯 DECIDE PHASE CHECKLIST:');
    checklist.push('□ State clear reasoning for decisions');
    checklist.push('□ Document strategy and approach');
    checklist.push('□ Consider constraints and limitations');
    checklist.push('□ Plan minimal diffs approach');
    checklist.push('□ Define success criteria');
    checklist.push('');
    
    checklist.push('🔧 APPLY PHASE CHECKLIST:');
    checklist.push('□ Use only approved rename scripts (if needed)');
    checklist.push('□ Use only alias imports (@app/*, @data/*, etc.)');
    checklist.push('□ Make minimal, focused changes');
    checklist.push('□ Follow security guidelines');
    checklist.push('□ Update CHANGE_JOURNAL.md (if touching registries)');
    checklist.push('');
    
    checklist.push('✅ VERIFY PHASE CHECKLIST:');
    checklist.push('□ Run npm run doctor');
    checklist.push('□ Run npm run ci');
    checklist.push('□ Fix-forward until green');
    checklist.push('□ Verify all functionality works');
    checklist.push('□ Confirm no regressions');
    checklist.push('□ Do not commit if red');
    checklist.push('');
    
    checklist.push('🛡️ SAFETY CHECKLIST:');
    checklist.push('□ Never weaken RLS or expose secrets');
    checklist.push('□ Never use manual renames/moves');
    checklist.push('□ Never use relative imports (../)');
    checklist.push('□ Always validate external inputs');
    checklist.push('□ Follow policy fences and ESLint rules');
    checklist.push('');
    
    return checklist.join('\n');
  }

  /**
   * Generate process enforcement prompt
   */
  public generateEnforcementPrompt(): string {
    return `🎯 PROCESS ENFORCEMENT PROMPT

CRITICAL: You MUST follow the AUDIT → DECIDE → APPLY → VERIFY process in this chat session.

REQUIRED ACTIONS:
1. Read UNIVERSAL_HEADER.md and docs/AI_RULES.md
2. Run npm run hero:tasks:verify
3. Follow the process guarantee checklist
4. Complete each phase before moving to the next
5. Generate compliance report at the end

ACKNOWLEDGEMENT REQUIRED:
Reply with exactly one:
- "Master rules loaded; standing by for <TASK_ID>."
- "Master rules loaded; proceeding with <TASK_ID>."

PROCESS VIOLATIONS WILL RESULT IN:
- Session termination
- Compliance score reduction
- Process restart requirement

BEGIN WITH AUDIT PHASE NOW.`;
  }

  /**
   * Run comprehensive process verification
   */
  public async runProcessVerification(): Promise<void> {
    console.log('🔍 Running Process Verification...');
    console.log('=====================================');
    
    // Check universal header compliance
    const isCompliant = this.checkUniversalHeaderCompliance();
    console.log(`📋 Universal Header Compliance: ${isCompliant ? '✅ PASS' : '❌ FAIL'}`);
    
    // Generate reports
    console.log('\n' + this.generateComplianceReport());
    console.log('\n' + this.generateProcessChecklist());
    
    if (!isCompliant) {
      console.log('\n🚨 PROCESS VIOLATIONS DETECTED!');
      console.log('Please address violations before proceeding.');
      process.exit(1);
    }
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

function main() {
  const args = process.argv.slice(2);
  
  const system = new ProcessGuaranteeSystem();
  
  if (args.includes('--check')) {
    system.runProcessVerification();
  } else if (args.includes('--prompt')) {
    console.log(system.generateEnforcementPrompt());
  } else if (args.length === 0) {
    console.log('🎯 Process Guarantee System');
    console.log('============================');
    console.log('');
    console.log('Usage:');
    console.log('  npm run process:guarantee          # Run full verification');
    console.log('  npm run process:guarantee --check  # Check compliance only');
    console.log('  npm run process:guarantee --prompt # Generate enforcement prompt');
    console.log('');
  } else {
    system.runProcessVerification();
  }
}

// Run main function
main();

export { ProcessGuaranteeSystem, ProcessStep, ProcessSession };
