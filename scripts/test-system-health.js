#!/usr/bin/env node

/**
 * MIT Hero System: Simple Health Test
 * Tests each system individually to ensure they're working
 */

const fs = require('fs');
const path = require('path');

class SimpleHealthTester {
    constructor() {
        this.testResults = new Map();
        this.startTime = Date.now();
    }

    async testSystem(systemName, testFunction) {
        console.log(`\n🔍 Testing ${systemName}...`);
        
        try {
            const startTime = Date.now();
            const result = await testFunction();
            const duration = Date.now() - startTime;
            
            this.testResults.set(systemName, {
                status: 'PASS',
                duration: duration,
                result: result
            });
            
            console.log(`✅ ${systemName}: PASS (${duration}ms)`);
            return true;
        } catch (error) {
            this.testResults.set(systemName, {
                status: 'FAIL',
                error: error.message,
                duration: 0
            });
            
            console.log(`❌ ${systemName}: FAIL - ${error.message}`);
            return false;
        }
    }

    async testSentientArmy() {
        const systemPath = path.join(__dirname, 'mit-hero-sentient-army-perfection.js');
        if (!fs.existsSync(systemPath)) {
            throw new Error('System file not found');
        }
        
        // Simple require test
        const SentientArmy = require(systemPath);
        const instance = new SentientArmy();
        const state = await instance.getSystemState();
        
        return {
            version: state.version,
            systemHealth: state.systemHealth,
            timestamp: state.timestamp
        };
    }

    async testQuantumNeural() {
        const systemPath = path.join(__dirname, 'quantum-neural-engine.js');
        if (!fs.existsSync(systemPath)) {
            throw new Error('System file not found');
        }
        
        const QuantumNeural = require(systemPath);
        const instance = new QuantumNeural();
        const health = await instance.getSystemHealth();
        
        return {
            overallHealth: health.overallHealth,
            status: health.status,
            quantumStateIntegrity: health.quantumStateIntegrity
        };
    }

    async testCausalityPredictor() {
        const systemPath = path.join(__dirname, 'causality-predictor.js');
        if (!fs.existsSync(systemPath)) {
            throw new Error('System file not found');
        }
        
        const CausalityPredictor = require(systemPath);
        const instance = new CausalityPredictor();
        const health = await instance.getSystemHealth();
        
        return {
            overallHealth: health.overallHealth,
            status: health.status,
            causalGraphIntegrity: health.causalGraphIntegrity
        };
    }

    async testConsciousnessSimulator() {
        const systemPath = path.join(__dirname, 'consciousness-simulator.js');
        if (!fs.existsSync(systemPath)) {
            throw new Error('System file not found');
        }
        
        const ConsciousnessSimulator = require(systemPath);
        const instance = new ConsciousnessSimulator();
        const health = await instance.getSystemHealth();
        
        return {
            overallHealth: health.overallHealth,
            status: health.status,
            consciousnessIntegrity: health.consciousnessIntegrity
        };
    }

    async testUnifiedIntegration() {
        const systemPath = path.join(__dirname, 'mit-hero-unified-integration.js');
        if (!fs.existsSync(systemPath)) {
            throw new Error('System file not found');
        }
        
        const UnifiedIntegration = require(systemPath);
        const instance = new UnifiedIntegration();
        const status = await instance.getUnifiedStatus();
        
        return {
            status: status.status,
            autonomousFeatures: status.autonomousFeatures,
            timestamp: status.timestamp
        };
    }

    async runAllTests() {
        console.log('🧪 MIT HERO SYSTEM: SIMPLE HEALTH TEST');
        console.log('=======================================');
        console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
        console.log('');

        const tests = [
            { name: 'Sentient Army Perfection', test: () => this.testSentientArmy() },
            { name: 'Quantum Neural Engine', test: () => this.testQuantumNeural() },
            { name: 'Causality Predictor', test: () => this.testCausalityPredictor() },
            { name: 'Consciousness Simulator', test: () => this.testConsciousnessSimulator() },
            { name: 'Unified Integration', test: () => this.testUnifiedIntegration() }
        ];

        let passedTests = 0;
        let totalTests = tests.length;

        for (const test of tests) {
            const passed = await this.testSystem(test.name, test.test);
            if (passed) passedTests++;
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Generate report
        this.generateReport(passedTests, totalTests);
    }

    generateReport(passedTests, totalTests) {
        console.log('\n📊 HEALTH TEST REPORT');
        console.log('======================');
        console.log(`⏰ Total time: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s`);
        console.log(`✅ Passed: ${passedTests}/${totalTests}`);
        console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
        
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        console.log(`📈 Success rate: ${successRate}%`);

        if (passedTests === totalTests) {
            console.log('\n🎉 ALL SYSTEMS HEALTHY! Ready for activation.');
        } else if (passedTests >= 3) {
            console.log('\n⚠️  MOST SYSTEMS HEALTHY. Some issues detected but core functionality available.');
        } else {
            console.log('\n💥 CRITICAL ISSUES DETECTED. System activation not recommended.');
        }

        // Show detailed results
        console.log('\n📋 DETAILED RESULTS:');
        for (const [systemName, result] of this.testResults) {
            const status = result.status === 'PASS' ? '✅' : '❌';
            const info = result.status === 'PASS' 
                ? `(${result.duration}ms)` 
                : `- ${result.error}`;
            console.log(`   ${status} ${systemName}: ${info}`);
        }
    }

    async run() {
        try {
            await this.runAllTests();
        } catch (error) {
            console.error('💥 Critical error in health tester:', error);
            process.exit(1);
        }
    }
}

// CLI interface
if (require.main === module) {
    const tester = new SimpleHealthTester();
    tester.run();
}

module.exports = SimpleHealthTester;
