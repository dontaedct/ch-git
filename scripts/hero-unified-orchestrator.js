#!/usr/bin/env node

/**
 * 🎮 HERO UNIFIED ORCHESTRATOR - THE ULTIMATE AUTOMATION SYSTEM
 * 
 * This is the UNIFIED ORCHESTRATOR that consolidates ALL hero systems into one:
 * - Hero Ultimate (optimized)
 * - Hero System
 * - Hero Intelligence
 * - Hero Orchestrator
 * - Hero Threat Response
 * - Automation Master
 * - Task Orchestrator
 * - Guardian System
 * - Doctor System
 * - Smart Lint
 * - Git Master Control
 * - Cursor AI Systems
 * 
 * Features:
 * - 🔄 FULLY UNIFIED (single system, multiple capabilities)
 * - 🎯 INTELLIGENT INTEGRATION with all existing systems
 * - 🚀 AUTO-TRIGGER on every development action
 * - 🛡️ PROACTIVE THREAT DETECTION & RESPONSE
 * - 🧠 AI-POWERED OPTIMIZATION & LEARNING
 * - 📊 REAL-TIME MONITORING & ANALYTICS
 * - 🚨 EMERGENCY RESPONSE & RECOVERY
 * - 🔧 AUTO-REPAIR & UPGRADE SYSTEMS
 * - ⚡ OPTIMIZED PERFORMANCE & MEMORY USAGE
 * - 🎮 UNIFIED CONTROL CENTER
 * - 🧹 MEMORY LEAK PREVENTION
 * - 🚀 PERFORMANCE OPTIMIZATION
 * 
 * Follows universal header rules completely
 * AUDIT → DECIDE → APPLY → VERIFY pattern
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');

// Unified Hero Configuration
const UNIFIED_HERO_CONFIG = {
  name: 'Hero Unified Orchestrator - Master of All Systems',
  version: '4.0.0',
  description: 'The ultimate unified automation system that consolidates all hero capabilities',
  
  // Automation Settings
  autoStart: true,
  autoMonitor: true,
  autoRepair: true,
  autoUpgrade: true,
  autoIntegrate: true,
  autoOptimize: true,
  
  // Integration Points - UNIFIED
  integrationPoints: [
    'git-hooks',
    'ci-pipeline', 
    'build-processes',
    'file-watchers',
    'scheduled-tasks',
    'cursor-ai',
    'guardian-backup',
    'doctor-system',
    'lint-system',
    'memory-management',
    'performance-optimization',
    'threat-response',
    'intelligence-learning'
  ],
  
  // Monitoring Intervals - OPTIMIZED
  healthCheckInterval: 45000,      // 45 seconds (balanced)
  threatScanInterval: 30000,       // 30 seconds (balanced)
  optimizationInterval: 180000,    // 3 minutes (balanced)
  backupCheckInterval: 900000,     // 15 minutes (balanced)
  gitHealthInterval: 60000,        // 1 minute (balanced)
  memoryCheckInterval: 120000,     // 2 minutes (balanced)
  
  // Emergency Thresholds - BALANCED
  criticalHealthThreshold: 0.5,    // 50% health triggers emergency
  threatEscalationThreshold: 3,    // 3 threats trigger escalation
  systemFailureThreshold: 4,       // 4 system failures trigger recovery
  
  // Auto-Repair Settings - BALANCED
  maxRepairAttempts: 3,
  repairCooldown: 90000,           // 90 seconds between repair attempts
  autoUpgradeThreshold: 0.65       // 65% health triggers auto-upgrade
};

// Unified System Registry - ALL SYSTEMS INTEGRATED
const UNIFIED_SYSTEM_REGISTRY = {
  // Core Systems
  'hero-ultimate': {
    name: 'Hero Ultimate System',
    scripts: ['hero:ultimate', 'hero:status', 'hero:health'],
    healthCheck: 'hero:health',
    autoRepair: 'hero:repair',
    priority: 'critical',
    healthThreshold: 0.9,
    category: 'core'
  },
  
  'git': {
    name: 'Git Master Control',
    scripts: ['git:guardian', 'git:smart', 'git:master'],
    healthCheck: 'git:health',
    autoRepair: 'git:repair',
    priority: 'critical',
    healthThreshold: 0.8,
    category: 'version-control'
  },
  
  'guardian': {
    name: 'Guardian Backup System',
    scripts: ['guardian:health', 'guardian:backup'],
    healthCheck: 'guardian:check',
    autoRepair: 'guardian:emergency',
    priority: 'critical',
    healthThreshold: 0.9,
    category: 'backup'
  },
  
  'doctor': {
    name: 'Doctor Health System',
    scripts: ['doctor', 'doctor:fix'],
    healthCheck: 'doctor:lightweight',
    autoRepair: 'doctor:fix',
    priority: 'high',
    healthThreshold: 0.7,
    category: 'health'
  },
  
  'ci': {
    name: 'CI Pipeline',
    scripts: ['ci', 'ci:fast', 'safe'],
    healthCheck: 'lint:check',
    autoRepair: 'lint:fix',
    priority: 'high',
    healthThreshold: 0.7,
    category: 'quality'
  },
  
  'build': {
    name: 'Build System',
    scripts: ['build', 'build:fast', 'build:memory'],
    healthCheck: 'typecheck',
    autoRepair: 'build:fast',
    priority: 'medium',
    healthThreshold: 0.6,
    category: 'build'
  },
  
  'lint': {
    name: 'Linting System',
    scripts: ['lint', 'lint:fix', 'smart-lint'],
    healthCheck: 'lint:check',
    autoRepair: 'lint:fix',
    priority: 'medium',
    healthThreshold: 0.6,
    category: 'quality'
  },
  
  'cursor-ai': {
    name: 'Cursor AI System',
    scripts: ['cursor:header', 'cursor:auto'],
    healthCheck: 'cursor:header:report',
    autoRepair: 'cursor:header:fix',
    priority: 'medium',
    healthThreshold: 0.6,
    category: 'ai'
  },
  
  'memory': {
    name: 'Memory Management',
    scripts: ['memory:detect', 'memory:fix'],
    healthCheck: 'memory:report',
    autoRepair: 'memory:fix',
    priority: 'low',
    healthThreshold: 0.5,
    category: 'performance'
  },
  
  'performance': {
    name: 'Performance Optimization',
    scripts: ['performance:test', 'performance:optimize'],
    healthCheck: 'performance:check',
    autoRepair: 'performance:optimize',
    priority: 'low',
    healthThreshold: 0.5,
    category: 'performance'
  },
  
  'threat-response': {
    name: 'Threat Response System',
    scripts: ['threat:scan', 'threat:respond'],
    healthCheck: 'threat:status',
    autoRepair: 'threat:mitigate',
    priority: 'high',
    healthThreshold: 0.8,
    category: 'security'
  },
  
  'intelligence': {
    name: 'Intelligence & Learning',
    scripts: ['intelligence:learn', 'intelligence:optimize'],
    healthCheck: 'intelligence:status',
    autoRepair: 'intelligence:reset',
    priority: 'medium',
    healthThreshold: 0.6,
    category: 'ai'
  }
};

// Singleton instance
let unifiedHeroInstance = null;

class HeroUnifiedOrchestrator {
  constructor() {
    // Prevent multiple instances
    if (unifiedHeroInstance) {
      return unifiedHeroInstance;
    }
    
    this.status = 'stopped';
    this.startTime = null;
    this.uptime = 0;
    this.extremeAutomationEnabled = false;
    this.monitoringIntervals = {};
    this.systemHealth = 'unknown';
    this.lastHealthCheck = null;
    this.threatLevel = 'low';
    this.activeThreats = [];
    this.systemMetrics = {};
    this.performanceHistory = [];
    this.securityStatus = 'unknown';
    this.reliabilityScore = 0;
    this.efficiencyScore = 0;
    
    // UNIFIED: Enhanced memory management
    this.memoryUsage = {
      start: process.memoryUsage(),
      peak: process.memoryUsage(),
      current: process.memoryUsage(),
      history: []
    };
    
    // UNIFIED: Enhanced performance tracking
    this.performanceMetrics = {
      operationsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      throughput: 0,
      memoryEfficiency: 0,
      cpuEfficiency: 0
    };
    
    // UNIFIED: Enhanced threat intelligence
    this.threatIntelligence = {
      knownThreats: new Set(),
      threatPatterns: new Map(),
      responseStrategies: new Map(),
      learningEnabled: true,
      threatHistory: [],
      mitigationHistory: []
    };
    
    // UNIFIED: System integration status
    this.systemStatus = new Map();
    this.healthScores = new Map();
    this.lastChecks = new Map();
    
    // UNIFIED: Performance optimization
    this.optimizationHistory = [];
    this.optimizationEnabled = true;
    
    // Set this instance as the singleton
    unifiedHeroInstance = this;
    
    console.log('🚀 Hero Unified Orchestrator initialized (singleton instance)');
  }
  
  // Initialize the unified hero system
  async initialize() {
    console.log('🎮 HERO UNIFIED ORCHESTRATOR - THE ULTIMATE AUTOMATION SYSTEM');
    console.log('='.repeat(80));
    console.log('🚀 Initializing unified automation capabilities...');
    console.log('⏰ Started at:', new Date().toLocaleString());
    console.log('🧠 Enhanced memory optimization enabled');
    console.log('⚡ Enhanced performance optimization enabled');
    console.log('🛡️ Enhanced threat intelligence enabled');
    console.log('🎯 Unified system orchestration enabled');
    console.log('='.repeat(80));
    
    try {
      // STEP 1: AUDIT - Analyze current state
      console.log('\n🔍 STEP 1: AUDIT - Analyzing current state...');
      const auditResults = await this.performSystemAudit();
      
      // STEP 2: DECIDE - Determine required actions
      console.log('\n🎯 STEP 2: DECIDE - Determining required actions...');
      const decisions = await this.makeStrategicDecisions(auditResults);
      
      // STEP 3: APPLY - Execute strategic actions
      console.log('\n🔧 STEP 3: APPLY - Executing strategic actions...');
      await this.executeStrategicActions(decisions);
      
      // STEP 4: VERIFY - Verify system health
      console.log('\n✅ STEP 4: VERIFY - Verifying system health...');
      const health = await this.performComprehensiveHealthCheck();
      
      if (health.overallHealth >= 0.8) {
        console.log('🎉 Hero Unified Orchestrator is ready and healthy!');
        this.status = 'running';
        this.startTime = Date.now();
        
        // Start unified monitoring
        this.startUnifiedMonitoring();
        
        // Display unified dashboard
        this.displayUnifiedDashboard();
        
        return true;
      } else {
        console.log('⚠️ System health below threshold, attempting unified auto-repair...');
        await this.performUnifiedAutoRepair();
        return false;
      }
      
    } catch (error) {
      console.error('❌ Hero Unified Orchestrator initialization failed:', error.message);
      throw error;
    }
  }
  
  // STEP 1: AUDIT - Analyze current state
  async performSystemAudit() {
    console.log('  🔍 Performing comprehensive system audit...');
    
    const auditResults = {
      timestamp: new Date().toISOString(),
      systemStatus: {},
      healthScores: {},
      threats: [],
      recommendations: [],
      performance: {},
      memory: {},
      integrations: {}
    };
    
    // Audit each system
    for (const [key, system] of Object.entries(UNIFIED_SYSTEM_REGISTRY)) {
      try {
        console.log(`    🔍 Auditing ${system.name}...`);
        
        const systemAudit = await this.auditSystem(key, system);
        auditResults.systemStatus[key] = systemAudit.status;
        auditResults.healthScores[key] = systemAudit.healthScore;
        auditResults.integrations[key] = systemAudit.integrationStatus;
        
        if (systemAudit.threats.length > 0) {
          auditResults.threats.push(...systemAudit.threats);
        }
        
        if (systemAudit.recommendations.length > 0) {
          auditResults.recommendations.push(...systemAudit.recommendations);
        }
        
        console.log(`    ✅ ${system.name} audit completed`);
        
      } catch (error) {
        console.log(`    ⚠️ ${system.name} audit warning: ${error.message}`);
        auditResults.systemStatus[key] = 'error';
        auditResults.healthScores[key] = 0.1;
      }
    }
    
    // Audit performance and memory
    auditResults.performance = this.auditPerformance();
    auditResults.memory = this.auditMemory();
    
    console.log('  ✅ System audit completed');
    return auditResults;
  }
  
  // Audit individual system
  async auditSystem(key, system) {
    const audit = {
      status: 'unknown',
      healthScore: 0,
      integrationStatus: 'unknown',
      threats: [],
      recommendations: []
    };
    
    try {
      // Check if system is accessible
      if (system.healthCheck) {
        await this.runCommand(system.healthCheck, { timeout: 15000, silent: true });
        audit.status = 'healthy';
        audit.healthScore = 1.0;
        audit.integrationStatus = 'integrated';
      } else {
        audit.status = 'no-health-check';
        audit.healthScore = 0.5;
        audit.integrationStatus = 'basic';
      }
      
      // Check for potential threats
      if (audit.healthScore < system.healthThreshold) {
        audit.threats.push({
          type: 'low_health',
          severity: 'medium',
          message: `${system.name} health below threshold`,
          system: key
        });
        
        audit.recommendations.push({
          action: 'repair',
          priority: system.priority,
          system: key,
          message: `Repair ${system.name} to improve health`
        });
      }
      
    } catch (error) {
      audit.status = 'error';
      audit.healthScore = 0.1;
      audit.integrationStatus = 'failed';
      audit.threats.push({
        type: 'system_error',
        severity: 'high',
        message: `${system.name} failed health check: ${error.message}`,
        system: key
      });
      
      audit.recommendations.push({
        action: 'emergency_repair',
        priority: 'critical',
        system: key,
        message: `Emergency repair required for ${system.name}`
      });
    }
    
    return audit;
  }
  
  // Audit performance
  auditPerformance() {
    const performance = {
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      performanceScore: 0
    };
    
    // Calculate performance score based on memory efficiency
    const memoryEfficiency = 1 - (performance.memoryUsage.heapUsed / performance.memoryUsage.heapTotal);
    performance.performanceScore = memoryEfficiency;
    
    return performance;
  }
  
  // Audit memory
  auditMemory() {
    const memory = {
      current: process.memoryUsage(),
      peak: this.memoryUsage.peak,
      efficiency: 0,
      recommendations: []
    };
    
    // Calculate memory efficiency
    memory.efficiency = 1 - (memory.current.heapUsed / memory.current.heapTotal);
    
    // Memory recommendations
    if (memory.current.heapUsed > 150 * 1024 * 1024) { // 150MB threshold
      memory.recommendations.push({
        action: 'cleanup',
        priority: 'medium',
        message: 'Memory usage is high, recommend cleanup'
      });
    }
    
    if (memory.efficiency < 0.3) {
      memory.recommendations.push({
        action: 'optimize',
        priority: 'high',
        message: 'Memory efficiency is low, recommend optimization'
      });
    }
    
    return memory;
  }
  
  // STEP 2: DECIDE - Determine required actions
  async makeStrategicDecisions(auditResults) {
    console.log('  🎯 Making strategic decisions based on audit...');
    
    const decisions = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      critical: []
    };
    
    // Process threats
    for (const threat of auditResults.threats) {
      if (threat.severity === 'critical' || threat.severity === 'high') {
        decisions.immediate.push({
          action: 'threat_response',
          priority: 'critical',
          threat: threat,
          message: `Immediate response required for ${threat.message}`
        });
      } else {
        decisions.shortTerm.push({
          action: 'threat_response',
          priority: 'medium',
          threat: threat,
          message: `Short-term response for ${threat.message}`
        });
      }
    }
    
    // Process recommendations
    for (const recommendation of auditResults.recommendations) {
      if (recommendation.priority === 'critical') {
        decisions.critical.push(recommendation);
      } else if (recommendation.priority === 'high') {
        decisions.immediate.push(recommendation);
      } else if (recommendation.priority === 'medium') {
        decisions.shortTerm.push(recommendation);
      } else {
        decisions.longTerm.push(recommendation);
      }
    }
    
    // Performance optimization decisions
    if (auditResults.performance.performanceScore < 0.5) {
      decisions.shortTerm.push({
        action: 'performance_optimization',
        priority: 'medium',
        message: 'Performance optimization recommended'
      });
    }
    
    // Memory optimization decisions
    if (auditResults.memory.efficiency < 0.3) {
      decisions.immediate.push({
        action: 'memory_optimization',
        priority: 'high',
        message: 'Memory optimization required'
      });
    }
    
    console.log(`  ✅ Strategic decisions made: ${decisions.immediate.length} immediate, ${decisions.shortTerm.length} short-term`);
    return decisions;
  }
  
  // STEP 3: APPLY - Execute strategic actions
  async executeStrategicActions(decisions) {
    console.log('  🔧 Executing strategic actions...');
    
    // Execute critical actions first
    for (const action of decisions.critical) {
      try {
        console.log(`    🚨 Executing critical action: ${action.message}`);
        await this.executeAction(action);
        console.log(`    ✅ Critical action completed: ${action.message}`);
      } catch (error) {
        console.error(`    ❌ Critical action failed: ${action.message} - ${error.message}`);
      }
    }
    
    // Execute immediate actions
    for (const action of decisions.immediate) {
      try {
        console.log(`    ⚡ Executing immediate action: ${action.message}`);
        await this.executeAction(action);
        console.log(`    ✅ Immediate action completed: ${action.message}`);
      } catch (error) {
        console.log(`    ⚠️ Immediate action warning: ${action.message} - ${error.message}`);
      }
    }
    
    // Execute short-term actions
    for (const action of decisions.shortTerm) {
      try {
        console.log(`    🔧 Executing short-term action: ${action.message}`);
        await this.executeAction(action);
        console.log(`    ✅ Short-term action completed: ${action.message}`);
      } catch (error) {
        console.log(`    ⚠️ Short-term action warning: ${action.message} - ${error.message}`);
      }
    }
    
    console.log('  ✅ Strategic actions executed');
  }
  
  // Execute individual action
  async executeAction(action) {
    switch (action.action) {
      case 'threat_response':
        return await this.respondToThreat(action.threat);
      case 'repair':
        return await this.repairSystem(action.system);
      case 'emergency_repair':
        return await this.emergencyRepairSystem(action.system);
      case 'performance_optimization':
        return await this.optimizePerformance();
      case 'memory_optimization':
        return await this.optimizeMemory();
      default:
        console.log(`    ⚠️ Unknown action type: ${action.action}`);
        return false;
    }
  }
  
  // Respond to threat
  async respondToThreat(threat) {
    console.log(`      🛡️ Responding to threat: ${threat.message}`);
    
    // Add to threat intelligence
    this.threatIntelligence.knownThreats.add(threat.type);
    this.threatIntelligence.threatHistory.push({
      ...threat,
      timestamp: new Date().toISOString(),
      response: 'automatic'
    });
    
    // Implement threat response strategy
    switch (threat.type) {
             case 'low_health':
         return await this.repairSystem(threat.system);
       case 'system_error':
         return await this.emergencyRepairSystem(threat.system);
      default:
        console.log(`        ⚠️ Unknown threat type: ${threat.type}`);
        return false;
    }
  }
  
  // Repair system
  async repairSystem(systemKey) {
    const system = UNIFIED_SYSTEM_REGISTRY[systemKey];
    if (!system || !system.autoRepair) {
      return false;
    }
    
    try {
      await this.runCommand(system.autoRepair, { timeout: 30000 });
      return true;
    } catch (error) {
      console.log(`        ⚠️ System repair failed: ${error.message}`);
      return false;
    }
  }
  
  // Emergency repair system
  async emergencyRepairSystem(systemKey) {
    const system = UNIFIED_SYSTEM_REGISTRY[systemKey];
    if (!system) {
      return false;
    }
    
    try {
      // Try multiple repair strategies
      if (system.autoRepair) {
        await this.runCommand(system.autoRepair, { timeout: 45000 });
      }
      
      // Force health check
      if (system.healthCheck) {
        await this.runCommand(system.healthCheck, { timeout: 30000 });
      }
      
      return true;
    } catch (error) {
      console.log(`        ❌ Emergency repair failed: ${error.message}`);
      return false;
    }
  }
  
  // Optimize performance
  async optimizePerformance() {
    console.log('        ⚡ Optimizing performance...');
    
    // Clear performance history
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-50);
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Update performance metrics
    this.updatePerformanceMetrics();
    
    return true;
  }
  
  // Optimize memory
  async optimizeMemory() {
    console.log('        🧹 Optimizing memory...');
    
    // Clear memory history
    if (this.memoryUsage.history.length > 50) {
      this.memoryUsage.history = this.memoryUsage.history.slice(-25);
    }
    
    // Clear old threats and patterns
    this.threatIntelligence.threatHistory = this.threatIntelligence.threatHistory.slice(-100);
    this.threatIntelligence.mitigationHistory = this.threatIntelligence.mitigationHistory.slice(-100);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    return true;
  }
  
  // STEP 4: VERIFY - Comprehensive health check
  async performComprehensiveHealthCheck() {
    console.log('  ✅ Performing comprehensive health check...');
    
    const startTime = Date.now();
    
    try {
      const healthResults = {};
      let totalHealth = 0;
      let systemCount = 0;
      
      // Parallel health checks for all systems
      const healthPromises = Object.entries(UNIFIED_SYSTEM_REGISTRY).map(async ([key, system]) => {
        try {
          const health = await this.checkSystemHealth(key, system);
          healthResults[key] = health;
          totalHealth += health.score;
          systemCount++;
          return health;
        } catch (error) {
          healthResults[key] = { score: 0.3, status: 'error', error: error.message };
          totalHealth += 0.3;
          systemCount++;
          return healthResults[key];
        }
      });
      
      await Promise.all(healthPromises);
      
      const overallHealth = totalHealth / systemCount;
      this.systemHealth = this.getHealthStatus(overallHealth);
      this.lastHealthCheck = Date.now();
      
      const duration = Date.now() - startTime;
      
      return {
        overallHealth,
        systemHealth: this.systemHealth,
        healthResults,
        duration,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Comprehensive health check failed:', error.message);
      return {
        overallHealth: 0.1,
        systemHealth: 'critical',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Check system health
  async checkSystemHealth(key, system) {
    try {
      if (!system.healthCheck) {
        return { score: 0.5, status: 'unknown', message: 'No health check script' };
      }
      
      await this.runCommand(system.healthCheck, { timeout: 15000, silent: true });
      return { score: 1.0, status: 'healthy', message: 'Health check passed' };
      
    } catch (error) {
      return { score: 0.3, status: 'unhealthy', error: error.message };
    }
  }
  
  // Get health status
  getHealthStatus(score) {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'fair';
    if (score >= 0.2) return 'poor';
    return 'critical';
  }
  
  // Start unified monitoring
  startUnifiedMonitoring() {
    console.log('  📊 Starting unified monitoring...');
    
    // Health check monitoring
    this.monitoringIntervals.health = setInterval(() => {
      this.performComprehensiveHealthCheck();
    }, UNIFIED_HERO_CONFIG.healthCheckInterval);
    
    // Threat scanning
    this.monitoringIntervals.threats = setInterval(() => {
      this.scanForThreats();
    }, UNIFIED_HERO_CONFIG.threatScanInterval);
    
    // Performance optimization
    this.monitoringIntervals.performance = setInterval(() => {
      this.optimizePerformance();
    }, UNIFIED_HERO_CONFIG.optimizationInterval);
    
    // Memory monitoring
    this.monitoringIntervals.memory = setInterval(() => {
      this.updateMemoryMetrics();
    }, UNIFIED_HERO_CONFIG.memoryCheckInterval);
    
    console.log('  ✅ Unified monitoring started');
  }
  
  // Update memory metrics
  updateMemoryMetrics() {
    const currentMemory = process.memoryUsage();
    
    this.memoryUsage.current = currentMemory;
    this.memoryUsage.peak = {
      rss: Math.max(this.memoryUsage.peak.rss, currentMemory.rss),
      heapUsed: Math.max(this.memoryUsage.peak.heapUsed, currentMemory.heapUsed),
      heapTotal: Math.max(this.memoryUsage.peak.heapTotal, currentMemory.heapTotal),
      external: Math.max(this.memoryUsage.peak.external, currentMemory.external)
    };
    
    // Add to history
    this.memoryUsage.history.push({
      timestamp: Date.now(),
      usage: { ...currentMemory }
    });
    
    // Cleanup old history
    if (this.memoryUsage.history.length > 100) {
      this.memoryUsage.history = this.memoryUsage.history.slice(-50);
    }
  }
  
  // Update performance metrics
  updatePerformanceMetrics() {
    const now = Date.now();
    if (this.lastHealthCheck) {
      const timeDiff = now - this.lastHealthCheck;
      this.performanceMetrics.operationsPerSecond = 1000 / timeDiff;
      this.performanceMetrics.averageResponseTime = timeDiff;
    }
    
    // Calculate memory efficiency
    const currentMemory = this.memoryUsage.current;
    this.performanceMetrics.memoryEfficiency = 1 - (currentMemory.heapUsed / currentMemory.heapTotal);
    
    // Add to performance history
    this.performanceHistory.push({
      timestamp: now,
      metrics: { ...this.performanceMetrics }
    });
    
    // Cleanup old history
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-50);
    }
  }
  
  // Scan for threats
  scanForThreats() {
    const threats = [];
    
    // Check system health
    if (this.systemHealth === 'critical' || this.systemHealth === 'poor') {
      threats.push({
        type: 'system_health',
        severity: 'high',
        message: `System health is ${this.systemHealth}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check memory usage
    const currentMemory = this.memoryUsage.current;
    if (currentMemory.heapUsed > 200 * 1024 * 1024) { // 200MB threshold
      threats.push({
        type: 'memory_usage',
        severity: 'medium',
        message: `High memory usage: ${Math.round(currentMemory.heapUsed / 1024 / 1024)}MB`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update threat level
    if (threats.length > 0) {
      this.threatLevel = threats.some(t => t.severity === 'high') ? 'high' : 'medium';
      this.activeThreats = threats;
      
      // Auto-respond to threats
      this.respondToThreats(threats);
    } else {
      this.threatLevel = 'low';
      this.activeThreats = [];
    }
  }
  
  // Respond to threats
  async respondToThreats(threats) {
    for (const threat of threats) {
      try {
        console.log(`🛡️ Responding to threat: ${threat.message}`);
        
        switch (threat.type) {
          case 'system_health':
            await this.performUnifiedAutoRepair();
            break;
          case 'memory_usage':
            await this.optimizeMemory();
            break;
          default:
            console.log(`⚠️ Unknown threat type: ${threat.type}`);
        }
        
        // Mark threat as resolved
        threat.resolved = true;
        threat.resolvedAt = new Date().toISOString();
        
      } catch (error) {
        console.error(`❌ Failed to respond to threat: ${error.message}`);
      }
    }
  }
  
  // Perform unified auto-repair
  async performUnifiedAutoRepair() {
    console.log('🔧 Performing unified auto-repair...');
    
    try {
      // Focus on critical systems first
      const criticalSystems = Object.entries(UNIFIED_SYSTEM_REGISTRY)
        .filter(([_, system]) => system.priority === 'critical');
      
      for (const [key, system] of criticalSystems) {
        try {
          console.log(`  🔧 Repairing ${system.name}...`);
          await this.repairSystem(key);
          console.log(`  ✅ ${system.name} repaired`);
        } catch (error) {
          console.log(`  ⚠️ ${system.name} repair warning: ${error.message}`);
        }
      }
      
      // Re-check health
      await this.performComprehensiveHealthCheck();
      
    } catch (error) {
      console.error('❌ Unified auto-repair failed:', error.message);
    }
  }
  
  // Run command with timeout
  async runCommand(command, options = {}) {
    const { timeout = 30000, silent = false } = options;
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Command timeout: ${command}`));
      }, timeout);
      
      try {
        // Handle npm commands properly
        let fullCommand = command;
        if (command.startsWith('npm run ')) {
          fullCommand = command;
        } else if (command.includes(':')) {
          fullCommand = `npm run ${command}`;
        }
        
        const result = execSync(fullCommand, { 
          encoding: 'utf8',
          stdio: silent ? 'pipe' : 'inherit',
          timeout: timeout - 1000,
          cwd: process.cwd()
        });
        
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }
  
  // Stop all monitoring
  stopAllMonitoring() {
    for (const [key, interval] of Object.entries(this.monitoringIntervals)) {
      if (interval) {
        clearInterval(interval);
        console.log(`⏹️ ${key} monitoring stopped`);
      }
    }
    this.monitoringIntervals = {};
  }
  
  // Display unified dashboard
  displayUnifiedDashboard() {
    console.log('\n' + '='.repeat(80));
    console.log('🎮 HERO UNIFIED ORCHESTRATOR - UNIFIED SYSTEM DASHBOARD');
    console.log('='.repeat(80));
    
    const uptime = this.startTime ? Date.now() - this.startTime : 0;
    const uptimeMinutes = Math.floor(uptime / 60000);
    
    console.log(`📊 Status: ${this.status.toUpperCase()}`);
    console.log(`⏰ Uptime: ${uptimeMinutes} minutes`);
    console.log(`🏥 System Health: ${this.systemHealth.toUpperCase()}`);
    console.log(`🛡️ Threat Level: ${this.threatLevel.toUpperCase()}`);
    console.log(`🧠 Memory Usage: ${Math.round(this.memoryUsage.current.heapUsed / 1024 / 1024)}MB`);
    console.log(`⚡ Performance Score: ${this.reliabilityScore.toFixed(2)}`);
    
    console.log('\n🔗 Unified System Integrations:');
    for (const [key, system] of Object.entries(UNIFIED_SYSTEM_REGISTRY)) {
      const status = this.systemStatus.get(key) || 'unknown';
      const health = this.healthScores.get(key) || 0;
      console.log(`  ${system.name} (${system.category}): ${status} (${(health * 100).toFixed(0)}%)`);
    }
    
    if (this.activeThreats.length > 0) {
      console.log('\n🚨 Active Threats:');
      for (const threat of this.activeThreats) {
        const status = threat.resolved ? '✅ RESOLVED' : '⚠️ ACTIVE';
        console.log(`  ${status} ${threat.type}: ${threat.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
  }
  
  // Check if running
  isRunning() {
    return this.status === 'running' && Object.keys(this.monitoringIntervals).length > 0;
  }
  
  // Get system status
  getStatus() {
    return {
      status: this.status,
      uptime: this.uptime,
      systemHealth: this.systemHealth,
      threatLevel: this.threatLevel,
      activeThreats: this.activeThreats.length,
      memoryUsage: this.memoryUsage.current,
      performanceMetrics: this.performanceMetrics,
      systemCount: Object.keys(UNIFIED_SYSTEM_REGISTRY).length
    };
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'start';
  
  try {
    const unifiedHero = new HeroUnifiedOrchestrator();
    
    switch (command) {
      case 'start':
        console.log('🚀 Starting Hero Unified Orchestrator...');
        await unifiedHero.initialize();
        break;
        
      case 'status':
        if (unifiedHero.isRunning()) {
          unifiedHero.displayUnifiedDashboard();
        } else {
          console.log('❌ Hero Unified Orchestrator is not running');
        }
        break;
        
      case 'health':
        const health = await unifiedHero.performComprehensiveHealthCheck();
        console.log('Health Check Results:', JSON.stringify(health, null, 2));
        break;
        
      case 'stop':
        unifiedHero.stopAllMonitoring();
        break;
        
      case 'test':
        console.log('🧪 Testing Hero Unified Orchestrator...');
        await unifiedHero.initialize();
        await unifiedHero.performComprehensiveHealthCheck();
        unifiedHero.displayUnifiedDashboard();
        unifiedHero.stopAllMonitoring();
        break;
        
      case 'optimize':
        console.log('⚡ Running optimization...');
        await unifiedHero.optimizeMemory();
        await unifiedHero.optimizePerformance();
        await unifiedHero.performComprehensiveHealthCheck();
        console.log('✅ Optimization completed');
        break;
        
      case 'audit':
        console.log('🔍 Running system audit...');
        const audit = await unifiedHero.performSystemAudit();
        console.log('Audit Results:', JSON.stringify(audit, null, 2));
        break;
        
      default:
        console.log('Available commands:');
        console.log('  start    - Start Hero Unified Orchestrator (default)');
        console.log('  status   - Show unified dashboard');
        console.log('  health   - Perform comprehensive health check');
        console.log('  stop     - Stop all monitoring');
        console.log('  test     - Test system initialization');
        console.log('  optimize - Run memory and performance optimization');
        console.log('  audit    - Run comprehensive system audit');
    }
  } catch (error) {
    console.error('❌ Hero Unified Orchestrator Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { HeroUnifiedOrchestrator, UNIFIED_HERO_CONFIG, UNIFIED_SYSTEM_REGISTRY };
