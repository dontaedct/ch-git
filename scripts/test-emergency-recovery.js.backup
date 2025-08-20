#!/usr/bin/env node

/**
 * 🧪 Test Emergency Recovery System
 * 
 * This script tests the emergency recovery functionality:
 * 1. Tests Guardian health endpoint
 * 2. Tests Guardian emergency backup
 * 3. Tests MIT Hero emergency recovery
 * 
 * Follows universal header rules
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class EmergencyRecoveryTester {
    constructor() {
        this.projectRoot = process.cwd();
        this.testResults = [];
    }

    async runTest(name, testFn) {
        console.log(`🧪 Running test: ${name}`);
        try {
            const result = await testFn();
            this.testResults.push({ name, success: true, result });
            console.log(`✅ ${name}: PASSED`);
            return result;
        } catch (error) {
            this.testResults.push({ name, success: false, error: error.message });
            console.log(`❌ ${name}: FAILED - ${error.message}`);
            return null;
        }
    }

    async testGuardianHealth() {
        // Test if guardian health endpoint is accessible
        return new Promise((resolve, reject) => {
            const child = spawn('curl', ['-s', 'http://localhost:3000/api/guardian/health'], {
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

            child.on('close', (code) => {
                if (code === 0 && stdout) {
                    try {
                        const response = JSON.parse(stdout);
                        resolve(response);
                    } catch {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`Health check failed: ${stderr || 'No response'}`));
                }
            });

            child.on('error', (error) => {
                reject(new Error(`Health check error: ${error.message}`));
            });
        });
    }

    async testGuardianEmergency() {
        // Test guardian emergency backup
        return new Promise((resolve, reject) => {
            const child = spawn('npm', ['run', 'guardian:emergency'], {
                cwd: this.projectRoot,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let stdout = '';
            let stderr = '';

            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, stdout, stderr });
                } else {
                    reject(new Error(`Emergency backup failed with code ${code}: ${stderr}`));
                }
            });

            child.on('error', (error) => {
                reject(new Error(`Emergency backup error: ${error.message}`));
            });

            // Set timeout
            setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error('Emergency backup timed out'));
            }, 30000);
        });
    }

    async testMITHeroEmergency() {
        // Test MIT Hero emergency recovery
        return new Promise((resolve, reject) => {
            const child = spawn('node', ['scripts/mit-hero-unified-integration.js', 'emergency-recovery'], {
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

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, stdout, stderr, exitCode: code });
                } else {
                    reject(new Error(`MIT Hero emergency recovery failed with code ${code}: ${stderr}`));
                }
            });

            child.on('error', (error) => {
                reject(new Error(`MIT Hero emergency recovery error: ${error.message}`));
            });

            // Set timeout
            setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error('MIT Hero emergency recovery timed out'));
            }, 60000);
        });
    }

    async runAllTests() {
        console.log('🚨 EMERGENCY RECOVERY SYSTEM TEST');
        console.log('==================================');
        console.log('');

        // Test 1: Guardian Health
        await this.runTest('Guardian Health Endpoint', () => this.testGuardianHealth());

        // Test 2: Guardian Emergency Backup
        await this.runTest('Guardian Emergency Backup', () => this.testGuardianEmergency());

        // Test 3: MIT Hero Emergency Recovery
        await this.runTest('MIT Hero Emergency Recovery', () => this.testMITHeroEmergency());

        // Summary
        console.log('');
        console.log('📊 TEST SUMMARY');
        console.log('================');
        
        const passed = this.testResults.filter(r => r.success).length;
        const total = this.testResults.length;
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${total - passed}`);
        
        if (passed === total) {
            console.log('🎉 All tests passed! Emergency recovery system is working.');
            process.exit(0);
        } else {
            console.log('⚠️ Some tests failed. Check the output above for details.');
            process.exit(1);
        }
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    const tester = new EmergencyRecoveryTester();
    tester.runAllTests().catch(error => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = EmergencyRecoveryTester;
