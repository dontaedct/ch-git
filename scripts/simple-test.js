#!/usr/bin/env node

console.log('🧪 Simple Test Starting...');

try {
    console.log('1. Testing Sentient Army...');
    const SentientArmy = require('./mit-hero-sentient-army-perfection.js');
    console.log('   ✅ Sentient Army imported:', typeof SentientArmy);
    
    console.log('2. Testing Quantum Neural...');
    const QuantumNeural = require('./quantum-neural-engine.js');
    console.log('   ✅ Quantum Neural imported:', typeof QuantumNeural);
    
    console.log('3. Testing Causality...');
    const Causality = require('./causality-predictor.js');
    console.log('   ✅ Causality imported:', typeof Causality);
    
    console.log('4. Testing Consciousness...');
    const Consciousness = require('./consciousness-simulator.js');
    console.log('   ✅ Consciousness imported:', typeof Consciousness);
    
    console.log('5. Testing Unified Integration...');
    const Unified = require('./mit-hero-unified-integration.js');
    console.log('   ✅ Unified Integration imported:', typeof Unified);
    
    console.log('\n🎉 All imports successful!');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
}
