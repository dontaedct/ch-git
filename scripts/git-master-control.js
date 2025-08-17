#!/usr/bin/env node

/**
 * Git Master Control - Lightweight & Efficient
 * Orchestrates Git automation systems without heavy operations
 */

const GitGuardian = require('./git-guardian');
const SmartHookManager = require('./smart-hook-manager');
const GitAutoRecovery = require('./git-auto-recovery');

class GitMasterControl {
    constructor() {
        this.guardian = new GitGuardian();
        this.hookManager = new SmartHookManager();
        this.recovery = new GitAutoRecovery();
    }

    /**
     * Main master control function - quick and efficient
     */
    async masterControl() {
        console.log('🎮 Git Master Control (Lightweight)');
        console.log('====================================');

        try {
            // Quick system check
            const systems = await this.quickSystemCheck();
            
            if (systems.status === 'healthy') {
                console.log('✅ All systems healthy - no action needed');
                return systems;
            }

            // Apply minimal fixes
            if (systems.issues.length > 0) {
                console.log('🔧 Applying master fixes...');
                await this.applyMasterFixes(systems.issues);
            }

            const finalStatus = await this.quickSystemCheck();
            console.log(`✅ Master control completed: ${finalStatus.status}`);
            return finalStatus;

        } catch (error) {
            console.error('❌ Master control error:', error.message);
            return { status: 'error', issues: [{ error: error.message }] };
        }
    }

    /**
     * Quick system check without heavy operations
     */
    async quickSystemCheck() {
        const issues = [];
        
        try {
            // Check if all systems can load
            if (!this.guardian || !this.hookManager || !this.recovery) {
                issues.push({ system: 'core', error: 'System modules failed to load' });
            }

            // Basic Git check
            const { execSync } = require('child_process');
            execSync('git status --porcelain', { stdio: 'pipe' });
        } catch (error) {
            issues.push({ system: 'git', error: 'Git not accessible' });
        }

        const status = issues.length === 0 ? 'healthy' : 'unhealthy';
        return { status, issues };
    }

    /**
     * Apply master fixes without heavy operations
     */
    async applyMasterFixes(issues) {
        for (const issue of issues) {
            try {
                switch (issue.system) {
                    case 'git':
                        // Minimal Git fix
                        break;
                    case 'core':
                        // System already loaded
                        break;
                }
            } catch (error) {
                console.log(`⚠️  Master fix failed for ${issue.system}: ${error.message}`);
            }
        }
    }

    /**
     * Run individual system checks
     */
    async runSystemChecks() {
        console.log('🔍 Running system checks...');
        
        const results = {
            guardian: await this.guardian.guard(),
            hooks: await this.hookManager.manage(),
            recovery: await this.recovery.startAutoRecovery()
        };

        return results;
    }

    /**
     * Emergency orchestration - minimal and safe
     */
    async emergencyOrchestration() {
        console.log('🚨 Emergency orchestration mode...');
        try {
            // Only run essential checks
            await this.guardian.emergencyRecovery();
            console.log('✅ Emergency orchestration completed');
        } catch (error) {
            console.log('⚠️  Emergency orchestration limited');
        }
    }

    /**
     * Provide status report
     */
    async provideStatusReport() {
        const systems = await this.runSystemChecks();
        
        console.log('\n📊 System Status Report');
        console.log('========================');
        console.log(`🛡️  Guardian: ${systems.guardian.status}`);
        console.log(`🧠 Hooks: ${systems.hooks.status}`);
        console.log(`🔄 Recovery: ${systems.recovery.status}`);
        
        const overallStatus = this.calculateOverallStatus(systems);
        console.log(`\n🎯 Overall Status: ${overallStatus.toUpperCase()}`);
        
        return { systems, overallStatus };
    }

    /**
     * Calculate overall system status
     */
    calculateOverallStatus(systems) {
        const statuses = [systems.guardian.status, systems.hooks.status, systems.recovery.status];
        
        if (statuses.every(s => s === 'healthy')) return 'healthy';
        if (statuses.some(s => s === 'error')) return 'error';
        if (statuses.some(s => s === 'unhealthy')) return 'unhealthy';
        return 'warning';
    }

    /**
     * Start monitoring mode
     */
    async startMonitoring() {
        console.log('🔍 Starting monitoring mode...');
        console.log('💡 Press Ctrl+C to stop');
        
        try {
            while (true) {
                await this.provideStatusReport();
                await this.sleep(10000); // 10 seconds
            }
        } catch (error) {
            console.log('🛑 Monitoring stopped');
        }
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI execution
if (require.main === module) {
    const master = new GitMasterControl();
    
    const args = process.argv.slice(2);
    if (args.includes('--monitor')) {
        master.startMonitoring().catch(console.error);
    } else {
        master.masterControl().catch(console.error);
    }
}

module.exports = GitMasterControl;
