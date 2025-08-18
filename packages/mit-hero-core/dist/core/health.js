"use strict";
/**
 * @dct/mit-hero-core
 * MIT Hero Core Health Monitoring
 *
 * This module provides health monitoring functionality for the MIT Hero system,
 * including system health checks, performance metrics, and recommendations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthMonitor = void 0;
// Stub implementations for dependencies during copy phase
class ConcurrencyLimiter {
    constructor(config) { }
    async execute(fn) {
        return await fn();
    }
}
class RetryHelper {
    constructor(config) { }
    async execute(fn) {
        return await fn();
    }
}
// ============================================================================
// HEALTH MONITOR CLASS
// ============================================================================
class HealthMonitor {
    constructor(config) {
        this.config = {
            checkInterval: 30000, // 30 seconds
            timeoutMs: 15000,
            retryAttempts: 3,
            enableMetrics: true,
            ...config
        };
        this.concurrencyLimiter = new ConcurrencyLimiter({
            maxConcurrent: 5,
            maxQueueSize: 20,
            priorityLevels: 3,
            timeoutMs: this.config.timeoutMs,
            resourceLimits: { cpu: 50, memory: 60, disk: 40 }
        });
        this.retryHelper = new RetryHelper({
            maxAttempts: this.config.retryAttempts,
            baseDelay: 1000,
            maxDelay: 5000
        });
        this.healthHistory = [];
        this.performanceHistory = [];
        this.lastCheck = 0;
    }
    // ============================================================================
    // SYSTEM HEALTH CHECKS
    // ============================================================================
    /**
     * Check overall system health
     */
    async checkSystemHealth() {
        try {
            const result = await this.concurrencyLimiter.execute(async () => {
                const health = await this.performHealthCheck();
                this.recordHealthCheck(health);
                return health;
            });
            return result;
        }
        catch (error) {
            // Return degraded health on error
            const degradedHealth = {
                overallHealth: 0.3,
                cpuHealth: 0.3,
                memoryHealth: 0.3,
                diskHealth: 0.3,
                networkHealth: 0.3,
                timestamp: new Date().toISOString(),
                details: {
                    cpu: { usage: 0, loadAverage: [0, 0, 0], cores: 0 },
                    memory: { total: 0, used: 0, free: 0, available: 0, usage: 0 },
                    disk: { total: 0, used: 0, free: 0, usage: 0, readSpeed: 0, writeSpeed: 0 },
                    network: { bytesReceived: 0, bytesSent: 0, packetsReceived: 0, packetsSent: 0, errors: 0, dropped: 0 }
                }
            };
            this.recordHealthCheck(degradedHealth);
            return degradedHealth;
        }
    }
    async performHealthCheck() {
        // This is a placeholder implementation
        // In the real system, this would collect actual system metrics
        const cpuMetrics = {
            usage: Math.random() * 100,
            loadAverage: [Math.random() * 2, Math.random() * 2, Math.random() * 2],
            cores: 8
        };
        const memoryTotal = 16 * 1024 * 1024 * 1024; // 16GB
        const memoryUsed = Math.random() * 12 * 1024 * 1024 * 1024; // Random usage up to 12GB
        const memoryFree = Math.random() * 4 * 1024 * 1024 * 1024; // Random free up to 4GB
        const memoryAvailable = Math.random() * 8 * 1024 * 1024 * 1024; // Random available up to 8GB
        const memoryMetrics = {
            total: memoryTotal,
            used: memoryUsed,
            free: memoryFree,
            available: memoryAvailable,
            usage: (memoryUsed / memoryTotal) * 100
        };
        const diskTotal = 500 * 1024 * 1024 * 1024; // 500GB
        const diskUsed = Math.random() * 400 * 1024 * 1024 * 1024; // Random usage up to 400GB
        const diskFree = Math.random() * 100 * 1024 * 1024 * 1024; // Random free up to 100GB
        const diskMetrics = {
            total: diskTotal,
            used: diskUsed,
            free: diskFree,
            usage: (diskUsed / diskTotal) * 100,
            readSpeed: Math.random() * 100,
            writeSpeed: Math.random() * 50
        };
        const networkMetrics = {
            bytesReceived: Math.random() * 1000000,
            bytesSent: Math.random() * 500000,
            packetsReceived: Math.random() * 10000,
            packetsSent: Math.random() * 5000,
            errors: Math.random() * 10,
            dropped: Math.random() * 5
        };
        // Calculate health scores (0-1, where 1 is healthy)
        const cpuHealth = Math.max(0, 1 - (cpuMetrics.usage / 100));
        const memoryHealth = Math.max(0, 1 - (memoryMetrics.usage / 100));
        const diskHealth = Math.max(0, 1 - (diskMetrics.usage / 100));
        const networkHealth = Math.max(0, 1 - ((networkMetrics.errors + networkMetrics.dropped) / 100));
        // Overall health is weighted average
        const overallHealth = (cpuHealth * 0.3 + memoryHealth * 0.3 + diskHealth * 0.2 + networkHealth * 0.2);
        return {
            overallHealth,
            cpuHealth,
            memoryHealth,
            diskHealth,
            networkHealth,
            timestamp: new Date().toISOString(),
            details: {
                cpu: cpuMetrics,
                memory: memoryMetrics,
                disk: diskMetrics,
                network: networkMetrics
            }
        };
    }
    // ============================================================================
    // PERFORMANCE METRICS
    // ============================================================================
    /**
     * Get current performance metrics
     */
    async getPerformanceMetrics() {
        try {
            const result = await this.concurrencyLimiter.execute(async () => {
                const metrics = await this.collectPerformanceMetrics();
                this.recordPerformanceMetrics(metrics);
                return metrics;
            });
            return result;
        }
        catch (error) {
            return {
                responseTime: 0,
                throughput: 0,
                errorRate: 1,
                availability: 0,
                timestamp: new Date().toISOString()
            };
        }
    }
    async collectPerformanceMetrics() {
        // This is a placeholder implementation
        // In the real system, this would collect actual performance metrics
        return {
            responseTime: Math.random() * 1000, // Random response time 0-1000ms
            throughput: Math.random() * 1000, // Random throughput 0-1000 req/s
            errorRate: Math.random() * 0.1, // Random error rate 0-10%
            availability: 0.95 + Math.random() * 0.05, // Random availability 95-100%
            timestamp: new Date().toISOString()
        };
    }
    // ============================================================================
    // RECOMMENDATIONS
    // ============================================================================
    /**
     * Generate health recommendations
     */
    async generateRecommendations() {
        try {
            const result = await this.concurrencyLimiter.execute(async () => {
                const health = await this.checkSystemHealth();
                const recommendations = this.analyzeHealthAndGenerateRecommendations(health);
                return recommendations;
            });
            return result;
        }
        catch (error) {
            return [{
                    priority: 'critical',
                    category: 'stability',
                    description: 'Health monitoring system failure',
                    action: 'Restart health monitoring system',
                    impact: 'Unable to monitor system health'
                }];
        }
    }
    analyzeHealthAndGenerateRecommendations(health) {
        const recommendations = [];
        // CPU recommendations
        if (health.cpuHealth < 0.5) {
            recommendations.push({
                priority: 'high',
                category: 'performance',
                description: 'CPU usage is high',
                action: 'Investigate CPU-intensive processes and optimize',
                impact: 'System may become unresponsive under load'
            });
        }
        // Memory recommendations
        if (health.memoryHealth < 0.3) {
            recommendations.push({
                priority: 'critical',
                category: 'stability',
                description: 'Memory usage is critically high',
                action: 'Free up memory or restart services',
                impact: 'System may crash or become unstable'
            });
        }
        // Disk recommendations
        if (health.diskHealth < 0.2) {
            recommendations.push({
                priority: 'high',
                category: 'efficiency',
                description: 'Disk space is critically low',
                action: 'Clean up disk space or expand storage',
                impact: 'System may become unusable'
            });
        }
        // Network recommendations
        if (health.networkHealth < 0.6) {
            recommendations.push({
                priority: 'medium',
                category: 'performance',
                description: 'Network errors detected',
                action: 'Check network connectivity and configuration',
                impact: 'Reduced network performance and reliability'
            });
        }
        // Overall system recommendations
        if (health.overallHealth < 0.6) {
            recommendations.push({
                priority: 'high',
                category: 'stability',
                description: 'Overall system health is degraded',
                action: 'Review all system components and apply fixes',
                impact: 'System performance and reliability compromised'
            });
        }
        // Sort by priority (critical first)
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        return recommendations;
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    /**
     * Record health check for historical analysis
     */
    recordHealthCheck(health) {
        this.healthHistory.push(health);
        this.lastCheck = Date.now();
        // Keep only last 1000 health checks
        if (this.healthHistory.length > 1000) {
            this.healthHistory = this.healthHistory.slice(-1000);
        }
    }
    /**
     * Record performance metrics for historical analysis
     */
    recordPerformanceMetrics(metrics) {
        this.performanceHistory.push(metrics);
        // Keep only last 1000 performance records
        if (this.performanceHistory.length > 1000) {
            this.performanceHistory = this.performanceHistory.slice(-1000);
        }
    }
    /**
     * Get health history
     */
    getHealthHistory(limit = 100) {
        return this.healthHistory.slice(-limit);
    }
    /**
     * Get performance history
     */
    getPerformanceHistory(limit = 100) {
        return this.performanceHistory.slice(-limit);
    }
    /**
     * Get last health check time
     */
    getLastCheckTime() {
        return this.lastCheck;
    }
    /**
     * Check if health check is due
     */
    isHealthCheckDue() {
        return Date.now() - this.lastCheck > this.config.checkInterval;
    }
    /**
     * Get health monitoring configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update health monitoring configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        // Update concurrency limiter if needed
        if (updates.timeoutMs) {
            this.concurrencyLimiter = new ConcurrencyLimiter({
                maxConcurrent: 5,
                maxQueueSize: 20,
                priorityLevels: 3,
                timeoutMs: this.config.timeoutMs,
                resourceLimits: { cpu: 50, memory: 60, disk: 40 }
            });
        }
    }
    /**
     * Clear health history
     */
    clearHistory() {
        this.healthHistory = [];
        this.performanceHistory = [];
    }
    /**
     * Get health summary
     */
    async getHealthSummary() {
        const current = await this.checkSystemHealth();
        const recommendations = await this.generateRecommendations();
        // Simple trend analysis based on last few checks
        const recentHealth = this.healthHistory.slice(-5);
        let trend = 'stable';
        if (recentHealth.length >= 2) {
            const first = recentHealth[0].overallHealth;
            const last = recentHealth[recentHealth.length - 1].overallHealth;
            const change = last - first;
            if (change > 0.1)
                trend = 'improving';
            else if (change < -0.1)
                trend = 'degrading';
        }
        return {
            current,
            trend,
            recommendations
        };
    }
}
exports.HealthMonitor = HealthMonitor;
//# sourceMappingURL=health.js.map