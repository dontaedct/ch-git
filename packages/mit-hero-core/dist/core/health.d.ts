/**
 * @dct/mit-hero-core
 * MIT Hero Core Health Monitoring
 *
 * This module provides health monitoring functionality for the MIT Hero system,
 * including system health checks, performance metrics, and recommendations.
 */
export interface HealthConfig {
    checkInterval: number;
    timeoutMs: number;
    retryAttempts: number;
    enableMetrics: boolean;
}
export interface SystemHealth {
    overallHealth: number;
    cpuHealth: number;
    memoryHealth: number;
    diskHealth: number;
    networkHealth: number;
    timestamp: string;
    details: {
        cpu: CpuMetrics;
        memory: MemoryMetrics;
        disk: DiskMetrics;
        network: NetworkMetrics;
    };
}
export interface CpuMetrics {
    usage: number;
    loadAverage: number[];
    temperature?: number;
    cores: number;
}
export interface MemoryMetrics {
    total: number;
    used: number;
    free: number;
    available: number;
    usage: number;
}
export interface DiskMetrics {
    total: number;
    used: number;
    free: number;
    usage: number;
    readSpeed: number;
    writeSpeed: number;
}
export interface NetworkMetrics {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
    errors: number;
    dropped: number;
}
export interface PerformanceMetrics {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
    timestamp: string;
}
export interface HealthRecommendation {
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'performance' | 'security' | 'stability' | 'efficiency';
    description: string;
    action: string;
    impact: string;
}
export declare class HealthMonitor {
    private config;
    private concurrencyLimiter;
    private retryHelper;
    private healthHistory;
    private performanceHistory;
    private lastCheck;
    constructor(config?: Partial<HealthConfig>);
    /**
     * Check overall system health
     */
    checkSystemHealth(): Promise<SystemHealth>;
    private performHealthCheck;
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics(): Promise<PerformanceMetrics>;
    private collectPerformanceMetrics;
    /**
     * Generate health recommendations
     */
    generateRecommendations(): Promise<HealthRecommendation[]>;
    private analyzeHealthAndGenerateRecommendations;
    /**
     * Record health check for historical analysis
     */
    private recordHealthCheck;
    /**
     * Record performance metrics for historical analysis
     */
    private recordPerformanceMetrics;
    /**
     * Get health history
     */
    getHealthHistory(limit?: number): SystemHealth[];
    /**
     * Get performance history
     */
    getPerformanceHistory(limit?: number): PerformanceMetrics[];
    /**
     * Get last health check time
     */
    getLastCheckTime(): number;
    /**
     * Check if health check is due
     */
    isHealthCheckDue(): boolean;
    /**
     * Get health monitoring configuration
     */
    getConfig(): HealthConfig;
    /**
     * Update health monitoring configuration
     */
    updateConfig(updates: Partial<HealthConfig>): void;
    /**
     * Clear health history
     */
    clearHistory(): void;
    /**
     * Get health summary
     */
    getHealthSummary(): Promise<{
        current: SystemHealth;
        trend: 'improving' | 'stable' | 'degrading';
        recommendations: HealthRecommendation[];
    }>;
}
//# sourceMappingURL=health.d.ts.map