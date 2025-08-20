#!/usr/bin/env node

/**
 * Test script for the fixed MIT Hero system
 * This script tests that the system can run without freezing and can be safely stopped
 */

import MITHeroUnifiedIntegration from './mit-hero-unified-integration';;

async function testMitHero() {
    console.log('🧪 Testing MIT Hero System (Fixed Version)');
    console.log('==========================================');
    
    const hero = new MITHeroUnifiedIntegration();
    
    try {
        console.log('\n🚀 Starting MIT Hero System...');
        
        // Start the system
        await hero.execute();
        
        console.log('\n⏰ Waiting 10 seconds to observe behavior...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        console.log('\n🛑 Testing cleanup...');
        hero.cleanup();
        
        console.log('\n✅ Test completed successfully!');
        console.log('🎯 The system should have stopped without freezing');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testMitHero();
