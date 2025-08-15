#!/usr/bin/env node

/**
 * MIT Hero System: Bulletproof Autonomous Activation
 * Activates all autonomous systems safely without freezing
 */

const { spawn } = require('child_process');
const path = require('path');

class BulletproofActivator {
    constructor() {
        this.activatedSystems = new Set();
        this.failedSystems = new Set();
        this.startTime = Date.now();
    }

    async activateSystem(systemName, command, description) {
        console.log(`\n🔧 Activating ${systemName}...`);
        console.log(`   ${description}`);
        
        try {
            return new Promise((resolve, reject) => {
                const child = spawn('npm', ['run', command], {
                    stdio: 'pipe',
                    shell: true
                });

                let output = '';
                let errorOutput = '';

                child.stdout.on('data', (data) => {
                    output += data.toString();
                    process.stdout.write(data);
                });

                child.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                    process.stderr.write(data);
                });

                child.on('close', (code) => {
                    if (code === 0) {
                        this.activatedSystems.add(systemName);
                        console.log(`✅ ${systemName} activated successfully`);
                        resolve(true);
                    } else {
                        this.failedSystems.add(systemName);
                        console.log(`❌ ${systemName} failed with code ${code}`);
                        resolve(false);
                    }
                });

                child.on('error', (error) => {
                    this.failedSystems.add(systemName);
                    console.log(`❌ ${systemName} error:`, error.message);
                    resolve(false);
                });

                // Safety timeout - kill if taking too long
                setTimeout(() => {
                    if (!child.killed) {
                        child.kill('SIGTERM');
                        console.log(`⏰ ${systemName} timed out, moving to next system`);
                        resolve(false);
                    }
                }, 30000); // 30 second timeout
            });
        } catch (error) {
            console.log(`❌ ${systemName} activation error:`, error.message);
            this.failedSystems.add(systemName);
            return false;
        }
    }

    async activateAllSystems() {
        console.log('🚀 MIT HERO SYSTEM: BULLETPROOF AUTONOMOUS ACTIVATION');
        console.log('========================================================');
        console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
        console.log('');

        const systems = [
            {
                name: 'Sentient Army Perfection',
                command: 'hero:sentient:perfection',
                description: 'Core sentient army perfection system'
            },
            {
                name: 'Quantum Neural Engine',
                command: 'quantum:neural:initialize',
                description: 'Quantum-enhanced neural optimization'
            },
            {
                name: 'Causality Predictor',
                command: 'causality:predict',
                description: 'Predictive causality analysis'
            },
            {
                name: 'Consciousness Simulator',
                command: 'consciousness:emerge',
                description: 'Multi-dimensional consciousness simulation'
            }
        ];

        console.log('📋 Systems to activate:');
        systems.forEach((system, index) => {
            console.log(`   ${index + 1}. ${system.name}`);
        });
        console.log('');

        // Activate systems one by one with safety delays
        for (const system of systems) {
            const success = await this.activateSystem(
                system.name, 
                system.command, 
                system.description
            );
            
            // Safety delay between activations
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Final status report
        await this.generateStatusReport();
    }

    async generateStatusReport() {
        console.log('\n📊 ACTIVATION STATUS REPORT');
        console.log('============================');
        console.log(`⏰ Total time: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s`);
        console.log(`✅ Successfully activated: ${this.activatedSystems.size}`);
        console.log(`❌ Failed activations: ${this.failedSystems.size}`);
        
        if (this.activatedSystems.size > 0) {
            console.log('\n✅ Activated systems:');
            Array.from(this.activatedSystems).forEach(system => {
                console.log(`   • ${system}`);
            });
        }
        
        if (this.failedSystems.size > 0) {
            console.log('\n❌ Failed systems:');
            Array.from(this.failedSystems).forEach(system => {
                console.log(`   • ${system}`);
            });
        }

        // Calculate success rate
        const totalSystems = this.activatedSystems.size + this.failedSystems.size;
        const successRate = totalSystems > 0 ? (this.activatedSystems.size / totalSystems * 100).toFixed(1) : 0;
        console.log(`\n📈 Success rate: ${successRate}%`);

        if (this.activatedSystems.size >= 2) {
            console.log('\n🎉 SUCCESS: Core autonomous systems are now active!');
            console.log('   The MIT Hero System is now operating with enhanced capabilities.');
        } else {
            console.log('\n⚠️  WARNING: Some systems failed to activate.');
            console.log('   Check the logs above for specific error details.');
        }
    }

    async run() {
        try {
            await this.activateAllSystems();
        } catch (error) {
            console.error('💥 Critical error in bulletproof activator:', error);
            process.exit(1);
        }
    }
}

// CLI interface
if (require.main === module) {
    const activator = new BulletproofActivator();
    activator.run();
}

module.exports = BulletproofActivator;
