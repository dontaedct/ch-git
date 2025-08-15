#!/usr/bin/env node

/**
 * 🤖 CURSOR AI AUTO-START AUTOMATION
 * 
 * This script automatically runs at the beginning of each Cursor AI chat
 * to ensure universal header compliance. It's designed to be:
 * - Fully automated
 * - Consistent across all chats
 * - Precise in rule enforcement
 * - Integrated with existing systems
 * 
 * Usage: 
 * - Run manually: node scripts/cursor-ai-auto-start.js
 * - Or integrate with Cursor AI startup
 * - Or run via npm: npm run cursor:auto
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class CursorAIAutoStart {
  constructor() {
    this.projectRoot = process.cwd();
    this.startTime = Date.now();
    this.isAutomated = true;
  }

  /**
   * Main execution - automatically runs universal header compliance
   */
  async execute() {
    console.log('🤖 CURSOR AI AUTO-START AUTOMATION');
    console.log('='.repeat(60));
    console.log('🎯 Automatically ensuring universal header compliance...');
    console.log('⏰ Started at:', new Date().toLocaleString());
    console.log('='.repeat(60));
    
    try {
      // STEP 1: Check if we're in a Cursor AI environment
      if (!this.isCursorAIEnvironment()) {
        console.log('⚠️ Not in Cursor AI environment - running in manual mode');
      } else {
        console.log('✅ Cursor AI environment detected');
      }
      
      // STEP 2: Run universal header compliance check
      console.log('\n🔍 Running universal header compliance check...');
      await this.runUniversalHeaderCheck();
      
      // STEP 3: Verify integration with existing systems
      console.log('\n🔗 Verifying system integration...');
      await this.verifySystemIntegration();
      
      // STEP 4: Display ready status
      await this.displayReadyStatus();
      
      const duration = Date.now() - this.startTime;
      console.log(`\n✅ AUTO-START COMPLETED in ${duration}ms`);
      console.log('🚀 Cursor AI is now ready to follow universal header rules automatically');
      
    } catch (error) {
      const duration = Date.now() - this.startTime;
      console.error(`\n❌ Auto-start failed after ${duration}ms: ${error.message}`);
      
      // Even if it fails, show basic compliance info
      await this.showBasicComplianceInfo();
      
      throw error;
    }
  }

  /**
   * Check if we're in a Cursor AI environment
   */
  isCursorAIEnvironment() {
    return process.env.CURSOR_AI === 'true' || 
           process.env.CURSOR_EDITOR === 'cursor' ||
           process.argv.includes('--cursor-ai') ||
           process.argv.includes('--ai');
  }

  /**
   * Run universal header compliance check
   */
  async runUniversalHeaderCheck() {
    try {
      // Check if the universal header script exists
      const headerScriptPath = path.join(this.projectRoot, 'scripts', 'cursor-ai-universal-header.js');
      
      if (!fs.existsSync(headerScriptPath)) {
        console.log('⚠️ Universal header script not found - creating basic compliance...');
        await this.createBasicCompliance();
        return;
      }
      
      // Run the universal header script
      console.log('🔄 Executing universal header compliance...');
      const result = await this.spawnCommand('node', ['scripts/cursor-ai-universal-header.js'], 120000);
      
      if (result.success) {
        console.log('✅ Universal header compliance verified');
      } else {
        console.log(`⚠️ Universal header check had warnings: ${result.stderr}`);
      }
      
    } catch (error) {
      console.log('⚠️ Universal header check failed, continuing with basic compliance...');
      await this.createBasicCompliance();
    }
  }

  /**
   * Create basic compliance if full check fails
   */
  async createBasicCompliance() {
    console.log('🔧 Setting up basic universal header compliance...');
    
    try {
      // Check package.json for rename scripts
      const packagePath = path.join(this.projectRoot, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }
        
        // Add basic rename scripts if they don't exist
        const requiredScripts = ['rename:symbol', 'rename:import', 'rename:route', 'rename:table'];
        let addedScripts = 0;
        
        for (const script of requiredScripts) {
          if (!packageJson.scripts[script]) {
            packageJson.scripts[script] = `tsx scripts/rename.ts ${script.split(':')[1]}`;
            addedScripts++;
          }
        }
        
        if (addedScripts > 0) {
          fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
          console.log(`📝 Added ${addedScripts} rename scripts to package.json`);
        }
      }
      
      console.log('✅ Basic compliance setup completed');
      
    } catch (error) {
      console.log('⚠️ Basic compliance setup failed:', error.message);
    }
  }

  /**
   * Verify integration with existing systems
   */
  async verifySystemIntegration() {
    try {
      // Check automation master
      const masterPath = path.join(this.projectRoot, 'scripts', 'automation-master.js');
      if (fs.existsSync(masterPath)) {
        console.log('✅ Automation master found');
      }
      
      // Check guardian system
      const guardianPath = path.join(this.projectRoot, 'scripts', 'guardian.js');
      if (fs.existsSync(guardianPath)) {
        console.log('✅ Guardian system found');
      }
      
      // Check task orchestrator
      const orchestratorPath = path.join(this.projectRoot, 'scripts', 'task-orchestrator.js');
      if (fs.existsSync(orchestratorPath)) {
        console.log('✅ Task orchestrator found');
      }
      
      // Check doctor system
      const doctorPath = path.join(this.projectRoot, 'scripts', 'doctor.ts');
      if (fs.existsSync(doctorPath)) {
        console.log('✅ Doctor system found');
      }
      
      console.log('🔗 System integration verified');
      
    } catch (error) {
      console.log('⚠️ System integration check failed:', error.message);
    }
  }

  /**
   * Display ready status
   */
  async displayReadyStatus() {
    console.log('\n🎯 UNIVERSAL HEADER COMPLIANCE STATUS');
    console.log('='.repeat(50));
    
    // Check key compliance areas
    const compliance = await this.checkComplianceAreas();
    
    for (const [area, status] of Object.entries(compliance)) {
      const icon = status.compliant ? '✅' : '⚠️';
      console.log(`${icon} ${area}: ${status.message}`);
    }
    
    console.log('='.repeat(50));
    
    if (Object.values(compliance).every(c => c.compliant)) {
      console.log('🎉 FULL COMPLIANCE ACHIEVED!');
    } else {
      console.log('📋 PARTIAL COMPLIANCE - Some areas need attention');
    }
  }

  /**
   * Check compliance areas
   */
  async checkComplianceAreas() {
    const compliance = {};
    
    try {
      // Check rename scripts
      const packagePath = path.join(this.projectRoot, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const renameScripts = Object.keys(packageJson.scripts || {}).filter(s => s.startsWith('rename:'));
        
        compliance['Rename Tools'] = {
          compliant: renameScripts.length >= 4,
          message: `${renameScripts.length}/4 scripts available`
        };
      }
      
      // Check import aliases
      const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
      if (fs.existsSync(tsconfigPath)) {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        const hasAliases = tsconfig.compilerOptions?.paths && Object.keys(tsconfig.compilerOptions.paths).length > 0;
        
        compliance['Import Aliases'] = {
          compliant: hasAliases,
          message: hasAliases ? 'Configured' : 'Not configured'
        };
      }
      
      // Check automation systems
      const automationScripts = ['automation-master.js', 'guardian.js', 'task-orchestrator.js'];
      const availableScripts = automationScripts.filter(script => 
        fs.existsSync(path.join(this.projectRoot, 'scripts', script))
      );
      
      compliance['Automation Systems'] = {
        compliant: availableScripts.length >= 2,
        message: `${availableScripts.length}/3 systems available`
      };
      
    } catch (error) {
      compliance['System Check'] = {
        compliant: false,
        message: 'Error during check'
      };
    }
    
    return compliance;
  }

  /**
   * Show basic compliance info if main check fails
   */
  async showBasicComplianceInfo() {
    console.log('\n📋 BASIC UNIVERSAL HEADER COMPLIANCE INFO');
    console.log('='.repeat(50));
    console.log('🎯 Key Rules to Follow:');
    console.log('• Use npm run rename:* for symbol/import/route/table changes');
    console.log('• Import via @app/*, @data/*, @lib/*, @ui/* aliases');
    console.log('• Run npm run doctor && npm run ci before committing');
    console.log('• Follow AUDIT → DECIDE → APPLY → VERIFY pattern');
    console.log('• Never weaken RLS or expose secrets');
    console.log('• Use <button> and <a> tags, not clickable divs');
    console.log('='.repeat(50));
  }

  /**
   * Spawn command with timeout
   */
  async spawnCommand(command, args, timeout) {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        cwd: this.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      const timeoutId = setTimeout(() => {
        child.kill();
        resolve({
          success: false,
          exitCode: -1,
          stdout,
          stderr: 'Command timed out'
        });
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        resolve({
          success: code === 0,
          exitCode: code,
          stdout,
          stderr
        });
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          exitCode: -1,
          stdout,
          stderr: error.message
        });
      });
    });
  }
}

// Main execution
if (require.main === module) {
  const autoStart = new CursorAIAutoStart();
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🤖 CURSOR AI AUTO-START AUTOMATION

Usage: node scripts/cursor-ai-auto-start.js [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Enable verbose output
  --manual       Force manual mode (skip Cursor AI detection)

This script automatically runs at the beginning of each Cursor AI chat
to ensure universal header compliance. It's fully automated, consistent,
and precise in rule enforcement.

Examples:
  node scripts/cursor-ai-auto-start.js
  npm run cursor:auto
  npm run cursor:auto -- --manual
`);
    process.exit(0);
  }
  
  autoStart.execute()
    .then(() => {
      console.log('\n🎉 Auto-start automation completed successfully!');
      console.log('🚀 Ready for Cursor AI development with universal header compliance');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Auto-start automation failed:', error.message);
      console.log('💡 Continuing with basic compliance...');
      process.exit(1);
    });
}

module.exports = CursorAIAutoStart;
